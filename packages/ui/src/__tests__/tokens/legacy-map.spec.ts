/*
 * 옛 이름 → 새 이름 표(B5, #22) — 3.0.0 에서 alias(legacy.json · generated/legacy.css)를 지운 뒤에도 소비 레포의 이행 경로(린트 `--fix` ·
 * 코드모드)가 읽는 정적 표(tokens/legacy-map.mjs, #49)의 성질을 검사한다.
 *
 * 두 성질이 무너지는 방식은 이미 한 번 실제로 났다: ① ESLint `--fix` 가 반복 검사하며 `bg-surface-2 → bg-muted → bg-muted-foreground` 로 두 번
 * 고쳤고(린트 표에 목적지가 다시 출발지가 되는 항목이 있었다), ② 스크립트가 규칙마다 따로 치환하며 같은 일을 했다. 그래서 여기서는
 * «린트 표는 사슬이 없다» 와 «스크립트는 한 번에 끝난다(두 번 돌려도 accent·muted 밖은 멱등)» 를 실제 함수로 본다.
 */
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { legacyClassRenames, legacyClassRestrictions, legacyRenames } from "../../../tokens/legacy-map.mjs";
import { readTokenSources, validateTokenSources } from "../../../tokens/schema";
import legacyClassesJson from "../../generated/legacy-classes.json" with { type: "json" };
import { codemodClasses } from "../../../../../scripts/codemod-classes.mjs";
import { codemodCssVars } from "../../../../../scripts/codemod-css-vars.mjs";

const { tokens } = validateTokenSources(
  readTokenSources(fileURLToPath(new URL("../../../tokens/", import.meta.url))),
);
const map = legacyRenames();
/** 새 정본의 CSS 변수 이름 — 표의 목적지가 실제로 있는지 본다. */
const defined = new Set(tokens.map((t) => `--${t.path.join("-")}`));

