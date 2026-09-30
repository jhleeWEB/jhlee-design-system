/*
 * 곡률의 정적 불변식(계획 §3.5-1, #26) — 배포되는 CSS 와 소스가 «원호 강등이 허용된 폴백» 이라는 계약을 지키는가.
 *
 * 모서리는 전역 규칙 하나(corner.css 의 `*`)가 정하므로 깨지는 방식도 정해져 있다: 규칙이 `@layer` 안으로 들어가 요소 규칙에 지고,
 * 누가 `--corner-k` 기본값을 1 이 아니게 두어 미지원 엔진의 반경이 커지고, 원형 반경에 `round` 예외가 빠져 캡슐이 눌리고,
 * 임의값 `rounded-[7px]` 이 계수를 타지 않는다. 일곱 검사가 그 자리를 하나씩 붙든다. 검출기 자체는 의도적 위반 셋으로 증명한다
 * (forbidden-patterns 의 DETECTOR_CASES 와 같은 이유).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import postcss, { type AtRule, type Node as CssNode, type Rule } from "postcss";
import { describe, expect, it } from "vitest";

import { sourceGraph } from "../__arch__/source-graph";
import { auditCorners, CONCENTRIC_PREFIX, countByFile, DEFAULT_ROUND_SELECTORS, type CornerSource } from "../testing/corner-audit";
import { loadTokenModel } from "./tokens/model";

const read = (file: string): string => readFileSync(fileURLToPath(new URL(`../${file}`, import.meta.url)), "utf8");
const corner = postcss.parse(read("corner.css"), { from: "corner.css" });
const tokens = postcss.parse(read("generated/tokens.css"), { from: "generated/tokens.css" });
const model = loadTokenModel();

/** 노드를 감싼 at-rule 이름들(바깥부터). */
function atRulesAround(node: CssNode): string[] {
  const names: string[] = [];
  for (let p = node.parent; p && p.type !== "root"; p = p.parent) if (p.type === "atrule") names.unshift((p as AtRule).name);
  return names;
}

/** `--name: value` 선언을 전부 — 어느 at-rule 안인지와 함께. */
function customProps(root: postcss.Root, name: string): { value: string; atRules: string[] }[] {
  const out: { value: string; atRules: string[] }[] = [];
  root.walkDecls(name, decl => {
    out.push({ value: decl.value.trim(), atRules: atRulesAround(decl) });
  });
  return out;
}

/** 원형 예외 목록 — corner.css 의 `corner-shape: round` 규칙 selector. */
function roundSelectorsInCornerCss(): string[] {
  const out: string[] = [];
  corner.walkDecls("corner-shape", decl => {
    if (decl.value.trim() === "round") out.push(...(decl.parent as Rule).selectors);
  });
  return out.sort();
}

/** src/ 의 제품 CSS·TSX(legacy 포함, 스펙·스토리·생성물 제외) — 소비자 검사기에 넘기는 모양. */
const sources: CornerSource[] = [...sourceGraph().values()].filter(f => !f.excluded).map(f => ({ path: f.path, text: f.text }));

