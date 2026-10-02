/*
 * 짝수 치수 래칫(#82) — 사용자 결정(2026-10-02): «치수는 최대한 짝수로. 예외는 아이콘처럼 홀수여야 육안으로 맞는 경우».
 *
 * 왜: 홀수 · 소수 px(13.5px 글자 · 13 × 1.55 = 20.15px 줄 · 9×4 꼬리)는 가운데 정렬마다 반 픽셀을 낳는다 — 같은 줄의 아이콘 · 테두리 · 글자가
 * 반 픽셀씩 어긋나 흐려지고, 그 어긋남이 배율 · 엔진마다 다르게 반올림된다. 짝수면 «가운데» 가 늘 픽셀 경계에 선다.
 *
 * 두 층을 본다.
 *  1. 토큰 — 생성물 CSS(tokens.css · theme.tailwind.css · cursors.css)의 커스텀 프로퍼티를 끝까지 해석한 값 안의 px 가 짝수 정수인가.
 *     글자 크기와 줄 높이는 px 여야 한다 — 비율(1.55)은 크기와 곱해 소수 px 를 낸다.
 *  2. 소스 — 렌더되는 제품 소스(tsx · ts · css — 스펙 · 스토리 · 생성물 · 도구 밖)의 px 리터럴 · 계산되는 calc() · Tailwind 숫자 유틸(4px × n) ·
 *     `*-px` 유틸 · 비율 leading · 선 굵기 · JS 숫자 치수(h · w · size · sideOffset …).
 *
 * 예외는 허용 목록뿐이고 항목마다 이유를 적는다 — 헤어라인(1px 테두리 · 구분선 · 그림자 오프셋 · 포커스 링 간격)과 그것에서 파생된 동심원,
 * pill 센티널(9999px), 그리고 홀수여야 광학적으로 맞는 아이콘(ICON_EXCEPTIONS — 오늘 0). 허용 목록은 래칫이다: 실제 횟수와 같아야 하고,
 * 고쳐서 줄었으면 같은 PR 에서 목록을 낮춘다(forbidden-patterns.spec 과 같은 규칙).
 *
 * 세지 않는 것(치수가 아니다): 가운데 정렬이 낳는 파생 여백(44px 상단바 안 30px 버튼의 위아래 7px), 아이콘 글리프의 SVG 좌표와 획 굵기
 * (뷰박스가 비율로 줄여 16px 에서 1.33px 이 된다 — 획은 «모양» 이다), 커서 이미지의 핫스팟 좌표, 단위 없는 수(z-index · 굵기), em · ms · % · vw.
 * 정규식 래칫의 한계도 forbidden-patterns.spec 과 같다 — 변수로 감추거나 템플릿으로 조립한 값은 못 본다. 이 스펙은 부주의한 재발을 막는다.
 */
import valueParser from "postcss-value-parser";
import { describe, expect, it } from "vitest";

import {
  matches,
  parseSource,
  sourceGraph,
  type Located,
  type SourceFileInfo,
} from "../../__arch__/source-graph";
import { loadTokenModelFrom, resolvedMap } from "./model";

/* ── 판정 ─────────────────────────────────────────────────────────────────── */

/** 짝수 정수 px 인가 — 0 은 짝수다. 음수(`-mt-1` · `-12px`)는 크기로 본다. */
const isEven = (px: number): boolean => Number.isInteger(px) && Math.abs(px) % 2 === 0;

/** 값 안의 px 길이 — 함수(rgb · calc …) 안까지 내려가고, 문자열(`url("data:…")` 의 SVG)은 보지 않는다. */
function pxLengths(value: string): readonly { readonly text: string; readonly px: number }[] {
  const out: { text: string; px: number }[] = [];
  valueParser(value).walk((node) => {
    if (node.type !== "word") return;
    const unit = valueParser.unit(node.value);
    if (unit && unit.unit === "px") out.push({ text: node.value, px: Number(unit.number) });
  });
  return out;
}

/** 계산 결과 — px 길이거나 단위 없는 수. */
interface Num {
  readonly n: number;
  readonly px: boolean;
}

/** calc 낱말 — 공백 · `calc(`(괄호로 읽는다) · `var(--x[, 폴백])` · 수(뒤에 다른 단위가 붙으면 실패) · 연산자 · 괄호. */
const CALC_TOKEN = /\s+|calc\(|var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)|(\d*\.?\d+)(px)?(?![\w%])|[-+*/()]/y;

