/**
 * `@jhleeweb/squircle-design-system` — Squircle Design System(AARO 디자인 시스템에서 분리).
 *
 * 도면 캔버스와 UI 크롬을 가른 토큰 위의 컨트롤 · 오버레이 · 피드백 · 내비게이션 · 데이터 층이다. Tailwind v4 로 그려지므로 앱이
 * **테마 CSS 를 함께** 불러야 한다:
 *
 *     @import "tailwindcss";
 *     @import "@jhleeweb/squircle-design-system/theme.css";
 *
 * theme.css 가 `@source "./"` 로 자기 자신을 등록하므로 소비자는 이 한 줄로 끝난다. 그래도 컴포넌트가
 * 스타일 없이 렌더되면(에러가 나지 않는 조용한 실패) 산출 CSS 에 `.rounded-md` 가 있는지부터 본다.
 *
 * 3열 작업대 셸 · 컨트롤(`./legacy` · `shell.css` · `DesignSystemProvider`)과 루트 배럴의 그 별칭은 3.0.0 에서 지웠다(#49).
 * 무엇을 그릴지(도메인 색 · 배치 객체 · 지표의 의미)는 앱이 정한다 — 셸 레이아웃도 이제 앱의 몫이다.
 *
 * 방향 C: 도면이 사는 면(`--canvas-*`)과 UI 가 사는 면(`--chrome-*`)을 가른다. 캔버스는
 * 라이트 고정 · radius 0 · 무채색이고, 다크와 그림자와 모서리는 크롬에만 있다. 새 컴포넌트를
 * 만들 때 묻는 질문은 언제나 「이것은 캔버스인가 크롬인가」 하나다.
 *
 * 모서리: 일반 `border-radius` 원호 사다리(`rounded-sm/md/lg/xl` = 6/8/12/16px). 스쿼클(#26)은 사용자 결정(2026-09-30, #36)으로 폐기했다 —
 * Chromium 에서 초타원의 안쪽 윤곽 간격 특성 때문에 1px 테두리가 모서리에서 두꺼워 보였다. `corner.css` 는 비어 있는 호환 파일이다.
 */

export { CanvasScale, type CanvasScaleProps } from "./CanvasScale";
export { Legend, LegendItem, type LegendItemProps, type LegendProps } from "./Legend";
export { legendSwatchVariants, legendVariants } from "./Legend.variants";
export {
  niceScale,
  gridPitchM,
  GRID_TARGET_PX,
  GRID_MAJOR_EVERY,
  GRID_MAX_DIVISIONS,
} from "./canvas-metrics";

/* ── 디자인 시스템(#1198) ─────────────────────────────────────────────────── */
export { cn, cva, type VariantProps } from "./cn";
export { toneValues, type Tone } from "./lib/tone";
export * from "./primitives";
export * from "./overlay";
export * from "./feedback";
export * from "./navigation";
export * from "./data";
