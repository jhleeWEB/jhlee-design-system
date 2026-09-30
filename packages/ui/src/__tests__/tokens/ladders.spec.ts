/*
 * 사다리 계약(계획 §2.4 D-2 `ladders.spec`, #11). 옛 `tokens.spec.ts` 의 다섯 불변식을 토큰 모델 위로 옮기고, animate/ease 사다리와
 * `@utility` ↔ cn.ts classGroups 동치를 더했다. 검사 수는 줄지 않았다 — 정규식으로 블록을 잘라 읽던 다섯이 선언 단위로 같은 것을 묻는다.
 *
 * 「캔버스는 다크에서도 바뀌지 않는다」는 이 시스템의 **유일한 구조적 약속**이고, 그것이 깨지는 방식은 언제나 같다 — 누군가 다크 블록에
 * `--canvas-*` 한 줄을 더한다. 그 순간 도면이 어두워지고, 인쇄와 색각 이상 근거가 함께 무너진다.
 */
import { describe, expect, it } from "vitest";

import { cnClassGroup, cnLadder } from "./cn-ladders";
import { loadTokenModel, type TokenScope } from "./model";

const model = loadTokenModel();

const namesIn = (scope: TokenScope, prefix: string): string[] =>
  [...new Set(model.tokens.filter(t => t.scope === scope && t.name.startsWith(prefix)).map(t => t.name))].sort();

/** `theme.css` `@theme` 의 `--<ns>-<name>` 에서 `<name>` 만 — `--text-body--line-height` 같은 부속 키는 사다리가 아니다. */
const ladder = (ns: string): string[] =>
  namesIn("theme", `--${ns}-`)
    .map(n => n.slice(ns.length + 3))
    .filter(n => !n.includes("--"))
    .sort();

describe("방향 C — 캔버스와 크롬의 분리", () => {
  it("다크 블록은 --canvas-* 를 하나도 건드리지 않는다", () => {
    expect(model.tokens.filter(t => t.scope === "dark-media" || t.scope === "dark-attr").length).toBeGreaterThan(0);
    expect(namesIn("dark-media", "--canvas-")).toEqual([]);
    expect(namesIn("dark-attr", "--canvas-")).toEqual([]);
  });

  it("다크 블록 둘이 같은 크롬 토큰 집합을 정의한다", () => {
    /* 한쪽에만 토큰이 있으면 OS 다크와 토글 다크가 **다른 색**으로 열린다. 값까지의 동일성은 dark-parity.spec 이 본다. */
    expect(namesIn("dark-attr", "--chrome-")).toEqual(namesIn("dark-media", "--chrome-"));
  });

  it("캔버스 토큰은 :root 한 곳에서만 한 번씩 정의된다", () => {
    const canvas = model.tokens.filter(t => t.name.startsWith("--canvas-"));
    expect(canvas.length).toBeGreaterThan(0);
    for (const t of canvas) expect(t.scope, t.name).toBe("root");
    const names = canvas.map(t => t.name);
    expect(names).toEqual([...new Set(names)]);
    expect(model.tokens.filter(t => t.name === "--canvas-bg")).toHaveLength(1);
  });
});

describe("사다리", () => {
  it("Tailwind 기본 사다리를 지워 역할 이름만 남긴다", () => {
    /* 남겨 두면 `rounded-lg`·`text-red-500` 이 계속 존재하고 「radius 는 역할이 정한다」·「유채색은 판정에만」이 관습에 진다. */
    const reset = (namespace: string) => model.resets.find(r => r.namespace === namespace)?.scope;
    expect(reset("--radius")).toBe("theme");
    expect(reset("--shadow")).toBe("theme");
    expect(reset("--text")).toBe("theme");
    expect(reset("--color")).toBe("theme-inline");
  });

  it("cn.ts 의 radius · shadow · text 사다리가 theme.css 와 같다", () => {
    /* 둘이 갈리면 증상은 «className 덮어쓰기가 가끔 안 먹는다» 로 나타나 추적하기 어렵다. cn.ts 주석이 약속한 것이 이것이다. */
    expect(cnLadder("radius")).toEqual(ladder("radius"));
    expect(cnLadder("shadow")).toEqual(ladder("shadow"));
    expect(cnLadder("text")).toEqual(ladder("text"));
  });

  it("cn.ts 의 animate · ease 사다리가 theme.css 와 같다", () => {
    /* `--animate-*` 는 reduced-motion 블록에도 `none` 으로 다시 나온다 — 사다리는 `@theme` 의 것이다. */
    expect(cnLadder("animate")).toEqual(ladder("animate"));
    expect(cnLadder("ease")).toEqual(ladder("ease"));
  });

  it("cn.ts 의 h · w · gap classGroups 가 theme.css 의 @utility 와 같다", () => {
    /* `@utility` 로 손수 낸 클래스는 Tailwind 네임스페이스가 아니라 twMerge 가 모른다 — 모르면 «충돌 없음» 으로 보아 둘 다 남긴다.
       실측으로 `cn("h-ctl", "h-auto")` 가 둘을 다 남겼다(cn.ts 주석). 그래서 손수 낸 것마다 classGroups 에 있어야 한다. */
    const declared = (prefix: string) => model.utilities.filter(u => u.startsWith(`${prefix}-`)).sort();
    expect(cnClassGroup("h")).toEqual(declared("h"));
    expect(cnClassGroup("w")).toEqual(declared("w"));
    expect(cnClassGroup("gap")).toEqual(declared("gap"));
  });

  it("손수 낸 @utility 는 이것이 전부다 — 더하면 여기와 cn.ts 를 함께 고친다(혼용 규칙 ⑤)", () => {
    expect([...model.utilities].sort()).toMatchInlineSnapshot(`
      [
        "focus-ring",
        "gap-shell",
        "h-ctl",
        "h-ctl-lg",
        "h-ctl-sm",
        "on-canvas",
        "tnum",
        "w-ctl",
        "w-ctl-lg",
        "w-ctl-sm",
        "w-rail",
      ]
    `);
  });
});
