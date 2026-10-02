/**
 * `@jhleeweb/jhlee-design-system/eslint` — 소비 레포용 ESLint flat config 조각(계획 §2.5-a, #31).
 *
 * «인라인 CSS 덮어쓰기 금지·토큰 밖 값 금지» 는 문서가 아니라 린트가 고정한다 — 문서는 LLM 이 읽고도 잊지만 린트는 커밋마다 돈다.
 * 조각이 잡는 것 다섯:
 *  1. `no-restricted-syntax`(요소) — raw `button input select textarea dialog table` 대신 DS 컴포넌트. `react/forbid-elements` 와 같은 일을
 *     코어 규칙으로 한다 — eslint-plugin-react 7.37.5 의 peer 가 ESLint 10 을 빼 npm 소비자의 설치가 ERESOLVE 로 죽었다(#33).
 *  2. `better-tailwindcss/no-unknown-classes` — theme.css 밖의 클래스. Tailwind 기본 사다리는 `initial` 로 지웠으므로 LLM 이 쓴
 *     `text-sm`·`bg-gray-100` 은 **CSS 없이 조용히 무시된다** — 여기서 즉시 오류로 바꾼다. `entryPoint` 는 소비자의 진입 CSS 다.
 *  3. `better-tailwindcss/no-restricted-classes` — hex·색 함수·단위 리터럴·격자 밖 간격 + 옛 이름 개명(`{pattern, fix}` = `--fix` 가 곧 코드모드).
 *  4. `no-restricted-syntax` — `style={{ color | background | border … }}`. 캔버스·3D 디렉터리는 `styleIgnores` 로 뺀다.
 *  5. `ds/legacy-tone` — 옛 톤 키(`accent`·`ok`…)를 새 키로(`--fix`).
 *
 * 루트 eslint.config.js 도 같은 패턴(`restrictedClassPatterns` · `SPACING_*`)을 여기서 가져간다 — 두 곳에 적으면 하나가 뒤처진다. 그래서 이 디렉터리의
 * 상대 import 는 `.ts` 확장자를 단다: Node 24 가 빌드 없이 이 파일을 읽을 때(type stripping) 확장자 없는 지정자를 풀지 못한다. tsdown 은 출력에서 `.js` 로 바꾼다.
 * 플러그인 둘(eslint-plugin-better-tailwindcss · eslint)은 optional peer 다 — 프리셋을 import 하는 소비자만 설치한다.
 *
 * @example
 * // eslint.config.js (소비 레포)
 * import { jhleeDesignSystem } from "@jhleeweb/jhlee-design-system/eslint";
 * export default [...jhleeDesignSystem({ entryPoint: new URL("./src/app/globals.css", import.meta.url).pathname })];
 */
import type { ESLint, Linter } from "eslint";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

import legacyClasses from "../generated/legacy-classes.json" with { type: "json" };
import legacyTone, { LEGACY_TONES } from "./rules/legacy-tone.ts";
import { SPACING_STEPS, SPACING_UTILITIES, spacingOffGridPattern, spacingStepsLabel } from "./spacing.ts";

export { LEGACY_TONES, SPACING_STEPS, SPACING_UTILITIES, spacingOffGridPattern };

/** `no-restricted-classes` 의 한 항목 — better-tailwindcss 의 `restrict` 모양이다. */
export interface RestrictedClass {
  /** 클래스 전체에 거는 정규식(문자열). */
  readonly pattern: string;
  /** 있으면 `--fix` 가 이 치환으로 고친다(`$1` 캡처 참조). */
  readonly fix?: string;
  /** 왜 막는가 — 진단 메시지. */
  readonly message: string;
}

/** 프리셋 옵션. */
export interface JhleeDesignSystemOptions {
  /** 소비 레포의 진입 CSS 절대 경로(`theme.css` 를 @import 하는 파일) — `no-unknown-classes` 가 이 파일에서 «아는 클래스» 를 읽는다. */
  readonly entryPoint: string;
  /**
   * 검사 대상 글롭.
   * @default ["**\/*.{js,jsx,ts,tsx}"]
   */
  readonly files?: readonly string[];
  /**
   * 인라인 스타일 규칙(4)에서 뺄 글롭 — 캔버스·3D 처럼 색을 계산해 넣는 디렉터리.
   * @default []
   */
  readonly styleIgnores?: readonly string[];
  /**
   * 두 플러그인 규칙의 심각도. 처음 붙일 때 `"warn"` 으로 실측한 뒤 `"error"` 로 올린다.
   * @default "error"
   */
  readonly severity?: "error" | "warn";
}

/** raw 요소 → DS 컴포넌트. `dialog` 는 Modal/Drawer/ConfirmDialog, `table` 은 Table/DataTable 이다. */
const FORBIDDEN_ELEMENTS: readonly { element: string; message: string }[] = [
  {
    element: "button",
    message: "Use <Button> from @jhleeweb/jhlee-design-system instead of a raw <button>.",
  },
  {
    element: "input",
    message:
      "Use <Input> / <Checkbox> / <Switch> / <RadioGroupItem> from @jhleeweb/jhlee-design-system instead of a raw <input>.",
  },
  {
    element: "select",
    message: "Use <Select> from @jhleeweb/jhlee-design-system instead of a raw <select>.",
  },
  {
    element: "textarea",
    message: "Use <Textarea> from @jhleeweb/jhlee-design-system instead of a raw <textarea>.",
  },
  {
    element: "dialog",
    message:
      "Use <Modal> / <Drawer> / <ConfirmDialog> from @jhleeweb/jhlee-design-system instead of a raw <dialog>.",
  },
  {
    element: "table",
    message: "Use <Table> / <DataTable> from @jhleeweb/jhlee-design-system instead of a raw <table>.",
  },
];