/** 패턴 하나가 어느 옛 이름을 맞추는가 — `-<old>((?:/…)?)$` 꼴에서 old 를 되읽는다. */
const sourceOf = (pattern: string): string =>
  /-((?:[a-z0-9-]+?))(?:\(\(\?:\/|\$)/.exec(pattern.replace(/\\/g, ""))?.[1] ?? "";

describe("legacy-map — 표", () => {
  it("renames(새 이름과 글자가 같은 옛 이름)는 accent · muted 둘이다", () => {
    expect(map.renameSources.sort()).toEqual(["accent", "muted"]);
  });

  it("목적지는 전부 오늘의 정본에 있다 — 정본에서 이름이 사라지면 코드모드가 죽은 이름으로 옮긴다", () => {
    expect(Object.values(map.cssVars).filter((to) => !defined.has(to))).toEqual([]);
    const utilityColors = new Set(
      tokens.filter((t) => t.path[0] === "color" && t.jds.scope === "theme-inline").map((t) => t.path[1]),
    );
    expect(Object.values(map.colors).filter((to) => !utilityColors.has(to))).toEqual([]);
    const radius = new Set(tokens.filter((t) => t.path[0] === "radius").map((t) => t.path[1]));
    expect(Object.values(map.radius).filter((to) => !radius.has(to))).toEqual([]);
  });

  it("출발지(옛 이름)는 정본에 없다 — renames 둘만 예외(새 이름과 글자가 같다)", () => {
    const renamed = new Set(["--chrome-accent", "--chrome-muted"]);
    expect(Object.keys(map.cssVars).filter((from) => defined.has(from) && !renamed.has(from))).toEqual([]);
  });

  it("커밋된 린트 표(generated/legacy-classes.json)가 정적 표의 결과와 같다", () => {
    expect(legacyClassesJson).toEqual(legacyClassRestrictions(map));
  });

  it("CSS 변수 표는 옛 chrome·radius 이름 전부 + renames + 옛 base 이름을 든다", () => {
    expect(map.cssVars["--chrome-ink"]).toBe("--chrome-foreground");
    expect(map.cssVars["--chrome-accent-soft"]).toBe("--chrome-accent");
    expect(map.cssVars["--chrome-accent"]).toBe("--chrome-primary");
    expect(map.cssVars["--chrome-muted"]).toBe("--chrome-muted-foreground");
    expect(map.cssVars["--radius-control"]).toBe("--radius-md");
    expect(map.cssVars["--radius-float"]).toBe("--radius-lg");
    expect(map.cssVars["--ink"]).toBe("--palette-gray-900");
    expect(map.cssVars["--size-gap"]).toBe("--space-card-gap");
    expect(map.cssVars["--color-cool-500"]).toBe("--palette-cool-500");
    expect(map.cssVars["--inspect-w"]).toBeUndefined();
    expect(Object.keys(map.cssVars).length).toBe(32 + 5 + 2 + 61);
  });

  it("린트 표(legacy-classes.json)는 사슬이 없다 — 목적지가 다시 출발지가 되는 항목이 없고 renames 는 빠져 있다", () => {
    /* 네임스페이스마다 따로 본다 — `rounded-card`(radius 출발지)와 `bg-card`(color 목적지)는 서로 다른 패턴이라 사슬이 아니다. */
    const lintColors = Object.entries(map.colors).filter(([from]) => !map.renameSources.includes(from));
    const colorSources = new Set(lintColors.map(([from]) => from));
    for (const [, to] of lintColors)
      expect(colorSources.has(to), `${to} 가 목적지이면서 출발지다 — --fix 가 두 번 고친다`).toBe(false);
    const radiusSources = new Set(Object.keys(map.radius));
    for (const to of Object.values(map.radius)) expect(radiusSources.has(to), to).toBe(false);
    const lint = legacyClassRestrictions(map);
    expect(lint.length).toBe(lintColors.length + Object.keys(map.radius).length);
    expect(lint.length).toBe(31 + 5);
    expect(lint.some((r) => r.fix === "$1$2-primary$3" || r.fix === "$1$2-muted-foreground$3")).toBe(false);
  });

  it("전체 표는 renames 까지 들고 긴 이름이 앞에 온다", () => {
    const all = legacyClassRenames(map);
    expect(all.length).toBe(31 + 2 + 5);
    expect(all.some((r) => r.fix === "$1$2-primary$3")).toBe(true);
    expect(all.some((r) => r.fix === "$1$2-muted-foreground$3")).toBe(true);
    const colorSources = all.slice(0, 33).map((r) => sourceOf(r.pattern));
    for (let i = 1; i < colorSources.length; i++)
      expect(colorSources[i - 1]!.length, colorSources.join(" ")).toBeGreaterThanOrEqual(
        colorSources[i]!.length,
      );
  });
});

describe("scripts/codemod-classes — 한 번에 끝난다", () => {
  it("옛 이름을 새 이름으로 — 사슬(surface-2 → muted → muted-foreground)을 타지 않고 variant 접두·불투명도는 그대로", () => {
    const before =
      'cn("bg-surface-2 text-muted hover:bg-accent-soft/40 rounded-control border-line-strong", {"text-accent": on}, `ring-focus rounded-t-modal`)';
    const after =
      'cn("bg-muted text-muted-foreground hover:bg-accent/40 rounded-md border-border-strong", {"text-primary": on}, `ring-ring rounded-t-xl`)';
    const { text, count } = codemodClasses(before);
    expect(count).toBe(8);
    expect(text).toBe(after);
  });

  it("무관한 토큰은 건드리지 않는다 — 우연히 접미가 같은 이름, CSS 변수, 산문", () => {
    const untouched =
      'cn("text-muted-foreground rounded-md bg-card w-line line-clamp-2 underline", "var(--chrome-ink)") // the ink line';
    const { text, count } = codemodClasses(untouched);
    expect(count).toBe(0);
    expect(text).toBe(untouched);
  });

  it("두 번째 실행은 새 bg-accent · bg-muted 를 다시 바꾼다 — 그래서 «한 번만» 이다(문서·스크립트 머리의 경고가 참인지)", () => {
    const once = codemodClasses('"bg-accent-soft bg-surface-2"').text;
    expect(once).toBe('"bg-accent bg-muted"');
    expect(codemodClasses(once).text).toBe('"bg-primary bg-muted-foreground"');
  });
});

describe("scripts/codemod-css-vars — 한 번에 끝난다", () => {
  it("var(--chrome-<옛>) 를 새 이름으로, 경계를 지킨다", () => {
    const { text, count } = codemodCssVars(
      ".x { color: var(--chrome-ink); background: var( --chrome-surface-2 ); border-color: var(--chrome-ink-2, red); outline: var(--chrome-accent-soft) var(--chrome-accent); border-radius: var(--radius-card) }",
    );
    expect(count).toBe(6);
    expect(text).toBe(
      ".x { color: var(--chrome-foreground); background: var( --chrome-muted ); border-color: var(--chrome-foreground-2, red); outline: var(--chrome-accent) var(--chrome-primary); border-radius: var(--radius-lg) }",
    );
  });

  it("새 이름과 정의 자리(--chrome-ink: …)는 건드리지 않는다", () => {
    const { text, count } = codemodCssVars(
      ":root { --chrome-ink: var(--palette-cool-900); } .y { color: var(--chrome-foreground); gap: var(--space-card-gap); }",
    );
    expect(count).toBe(0);
    expect(text).toContain("--chrome-ink: var(--palette-cool-900)");
  });
});
