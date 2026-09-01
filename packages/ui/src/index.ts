/**
 * `@buildos/ui` — AARO 화면 셸.
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
