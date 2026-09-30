/**
 * `@jhleeweb/squircle-design-system/legacy` — 3열 작업대 셸·컨트롤·`DesignSystemProvider`.
 *
 * 세 앱이 각자 다시 쓰던 "3열 작업대"(좌 파라미터 · 중 뷰어 · 우 검사)를 한 벌로 모은 것이다.
 * 여기 있는 것은 **구조와 컨트롤**이고, 무엇을 그릴지는 앱이 정한다.
 *
 * 스타일은 CSS 를 따로 불러온다(컴포넌트가 클래스명만 쓴다):
 *
 *     import "@jhleeweb/squircle-design-system/shell.css";   // 토큰까지 함께 들어온다
 *
 * 기존 셸·컨트롤 API 를 DS 프리미티브로 그리려는 앱은 최상단을 `DesignSystemProvider` 로 감싼다.
 * 선택하지 않은 스튜디오는 `shell.css` 만으로 기존 UI 를 유지한다.
 *
 * 이 서브패스는 **격리·동결** 상태다(계획 §2.5-i, #10). 새 기능은 받지 않고, 루트 배럴의 같은 이름들은
 * 한 마이너 동안 `@deprecated` 로 남았다가 다음 마이너에서 `feat!:` 로 사라진다 — 그 뒤에는 여기서만 import 한다.
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
