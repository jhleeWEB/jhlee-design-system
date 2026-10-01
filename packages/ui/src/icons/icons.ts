/* 아이콘 컴포넌트 목록(#64) — 이름마다 `createIcon` 을 한 번 부른다. 글리프 정본은 `./glyphs.ts` 한 벌이다.
 *
 * 새 글리프는 `glyphs.ts` 와 여기(컴포넌트 · `icons` 맵)에 한 줄씩 더한다 — 빠지면 `icons.spec` 이 잡는다.
 * `@__PURE__` 주석은 쓰지 않는 아이콘을 번들러가 떨어뜨릴 수 있게 한다(호출이 부수 효과 없음을 알린다).
 * 순수 모듈이다 — "use client" 가 없다(서버 컴포넌트에서 렌더할 수 있다). 패키지 안에서는 배럴(index) 대신 이 파일을 import 한다.
 */
import { createIcon } from "./createIcon";

/** 글리프 `arrow-left` — 정본 `glyphs.ts`. */
export const IconArrowLeft = /* @__PURE__ */ createIcon("arrow-left");
/** 글리프 `chevron-left` — 정본 `glyphs.ts`. */
export const IconChevronLeft = /* @__PURE__ */ createIcon("chevron-left");
/** 글리프 `chevron-right` — 정본 `glyphs.ts`. */
export const IconChevronRight = /* @__PURE__ */ createIcon("chevron-right");
/** 글리프 `chevron-up` — 정본 `glyphs.ts`. */
export const IconChevronUp = /* @__PURE__ */ createIcon("chevron-up");
/** 글리프 `chevron-down` — 정본 `glyphs.ts`. */
export const IconChevronDown = /* @__PURE__ */ createIcon("chevron-down");
/** 글리프 `x` — 정본 `glyphs.ts`. */
export const IconX = /* @__PURE__ */ createIcon("x");
/** 글리프 `plus` — 정본 `glyphs.ts`. */
export const IconPlus = /* @__PURE__ */ createIcon("plus");
/** 글리프 `minus` — 정본 `glyphs.ts`. */
export const IconMinus = /* @__PURE__ */ createIcon("minus");
/** 글리프 `check` — 정본 `glyphs.ts`. */
export const IconCheck = /* @__PURE__ */ createIcon("check");
/** 글리프 `more-horizontal` — 정본 `glyphs.ts`. */
export const IconMoreHorizontal = /* @__PURE__ */ createIcon("more-horizontal");
/** 글리프 `calendar` — 정본 `glyphs.ts`. */
export const IconCalendar = /* @__PURE__ */ createIcon("calendar");
/** 글리프 `search` — 정본 `glyphs.ts`. */
export const IconSearch = /* @__PURE__ */ createIcon("search");
/** 글리프 `info` — 정본 `glyphs.ts`. */
export const IconInfo = /* @__PURE__ */ createIcon("info");
/** 글리프 `alert-triangle` — 정본 `glyphs.ts`. */
export const IconAlertTriangle = /* @__PURE__ */ createIcon("alert-triangle");
/** 글리프 `trash` — 정본 `glyphs.ts`. */
export const IconTrash = /* @__PURE__ */ createIcon("trash");
/** 글리프 `copy` — 정본 `glyphs.ts`. */
export const IconCopy = /* @__PURE__ */ createIcon("copy");
/** 글리프 `download` — 정본 `glyphs.ts`. */
export const IconDownload = /* @__PURE__ */ createIcon("download");
/** 글리프 `settings` — 정본 `glyphs.ts`. */
export const IconSettings = /* @__PURE__ */ createIcon("settings");
/** 글리프 `file-text` — 정본 `glyphs.ts`. */
export const IconFileText = /* @__PURE__ */ createIcon("file-text");
/** 글리프 `folder-open` — 정본 `glyphs.ts`. */
export const IconFolderOpen = /* @__PURE__ */ createIcon("folder-open");
/** 글리프 `map` — 정본 `glyphs.ts`. */
export const IconMap = /* @__PURE__ */ createIcon("map");
/** 글리프 `maximize` — 정본 `glyphs.ts`. */
export const IconMaximize = /* @__PURE__ */ createIcon("maximize");
/** 글리프 `minimize` — 정본 `glyphs.ts`. */
export const IconMinimize = /* @__PURE__ */ createIcon("minimize");
/** 글리프 `hourglass` — 정본 `glyphs.ts`. */
export const IconHourglass = /* @__PURE__ */ createIcon("hourglass");
/** 글리프 `layers` — 정본 `glyphs.ts`. */
export const IconLayers = /* @__PURE__ */ createIcon("layers");
/** 글리프 `eye` — 정본 `glyphs.ts`. */
export const IconEye = /* @__PURE__ */ createIcon("eye");
/** 글리프 `eye-off` — 정본 `glyphs.ts`. */
export const IconEyeOff = /* @__PURE__ */ createIcon("eye-off");
/** 글리프 `lock` — 정본 `glyphs.ts`. */
export const IconLock = /* @__PURE__ */ createIcon("lock");
/** 글리프 `unlock` — 정본 `glyphs.ts`. */
export const IconUnlock = /* @__PURE__ */ createIcon("unlock");
/** 글리프 `camera` — 정본 `glyphs.ts`. */
export const IconCamera = /* @__PURE__ */ createIcon("camera");
/** 글리프 `grid` — 정본 `glyphs.ts`. */
export const IconGrid = /* @__PURE__ */ createIcon("grid");
/** 글리프 `axis` — 정본 `glyphs.ts`. */
export const IconAxis = /* @__PURE__ */ createIcon("axis");
/** 글리프 `orbit` — 정본 `glyphs.ts`. */
export const IconOrbit = /* @__PURE__ */ createIcon("orbit");
/** 글리프 `pan` — 정본 `glyphs.ts`. */
export const IconPan = /* @__PURE__ */ createIcon("pan");
/** 글리프 `grab` — 정본 `glyphs.ts`. */
export const IconGrab = /* @__PURE__ */ createIcon("grab");
/** 글리프 `zoom-in` — 정본 `glyphs.ts`. */
export const IconZoomIn = /* @__PURE__ */ createIcon("zoom-in");
/** 글리프 `zoom-out` — 정본 `glyphs.ts`. */
export const IconZoomOut = /* @__PURE__ */ createIcon("zoom-out");
/** 글리프 `zoom-extents` — 정본 `glyphs.ts`. */
export const IconZoomExtents = /* @__PURE__ */ createIcon("zoom-extents");
/** 글리프 `select` — 정본 `glyphs.ts`. */
export const IconSelect = /* @__PURE__ */ createIcon("select");
/** 글리프 `select-window` — 정본 `glyphs.ts`. */
export const IconSelectWindow = /* @__PURE__ */ createIcon("select-window");
/** 글리프 `crosshair` — 정본 `glyphs.ts`. */
export const IconCrosshair = /* @__PURE__ */ createIcon("crosshair");
/** 글리프 `eyedropper` — 정본 `glyphs.ts`. */
export const IconEyedropper = /* @__PURE__ */ createIcon("eyedropper");
/** 글리프 `snap` — 정본 `glyphs.ts`. */
export const IconSnap = /* @__PURE__ */ createIcon("snap");
/** 글리프 `move` — 정본 `glyphs.ts`. */
export const IconMove = /* @__PURE__ */ createIcon("move");
/** 글리프 `rotate` — 정본 `glyphs.ts`. */
export const IconRotate = /* @__PURE__ */ createIcon("rotate");
/** 글리프 `scale` — 정본 `glyphs.ts`. */
export const IconScale = /* @__PURE__ */ createIcon("scale");
/** 글리프 `draw` — 정본 `glyphs.ts`. */
export const IconDraw = /* @__PURE__ */ createIcon("draw");
/** 글리프 `spline` — 정본 `glyphs.ts`. */
export const IconSpline = /* @__PURE__ */ createIcon("spline");
/** 글리프 `polygon` — 정본 `glyphs.ts`. */
export const IconPolygon = /* @__PURE__ */ createIcon("polygon");
/** 글리프 `rectangle` — 정본 `glyphs.ts`. */
export const IconRectangle = /* @__PURE__ */ createIcon("rectangle");
/** 글리프 `circle` — 정본 `glyphs.ts`. */
export const IconCircle = /* @__PURE__ */ createIcon("circle");
/** 글리프 `cut` — 정본 `glyphs.ts`. */
export const IconCut = /* @__PURE__ */ createIcon("cut");
/** 글리프 `split` — 정본 `glyphs.ts`. */
export const IconSplit = /* @__PURE__ */ createIcon("split");
/** 글리프 `undo` — 정본 `glyphs.ts`. */
export const IconUndo = /* @__PURE__ */ createIcon("undo");
/** 글리프 `redo` — 정본 `glyphs.ts`. */
export const IconRedo = /* @__PURE__ */ createIcon("redo");
/** 글리프 `measure-distance` — 정본 `glyphs.ts`. */
export const IconMeasureDistance = /* @__PURE__ */ createIcon("measure-distance");
/** 글리프 `bold` — 정본 `glyphs.ts`. */
export const IconBold = /* @__PURE__ */ createIcon("bold");
/** 글리프 `italic` — 정본 `glyphs.ts`. */
export const IconItalic = /* @__PURE__ */ createIcon("italic");
/** 글리프 `underline` — 정본 `glyphs.ts`. */
export const IconUnderline = /* @__PURE__ */ createIcon("underline");
/** 글리프 `line` — 정본 `glyphs.ts`. */
export const IconLine = /* @__PURE__ */ createIcon("line");
/** 글리프 `polyline` — 정본 `glyphs.ts`. */
export const IconPolyline = /* @__PURE__ */ createIcon("polyline");
/** 글리프 `add-point` — 정본 `glyphs.ts`. */
export const IconAddPoint = /* @__PURE__ */ createIcon("add-point");
/** 글리프 `offset` — 정본 `glyphs.ts`. */
export const IconOffset = /* @__PURE__ */ createIcon("offset");
/** 글리프 `extrude` — 정본 `glyphs.ts`. */
export const IconExtrude = /* @__PURE__ */ createIcon("extrude");
/** 글리프 `zoom-window` — 정본 `glyphs.ts`. */
export const IconZoomWindow = /* @__PURE__ */ createIcon("zoom-window");
/** 글리프 `measure-area` — 정본 `glyphs.ts`. */
export const IconMeasureArea = /* @__PURE__ */ createIcon("measure-area");
/** 글리프 `section-plane` — 정본 `glyphs.ts`. */
export const IconSectionPlane = /* @__PURE__ */ createIcon("section-plane");
/** 글리프 `view-iso` — 정본 `glyphs.ts`. */
export const IconViewIso = /* @__PURE__ */ createIcon("view-iso");
/** 글리프 `view-top` — 정본 `glyphs.ts`. */
export const IconViewTop = /* @__PURE__ */ createIcon("view-top");
/** 글리프 `view-front` — 정본 `glyphs.ts`. */
export const IconViewFront = /* @__PURE__ */ createIcon("view-front");
/** 글리프 `view-side` — 정본 `glyphs.ts`. */
export const IconViewSide = /* @__PURE__ */ createIcon("view-side");

