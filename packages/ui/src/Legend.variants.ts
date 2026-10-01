import { cva } from "./cn";

/* `*.variants.ts` 는 지시문·훅·Radix 가 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Input.variants.ts 와 같은 이유).
 *
 * 범례는 **캔버스**다(방향 C) — 흰 바탕 고정 · radius 0 · 무채색 · 다크 없음. 그래서 색은 `canvas-*` 만 쓰고 `rounded-*` · `shadow-*` · 크롬 색이 없다.
 * 스와치의 색은 `text-canvas-*` 로 currentColor 에 싣고 무늬(채움 · 외곽 · 빗금 · 선)가 그 색을 읽는다 — 도면의 무채색 위계(ink › ink-2 › muted › line)는
 * 몇 단뿐이라 **무늬가 두 번째 축**이 되어야 항목을 가를 수 있다. 빗금은 Tailwind 대괄호에 1px 리터럴이 들어가 래칫에 걸리므로 canvas.css 의 `.ds-legend-hatch` 다. */

/** 범례 목록의 변형 — `orientation`. */
export const legendVariants = cva(
  [
    "m-0 flex min-w-0 list-none rounded-none border border-solid border-canvas-line bg-canvas px-3 py-2",
    "font-sans text-micro text-canvas-ink",
  ],
  {
    variants: {
      /**
       * 항목을 놓는 방향.
       * - `vertical` — 한 줄에 한 항목. 도면 모서리의 범례 상자
       * - `horizontal` — 한 줄에 이어 놓고 넘치면 줄을 바꾼다. 도면 아래 띠
       */
      orientation: {
        vertical: "flex-col gap-1",
        horizontal: "flex-row flex-wrap gap-x-3 gap-y-1",
      },
    },
    defaultVariants: { orientation: "vertical" },
  },
);

/** 스와치의 변형 — `swatch`(캔버스 무채색 한 단) · `pattern`(무늬). */
export const legendSwatchVariants = cva("inline-block shrink-0 rounded-none", {
  variants: {
    /**
     * 스와치 색 — 캔버스 토큰의 무채색 한 단. 진한 순서다.
     * - `ink` — 가장 진한 먹(벽 · 주된 선)
     * - `ink-2` — 한 단 옅은 먹
     * - `muted` — 흐린 먹(보조 선 · 치수)
     * - `line-strong` — 진한 선색
     * - `line` — 옅은 선색
     * - `grid` — 격자색
     * - `surface` — 바탕에서 한 단 들어간 면(채움보다 외곽 · 빗금과 함께 쓴다 — 흰 바탕 위 채움은 거의 보이지 않는다)
     */
    swatch: {
      ink: "text-canvas-ink",
      "ink-2": "text-canvas-ink-2",
      muted: "text-canvas-muted",
      "line-strong": "text-canvas-line-strong",
      line: "text-canvas-line",
      grid: "text-canvas-grid",
      surface: "text-canvas-surface",
    },
    /**
     * 무늬 — 같은 색 안에서 항목을 가르는 두 번째 축.
     * - `fill` — 꽉 찬 사각(면 · 영역)
     * - `outline` — 외곽선만 있는 사각(경계 · 계획선)
     * - `hatch` — 외곽선 + 45° 빗금(단면 · 제외 구역)
     * - `line` — 가로 선 하나(선 요소 · 치수선)
     */
    pattern: {
      fill: "size-3 bg-current",
      outline: "size-3 border border-solid border-current bg-canvas",
      hatch: "ds-legend-hatch size-3 border border-solid border-current bg-canvas",
      line: "h-0.5 w-4 bg-current",
    },
  },
  defaultVariants: { swatch: "ink", pattern: "fill" },
});