/**
 * `calc()` 를 계산한다 — px · 단위 없는 수 · 해석값이 그런 수 하나인 `var(--토큰)` 만. 그 밖(% · vw · ch · 지역 변수 · 템플릿 `${}`)이 하나라도
 * 끼면 null(계산할 수 없음 — 판정하지 않는다). Tailwind 임의값의 `_`(공백)과 붙여 쓴 `-`(`…)-var(…`)도 읽는다.
 */
function evaluateCalc(expr: string, tokens: Readonly<Record<string, string>>): Num | null {
  const words: (Num | string)[] = [];
  const src = expr.replace(/_/g, " ");
  CALC_TOKEN.lastIndex = 0;
  while (CALC_TOKEN.lastIndex < src.length) {
    const at = CALC_TOKEN.lastIndex;
    const m = CALC_TOKEN.exec(src);
    if (!m || m.index !== at) return null;
    const [whole, varName, fallback, digits, unit] = m;
    if (/^\s+$/.test(whole)) continue;
    if (whole === "calc(") words.push("(");
    else if (varName) {
      const raw = (tokens[varName] ?? fallback)?.trim();
      const num = raw === undefined ? null : /^(-?\d*\.?\d+)(px)?$/.exec(raw);
      if (!num) return null;
      words.push({ n: Number(num[1]), px: num[2] === "px" });
    } else if (digits !== undefined) words.push({ n: Number(digits), px: unit === "px" });
    else words.push(whole);
  }
  let i = 0;
  const peek = (): Num | string | undefined => words[i];
  const expression = (): Num | null => {
    let left = term();
    while (left && (peek() === "+" || peek() === "-")) {
      const op = words[i++];
      const right = term();
      if (!right || right.px !== left.px) return null;
      left = { n: op === "+" ? left.n + right.n : left.n - right.n, px: left.px };
    }
    return left;
  };
  const term = (): Num | null => {
    let left = factor();
    while (left && (peek() === "*" || peek() === "/")) {
      const op = words[i++];
      const right = factor();
      if (!right) return null;
      if (op === "*") {
        if (left.px && right.px) return null;
        left = { n: left.n * right.n, px: left.px || right.px };
      } else {
        if (right.px || right.n === 0) return null;
        left = { n: left.n / right.n, px: left.px };
      }
    }
    return left;
  };
  const factor = (): Num | null => {
    const word = words[i++];
    if (word === "-") {
      const inner = factor();
      return inner ? { n: -inner.n, px: inner.px } : null;
    }
    if (word === "(") {
      const inner = expression();
      return words[i++] === ")" ? inner : null;
    }
    return typeof word === "object" ? word : null;
  };
  const result = expression();
  return result && i === words.length ? result : null;
}