/** 이름 → 컴포넌트 — 동적으로 고를 때(툴 정의 표 · 카탈로그). 키는 `GlyphName` 이다. */
export const icons = {
  "arrow-left": IconArrowLeft,
  "chevron-left": IconChevronLeft,
  "chevron-right": IconChevronRight,
  "chevron-up": IconChevronUp,
  "chevron-down": IconChevronDown,
  x: IconX,
  plus: IconPlus,
  minus: IconMinus,
  check: IconCheck,
  "more-horizontal": IconMoreHorizontal,
  calendar: IconCalendar,
  search: IconSearch,
  info: IconInfo,
  "alert-triangle": IconAlertTriangle,
  trash: IconTrash,
  copy: IconCopy,
  download: IconDownload,
  settings: IconSettings,
  "file-text": IconFileText,
  "folder-open": IconFolderOpen,
  map: IconMap,
  maximize: IconMaximize,
  minimize: IconMinimize,
  hourglass: IconHourglass,
  layers: IconLayers,
  eye: IconEye,
  "eye-off": IconEyeOff,
  lock: IconLock,
  unlock: IconUnlock,
  camera: IconCamera,
  grid: IconGrid,
  axis: IconAxis,
  orbit: IconOrbit,
  pan: IconPan,
  grab: IconGrab,
  "zoom-in": IconZoomIn,
  "zoom-out": IconZoomOut,
  "zoom-extents": IconZoomExtents,
  select: IconSelect,
  "select-window": IconSelectWindow,
  crosshair: IconCrosshair,
  eyedropper: IconEyedropper,
  snap: IconSnap,
  move: IconMove,
  rotate: IconRotate,
  scale: IconScale,
  draw: IconDraw,
  spline: IconSpline,
  polygon: IconPolygon,
  rectangle: IconRectangle,
  circle: IconCircle,
  cut: IconCut,
  split: IconSplit,
  undo: IconUndo,
  redo: IconRedo,
  "measure-distance": IconMeasureDistance,
  bold: IconBold,
  italic: IconItalic,
  underline: IconUnderline,
  line: IconLine,
  polyline: IconPolyline,
  "add-point": IconAddPoint,
  offset: IconOffset,
  extrude: IconExtrude,
  "zoom-window": IconZoomWindow,
  "measure-area": IconMeasureArea,
  "section-plane": IconSectionPlane,
  "view-iso": IconViewIso,
  "view-top": IconViewTop,
  "view-front": IconViewFront,
  "view-side": IconViewSide,
} as const;
