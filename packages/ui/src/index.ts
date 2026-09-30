/**
 * `@jhleeweb/squircle-design-system` — Squircle Design System(AARO 디자인 시스템에서 분리).
 *
 * 세 앱이 각자 다시 쓰던 "3열 작업대"(좌 파라미터 · 중 뷰어 · 우 검사)를 한 벌로 모았다.
 * 여기 있는 것은 **구조와 컨트롤**이고, 무엇을 그릴지는 앱이 정한다 — 도메인 색, 배치 객체
 * 종류, 지표의 의미는 전부 앱 몫이다.
 *
 * 그 셸·컨트롤은 `@jhleeweb/squircle-design-system/legacy` 서브패스로 격리했다(#10). 스타일은
 * `@jhleeweb/squircle-design-system/shell.css`(토큰까지 함께 들어온다). 토큰만 필요하면 `…/tokens.css`.
 *
 * ── 디자인 시스템 층(#1198) ──────────────────────────────────────────────────
 * 위의 셸·컨트롤 위에 오버레이·피드백·내비게이션·데이터 층을 얹었다. 그쪽은 Tailwind v4 로
 * 그려지므로 앱이 **테마 CSS 를 함께** 불러야 한다:
 *
 *     @import "tailwindcss";
 *     @import "@jhleeweb/squircle-design-system/theme.css";
 *
 * theme.css 가 `@source "./"` 로 자기 자신을 등록하므로 소비자는 이 한 줄로 끝난다. 그래도 컴포넌트가
 * 스타일 없이 렌더되면(에러가 나지 않는 조용한 실패) 산출 CSS 에 `.rounded-md` 가 있는지부터 본다.
 * 기존 셸·컨트롤 API까지 전환할 앱은 최상단을 `DesignSystemProvider`로 감싼다.
 * 선택하지 않은 스튜디오는 `shell.css`만으로 기존 UI를 유지한다.
 *
 * 방향 C: 도면이 사는 면(`--canvas-*`)과 UI 가 사는 면(`--chrome-*`)을 가른다. 캔버스는
 * 라이트 고정 · radius 0 · 무채색이고, 다크와 그림자와 모서리는 크롬에만 있다. 새 컴포넌트를
 * 만들 때 묻는 질문은 언제나 「이것은 캔버스인가 크롬인가」 하나다.
 *
 * 모서리: 일반 `border-radius` 원호 사다리(`rounded-sm/md/lg/xl` = 6/8/12/16px). 스쿼클(#26)은 사용자 결정(2026-09-30, #36)으로 폐기했다 —
 * Chromium 에서 초타원의 안쪽 윤곽 간격 특성 때문에 1px 테두리가 모서리에서 두꺼워 보였다. `corner.css` 는 비어 있는 호환 파일이다.
 */

/* ── 레거시 셸·컨트롤(#10) ───────────────────────────────────────────────────
 * `./legacy` 서브패스로 격리했다. 루트 배럴의 이 이름들은 한 마이너 동안만 남는 호환 별칭이다.
 * `export { X } from` 재export 가 아니라 **const 별칭**인 이유(실측, TS 5.9 · tsdown 0.23): export 선언에 붙인 `@deprecated` 는
 * 소비자 쪽에서 무시되고(6385 미보고), 중괄호 안 지정자에 붙이면 소스에서는 잡히지만 rolldown-plugin-dts 가 배럴의 export 를
 * 한 문장으로 합치며 지정자 주석을 버려 dist/index.d.ts 에 남지 않는다. 선언에 붙은 JSDoc 만 d.ts 까지 살아남는다. */