describe("전역 규칙", () => {
  it("corner-shape: var(--corner-shape) 는 @supports 안 · @layer 밖 · `*, ::before, ::after` 선택자에 있다", () => {
    const globalRules: { selector: string; atRules: string[] }[] = [];
    corner.walkDecls("corner-shape", decl => {
      if (decl.value.trim() === "var(--corner-shape)") globalRules.push({ selector: (decl.parent as Rule).selector.replace(/\s+/g, " "), atRules: atRulesAround(decl) });
    });
    expect(globalRules).toEqual([{ selector: "*, ::before, ::after", atRules: ["supports"] }]);
    /* @layer 안이면 tokens.css 의 레이어 없는 요소 규칙이 이긴다 — corner.css 어디에도 @layer 가 없어야 한다. */
    corner.walkAtRules("layer", at => expect.fail(`corner.css 에 @layer 가 있다: ${at.params}`));
    corner.walkAtRules("supports", at => expect(at.params).toBe("(corner-shape: squircle)"));
  });

  it("--corner-k 는 @supports 밖에서 1, 안에서 1.5 — 미지원 엔진의 반경이 커지지 않는다", () => {
    const outside = [...customProps(tokens, "--corner-k"), ...customProps(corner, "--corner-k")].filter(d => !d.atRules.includes("supports"));
    expect(outside.map(d => d.value)).toEqual(["1"]);
    const inside = customProps(tokens, "--corner-k").filter(d => d.atRules.includes("supports"));
    expect(inside.map(d => d.value)).toEqual(["1.5"]);
    /* 토큰 모델이 읽는 해석값도 미지원 엔진의 것이다 — @supports 안은 토큰이 아니다(model.ts). */
    expect(model.tokens.filter(t => t.name === "--corner-k").map(t => t.value)).toEqual(["1"]);
    expect(model.tokens.filter(t => t.name === "--corner-shape").map(t => t.value)).toEqual(["round"]);
    /* 킬 스위치는 둘을 함께 되돌린다 — 반경만 원호로 두고 계수를 남기면 «큰 원호» 가 된다. */
    const kill = customProps(corner, "--corner-k");
    expect(kill).toEqual([{ value: "1", atRules: ["supports"] }]);
    expect(customProps(corner, "--corner-shape")).toEqual([{ value: "round", atRules: ["supports"] }]);
  });

  it("corner-shape 는 corner.css 밖에서 round 만 — 소비자 검사기와 같은 규칙", () => {
    expect(auditCorners(sources, { cornerShapeFiles: ["corner.css"] }).filter(f => f.rule === "corner-shape-outside-ui")).toEqual([]);
    /* corner.css 안에서도 값은 둘뿐이다 — 전역 var 와 원형 예외. */
    const values = new Set<string>();
    corner.walkDecls("corner-shape", decl => {
      values.add(decl.value.trim());
    });
    expect([...values].sort()).toEqual(["round", "var(--corner-shape)"]);
  });

  it("원형 radius 규칙의 selector 는 전부 round 예외 목록에 있고, 목록은 검사기의 기본값과 같다", () => {
    const listed = roundSelectorsInCornerCss();
    expect(listed).toEqual([...DEFAULT_ROUND_SELECTORS, '[data-corner="round"] *'].sort());
    expect(auditCorners(sources).filter(f => f.rule === "circular-without-round")).toEqual([]);
    /* TSX 의 원형은 `rounded-full` 클래스뿐이어야 `.rounded-full` 예외가 전부를 덮는다 — 검사기의 arbitrary-rounded 가 `rounded-[9999px]` 류를 잡는다. */
    expect(sources.filter(s => /\.tsx?$/.test(s.path) && /\brounded-(?:\[|\()/.test(s.text) && !s.text.includes(CONCENTRIC_PREFIX))).toEqual([]);
  });
});

describe("반경 사다리", () => {
  const theme = (name: string): string | undefined => model.tokens.find(t => t.name === name && t.scope === "theme")?.value;

  it("md · lg · xl 은 calc(N px * var(--corner-k, 1)) 이고 sm 6px · full 9999px · none 0 은 고정이다", () => {
    expect(theme("--radius-md")).toBe("calc(8px * var(--corner-k, 1))");
    expect(theme("--radius-lg")).toBe("calc(12px * var(--corner-k, 1))");
    expect(theme("--radius-xl")).toBe("calc(16px * var(--corner-k, 1))");
    expect(theme("--radius-sm")).toBe("6px");
    expect(theme("--radius-full")).toBe("9999px");
    expect(theme("--radius-none")).toBe("0");
  });

  it("border-radius 원시값 래칫 — theme.css 의 스크롤 썸 1 · legacy shell.css 의 스위치 2 뿐이고 셋 다 원형 예외다", () => {
    /* 원형(999px · 50%)이라 토큰(--radius-full)으로 바꿔도 그림은 같다 — 옮기면 여기서 줄인다. 줄어들기만 한다. */
    const raw = auditCorners(sources).filter(f => f.rule === "raw-radius");
    expect(countByFile(raw)).toEqual({ "legacy/shell.css": 2, "theme.css": 1 });
    expect(raw.map(f => f.text).sort()).toEqual(["border-radius: 50%", "border-radius: 999px", "border-radius: 999px"]);
  });

  it("TSX 의 rounded-[…] 는 동심원 calc(var(--radius-…) − 패딩) 뿐이다", () => {
    expect(auditCorners(sources).filter(f => f.rule === "arbitrary-rounded")).toEqual([]);
    /* 컴포넌트(.tsx)만 — testing/corner-audit.ts 는 규칙 설명 문자열에 그 글자를 든다. */
    const concentric = sources.filter(s => s.path.endsWith(".tsx")).flatMap(s => [...s.text.matchAll(/rounded-\[[^\]\n]*\]/g)].map(m => `${s.path}: ${m[0]}`)).sort();
    expect(concentric).toMatchInlineSnapshot(`
      [
        "navigation/SegmentedControl.tsx: rounded-[calc(var(--radius-md)-var(--spacing)*0.5)]",
        "primitives/MediaCard.tsx: rounded-[calc(var(--radius-lg)-var(--space-hairline))]",
      ]
    `);
  });
});

describe("검출기 — 의도적 위반 셋", () => {
  it("원시 반경 · round 없는 원형 · 임의값 rounded-[7px] · corner-shape squircle 을 잡는다", () => {
    const probe: CornerSource[] = [
      {
        path: "app/widget.css",
        text: [
          ":root { --radius-chip: 6px; }",
          ".a { border-radius: 4px; }",
          ".b { border-radius: 50%; }",
          ".c { border-radius: 50%; corner-shape: round; }",
          ".rounded-full { border-radius: 9999px; }",
          ".d { border-radius: var(--radius-md); }",
          ".e { border-radius: calc(var(--radius-md) - 2px); }",
          "@media (min-width: 0) { .f { corner-shape: squircle; } .g { corner-shape: round; } }",
        ].join("\n"),
      },
      { path: "app/Widget.tsx", text: ['const a = cn("rounded-[7px] rounded-md");', 'const b = "rounded-[calc(var(--radius-md)-2px)] rounded-full";', "// rounded-[8px] in a comment"].join("\n") },
    ];
    expect(auditCorners(probe).map(f => `${f.rule} ${f.path}:${f.line} ${f.text}`)).toEqual([
      "raw-radius app/widget.css:2 border-radius: 4px",
      "raw-radius app/widget.css:3 border-radius: 50%",
      "circular-without-round app/widget.css:3 .b { border-radius: 50% }",
      "raw-radius app/widget.css:4 border-radius: 50%",
      "raw-radius app/widget.css:5 border-radius: 9999px",
      "corner-shape-outside-ui app/widget.css:8 corner-shape: squircle",
      "arbitrary-rounded app/Widget.tsx:1 rounded-[7px]",
    ]);
    expect(countByFile(auditCorners(probe), "raw-radius")).toEqual({ "app/widget.css": 4 });
    /* 같은 파일을 corner-shape 의 집으로 허용하면 squircle 도 통과한다 — DS 의 corner.css 가 그 경우다. */
    expect(auditCorners(probe, { cornerShapeFiles: ["widget.css"] }).filter(f => f.rule === "corner-shape-outside-ui")).toEqual([]);
  });

  it("corner.css 의 전역 규칙이 @layer 안이나 @supports 밖으로 옮겨지면 검사가 빨개진다", () => {
    const parse = (css: string) => postcss.parse(css, { from: "probe.css" });
    const where = (root: postcss.Root): string[][] => {
      const out: string[][] = [];
      root.walkDecls("corner-shape", decl => {
        out.push(atRulesAround(decl));
      });
      return out;
    };
    expect(where(parse("@layer base { @supports (corner-shape: squircle) { * { corner-shape: var(--corner-shape); } } }"))).toEqual([["layer", "supports"]]);
    expect(where(parse("* { corner-shape: var(--corner-shape); }"))).toEqual([[]]);
    expect(where(parse("@supports (corner-shape: squircle) { * { corner-shape: var(--corner-shape); } }"))).toEqual([["supports"]]);
  });
});
