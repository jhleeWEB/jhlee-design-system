/**
 * `@jhleeweb/squircle-design-system` — Squircle Design System(AARO 디자인 시스템에서 분리).
 *
 * 세 앱이 각자 다시 쓰던 "3열 작업대"(좌 파라미터 · 중 뷰어 · 우 검사)를 한 벌로 모았다.
 * 여기 있는 것은 **구조와 컨트롤**이고, 무엇을 그릴지는 앱이 정한다 — 도메인 색, 배치 객체
 * 종류, 지표의 의미는 전부 앱 몫이다.
 *
 * 스타일은 CSS 를 따로 불러온다(컴포넌트가 클래스명만 쓴다):
 *
 *     import "@jhleeweb/squircle-design-system/shell.css";   // 토큰까지 함께 들어온다
 *
 * 토큰만 필요하면 `@jhleeweb/squircle-design-system/tokens.css`.
 *
 * ── 디자인 시스템 층(#1198) ──────────────────────────────────────────────────
 * 위의 셸·컨트롤 위에 오버레이·피드백·내비게이션·데이터 층을 얹었다. 그쪽은 Tailwind v4 로
 * 그려지므로 앱이 **테마 CSS 를 함께** 불러야 한다:
 *
 *     @import "tailwindcss";
 *     @import "@jhleeweb/squircle-design-system/theme.css";
 *
 * theme.css 가 `@source "./"` 로 자기 자신을 등록하므로 소비자는 이 한 줄로 끝난다. 그래도 컴포넌트가
 * 스타일 없이 렌더되면(에러가 나지 않는 조용한 실패) 산출 CSS 에 `.rounded-control` 이 있는지부터 본다.
 * 기존 셸·컨트롤 API까지 전환할 앱은 최상단을 `DesignSystemProvider`로 감싼다.
 * 선택하지 않은 스튜디오는 `shell.css`만으로 기존 UI를 유지한다.
 *
 * 방향 C: 도면이 사는 면(`--canvas-*`)과 UI 가 사는 면(`--chrome-*`)을 가른다. 캔버스는
 * 라이트 고정 · radius 0 · 무채색이고, 다크와 그림자와 모서리는 크롬에만 있다. 새 컴포넌트를
 * 만들 때 묻는 질문은 언제나 「이것은 캔버스인가 크롬인가」 하나다.
 */

export {
  AppShell,
  Field,
  Hud,
  HudCell,
  KeyValue,
  Legend,
  Panel,
  PanelGroup,
  StatusBadge,
  Tabs,
  TopBar,
  ViewerPanel,
} from "./shell";
export type { Verdict } from "./shell";

export { Segmented, Select, Slider, Toggle } from "./controls";
export type { Option } from "./controls";
export { DesignSystemProvider } from "./design-system";
export { CanvasScale, type CanvasScaleProps } from "./CanvasScale";
export { niceScale, gridPitchM, GRID_TARGET_PX, GRID_MAJOR_EVERY, GRID_MAX_DIVISIONS } from "./canvas-metrics";

/* ── 디자인 시스템(#1198) ─────────────────────────────────────────────────── */
export { cn, cva, type VariantProps } from "./cn";
export * from "./primitives";
export * from "./overlay";
export * from "./feedback";
export * from "./navigation";
export * from "./data";
