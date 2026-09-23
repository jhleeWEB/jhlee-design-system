/**
 * `@buildos/ui` — AARO 디자인 시스템.
 *
 * 세 앱이 각자 다시 쓰던 "3열 작업대"(좌 파라미터 · 중 뷰어 · 우 검사)를 한 벌로 모았다.
 * 여기 있는 것은 **구조와 컨트롤**이고, 무엇을 그릴지는 앱이 정한다 — 도메인 색, 배치 객체
 * 종류, 지표의 의미는 전부 앱 몫이다.
 *
 * 스타일은 CSS 를 따로 불러온다(컴포넌트가 클래스명만 쓴다):
 *
 *     import "@buildos/ui/shell.css";   // 토큰까지 함께 들어온다
 *
 * 토큰만 필요하면 `@buildos/ui/tokens.css`.
 *
 * ── 디자인 시스템 층(#1198) ──────────────────────────────────────────────────
 * 위의 셸·컨트롤 위에 오버레이·피드백·내비게이션·데이터 층을 얹었다. 그쪽은 Tailwind v4 로
 * 그려지므로 앱이 **테마 CSS 를 함께** 불러야 한다:
 *
 *     @import "tailwindcss";
 *     @import "@buildos/ui/theme.css";
 *     @source "../../../packages/ui/src";
 *
 * `@source` 가 빠지면 Tailwind 가 이 패키지 안의 클래스를 보지 못해 **컴포넌트가 스타일 없이
 * 렌더된다** — 에러가 나지 않으므로 이 줄을 의심한다.
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

/* ── 디자인 시스템(#1198) ─────────────────────────────────────────────────── */
export { cn, cva, type VariantProps } from "./cn";
export * from "./primitives";
export * from "./overlay";
export * from "./feedback";
export * from "./navigation";
export * from "./data";