/** 본문의 `calc(…)` 를 괄호 짝까지 잘라 낸다(중첩이면 바깥 · 안쪽 둘 다). */
function calcExpressions(code: string): readonly Located[] {
  const out: Located[] = [];
  for (const m of code.matchAll(/calc\(/g)) {
    let depth = 0;
    for (let j = m.index; j < code.length; j++) {
      if (code[j] === "(") depth++;
      else if (code[j] === ")" && --depth === 0) {
        out.push({ text: code.slice(m.index, j + 1), line: code.slice(0, m.index).split("\n").length });
        break;
      }
    }
  }
  return out;
}

/* ── 1. 토큰 ──────────────────────────────────────────────────────────────── */

/** 생성물 셋 — 소비자가 받는 토큰 값 전부. cursors.css 의 커서 이미지(url 문자열)와 핫스팟(단위 없는 수)은 px 검사에 걸리지 않는다. */
const GENERATED = ["generated/tokens.css", "generated/theme.tailwind.css", "generated/cursors.css"] as const;
const model = loadTokenModelFrom(GENERATED);
const RESOLVED = { light: resolvedMap(model, "light"), dark: resolvedMap(model, "dark") } as const;

/** 글자 크기(`--text-body`)와 줄 높이(`--text-body--line-height` · `--leading-*`) — px 여야 한다. */
const FONT_SIZE = /^--text-(?!.*--)[a-z0-9-]+$/;
const LINE_HEIGHT = /^--(?:text-[a-z0-9-]+--line-height|leading-[a-z0-9-]+)$/;

interface TokenFinding {
  readonly name: string;
  readonly value: string;
  /** 짝수가 아닌 조각(정렬). 줄 높이 · 글자 크기가 px 가 아니면 값 전체. */
  readonly odd: readonly string[];
}

/** 해석된 토큰 맵에서 짝수 규칙을 어긴 것 — 허용 목록을 보기 전의 판정이다(검출기를 가짜 맵으로 증명하려고 둘을 가른다). */
function tokenFindings(resolved: Readonly<Record<string, string>>): readonly TokenFinding[] {
  const out: TokenFinding[] = [];
  for (const [name, value] of Object.entries(resolved)) {
    if ((FONT_SIZE.test(name) || LINE_HEIGHT.test(name)) && !/^\d+(?:\.\d+)?px$/.test(value)) {
      out.push({ name, value, odd: [value] });
      continue;
    }
    const odd = pxLengths(value)
      .filter((l) => !isEven(l.px))
      .map((l) => l.text)
      .sort();
    if (odd.length) out.push({ name, value, odd });
  }
  return out;
}

/**
 * 홀수가 남는 토큰 — 이름 → 허용하는 홀수 조각(정렬, 같은 조각이 둘이면 둘) · 이유. 실제 조각과 **같아야** 한다(래칫).
 * 헤어라인은 선 그 자체라 2px 이면 선이 아니라 홈이 된다 — 여기 남는 1px 는 전부 «선» 이다.
 */
const ODD_TOKENS: Readonly<Record<string, { readonly odd: readonly string[]; readonly why: string }>> = {
  "--radius-full": {
    odd: ["9999px"],
    why: "pill 센티널 — 치수가 아니라 «상자 반보다 크면 반원이 된다» 는 표식(Tailwind 관행값). 어떤 짝수로 바꿔도 그림이 같다",
  },
  "--shadow-card": { odd: ["1px"], why: "첫 겹의 y 오프셋 1px — 카드 밑변의 헤어라인 그림자" },
  "--shadow-chip": { odd: ["1px"], why: "y 오프셋 1px — 가장 낮은 층의 헤어라인 그림자" },
  "--shadow-modal": {
    odd: ["1px"],
    why: "0 0 0 1px — 그림자 안에 넣은 테두리 헤어라인(부유 레이어가 border 를 따로 그리지 않는다, layer.json)",
  },
  "--shadow-pop": { odd: ["1px"], why: "0 0 0 1px — modal 과 같은 그림자 속 테두리 헤어라인" },
  "--space-hairline": { odd: ["1px"], why: "헤어라인 — 패널 사이를 가르는 선 그 자체(옛 --gap)" },
};

describe("짝수 치수 — 토큰", () => {
  it("검출기가 가짜 토큰에서 위반만 골라낸다", () => {
    const probe = {
      "--size-ok": "12px",
      "--size-odd": "13px",
      "--text-x": "13.5px",
      "--text-x--line-height": "1.55",
      "--text-y": "14px",
      "--text-y--line-height": "20px",
      "--leading-x": "1.375",
      "--shadow-x": "0 1px 3px rgb(25 31 40 / 0.05), 0 0 0 2px red",
      "--layer-x": "41",
      "--duration-x": "350ms",
      "--tracking-x": "0.09em",
      "--cursor-x": `url("data:image/svg+xml,%3Csvg width='31px'%3E") 3 5, default`,
    };
    expect(tokenFindings(probe).map((f) => `${f.name}: ${f.odd.join(" ")}`)).toEqual([
      "--size-odd: 13px",
      "--text-x: 13.5px",
      "--text-x--line-height: 1.55",
      "--leading-x: 1.375",
      "--shadow-x: 1px 3px",
    ]);
  });

  it("글자 사다리는 결정 그대로다 — 크기 / 줄 높이 모두 짝수 px(사용자 결정 «짝수 사다리 compact», #82)", () => {
    const scale = Object.fromEntries(
      Object.entries(RESOLVED.light)
        .filter(([name]) => FONT_SIZE.test(name))
        .map(([name, size]) => [
          name.slice("--text-".length),
          `${size} / ${RESOLVED.light[`${name}--line-height`] ?? "?"}`,
        ]),
    );
    expect(scale).toEqual({
      micro: "10px / 14px",
      label: "12px / 16px",
      body: "14px / 20px",
      control: "14px / 20px",
      title: "16px / 24px",
      readout: "22px / 28px",
      display: "26px / 32px",
    });
  });

  it.each(["light", "dark"] as const)("토큰의 px 는 짝수다 — 허용 목록 밖은 실패(%s)", (mode) => {
    const unexpected = tokenFindings(RESOLVED[mode])
      .filter((f) => ODD_TOKENS[f.name]?.odd.join(" ") !== f.odd.join(" "))
      .map((f) => `${f.name}: ${f.value} (홀수 · 소수 · 비율: ${f.odd.join(" ")})`);
    expect(
      unexpected,
      "토큰 정본(tokens/*.json)의 값을 짝수 px 로 고친다. 헤어라인처럼 홀수여야 하는 것만 ODD_TOKENS 에 이유와 함께 적는다",
    ).toEqual([]);
  });

  it("허용 목록은 실제와 같다 — 고쳐서 홀수가 사라진 토큰은 목록에서 지운다", () => {
    const found = new Map(tokenFindings(RESOLVED.light).map((f) => [f.name, f.odd.join(" ")]));
    const stale = Object.entries(ODD_TOKENS)
      .filter(([name, entry]) => found.get(name) !== entry.odd.join(" "))
      .map(([name, entry]) => `${name}: 목록 ${entry.odd.join(" ")} → 실제 ${found.get(name) ?? "(짝수)"}`);
    expect(stale).toEqual([]);
    for (const [name, entry] of Object.entries(ODD_TOKENS))
      expect(entry.why.length, name).toBeGreaterThan(10);
    expect(Object.keys(ODD_TOKENS)).toEqual(Object.keys(ODD_TOKENS).sort());
  });
});

/* ── 2. 소스 ──────────────────────────────────────────────────────────────── */

/** 허용 — 조각(검출된 글자 그대로) → 횟수, 그리고 이유. */
interface Allowance {
  readonly uses: Readonly<Record<string, number>>;
  readonly why: string;
}

/**
 * 아이콘 — 홀수여야 광학적으로 맞는 크기(사용자 결정의 예외). **오늘 0** 이다: 아이콘은 12 · 16 · 20 · 24px(`--size-icon-*` · size-3/4/5/6)와
 * 커서 32px 뿐이다. 더할 때는 파일 → 조각(`size-[15px]` 의 `15px` · `size-3.75` · `size={15}` 의 `size={15`) → 횟수와 «왜 짝수로는 육안으로
 * 맞지 않는가» 를 적는다. 크기를 정하는 세 규칙(px-literal · spacing-step · js-number)이 함께 읽는다.
 */
const ICON_EXCEPTIONS: Readonly<Record<string, Allowance>> = {};

interface Rule {
  readonly id: string;
  /** 왜 흩어지면 안 되는가 — 실패 메시지에 그대로 실린다. */
  readonly why: string;
  readonly kinds: readonly SourceFileInfo["kind"][];
  /** 짝수 규칙을 어긴 조각 — 허용 목록을 보기 전의 판정. */
  readonly find: (file: SourceFileInfo) => readonly Located[];
  /** 파일 → 허용. 경로 오름차순 · 실제 횟수와 같아야 한다(래칫). */
  readonly allow: Readonly<Record<string, Allowance>>;
  /** 아이콘 예외(ICON_EXCEPTIONS)를 함께 읽는가. */
  readonly icons: boolean;
  /** 검출기 증명 — 가짜 본문과 잡아야 할 조각. */
  readonly probes: readonly {
    readonly path: string;
    readonly source: string;
    readonly hits: readonly string[];
  }[];
}

/** Tailwind 숫자 유틸의 접두 — 값이 `--spacing`(4px) × n 인 것(간격 · 치수 · 위치 · 이동). */
const STEP_PREFIX =
  "(?:p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?|top|right|bottom|left|start|end|w|h|size|min-[wh]|max-[wh]|translate-[xy]|basis|indent|scroll-[mp][xytrblse]?)";

const RULES: readonly Rule[] = [
  {
    id: "px-literal",
    why: "px 리터럴은 짝수다 — 홀수 · 소수(13.5px · 9.5px · 1.5px)는 가운데 정렬에서 반 픽셀을 낳는다. 1px 는 헤어라인(테두리 · 선)일 때만 허용 목록에 이유와 함께 둔다",
    kinds: ["ts", "tsx", "css"],
    find: (file) =>
      matches(file.code, /(?<![\da-zA-Z.])\d*\.?\d+px(?![a-zA-Z\d])/g).filter(
        (hit) => !isEven(parseFloat(hit.text)),
      ),
    allow: {
      "canvas.css": {
        uses: { "1px": 2 },
        why: "범례 빗금(.ds-legend-hatch)의 1px 먹선 — repeating-linear-gradient 의 선 두께와 그 끝. 캔버스의 헤어라인",
      },
      "theme.css": {
        uses: { "1px": 2 },
        why: "focus-ring 의 outline-offset 1px(링을 컨트롤 테두리에서 한 줄 띄우는 최소 간격)과 아코디언 항목 테두리 1px — 헤어라인",
      },
    },
    icons: true,
    probes: [
      {
        path: "primitives/__probe__.tsx",
        source: [
          'const a = cn("h-[13px] w-[12px]", "translate-y-[0.5px] shadow-[0_0_0_3px_red]");',
          'const b = { paddingRight: "calc(2ch + 10px)", top: "-7px" };',
          "// 9.5px 는 10px 로",
        ].join("\n"),
        hits: ["13px", "0.5px", "3px", "7px"],
      },
      {
        path: "primitives/__probe__.css",
        source: [
          ":root { --x-offset: 11px; --y: 12px; }",
          ".ds-x { padding: 2px 3px; border: 1px solid; font-size: 9.5px; outline-offset: 0px; }",
          "/* 13px 은 주석 */",
        ].join("\n"),
        hits: ["11px", "3px", "1px", "9.5px"],
      },
    ],
  },
  {
    id: "calc",
    why: "calc() 의 결과도 짝수다 — 토큰끼리 빼고 곱한 값(`radius-lg − hairline` = 11px)이 홀수가 되기 쉽다. 헤어라인에서 파생된 동심원만 허용 목록에 둔다",
    kinds: ["ts", "tsx", "css"],
    find: (file) =>
      calcExpressions(file.code).filter((hit) => {
        const result = evaluateCalc(hit.text, RESOLVED.light);
        return result !== null && result.px && !isEven(result.n);
      }),
    allow: {
      "primitives/MediaCard.tsx": {
        uses: { "calc(var(--radius-lg)-var(--space-hairline))": 1 },
        why: "헤어라인에서 파생된 동심원 — 1px 테두리의 안쪽 윤곽(lg 12 − 1 = 11px)을 따라 도는 선택 링(:after)의 반경. 짝수로 돌리면 링과 테두리 사이가 모서리에서 벌어진다",
      },
    },
    icons: false,
    probes: [
      {
        path: "primitives/__probe__.tsx",
        source: [
          'const a = "rounded-[calc(var(--radius-md)-var(--spacing))] rounded-[calc(var(--radius-lg)-var(--space-hairline))]";',
          'const b = "[--thumb:calc(var(--spacing)*3)] [--x:calc(var(--spacing)*0.25)] p-[calc(var(--spacing)_*_2.5)]";',
          'const c = "w-[calc(100%-var(--spacing))] h-[calc(var(--size-control-md)/2_+_1px)] m-[calc(-1*var(--spacing)*1.25)]";',
          "const d = `calc(var(--local) / 2 + ${n}px)`;",
        ].join("\n"),
        hits: [
          "calc(var(--radius-lg)-var(--space-hairline))",
          "calc(var(--spacing)*0.25)",
          "calc(var(--size-control-md)/2_+_1px)",
          "calc(-1*var(--spacing)*1.25)",
        ],
      },
      {
        path: "primitives/__probe__.css",
        source: [
          ".ds-x { padding: calc(var(--spacing) * 2.5) calc(var(--spacing) * 0.75); }",
          ".ds-y { width: calc(100vw - 2 * var(--space-dialog-gutter-x)); height: calc(var(--size-control-sm) / 4); }",
        ].join("\n"),
        hits: ["calc(var(--spacing) * 0.75)", "calc(var(--size-control-sm) / 4)"],
      },
    ],
  },
  {
    id: "spacing-step",
    why: "Tailwind 숫자 유틸은 4px × n 이다 — n 이 0.5 의 배수가 아니면(0.25 · 1.75 …) 홀수 · 소수 px 가 된다. 간격은 4px 격자(ESLint), 치수는 짝수",
    kinds: ["ts", "tsx"],
    find: (file) =>
      matches(file.code, new RegExp(`(?<![\\w-])-?${STEP_PREFIX}-\\d*\\.?\\d+(?![\\w./%-])`, "g")).filter(
        (hit) => !isEven(4 * parseFloat(hit.text.slice(hit.text.lastIndexOf("-") + 1))),
      ),
    allow: {},
    icons: true,
    probes: [
      {
        path: "primitives/__probe__.tsx",
        source: [
          'const a = cn("h-1.25 size-3.75 -mt-0.25 p-2.5 gap-1.5 w-1/2 -translate-x-1/2 min-w-5.5");',
          'const b = "data-[state=on]:translate-x-4.75 inset-x-0 basis-28 grid-cols-3";',
        ].join("\n"),
        hits: ["h-1.25", "size-3.75", "-mt-0.25", "translate-x-4.75"],
      },
    ],
  },
  {
    id: "px-utility",
    why: "`*-px` 유틸(h-px · gap-px · p-px …)은 1px 치수다 — 선 그 자체(구분선 · 연결선 · 눈금)이거나 이웃의 1px 테두리를 겹치는 자리만 허용 목록에 둔다. 여백 1px(py-px · p-px · gap-px 틈)는 짝수 치수로 바꾼다",
    kinds: ["ts", "tsx"],
    find: (file) => matches(file.code, /(?<![\w-])-?[a-z]+(?:-[a-z]+)*-px(?![\w-])/g),
    allow: {
      "data/DataTable.tsx": {
        uses: { "size-px": 1 },
        why: "숨긴 캡션(sr-only)의 1px 클립 상자 — 화면에서 숨기는 표준 기법이라 보이는 치수가 아니다",
      },
      "data/Readout.variants.ts": {
        uses: { "gap-px": 1 },
        why: "칸 사이 1px 틈이 곧 구분선이다 — 묶음 바탕이 테두리색이라 틈이 선으로 보인다(divide-x 는 줄바꿈된 줄의 첫 칸에도 선을 긋는다)",
      },
      "navigation/AppShell.variants.ts": {
        uses: { "-mr-px": 1 },
        why: "flush 인스펙터 손잡이가 인스펙터의 1px 왼쪽 테두리 위에 겹쳐 앉는다 — 선이 두 줄로 서지 않게",
      },
      "navigation/ResizablePanels.variants.ts": {
        uses: { "h-px": 1, "w-px": 1 },
        why: "끌개 손잡이의 1px 선(가로 · 세로) — 누르는 영역은 before: 가상 요소가 넓힌다",
      },
      "navigation/Stepper.variants.ts": {
        uses: { "h-px": 1, "w-px": 1 },
        why: "단계 사이 연결선(가로 · 세로)",
      },
      "navigation/Toolbar.tsx": { uses: { "w-px": 1 }, why: "ToolbarDivider — 도구 묶음 사이 세로 구분선" },
      "navigation/TopBar.tsx": { uses: { "w-px": 1 }, why: "제목과 경로(breadcrumb) 사이 세로 구분선" },
      "overlay/Command.tsx": { uses: { "h-px": 1 }, why: "CommandSeparator — 묶음 사이 구분선" },
      "overlay/ContextMenu.tsx": { uses: { "h-px": 1 }, why: "ContextMenuSeparator — 메뉴 구분선" },
      "overlay/DropdownMenu.tsx": { uses: { "h-px": 1 }, why: "DropdownMenuSeparator — 메뉴 구분선" },
      "primitives/Button.tsx": {
        uses: { "-ml-px": 1 },
        why: "ButtonGroup — 이웃 버튼의 1px 테두리를 겹쳐 묶음 안 선을 한 줄로 만든다",
      },
      "primitives/Misc.tsx": { uses: { "h-px": 1, "w-px": 1 }, why: "Separator(가로 · 세로) — 선 그 자체" },
      "primitives/Select.tsx": { uses: { "h-px": 1 }, why: "SelectSeparator — 목록 구분선" },
      "primitives/Slider.tsx": { uses: { "w-px": 1 }, why: "눈금(mark)의 1px 세로 선" },
    },
    icons: false,
    probes: [
      {
        path: "primitives/__probe__.tsx",
        source: [
          'const a = cn("h-px w-full bg-border", "py-px gap-px", "[&>*+*]:-ml-px");',
          'const b = "px-3 text-px-like size-pxl --space-px";',
        ].join("\n"),
        hits: ["h-px", "py-px", "gap-px", "-ml-px"],
      },
    ],
  },
  {
    id: "ratio-leading",
    why: "비율 줄 높이(leading-snug · normal · relaxed · 숫자)는 글자 크기와 곱해 소수 px(13 × 1.625 = 21.1px)를 낸다 — 글자 토큰(text-*)의 짝수 px 줄 높이를 쓰고, 한 줄 컨트롤은 leading-none",
    kinds: ["ts", "tsx", "css"],
    find: (file) =>
      file.kind === "css"
        ? matches(file.code, /line-height\s*:\s*(?:\d*\.?\d+(?![\w%])|var\(--leading-[\w-]+\))/g).filter(
            (hit) => !/:\s*1$/.test(hit.text),
          )
        : matches(file.code, /(?<![\w-])leading-(?:tight|snug|normal|relaxed|loose|\d*\.?\d+)(?![\w-])/g),
    allow: {},
    icons: false,
    probes: [
      {
        path: "primitives/__probe__.tsx",
        source: [
          'const a = cn("text-title leading-snug", "text-body leading-relaxed", "leading-5");',
          'const b = "leading-none leading-(--size-kbd) text-label";',
        ].join("\n"),
        hits: ["leading-snug", "leading-relaxed", "leading-5"],
      },
      {
        path: "primitives/__probe__.css",
        source:
          ".ds-x { line-height: 1.55; } .ds-y { line-height: 1; line-height: var(--leading-relaxed); line-height: 20px; }",
        hits: ["line-height: 1.55", "line-height: var(--leading-relaxed)"],
      },
    ],
  },
  {
    id: "line-width",
    why: "선 굵기 유틸(border-* · ring-* · outline-* · divide-* · stroke-*)은 1(헤어라인) 아니면 짝수다 — 3px 선은 가운데 정렬에서 반 픽셀을 낳는다",
    kinds: ["ts", "tsx"],
    find: (file) =>
      matches(
        file.code,
        /(?<![\w-])(?:border(?:-[xytrblse])?|ring(?:-offset)?|outline(?:-offset)?|divide-[xy]|stroke|decoration|underline-offset)-\d+(?![\w.-])/g,
      ).filter((hit) => {
        const n = Number(hit.text.slice(hit.text.lastIndexOf("-") + 1));
        return n !== 1 && !isEven(n);
      }),
    allow: {},
    icons: false,
    probes: [
      {
        path: "primitives/__probe__.tsx",
        source:
          'const a = cn("border border-2 border-t-3 ring-1 ring-3 outline-offset-1 divide-x-5 stroke-2 underline-offset-3");',
        hits: ["border-t-3", "ring-3", "divide-x-5", "underline-offset-3"],
      },
    ],
  },
  {
    id: "js-number",
    why: "JS 숫자 치수(h · w · size · width · height · Radix 의 sideOffset · alignOffset · collisionPadding · arrowPadding)도 px 다 — 짝수로",
    kinds: ["ts", "tsx"],
    find: (file) =>
      matches(
        file.code,
        /\b(?:h|w|size|width|height|sideOffset|alignOffset|collisionPadding|arrowPadding)\s*(?:=\s*\{?|:)\s*-?\d*\.?\d+(?![\w.%])/g,
      ).filter((hit) => !isEven(parseFloat(hit.text.slice(hit.text.search(/-?\d*\.?\d+$/))))),
    allow: {},
    icons: true,
    probes: [
      {
        path: "overlay/__probe__.tsx",
        source: [
          "function P({ sideOffset = 5, alignOffset = 4, h = 12 }: Props) {}",
          "<Skeleton h={13} w={120} />;",
          "const BOX = { width: 121, height: 20, size: 9.5 } as const;",
          "<Icon size={16} strokeWidth={1.6} />;",
          "if (h === 3) {}",
        ].join("\n"),
        hits: ["sideOffset = 5", "h={13", "width: 121", "size: 9.5"],
      },
    ],
  },
];

/** 렌더되지 않는 도구 — 소비자 테스트 도우미(testing/) · 린트 프리셋(eslint/) · CLI(agent/). 문장 속 «1px 테두리» 는 치수가 아니라 설명이다. */
const TOOLING = /^(?:testing|eslint|agent)\//;
const SOURCES = [...sourceGraph().values()].filter((file) => !file.excluded && !TOOLING.test(file.path));

/** 규칙의 실제 조각 — 파일 → 조각 → 줄 번호들. */
function hitsOf(rule: Rule): ReadonlyMap<string, ReadonlyMap<string, readonly number[]>> {
  const out = new Map<string, Map<string, number[]>>();
  for (const file of SOURCES) {
    if (!rule.kinds.includes(file.kind)) continue;
    for (const hit of rule.find(file)) {
      const byText = out.get(file.path) ?? new Map<string, number[]>();
      byText.set(hit.text, [...(byText.get(hit.text) ?? []), hit.line]);
      out.set(file.path, byText);
    }
  }
  return out;
}

/** 파일 · 조각의 허용 횟수 — 규칙의 목록 + (크기 규칙이면) 아이콘 예외. */
function allowed(rule: Rule, path: string, text: string): number {
  return (rule.allow[path]?.uses[text] ?? 0) + (rule.icons ? (ICON_EXCEPTIONS[path]?.uses[text] ?? 0) : 0);
}

describe("짝수 치수 — 소스 그래프", () => {
  it("도구 · 스펙 · 스토리 · 생성물을 빼고 렌더되는 소스를 센다", () => {
    const paths = SOURCES.map((file) => file.path);
    expect(paths).toContain("primitives/Button.tsx");
    expect(paths).toContain("theme.css");
    expect(paths).toContain("canvas.css");
    expect(
      paths.some((p) => TOOLING.test(p) || p.startsWith("generated/") || p.endsWith(".stories.tsx")),
    ).toBe(false);
  });

  it("calc 계산기 — 토큰을 해석해 px 를 낸다(계산할 수 없으면 null)", () => {
    const tokens = { "--spacing": "4px", "--radius-lg": "12px", "--space-hairline": "1px", "--x": "1.5" };
    expect(evaluateCalc("calc(var(--radius-lg)-var(--space-hairline))", tokens)).toEqual({ n: 11, px: true });
    expect(evaluateCalc("calc(var(--spacing)_*_2.5)", tokens)).toEqual({ n: 10, px: true });
    expect(evaluateCalc("calc(-1 * (var(--spacing) + 2px) / 2)", tokens)).toEqual({ n: -3, px: true });
    expect(evaluateCalc("calc(var(--x) * 2)", tokens)).toEqual({ n: 3, px: false });
    expect(evaluateCalc("calc(100% - var(--spacing))", tokens)).toBeNull();
    expect(evaluateCalc("calc(var(--missing) * 2)", tokens)).toBeNull();
    expect(evaluateCalc("calc(var(--missing, 6px) * 2)", tokens)).toEqual({ n: 12, px: true });
    expect(evaluateCalc("calc(4px * 2px)", tokens)).toBeNull();
    expect(evaluateCalc("calc(4px + 2)", tokens)).toBeNull();
  });

  it("아이콘 예외는 크기 규칙이 읽고, 경로 오름차순 · 이유가 있다(오늘 0)", () => {
    expect(Object.keys(ICON_EXCEPTIONS)).toEqual(Object.keys(ICON_EXCEPTIONS).sort());
    for (const [path, entry] of Object.entries(ICON_EXCEPTIONS)) {
      expect(entry.why.length, path).toBeGreaterThan(10);
      for (const [text, count] of Object.entries(entry.uses)) {
        const used = RULES.filter((rule) => rule.icons).reduce(
          (sum, rule) => sum + (hitsOf(rule).get(path)?.get(text)?.length ?? 0),
          0,
        );
        expect(used, `${path} ${text}: 아이콘 예외가 실제보다 크다 — 목록을 낮춘다`).toBeGreaterThanOrEqual(
          count,
        );
      }
    }
  });
});

describe.each(RULES)("짝수 치수 — $id", (rule) => {
  const hits = hitsOf(rule);

  it("검출기가 가짜 본문에서 위반만 골라낸다", () => {
    for (const probe of rule.probes)
      expect(
        rule.find(parseSource(probe.path, probe.source)).map((hit) => hit.text),
        probe.path,
      ).toEqual(probe.hits);
  });

  it("허용 목록 밖의 홀수 · 소수 치수가 없다", () => {
    const grown = [...hits].flatMap(([path, byText]) =>
      [...byText]
        .filter(([text, lines]) => lines.length > allowed(rule, path, text))
        .map(
          ([text, lines]) =>
            `${path}: ${text} × ${lines.length} (허용 ${allowed(rule, path, text)}) — 줄 ${lines.join(", ")}`,
        ),
    );
    expect(grown, rule.why).toEqual([]);
  });

  it("허용 목록은 실제와 같다 — 고쳐서 줄었으면 목록을 낮춘다(0 이면 지운다)", () => {
    const stale = Object.entries(rule.allow).flatMap(([path, entry]) =>
      Object.entries(entry.uses)
        .filter(([text, count]) => (hits.get(path)?.get(text)?.length ?? 0) < count)
        .map(
          ([text, count]) =>
            `${path}: ${text} 목록 ${count} → 실제 ${hits.get(path)?.get(text)?.length ?? 0}`,
        ),
    );
    expect(stale).toEqual([]);
  });

  it("허용 목록은 경로 오름차순이고 항목마다 이유가 있다", () => {
    const paths = Object.keys(rule.allow);
    expect(paths).toEqual([...paths].sort());
    for (const [path, entry] of Object.entries(rule.allow)) {
      expect(entry.why.length, path).toBeGreaterThan(10);
      for (const [text, count] of Object.entries(entry.uses))
        expect(count, `${path} ${text}`).toBeGreaterThan(0);
    }
  });
});