import {
  AppShell as LegacyAppShell,
  Field as LegacyField,
  Hud as LegacyHud,
  HudCell as LegacyHudCell,
  KeyValue as LegacyKeyValue,
  Legend as LegacyLegend,
  Panel as LegacyPanel,
  PanelGroup as LegacyPanelGroup,
  StatusBadge as LegacyStatusBadge,
  Tabs as LegacyTabs,
  TopBar as LegacyTopBar,
  ViewerPanel as LegacyViewerPanel,
  type Verdict as LegacyVerdict,
} from "./legacy/shell";
import {
  Segmented as LegacySegmented,
  Select as LegacySelect,
  Slider as LegacySlider,
  Toggle as LegacyToggle,
  type Option as LegacyOption,
} from "./legacy/controls";
import { DesignSystemProvider as LegacyDesignSystemProvider } from "./legacy/design-system";

/**
 * 레거시 셸 `AppShell`.
 * @deprecated 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다
 */
export const AppShell = LegacyAppShell;
/**
 * 레거시 셸 `Field`.
 * @deprecated 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다
 */
export const Field = LegacyField;
/**
 * 레거시 셸 `Hud`.
 * @deprecated 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다
 */
export const Hud = LegacyHud;
/**
 * 레거시 셸 `HudCell`.
 * @deprecated 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다
 */
export const HudCell = LegacyHudCell;
/**
 * 레거시 셸 `KeyValue`.
 * @deprecated 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다
 */
export const KeyValue = LegacyKeyValue;
/**
 * 레거시 셸 `Legend`.
 * @deprecated 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다
 */
export const Legend = LegacyLegend;
/**
 * 레거시 셸 `Panel`.
 * @deprecated 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다
 */
export const Panel = LegacyPanel;
/**
 * 레거시 셸 `PanelGroup`.
 * @deprecated 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다
 */
export const PanelGroup = LegacyPanelGroup;
/**
 * 레거시 셸 `StatusBadge`.
 * @deprecated 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다
 */
export const StatusBadge = LegacyStatusBadge;
/**
 * 레거시 셸 `Tabs`.
 * @deprecated 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다
 */
export const Tabs = LegacyTabs;
/**
 * 레거시 셸 `TopBar`.
 * @deprecated 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다
 */
export const TopBar = LegacyTopBar;
/**
 * 레거시 셸 `ViewerPanel`.
 * @deprecated 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다
 */
export const ViewerPanel = LegacyViewerPanel;
/**
 * 레거시 셸의 판정 어휘.
 * @deprecated 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다
 */
export type Verdict = LegacyVerdict;
/**
 * 레거시 컨트롤 `Segmented`.
 * @deprecated 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다
 */
export const Segmented = LegacySegmented;
/**
 * 레거시 컨트롤 `Select`.
 * @deprecated 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다
 */
export const Select = LegacySelect;
/**
 * 레거시 컨트롤 `Slider`.
 * @deprecated 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다
 */
export const Slider = LegacySlider;
/**
 * 레거시 컨트롤 `Toggle`.
 * @deprecated 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다
 */
export const Toggle = LegacyToggle;
/**
 * 레거시 컨트롤의 선택지 타입.
 * @deprecated 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다
 */
export type Option<T extends string | number> = LegacyOption<T>;
/**
 * 레거시 셸·컨트롤을 DS 프리미티브로 그리게 하는 Provider `DesignSystemProvider`.
 * @deprecated 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다
 */
export const DesignSystemProvider = LegacyDesignSystemProvider;

export { CanvasScale, type CanvasScaleProps } from "./CanvasScale";
export {
  niceScale,
  gridPitchM,
  GRID_TARGET_PX,
  GRID_MAJOR_EVERY,
  GRID_MAX_DIVISIONS,
} from "./canvas-metrics";

/* ── 디자인 시스템(#1198) ─────────────────────────────────────────────────── */
export { cn, cva, type VariantProps } from "./cn";
export {
  normalizeTone,
  toneValues,
  type LegacyTone,
  type LegacyToneOf,
  type Tone,
  type ToneInput,
} from "./lib/tone";
export * from "./primitives";
export * from "./overlay";
export * from "./feedback";
export * from "./navigation";
export * from "./data";