/**
 * raw 요소 선택자 — JSX 의 소문자 태그(`<button>`)와 `createElement("button")` 을 잡는다. `<Button>`(대문자)·`<ui.button>`(멤버)은 JSXIdentifier 이름이
 * 다르거나 모양이 달라 걸리지 않는다 — `react/forbid-elements` 와 같은 범위다.
 */
const elementSelectors = (): { selector: string; message: string }[] =>
  FORBIDDEN_ELEMENTS.flatMap(({ element, message }) => [
    { selector: `JSXOpeningElement > JSXIdentifier.name[name="${element}"]`, message },
    {
      selector: `CallExpression[callee.property.name="createElement"] > Literal.arguments:first-child[value="${element}"]`,
      message,
    },
  ]);

/** `style={{ … }}` 에서 막는 키 — 색·면·테두리·그림자. 치수(width·transform)는 캔버스 계산에 쓰이므로 두지 않는다. */
const STYLE_KEYS =
  "color|background|backgroundColor|border|borderColor|borderTop|borderRight|borderBottom|borderLeft|outline|outlineColor|boxShadow|fill|stroke";

/**
 * `no-restricted-classes` 의 전체 패턴 — 옛 이름 개명(생성물 `legacy-classes.json`)이 앞에 와서 개명이 다른 진단보다 먼저 보인다.
 * 루트 eslint.config.js 와 프리셋이 같은 배열을 쓴다.
 */
export function restrictedClassPatterns(): RestrictedClass[] {
  return [
    ...(legacyClasses as RestrictedClass[]),
    // raw 색 — hex 와 색 함수. 크롬의 색은 토큰 유틸뿐이다(계획 §2.5-d).
    { pattern: "^.*\\[#[0-9a-fA-F]{3,8}\\]$", message: "Hex colour in a class — use a colour token." },
    {
      pattern: "^.*\\[(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color)\\(.*\\]$",
      message: "Raw colour function in a class — use a colour token.",
    },
    // 임의 단위 — px·rem·em·ms 는 토큰 밖 값이다.
    {
      pattern: "^.*\\[[^\\]]*\\d+(?:\\.\\d+)?(?:px|rem|em|ms)[^\\]]*\\]$",
      message: "Unit literal in a class — use a token utility.",
    },
    // 간격 격자 — 4px 기반, 허용 스텝 화이트리스트. 간격 계열에만.
    {
      pattern: spacingOffGridPattern(),
      message: `Spacing step off the 4px grid — allowed steps are ${spacingStepsLabel()} (px = 4 × step).`,
    },
  ];
}

/** 프리셋이 싣는 로컬 규칙 플러그인 `ds` — 소비 레포는 `ds/legacy-tone` 하나를 받는다. */
export const dsPlugin: ESLint.Plugin = {
  meta: { name: "@jhleeweb/jhlee-design-system/eslint", version: "1" },
  rules: { "legacy-tone": legacyTone },
};

/**
 * 소비 레포 flat config 에 펼쳐 넣는 조각. `entryPoint` 는 필수다 — 없으면 `no-unknown-classes` 가 Tailwind 기본 사다리를 «아는 클래스» 로
 * 보고 `text-sm` 을 통과시킨다.
 */
export function jhleeDesignSystem(options: JhleeDesignSystemOptions): Linter.Config[] {
  const files = [...(options.files ?? ["**/*.{js,jsx,ts,tsx}"])];
  const severity = options.severity ?? "error";
  const styleIgnores = [...(options.styleIgnores ?? [])];
  return [
    {
      name: "jhlee-design-system/elements",
      files,
      rules: { "no-restricted-syntax": [severity, ...elementSelectors()] },
    },
    {
      name: "jhlee-design-system/classes",
      files,
      plugins: { "better-tailwindcss": betterTailwindcss },
      settings: { "better-tailwindcss": { entryPoint: options.entryPoint } },
      rules: {
        // `ds-*` 는 theme.css 가 @import 하는 컴포넌트 CSS 의 클래스다 — 토큰 밖 유틸리티가 아니라 DS 자신의 훅이다.
        "better-tailwindcss/no-unknown-classes": [
          severity,
          { entryPoint: options.entryPoint, ignore: ["^ds-"], detectComponentClasses: true },
        ],
        "better-tailwindcss/no-restricted-classes": [severity, { restrict: restrictedClassPatterns() }],
      },
    },
    {
      name: "jhlee-design-system/inline-style",
      files,
      ignores: styleIgnores,
      rules: {
        // 같은 규칙의 옵션은 뒤 설정이 통째로 덮으므로 요소 선택자를 다시 싣는다 — styleIgnores 안의 파일은 위 elements 만 받는다.
        "no-restricted-syntax": [
          severity,
          ...elementSelectors(),
          {
            selector: `JSXAttribute[name.name="style"] > JSXExpressionContainer > ObjectExpression > Property[key.name=/^(?:${STYLE_KEYS})$/]`,
            message:
              "Inline colour/border style — use a token utility class (bg-* text-* border-* shadow-*) instead.",
          },
        ],
      },
    },
    {
      name: "jhlee-design-system/tone",
      files,
      plugins: { ds: dsPlugin },
      rules: { "ds/legacy-tone": severity },
    },
  ];
}

export default jhleeDesignSystem;
