/*
 * 금지 패턴 래칫(계획 §2.4 D-1, #11) — 금지가 아니라 **래칫**이다. 제품 앱의 `forbidden-patterns.spec` 선례를 이식했다.
 *
 * 아래 패턴들은 오늘 이 패키지에 이미 있다. 한 번에 없앨 수 없고(Phase B 가 토큰을, Phase D 가 컴포넌트를 하나씩 옮긴다), 그 사이에
 * 다른 PR 이 같은 패턴을 새로 더하면 작업이 끝나지 않는다. 그래서 패턴마다 오늘의 `파일 → 횟수` 를 기준선으로 적어 두고
 * **실제 횟수가 기준선과 같아야** 통과한다.
 *  - 늘었다(또는 새 파일에 나타났다) → 새 위반이다. 토큰·유틸리티·cva 를 거치게 고친다.
 *  - 줄었다 → 잘한 일이다. 같은 PR 에서 기준선 숫자를 낮춘다(0 이 되면 줄을 지운다). 낮추지 않아도 통과시키면
 *    나중에 누군가 그 여유만큼 되돌려 놓아도 초록이라 래칫이 아니게 된다.
 *
 * ESLint 의 로컬 규칙(`ds/no-literal-style-value` 등, #9)과 겹치는 패턴이 있다. 둘을 다 두는 이유: ESLint 기준선은 «파일당 규칙당
 * 횟수» 를 suppressions 파일이 들고 있어 **어느 줄이 왜** 위반인지 스펙 실패 메시지처럼 말하지 못하고, CSS 는 ESLint 가 보지 않는다.
 * 래칫이 0 이 된 패턴은 Phase C 에서 ESLint/stylelint 의 error 로 승격하고 여기서 지운다.
 *
 * 못 잡는 것(정규식 래칫의 본질적 한계): 다른 이름의 변수로 감춘 값(`const d = 200; setTimeout(f, d)`), 템플릿 문자열로 조립한 클래스,
 * 계산식(`0.2 * 1000`). 이 스펙은 **부주의한 재발**을 막는 것이지 작정한 우회를 막지 못한다 — 그쪽은 리뷰가 맡는다.
 *
 * 세는 대상은 제품 소스뿐이다 — 스펙·가드·스토리·생성물은 hex 와 px 를 문자열로 들고 있는 것이 정상이다(`source-graph.ts` 의 isExcludedPath).
 * 동결된 `legacy/` 도 세지 않는다(countsOf 의 주석).
 * 주석은 걷어내고 센다: theme.css 머리 주석의 `#0869e1` 과 «140ms 를 넘기면 기다림이 된다» 가 위반으로 잡히면 안 된다.
 */
import { describe, expect, it } from "vitest";

import { matches, parseSource, sourceGraph, type Located, type SourceFileInfo } from "./source-graph";

interface Pattern {
  readonly id: string;
  /** 왜 흩어지면 안 되는가 — 실패 메시지에 그대로 실린다. */
  readonly why: string;
  /** 어느 파일 종류를 보는가. */
  readonly kinds: readonly SourceFileInfo["kind"][];
  readonly find: (file: SourceFileInfo) => readonly Located[];
  /** 오늘의 `파일 → 횟수`. 경로 오름차순. 줄어들기만 한다. 첫 실행 실측(2026-09-30, #11). */
  readonly baseline: Readonly<Record<string, number>>;
}

/**
 * CSS 본문에서 커스텀 프로퍼티 **정의**(`--x: 12px;`)를 지운다 — 토큰 정의는 리터럴이 사는 유일한 자리라 세지 않는다(혼용 규칙 ①·②).
 * 값이 여러 줄이어도(`--shadow-pop`) `;` 까지가 한 정의다. `--radius-*: initial` 의 `*` 도 이름의 일부다.
 */
function withoutTokenDefinitions(code: string): string {
  return code.replace(/--[\w*-]+\s*:[^;{}]*;/g, m => m.replace(/[^\n]/g, " "));
}

const cssValues = (file: SourceFileInfo, re: RegExp): readonly Located[] => matches(withoutTokenDefinitions(file.code), re);

