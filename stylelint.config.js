/* stylelint — 정적 검증 1층의 CSS 쪽(계획 §2.4 D-1, C4). ESLint 가 클래스 문자열의 리터럴을 잡는다면 여기는 손 CSS 의 리터럴을 잡는다:
 * 색·반경·글자·transition 은 `var(--…)` 만, 간격·치수는 px 숫자 금지, hex 금지, 커스텀 프로퍼티는 kebab-case.
 *
 * 예외의 «왜»:
 *  - `src/generated/*.css` 는 생성물이라 리터럴이 사는 유일한 자리다(정본 JSON 이 원천, tokens:check 가 최신성을 본다).
 *  - `canvas.css` 는 캔버스 면의 고정값(흰 바탕·radius 0·무채색)이 곧 계약이라 토큰을 거치지 않는다.
 *  - `corner.css` 는 `corner-shape` 진행형 향상의 규칙 파일이다 — 보정 반경 계산식이 `calc(var(--radius-*) * var(--corner-k))` 라 규칙이 잘못 읽는다(#26).
 *
 * 기준선이 없다 — 손 CSS 의 위반은 0 이다. 유일한 warning 기준선이던 `legacy/shell.css`(122건, `--max-warnings`)는 3.0.0 에서 파일째 지웠다(#49). */

/** 색이 들어가는 프로퍼티 — 값은 토큰 참조이거나 키워드다. 그림자·테두리 shorthand 도 색을 든다. */
const COLOR_PROPS =
  /^(color|background|background-color|border|border-(top|right|bottom|left)|border-color|border-(top|right|bottom|left)-color|outline|outline-color|box-shadow|fill|stroke|caret-color|accent-color|text-decoration-color)$/;
const RADIUS_PROPS = /^border-(top-left-|top-right-|bottom-left-|bottom-right-)?radius$/;
const FONT_PROPS = /^(font|font-family|font-size|font-weight|line-height|letter-spacing)$/;
const MOTION_PROPS =
  /^(transition|transition-duration|transition-delay|animation|animation-duration|animation-delay)$/;
const SPACING_PROPS =
  /^(padding|margin|gap|row-gap|column-gap|width|height|min-width|max-width|min-height|max-height|inset|top|right|bottom|left)(-(top|right|bottom|left|inline|block)(-(start|end))?)?$/;

/** stylelint 는 프로퍼티 키가 `/…/` 로 감싸져 있어야 정규식으로 읽는다(`.source` 만 넘기면 문자 그대로의 이름이 된다 — 첫 실행에서 0건이 나온 이유). */
const key = (re) => `/${re.source}/`;
/** 토큰 참조 또는 값 없는 키워드만. 0 과 `0s` 는 «없음» 이라 허용한다. */
const TOKEN_OR_KEYWORD = [/var\(--/, /^(inherit|initial|unset|revert|none|transparent|currentcolor|0|0s)$/i];

export default {
  ignoreFiles: [
    "**/node_modules/**",
    "**/dist/**",
    "**/storybook-static/**",
    "**/vrt/report/**",
    "**/vrt/results/**",
    "**/coverage/**",
    "packages/ui/src/generated/**",
    "packages/ui/src/canvas.css",
    "packages/ui/src/corner.css",
  ],
  rules: {
    "color-no-hex": [true, { message: "hex 색 — tokens/ 의 JSON 에 토큰을 더하고 var(--…) 로 쓴다" }],
    "custom-property-pattern": [
      "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
      { message: "커스텀 프로퍼티는 kebab-case(`--space-card-gap`)" },
    ],
    "declaration-property-value-allowed-list": [
      {
        [key(COLOR_PROPS)]: TOKEN_OR_KEYWORD,
        [key(RADIUS_PROPS)]: TOKEN_OR_KEYWORD,
        [key(FONT_PROPS)]: TOKEN_OR_KEYWORD,
        [key(MOTION_PROPS)]: TOKEN_OR_KEYWORD,
      },
      { message: (prop, value) => `${prop}: ${value} — 색·반경·글자·모션은 var(--…) 토큰만` },
    ],
    "declaration-property-value-disallowed-list": [
      { [key(SPACING_PROPS)]: [/(^|[^\w.-])\d*\.?\d+px/] },
      {
        message: (prop, value) =>
          `${prop}: ${value} — 간격·치수의 px 리터럴 대신 var(--space-*)·var(--size-*) 토큰을 쓴다`,
      },
    ],
  },
};
