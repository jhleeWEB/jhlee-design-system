/*
 * 사다리 계약(계획 §2.4 D-2 `ladders.spec`, #11 → #18). 검사 대상은 생성물 CSS 다 — 정본 JSON 이 아니라 소비자가 받는 것.
 *
 * 「캔버스는 다크에서도 바뀌지 않는다」는 이 시스템의 **유일한 구조적 약속**이고, 그것이 깨지는 방식은 언제나 같다 — 누군가 다크 블록에
 * `--canvas-*` 한 줄을 더한다. 그 순간 도면이 어두워지고, 인쇄와 색각 이상 근거가 함께 무너진다.
 *
 * 사다리 쪽은 «cn.ts 가 CSS 의 사다리를 안다» 를 본다. B3 전에는 cn.ts 의 손 목록을 정규식으로 읽어 theme.css 와 대조했는데, 이제 cn.ts 가
 * 생성물 `LADDERS` 를 import 하므로 목록 대조는 «생성물 == 생성물» 이라 뜻이 없다. 대신 **동작**을 본다 — 사다리마다 실제로 뒤엣것이
 * 이기는가. twMerge 가 사다리를 모르면 둘 다 남기고 승자가 소스 순서에 달린다(cn.ts 주석).
 */
import { describe, expect, it } from "vitest";

import { cn, TW_MERGE_CONFIG } from "../../cn";
import { LADDERS } from "../../generated/ladders";
import { loadTokenModel, type TokenScope } from "./model";

const model = loadTokenModel();

const namesIn = (scope: TokenScope, prefix: string): string[] =>
  [
    ...new Set(model.tokens.filter((t) => t.scope === scope && t.name.startsWith(prefix)).map((t) => t.name)),
  ].sort();
/** 정본 크롬 토큰만 — generated/tokens.css 의 것. */
const chromeNamesIn = (scope: TokenScope): string[] =>
  [
    ...new Set(
      model.tokens
        .filter(
          (t) => t.scope === scope && t.file === "generated/tokens.css" && t.name.startsWith("--chrome-"),
        )
        .map((t) => t.name),
    ),
  ].sort();

/** `@theme` 의 `--<ns>-<name>` 에서 `<name>` 만 — `--text-body--line-height` 같은 부속 키는 사다리가 아니다. */
const ladder = (ns: string): string[] =>
  namesIn("theme", `--${ns}-`)
    .map((n) => n.slice(ns.length + 3))
    .filter((n) => !n.includes("--"))
    .sort();

const utilitiesIn = (file: string): string[] =>
  model.utilities
    .filter((u) => u.file === file)
    .map((u) => u.name)
    .sort();
const HAND = "theme.css";
const GENERATED = "generated/theme.tailwind.css";

describe("방향 C — 캔버스와 크롬의 분리", () => {
  it("다크 블록은 --canvas-* 를 하나도 건드리지 않는다", () => {
    expect(
      model.tokens.filter((t) => t.scope === "dark-media" || t.scope === "dark-attr").length,
    ).toBeGreaterThan(0);
    expect(namesIn("dark-media", "--canvas-")).toEqual([]);
    expect(namesIn("dark-attr", "--canvas-")).toEqual([]);
  });

  it("다크 블록 둘이 같은 크롬 토큰 집합을 정의하고 라이트의 크롬 토큰마다 다크 값이 있다", () => {
    /* 생성기가 chrome.dark.json 을 두 블록에 찍는다 — 여기서 갈리면 생성기가 깨진 것이다. 빠진 토큰은 다크에서 라이트 색으로 남는다. */
    expect(chromeNamesIn("dark-attr")).toEqual(chromeNamesIn("dark-media"));
    expect(chromeNamesIn("dark-attr")).toEqual(chromeNamesIn("root"));
    expect(chromeNamesIn("dark-attr").length).toBeGreaterThan(20);
  });

  it("캔버스 토큰은 :root 한 곳에서만 한 번씩 정의된다", () => {
    const canvas = model.tokens.filter((t) => t.name.startsWith("--canvas-"));
    expect(canvas.length).toBeGreaterThan(0);
    for (const t of canvas) expect(t.scope, t.name).toBe("root");
    const names = canvas.map((t) => t.name);
    expect(names).toEqual([...new Set(names)]);
    expect(model.tokens.filter((t) => t.name === "--canvas-bg")).toHaveLength(1);
  });
});

