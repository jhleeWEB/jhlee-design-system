/*
 * 생성물 == 손 CSS(계획 §2.2 «alias 이행» B-2, #15) — B3 연결의 안전망.
 *
 * `tokens/**\/*.json` + 생성기가 낸 `generated/*.css` 를 손 `tokens.css`·`theme.css` 와 **같은 토큰 모델**로 읽어 «이름 → 끝까지 해석한 값» 맵을
 * 라이트·다크 모두 비교한다. 이것이 같으면 B3 가 손 CSS 를 생성물로 바꿔 끼워도 소비자가 보는 값은 한 픽셀도 달라지지 않는다.
 * 유일한 의도된 차이는 원시 팔레트의 새 이름 `--palette-*` 다 — 옛 `--color-{hue}-*` 는 alias 로 남아 같은 값을 낸다.
 * TS 쪽도 같다: 생성물 `MOTION` 은 B1 의 손 `tokens/motion.ts` 와, 생성물 `LADDERS` 는 cn.ts 의 twMerge 사다리와 같아야 한다.
 */
import { describe, expect, it } from "vitest";

import { LADDERS } from "../../generated/ladders";
import { MOTION as GENERATED_MOTION } from "../../generated/tokens";
import { MOTION } from "../../tokens/motion";
import { cnLadder } from "./cn-ladders";
import { loadTokenModel, loadTokenModelFrom, resolvedMap, type Mode, type TokenModel, type TokenScope } from "./model";

/** 생성물 CSS — 세 파일이 한 벌이다(B3 에서 tokens.css 가 이 셋을 재수출한다). */
const GENERATED_FILES = ["generated/tokens.css", "generated/theme.tailwind.css", "generated/legacy.css"] as const;
const PALETTE = /^--palette-/;
/** `--palette-cool-0` → `--color-cool-0` — alias 이름 규칙. */
const aliasOf = (palette: string): string => palette.replace(PALETTE, "--color-");

const hand = loadTokenModel();
const gen = loadTokenModelFrom(GENERATED_FILES);
const MODES: readonly Mode[] = ["light", "dark"];

const withoutPalette = (map: Record<string, string>): Record<string, string> => Object.fromEntries(Object.entries(map).filter(([name]) => !PALETTE.test(name)));
const namesIn = (model: TokenModel, scope: TokenScope): string[] => [...new Set(model.tokens.filter(t => t.scope === scope && !PALETTE.test(t.name)).map(t => t.name))].sort();
const SCOPES: readonly TokenScope[] = ["root", "dark-media", "dark-attr", "theme", "theme-inline", "reduced-motion"];