const PATTERNS: readonly Pattern[] = [
  {
    id: "tsx-arbitrary-literal",
    why: "클래스 대괄호 안의 px·rem·ms·s 리터럴은 토큰 밖 값이다 — theme.css 사다리(rounded-*·text-*·h-ctl·duration-*)에 이름을 더하고 그 유틸리티를 쓴다(혼용 규칙 ①)",
    kinds: ["ts", "tsx"],
    // 한 줄 안의 `[…]` 만 본다 — 여러 줄에 걸친 배열 리터럴을 클래스 대괄호로 오인하지 않게.
    find: file => matches(file.code, /\[[^\]\n]*\d+(?:\.\d+)?(?:px|rem|ms|s)\b[^\]\n]*\]/g),
    baseline: {
      "feedback/Toast.tsx": 2,
      "navigation/SegmentedControl.tsx": 1,
      "overlay/AlertDialog.tsx": 3,
      "overlay/Drawer.variants.ts": 8,
      "overlay/DropdownMenu.tsx": 1,
      "overlay/Modal.variants.ts": 7,
      "overlay/Popover.tsx": 2,
      "primitives/Input.tsx": 1,
    },
  },
  {
    id: "tsx-tailwind-default-scale",
    why: "duration-100 · z-50 · leading-5 · font-500 · tracking-1 같은 Tailwind 기본 사다리와 rounded-[…] 는 역할 이름이 아니다 — theme.css 가 initial 로 지운 사다리에 역할(duration-fast · z-toast)을 더해 쓴다",
    kinds: ["ts", "tsx"],
    find: file => matches(file.code, /\b(?:duration|z|leading|font|tracking)-\d+\b|\brounded-\[/g),
    baseline: {
      "data/DataTable.tsx": 1,
      "feedback/Progress.variants.ts": 1,
      "feedback/Toast.tsx": 1,
      "navigation/SegmentedControl.tsx": 2,
      "navigation/Sidebar.tsx": 2,
      "overlay/AlertDialog.tsx": 2,
      "overlay/Drawer.tsx": 1,
      "overlay/Drawer.variants.ts": 1,
      "overlay/DropdownMenu.tsx": 1,
      "overlay/Modal.tsx": 1,
      "overlay/Modal.variants.ts": 1,
      "overlay/Popover.tsx": 1,
      "overlay/Tooltip.tsx": 1,
      "primitives/Button.tsx": 1,
      "primitives/Button.variants.ts": 1,
      "primitives/Card.tsx": 2,
      "primitives/Choice.tsx": 3,
      "primitives/Input.variants.ts": 1,
      "primitives/MediaCard.tsx": 2,
      "primitives/MediaCard.variants.ts": 1,
      "primitives/Misc.tsx": 1,
    },
  },
  {
    id: "css-px-literal",
    why: "`.ds-*` CSS 의 px 는 토큰(`var(--…)`)이어야 한다 — 0 과 1px(헤어라인)만 예외다(혼용 규칙 ②). 토큰 정의 자리(`--x: 12px`)는 세지 않는다",
    kinds: ["css"],
    find: file => cssValues(file, /(?<![\w.-])(?!0px\b|1px\b)\d+(?:\.\d+)?px\b/g),
    baseline: {
      "canvas.css": 1,
      "feedback/toast.css": 1,
      "theme.css": 18,
    },
  },
  {
    id: "css-hex-literal",
    why: "`.ds-*` CSS 의 hex 색은 토큰 밖 색이다 — 크롬은 `var(--chrome-*)`, 캔버스는 `var(--canvas-*)` 만 쓴다(혼용 규칙 ②). 토큰 정의 자리는 세지 않는다",
    kinds: ["css"],
    find: file => cssValues(file, /#[0-9a-fA-F]{3,8}\b/g),
    baseline: {
      "canvas.css": 1,
    },
  },
  {
    id: "css-ms-literal",
    why: "`.ds-*` CSS 의 ms 는 모션 토큰(`--motion-*`·`--duration-*`)이어야 한다 — 값이 흩어지면 접기·토스트·스크롤바가 서로 다른 박자로 움직인다. 0 과 토큰 정의 자리는 세지 않는다",
    kinds: ["css"],
    find: file => cssValues(file, /(?<![\w.-])(?!0ms\b)\d+(?:\.\d+)?ms\b/g),
    baseline: {
      "feedback/toast.css": 4,
      "primitives/card-motion.css": 4,
      "theme.css": 1,
    },
  },
  {
    id: "js-ms-literal",
    why: "setTimeout 의 지연과 duration/delayDuration 기본값을 숫자로 적으면 CSS 의 모션 토큰과 JS 상수가 따로 논다(토스트 퇴장 180ms 는 큐 유예 240ms 안에 끝나야 한다) — `tokens/motion.ts` 의 `MOTION` 상수를 쓴다(B1, #15)",
    kinds: ["ts", "tsx"],
    // `setTimeout(` 부터 처음 만나는 `, <숫자>)` 까지 — 콜백이 여러 줄이어도 지연 인자는 그 뒤에 온다.
    find: file => matches(file.code, /\bsetTimeout\([\s\S]*?,\s*\d+\s*\)|\b(?:delayDuration|skipDelayDuration|duration)\s*=\s*\{?\s*\d+\b/g),
    // B1(#15)이 세 파일 4건을 `tokens/motion.ts` 의 상수로 바꿔 0 이 됐다 — 기준선이 비어도 검출기 검증(DETECTOR_CASES)은 남는다.
    baseline: {},
  },
  {
    id: "jsx-size-number",
    why: "JSX 의 size={16} · width={12} · strokeWidth={2} 는 아이콘·치수 토큰 밖 숫자다 — `lib/icons.ts` 한 곳(16px · strokeWidth 2)과 `--size-*` 토큰으로 모은다",
    kinds: ["tsx"],
    find: file => matches(file.code, /\b(?:size|width|height|strokeWidth)=\{\s*\d+(?:\.\d+)?\s*\}/g),
    baseline: {
      "CanvasScale.tsx": 3,
      "feedback/Toast.tsx": 1,
      "navigation/BackButton.tsx": 2,
      "overlay/Drawer.tsx": 2,
      "overlay/Modal.tsx": 2,
      "overlay/Popover.tsx": 2,
      "overlay/Tooltip.tsx": 2,
      "primitives/Card.tsx": 3,
      "primitives/PanelToggleButton.tsx": 2,
    },
  },
  {
    id: "forward-ref",
    why: "React 19 는 ref 가 일반 prop 이다 — forwardRef 는 displayName·제네릭·docgen 을 흐리는 옛 형태라 컴포넌트별 PR 로 걷어낸다(계획 §2.3 규칙 · Phase D)",
    kinds: ["ts", "tsx"],
    find: file => matches(file.code, /\bforwardRef\b/g),
    baseline: {
      "navigation/Accordion.tsx": 6,
      "navigation/BackButton.tsx": 2,
      "primitives/Button.tsx": 2,
      "primitives/Choice.tsx": 4,
      "primitives/Input.tsx": 3,
      "primitives/PanelToggleButton.tsx": 2,
    },
  },
  {
    id: "non-cva-variant-ternary",
    why: "size/tone/variant/elevation 축을 삼항으로 가르면 축의 값 목록이 cva 정의와 따로 자란다 — 축은 `*.variants.ts` 의 cva 하나가 소유한다(계획 §2.3)",
    kinds: ["ts", "tsx"],
    find: file => matches(file.code, /\b(?:size|tone|variant|elevation)\s*===\s*["'][^"'\n]*["']\s*\?/g),
    baseline: {
      "feedback/Alert.tsx": 1,
      "feedback/EmptyState.tsx": 2,
      "navigation/SegmentedControl.tsx": 1,
      "primitives/Card.tsx": 1,
    },
  },
  {
    id: "boolean-string-data-attr",
    why: "data-x={value} 에 불리언을 그대로 넣으면 DOM 에 \"true\"/\"false\" 문자열이 실려 `[data-x]` 선택자가 false 에도 맞는다 — 문자열 값이거나 `value ? \"\" : undefined` 로 적는다(ESLint ds/no-boolean-string-data-attr)",
    kinds: ["tsx"],
    find: file => matches(file.code, /\bdata-[a-z-]+=\{[a-zA-Z.]+\}/g),
    baseline: {
      "feedback/Toast.tsx": 1,
      "primitives/Card.tsx": 1,
    },
  },
  {
    id: "domain-vocabulary",
    why: "parcel · FSI · TBV · verdict · 필지 · 법규 는 원 저장소(인도 주거 컨피규레이터)의 도메인 어휘다 — 디자인 시스템은 도메인을 모른다. legacy 격리(`./legacy`)와 함께 앱으로 돌려보낸다",
    kinds: ["ts", "tsx"],
    find: file => matches(file.code, /\b(?:parcel|FSI|TBV|verdict)\b|To be verified|필지|법규/g),
    baseline: {
      "data/DescriptionList.tsx": 1,
    },
  },
];

/** 패턴 검출기가 실제로 잡는지 — 기준선이 `{}` 가 된 뒤에도 이 스펙이 «아무것도 안 보는 초록» 이 되지 않게 한다. */
const DETECTOR_CASES: Readonly<Record<string, { readonly path: string; readonly source: string; readonly hits: readonly string[] }>> = {
  "tsx-arbitrary-literal": {
    path: "primitives/__probe__.tsx",
    source: [
      'const a = cn("h-[36px] w-full", "duration-[140ms]");',
      'const b = cva("min-w-[12rem] rounded-control");',
      "const c = [1, 2].map(n => n * 3);",
      'const d = "delay-[1.5s]";',
      "// h-[8px] 는 h-ctl 로 바꿨다",
    ].join("\n"),
    hits: ["[36px]", "[140ms]", "[12rem]", "[1.5s]"],
  },
  "tsx-tailwind-default-scale": {
    path: "primitives/__probe__.tsx",
    source: [
      'const a = "transition duration-150 z-50 leading-5";',
      'const b = "font-600 tracking-1 rounded-[6px]";',
      'const c = "duration-fast z-toast rounded-control font-semibold";',
      "// z-50 은 z-toast 로",
    ].join("\n"),
    hits: ["duration-150", "z-50", "leading-5", "font-600", "tracking-1", "rounded-["],
  },
  "css-px-literal": {
    path: "primitives/__probe__.css",
    source: [
      ":root { --radius-chip: 6px; --shadow-pop: 0 2px 6px rgb(0 0 0 / 0.1),",
      "  0 12px 28px rgb(0 0 0 / 0.1); }",
      ".ds-x { padding: 10px 12px; border: 1px solid var(--chrome-line); width: 0px; gap: 0.5px; }",
      "/* 16px 은 토큰으로 */",
      ".ds-y { width: calc(100% + 16px); }",
    ].join("\n"),
    hits: ["10px", "12px", "0.5px", "16px"],
  },
  "css-hex-literal": {
    path: "primitives/__probe__.css",
    source: [":root { --chrome-ink: #191f28; }", ".ds-x { color: var(--x, #6b7280); background: #fff; }", "/* #0869e1 */"].join("\n"),
    hits: ["#6b7280", "#fff"],
  },
  "css-ms-literal": {
    path: "primitives/__probe__.css",
    source: [
      ":root { --motion-collapse-duration: 200ms; }",
      ".ds-x { transition: opacity 200ms ease, visibility 0ms; animation: enter 220ms var(--ease-out-quick, ease-out) both; }",
      "/* 140ms 를 넘기면 기다림이 된다 */",
    ].join("\n"),
    hits: ["200ms", "220ms"],
  },
  "js-ms-literal": {
    path: "feedback/__probe__.tsx",
    source: [
      "timer.current = window.setTimeout(() => {\n  setActive(false);\n}, 500);",
      "setTimeout(fn, toastExitMs);",
      "function Toast({ duration = 4200, delayDuration = 350 }: Props) {}",
      "<Tooltip delayDuration={350} />;",
      "// setTimeout(f, 200) 은 상수로",
    ].join("\n"),
    hits: ["setTimeout(() => {\n  setActive(false);\n}, 500)", "duration = 4200", "delayDuration = 350", "delayDuration={350"],
  },
  "jsx-size-number": {
    path: "primitives/__probe__.tsx",
    source: ["<LuX size={16} strokeWidth={2} />;", "<svg width={ 12 } height={1.5} />;", "<Icon size={iconSize} />;", "// size={16}"].join("\n"),
    hits: ["size={16}", "strokeWidth={2}", "width={ 12 }", "height={1.5}"],
  },
  "forward-ref": {
    path: "primitives/__probe__.tsx",
    source: ['import { forwardRef } from "react";', "export const X = React.forwardRef<HTMLDivElement, Props>(function X() {});", "const forwardRefs = 1;", "// forwardRef 는 쓰지 않는다"].join("\n"),
    hits: ["forwardRef", "forwardRef"],
  },
  "non-cva-variant-ternary": {
    path: "primitives/__probe__.tsx",
    source: [
      'const a = size === "sm" ? "h-ctl-sm" : "h-ctl";',
      "const b = tone === 'danger' ? danger : neutral;",
      'const c = variant==="ghost"?1:2;',
      'const d = elevation === "raised" ? "shadow-card" : "";',
      'const e = state === "open" ? 1 : 0;',
      "// size === \"sm\" ? 는 cva 로",
    ].join("\n"),
    hits: ['size === "sm" ?', "tone === 'danger' ?", 'variant==="ghost"?', 'elevation === "raised" ?'],
  },
  "boolean-string-data-attr": {
    path: "primitives/__probe__.tsx",
    source: ["<div data-open={open} data-state={props.state} data-slot=\"card\" data-collapsed={collapsed ? \"\" : undefined} />;", "// data-open={open}"].join("\n"),
    hits: ["data-open={open}", "data-state={props.state}"],
  },
  "domain-vocabulary": {
    path: "primitives/__probe__.tsx",
    source: [
      'const label = "Parcel area (FSI)";',
      "<Badge tone={verdict}>TBV</Badge>;",
      "const note = \"To be verified\";",
      "const ko = \"필지 법규\";",
      "const v: Verdict = ok;",
      "// FSI 는 앱 어휘다",
    ].join("\n"),
    hits: ["FSI", "verdict", "TBV", "To be verified", "필지", "법규"],
  },
};

const graph = sourceGraph();

function countsOf(pattern: Pattern): { readonly counts: Record<string, number>; readonly where: Record<string, readonly number[]> } {
  const counts: Record<string, number> = {};
  const where: Record<string, readonly number[]> = {};
  for (const file of graph.values()) {
    // `legacy/` 는 격리·동결이다(#12: ESLint 도 기준선이 아니라 ignores) — 계획 §2.4 의 래칫도 `legacy/` 를 세지 않는다.
    // 도메인 어휘(verdict·FSI)가 거기 살지만 그 코드는 «고치지 않고 앱으로 돌려보내는» 것이라 여기 잡아 둘 이유가 없다.
    if (file.excluded || file.path.startsWith("legacy/") || !pattern.kinds.includes(file.kind)) continue;
    const hits = pattern.find(file);
    if (hits.length === 0) continue;
    counts[file.path] = hits.length;
    where[file.path] = hits.map(hit => hit.line);
  }
  return { counts, where };
}

describe("소스 그래프", () => {
  it("제품 소스와 제외 경로를 가른다", () => {
    const paths = [...graph.keys()];
    expect(paths).toContain("primitives/Button.tsx");
    expect(paths).toContain("theme.css");
    expect(graph.get("primitives/Button.tsx")?.excluded).toBe(false);
    expect(graph.get("primitives/Button.stories.tsx")?.excluded).toBe(true);
    expect(graph.get("__arch__/forbidden-patterns.spec.ts")?.excluded).toBe(true);
    expect(graph.get("__tests__/setup.ts")?.excluded).toBe(true);
  });

  it("주석을 걷어내되 줄 번호는 지킨다", () => {
    const ts = parseSource("x.tsx", "const a = 1; // #fff\n/* 12px\n */ const b = 2;");
    expect(ts.code).toBe("const a = 1;        \n       \n    const b = 2;");
    const css = parseSource("x.css", "/* #fff */\n.a { color: red; } /* 12px */");
    expect(css.code).toBe("          \n.a { color: red; }           ");
  });
});

describe.each(PATTERNS)("금지 패턴 래칫 — $id", pattern => {
  const { counts, where } = countsOf(pattern);

  it("검출기가 가짜 본문에서 위반만 골라낸다", () => {
    const probe = DETECTOR_CASES[pattern.id];
    expect(probe, "DETECTOR_CASES 에 이 패턴의 가짜 본문을 더한다").toBeDefined();
    expect(pattern.find(parseSource(probe!.path, probe!.source)).map(hit => hit.text)).toEqual(probe!.hits);
  });

  it("어느 파일도 기준선보다 늘지 않고 새 파일에 나타나지 않는다", () => {
    const grown = Object.entries(counts)
      .filter(([path, count]) => count > (pattern.baseline[path] ?? 0))
      .map(([path, count]) => `${path}: ${pattern.baseline[path] ?? 0} → ${count} (줄 ${where[path]!.join(", ")})`);
    expect(grown, pattern.why).toEqual([]);
  });

  it("줄어든 만큼 기준선을 낮췄다", () => {
    const stale = Object.entries(pattern.baseline)
      .filter(([path, count]) => (counts[path] ?? 0) < count)
      .map(([path, count]) => `${path}: 기준선 ${count} → 실제 ${counts[path] ?? 0}`);
    expect(stale, "고쳐진 위반 — forbidden-patterns.spec.ts 의 baseline 숫자를 실제 값으로 낮춘다(0 이면 줄을 지운다)").toEqual([]);
  });

  it("기준선은 경로 오름차순이고 0 이하인 줄이 없다", () => {
    const paths = Object.keys(pattern.baseline);
    expect(paths).toEqual([...paths].sort());
    for (const [path, count] of Object.entries(pattern.baseline)) expect(count, path).toBeGreaterThan(0);
  });
});