describe("사다리", () => {
  it("Tailwind 기본 사다리를 지워 역할 이름만 남긴다", () => {
    /* 남겨 두면 `rounded-lg`·`text-red-500`·`font-black` 이 계속 존재하고 「radius 는 역할이 정한다」·「유채색은 판정에만」이 관습에 진다. */
    const reset = (namespace: string) => model.resets.find((r) => r.namespace === namespace)?.scope;
    expect(reset("--radius")).toBe("theme");
    expect(reset("--shadow")).toBe("theme");
    expect(reset("--text")).toBe("theme");
    expect(reset("--tracking")).toBe("theme");
    expect(reset("--font-weight")).toBe("theme");
    expect(reset("--color")).toBe("theme-inline");
  });

  it("생성물 LADDERS 가 @theme 의 사다리와 네임스페이스마다 같다", () => {
    /* ladders.ts 와 theme.tailwind.css 는 같은 정본에서 나오지만 다른 포맷이다 — 포맷 하나가 네임스페이스를 빠뜨리면 여기서 드러난다. */
    for (const ns of [
      "radius",
      "shadow",
      "text",
      "animate",
      "ease",
      "tracking",
      "font-weight",
      "height",
      "container",
    ] as const) {
      expect([...LADDERS[ns]].sort(), ns).toEqual(ladder(ns));
    }
  });

  it("생성 @utility 는 layer(z-*) · duration(duration-*) 사다리 그대로다 — 손으로 더하지 않는다(혼용 규칙 ⑤)", () => {
    const expected = [
      ...LADDERS.layer.map((n) => `z-${n}`),
      ...LADDERS.duration.map((n) => `duration-${n}`),
    ].sort();
    expect(utilitiesIn(GENERATED)).toEqual(expected);
  });

  it("손수 낸 @utility 는 이것이 전부다 — 더하면 여기와 cn.ts 를 함께 고친다", () => {
    expect(utilitiesIn(HAND)).toMatchInlineSnapshot(`
      [
        "focus-ring",
        "font-inherit",
        "gap-shell",
        "h-ctl",
        "h-ctl-lg",
        "h-ctl-sm",
        "h-dialog-fluid",
        "h-view-lg",
        "h-view-md",
        "h-view-sm",
        "max-h-dialog-fluid",
        "max-w-popover-fluid",
        "on-canvas",
        "tnum",
        "w-ctl",
        "w-ctl-lg",
        "w-ctl-sm",
        "w-dialog-fluid",
        "w-rail",
      ]
    `);
  });

  it("@theme 이 initial 로 지운 네임스페이스 집합 == cn.ts 의 override 집합 — 하나가 빠지면 그 사다리의 충돌 해소가 조용히 꺼진다(#22)", () => {
    /* `--color-*: initial` 은 @theme inline 의 것이고 twMerge 는 색 클래스를 이름과 무관하게 같은 그룹으로 보므로 override 대상이 아니다. */
    const resets = model.resets
      .filter((r) => r.scope === "theme")
      .map((r) => r.namespace.slice(2))
      .sort();
    expect(resets).toEqual(
      Object.keys(TW_MERGE_CONFIG.override.theme)
        .filter((ns) => resets.includes(ns))
        .sort(),
    );
    expect(Object.keys(TW_MERGE_CONFIG.override.theme).sort()).toEqual(
      [...new Set([...resets, "animate", "ease"])].sort(),
    );
    /* 생성물 LADDERS 의 네임스페이스는 전부 어딘가(override · extend.theme · classGroups)에 실려 있다 — height 는 h/w 로, layer 는 z 로, duration 은 duration 으로. */
    const covered = new Set([
      ...Object.keys(TW_MERGE_CONFIG.override.theme),
      ...Object.keys(TW_MERGE_CONFIG.extend.theme),
      "height",
      "layer",
      "duration",
    ]);
    for (const ns of Object.keys(LADDERS)) expect(covered.has(ns), ns).toBe(true);
    for (const ns of Object.keys(TW_MERGE_CONFIG.override.theme) as (keyof typeof LADDERS)[])
      expect(
        [...TW_MERGE_CONFIG.override.theme[ns as keyof typeof TW_MERGE_CONFIG.override.theme]],
        ns,
      ).toEqual([...LADDERS[ns]]);
  });
});

describe("cn — 사다리마다 뒤엣것이 이긴다", () => {
  /** 사다리 → 그 이름을 쓰는 유틸리티 접두. container 는 max-w-·w- 둘 다. */
  const PREFIXES: Record<keyof typeof LADDERS, readonly string[]> = {
    radius: ["rounded"],
    shadow: ["shadow"],
    text: ["text"],
    animate: ["animate"],
    ease: ["ease"],
    tracking: ["tracking"],
    "font-weight": ["font"],
    height: ["h", "w"],
    container: ["max-w", "w"],
    layer: ["z"],
    duration: ["duration"],
  };

  it.each(Object.keys(LADDERS) as (keyof typeof LADDERS)[])("%s", (ns) => {
    const names = LADDERS[ns];
    for (const prefix of PREFIXES[ns]) {
      for (let i = 1; i < names.length; i++) {
        const a = `${prefix}-${names[i - 1]}`;
        const b = `${prefix}-${names[i]}`;
        expect(cn(a, b), `${a} → ${b}`).toBe(b);
        expect(cn(b, a), `${b} → ${a}`).toBe(a);
      }
    }
  });

  it("역할 이름은 표준 유틸리티에도 진다 — h-auto · z-auto · duration-initial · max-w-none", () => {
    expect(cn("h-ctl", "h-auto")).toBe("h-auto");
    expect(cn("w-rail", "w-full")).toBe("w-full");
    expect(cn("gap-shell", "gap-0")).toBe("gap-0");
    expect(cn("z-toast", "z-auto")).toBe("z-auto");
    expect(cn("duration-fast", "duration-initial")).toBe("duration-initial");
    expect(cn("max-w-dialog-md", "max-w-none")).toBe("max-w-none");
  });

  it("손 @utility(h-* · w-* · gap-*)마다 표준 유틸리티가 이긴다 — cn.ts 의 HAND_UTILITIES 가 theme.css 와 같다는 뜻", () => {
    const standard: Record<string, string> = { h: "h-auto", w: "w-auto", gap: "gap-0" };
    for (const name of utilitiesIn(HAND)) {
      const prefix = name.split("-")[0]!;
      if (!(prefix in standard)) continue;
      expect(cn(name, standard[prefix]), name).toBe(standard[prefix]);
    }
  });

  it("다른 축은 충돌로 보지 않는다 — 글꼴과 굵기, 높이와 폭", () => {
    expect(cn("font-medium", "font-sans")).toBe("font-medium font-sans");
    expect(cn("h-ctl", "w-ctl")).toBe("h-ctl w-ctl");
  });
});