describe("생성물 CSS 의 해석 맵 == 손 CSS 의 해석 맵", () => {
  it("생성물의 모든 토큰이 끝까지 해석된다 — var( 가 남지 않는다", () => {
    for (const mode of MODES) {
      const unresolved = Object.entries(resolvedMap(gen, mode)).filter(([, v]) => v.includes("var(")).map(([n, v]) => `${n}: ${v}`);
      expect(unresolved, mode).toEqual([]);
    }
  });

  it("--palette-* 는 생성물에만 있고, 옛 --color-{hue}-* alias 가 같은 값을 낸다", () => {
    const light = resolvedMap(gen, "light");
    const palette = Object.keys(light).filter(name => PALETTE.test(name));
    expect(palette.length).toBeGreaterThan(30);
    expect(Object.keys(resolvedMap(hand, "light")).filter(name => PALETTE.test(name))).toEqual([]);
    for (const name of palette) expect(light[aliasOf(name)], `${aliasOf(name)} 는 ${name} 의 alias`).toBe(light[name]);
  });

  it.each(MODES)("%s — 이름과 값이 전부 같다(--palette-* 만 빼고)", mode => {
    /* toEqual 이 두 방향을 다 본다 — 손에만 있는 이름(생성기가 빠뜨림)도, 생성물에만 있는 이름(정본이 더함)도 실패다. */
    expect(withoutPalette(resolvedMap(gen, mode))).toEqual(resolvedMap(hand, mode));
  });

  it("다크에서 갈리는 이름 집합이 같다", () => {
    const changed = (model: TokenModel): string[] => {
      const light = resolvedMap(model, "light");
      const dark = resolvedMap(model, "dark");
      return Object.keys(dark).filter(name => light[name] !== dark[name] && !PALETTE.test(name)).sort();
    };
    expect(changed(gen)).toEqual(changed(hand));
    expect(changed(gen).length).toBeGreaterThan(20);
  });

  it("생성물의 다크 두 블록(OS · 토글)은 이름·값이 같다 — 한 정본(chrome.dark.json)을 두 번 찍은 것이다", () => {
    /* 손 CSS 의 복붙 두 블록을 dark-parity.spec 이 지키던 것을 생성기가 구조로 보장한다(B3 에서 그 스펙을 지운다). */
    const block = (scope: TokenScope): Record<string, string> => Object.fromEntries(gen.tokens.filter(t => t.scope === scope).map(t => [t.name, t.value]));
    expect(Object.keys(block("dark-attr")).length).toBeGreaterThan(20);
    expect(block("dark-attr")).toEqual(block("dark-media"));
  });

  it.each(SCOPES)("스코프 %s 의 이름 집합이 같다 — @theme · @theme inline · 다크 · reduced-motion 이 같은 자리에 같은 토큰을 둔다", scope => {
    expect(namesIn(gen, scope)).toEqual(namesIn(hand, scope));
  });

  it("네임스페이스 리셋(--radius-*: initial …)이 같은 스코프에 같은 것으로 있다", () => {
    const resets = (model: TokenModel): string[] => model.resets.map(r => `${r.scope} ${r.namespace}`).sort();
    expect(resets(gen)).toEqual(resets(hand));
    expect(resets(gen)).toContain("theme-inline --color");
  });

  it("미참조 원시 집합이 references.spec 의 기준선(18개)과 같다 — alias 는 참조로 치지 않는다", () => {
    /* 손: theme.css :root 의 --color-* 가운데 아무도 가리키지 않는 것. 생성물: --palette-* 가운데 자기 alias(--color-*) 말고는 아무도 가리키지 않는 것. */
    const handReferenced = new Set(hand.references.map(r => r.name));
    const handDead = hand.tokens
      .filter(t => t.file === "theme.css" && t.scope === "root" && t.name.startsWith("--color-") && !handReferenced.has(t.name))
      .map(t => t.name)
      .sort();
    const alias = new Set(gen.tokens.filter(t => t.name.startsWith("--color-") && t.refs.some(r => PALETTE.test(r))).map(t => t.name));
    const genReferrers = new Map<string, string[]>();
    for (const t of gen.tokens) for (const ref of t.refs) genReferrers.set(ref, [...(genReferrers.get(ref) ?? []), t.name]);
    const genDead = gen.tokens
      .filter(t => PALETTE.test(t.name) && (genReferrers.get(t.name) ?? []).every(by => alias.has(by)))
      .map(t => aliasOf(t.name))
      .sort();
    expect(handDead).toHaveLength(18);
    expect(genDead).toEqual(handDead);
  });
});

describe("생성물 TS == 손 TS", () => {
  it("generated/tokens.ts 의 MOTION 은 tokens/motion.ts 의 MOTION 과 키·값이 같다", () => {
    expect(GENERATED_MOTION).toEqual(MOTION);
  });

  it("generated/ladders.ts 의 LADDERS 는 cn.ts 의 twMerge 사다리와 같다(radius · shadow · text · animate · ease)", () => {
    for (const key of ["radius", "shadow", "text", "animate", "ease"] as const) expect([...LADDERS[key]].sort(), key).toEqual(cnLadder(key));
  });
});
