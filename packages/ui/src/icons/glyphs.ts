/* 아이콘 글리프의 정본(#64) — 컴포넌트(`./index.ts`)와 커서(`../cursors/cursors.ts`)가 이 한 벌을 읽는다.
 *
 * 문법은 lucide 와 같다: 24 뷰박스 · 획 2 · round cap/join · fill none · currentColor · 가장자리 2 여백. 이 문법이면 16px 에서 획이 1.33px 로
 * 크롬 글자(13px)의 굵기와 맞는다. 값은 SVG 좌표라 토큰 사다리 밖이다 — 글리프는 «모양» 이고 크기·색은 쓰는 자리(클래스 · currentColor)가 정한다.
 *
 * `lucide` 가 있는 항목은 lucide(ISC, 고지 `./LICENSE-lucide.txt`)의 경로를 **글자 그대로** 옮겼다. react-icons 5.7.0 이 싣던 lucide
 * (v5.1.0-6-g438f572e)에서 렌더 결과를 뽑았으므로 react-icons 를 쓰던 자리의 픽셀이 같다(기존 VRT 0 diff 가 그 증거다).
 * `lucide` 가 없는 항목은 lucide 에 맞는 글리프가 없어 같은 문법으로 직접 그렸다 — 도면 작업대(3D · CAD)의 툴 클러스터에 필요한 것들이다.
 * 채운 면(`fill: "currentColor"`)은 카메라 뷰(평면 · 정면 · 측면)에서 «어느 면을 보는가» 를 가리킬 때만 쓴다.
 */

/** 글리프를 이루는 SVG 요소 — lucide 가 쓰는 다섯 가지뿐이다. */
export type GlyphTag = "path" | "circle" | "rect" | "line" | "polyline";

/** 요소 하나 — 태그와 속성(React 의 camelCase 이름, 값은 문자열). */
export type GlyphNode = readonly [tag: GlyphTag, attrs: Readonly<Record<string, string>>];

/**
 * 카탈로그(`Foundations/Icons`)의 묶음 — 툴 클러스터의 구획과 같다.
 *  - `chrome` — 크롬 컨트롤(닫기 · 펼치기 · 확인 · 경고 …)
 *  - `navigate` — 뷰 조작(오빗 · 팬 · 줌)
 *  - `select` — 고르기와 스냅
 *  - `transform` — 이동 · 회전 · 축척
 *  - `draw` — 그리기(선 · 다각형 · 원 …)
 *  - `edit` — 고치기(오프셋 · 돌출 · 자르기 · 실행 취소)
 *  - `measure` — 측정
 *  - `view` — 보기(레이어 · 가시성 · 잠금 · 카메라 뷰)
 */
export type GlyphCategory =
  "chrome" | "navigate" | "select" | "transform" | "draw" | "edit" | "measure" | "view";

/** 글리프 하나. */
export interface Glyph {
  /** 카탈로그 묶음 — 툴 클러스터의 구획. */
  readonly category: GlyphCategory;
  /** lucide 에서 옮긴 경우 그 이름(lucide.dev/icons/<이름>). 없으면 이 저장소가 그렸다. */
  readonly lucide?: string;
  /** 그리는 순서대로의 SVG 요소. */
  readonly nodes: readonly GlyphNode[];
}

/* `satisfies` 로 모양을 검사하되 키는 리터럴로 남긴다 — `GlyphName` 이 이 표에서 나온다. `as const` 는 쓰지 않는다: 경로 문자열이 전부
 * 리터럴 타입이 되면 d.ts 가 수백 줄의 유니언을 싣고 타입 검사가 느려진다(첫 시도 실측). 바깥에는 `Record<GlyphName, Glyph>` 로 낸다. */
const table = {
  /** lucide `arrow-left` */
  "arrow-left": {
    category: "chrome",
    lucide: "arrow-left",
    nodes: [
      ["path", { d: "m12 19-7-7 7-7" }],
      ["path", { d: "M19 12H5" }],
    ],
  },
  /** lucide `chevron-left` */
  "chevron-left": {
    category: "chrome",
    lucide: "chevron-left",
    nodes: [["path", { d: "m15 18-6-6 6-6" }]],
  },
  /** lucide `chevron-right` */
  "chevron-right": {
    category: "chrome",
    lucide: "chevron-right",
    nodes: [["path", { d: "m9 18 6-6-6-6" }]],
  },
  /** lucide `chevron-up` */
  "chevron-up": {
    category: "chrome",
    lucide: "chevron-up",
    nodes: [["path", { d: "m18 15-6-6-6 6" }]],
  },
  /** lucide `chevron-down` */
  "chevron-down": {
    category: "chrome",
    lucide: "chevron-down",
    nodes: [["path", { d: "m6 9 6 6 6-6" }]],
  },
  /** lucide `x` */
  x: {
    category: "chrome",
    lucide: "x",
    nodes: [
      ["path", { d: "M18 6 6 18" }],
      ["path", { d: "m6 6 12 12" }],
    ],
  },
  /** lucide `plus` */
  plus: {
    category: "chrome",
    lucide: "plus",
    nodes: [
      ["path", { d: "M5 12h14" }],
      ["path", { d: "M12 5v14" }],
    ],
  },
  /** lucide `minus` */
  minus: {
    category: "chrome",
    lucide: "minus",
    nodes: [["path", { d: "M5 12h14" }]],
  },
  /** lucide `check` */
  check: {
    category: "chrome",
    lucide: "check",
    nodes: [["path", { d: "M20 6 9 17l-5-5" }]],
  },
  /** lucide `ellipsis` */
  "more-horizontal": {
    category: "chrome",
    lucide: "ellipsis",
    nodes: [
      ["circle", { cx: "12", cy: "12", r: "1" }],
      ["circle", { cx: "19", cy: "12", r: "1" }],
      ["circle", { cx: "5", cy: "12", r: "1" }],
    ],
  },
  /** lucide `calendar` */
  calendar: {
    category: "chrome",
    lucide: "calendar",
    nodes: [
      ["path", { d: "M8 2v4" }],
      ["path", { d: "M16 2v4" }],
      ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2" }],
      ["path", { d: "M3 10h18" }],
    ],
  },
  /** lucide `search` */
  search: {
    category: "chrome",
    lucide: "search",
    nodes: [
      ["circle", { cx: "11", cy: "11", r: "8" }],
      ["path", { d: "m21 21-4.3-4.3" }],
    ],
  },
  /** lucide `info` */
  info: {
    category: "chrome",
    lucide: "info",
    nodes: [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["path", { d: "M12 16v-4" }],
      ["path", { d: "M12 8h.01" }],
    ],
  },
  /** lucide `triangle-alert` */
  "alert-triangle": {
    category: "chrome",
    lucide: "triangle-alert",
    nodes: [
      ["path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }],
      ["path", { d: "M12 9v4" }],
      ["path", { d: "M12 17h.01" }],
    ],
  },
  /** lucide `trash-2` */
  trash: {
    category: "chrome",
    lucide: "trash-2",
    nodes: [
      ["path", { d: "M3 6h18" }],
      ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }],
      ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }],
      ["line", { x1: "10", x2: "10", y1: "11", y2: "17" }],
      ["line", { x1: "14", x2: "14", y1: "11", y2: "17" }],
    ],
  },
  /** lucide `copy` */
  copy: {
    category: "chrome",
    lucide: "copy",
    nodes: [
      ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }],
      ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }],
    ],
  },
  /** lucide `download` */
  download: {
    category: "chrome",
    lucide: "download",
    nodes: [
      ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }],
      ["polyline", { points: "7 10 12 15 17 10" }],
      ["line", { x1: "12", x2: "12", y1: "15", y2: "3" }],
    ],
  },
  /** lucide `settings` */
  settings: {
    category: "chrome",
    lucide: "settings",
    nodes: [
      [
        "path",
        {
          d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
        },
      ],
      ["circle", { cx: "12", cy: "12", r: "3" }],
    ],
  },
  /** lucide `file-text` */
  "file-text": {
    category: "chrome",
    lucide: "file-text",
    nodes: [
      ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }],
      ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4" }],
      ["path", { d: "M10 9H8" }],
      ["path", { d: "M16 13H8" }],
      ["path", { d: "M16 17H8" }],
    ],
  },
  /** lucide `folder-open` */
  "folder-open": {
    category: "chrome",
    lucide: "folder-open",
    nodes: [
      [
        "path",
        {
          d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
        },
      ],
    ],
  },
  /** lucide `map` */
  map: {
    category: "chrome",
    lucide: "map",
    nodes: [
      [
        "path",
        {
          d: "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",
        },
      ],
      ["path", { d: "M15 5.764v15" }],
      ["path", { d: "M9 3.236v15" }],
    ],
  },
  /** lucide `maximize-2` */
  maximize: {
    category: "chrome",
    lucide: "maximize-2",
    nodes: [
      ["polyline", { points: "15 3 21 3 21 9" }],
      ["polyline", { points: "9 21 3 21 3 15" }],
      ["line", { x1: "21", x2: "14", y1: "3", y2: "10" }],
      ["line", { x1: "3", x2: "10", y1: "21", y2: "14" }],
    ],
  },
  /** lucide `minimize-2` */
  minimize: {
    category: "chrome",
    lucide: "minimize-2",
    nodes: [
      ["polyline", { points: "4 14 10 14 10 20" }],
      ["polyline", { points: "20 10 14 10 14 4" }],
      ["line", { x1: "14", x2: "21", y1: "10", y2: "3" }],
      ["line", { x1: "3", x2: "10", y1: "21", y2: "14" }],
    ],
  },
  /** lucide `hourglass` */
  hourglass: {
    category: "chrome",
    lucide: "hourglass",
    nodes: [
      ["path", { d: "M5 22h14" }],
      ["path", { d: "M5 2h14" }],
      ["path", { d: "M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" }],
      ["path", { d: "M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" }],
    ],
  },
  /** lucide `layers` */
  layers: {
    category: "view",
    lucide: "layers",
    nodes: [
      [
        "path",
        {
          d: "m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",
        },
      ],
      ["path", { d: "m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" }],
      ["path", { d: "m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" }],
    ],
  },
  /** lucide `eye` */
  eye: {
    category: "view",
    lucide: "eye",
    nodes: [
      [
        "path",
        {
          d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
        },
      ],
      ["circle", { cx: "12", cy: "12", r: "3" }],
    ],
  },
  /** lucide `eye-off` */
  "eye-off": {
    category: "view",
    lucide: "eye-off",
    nodes: [
      [
        "path",
        {
          d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
        },
      ],
      ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242" }],
      [
        "path",
        { d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" },
      ],
      ["path", { d: "m2 2 20 20" }],
    ],
  },
  /** lucide `lock` */
  lock: {
    category: "view",
    lucide: "lock",
    nodes: [
      ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }],
      ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4" }],
    ],
  },
  /** lucide `lock-open` */
  unlock: {
    category: "view",
    lucide: "lock-open",
    nodes: [
      ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }],
      ["path", { d: "M7 11V7a5 5 0 0 1 9.9-1" }],
    ],
  },
  /** lucide `camera` */
  camera: {
    category: "view",
    lucide: "camera",
    nodes: [
      [
        "path",
        { d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" },
      ],
      ["circle", { cx: "12", cy: "13", r: "3" }],
    ],
  },
  /** lucide `grid-3x3` */
  grid: {
    category: "view",
    lucide: "grid-3x3",
    nodes: [
      ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }],
      ["path", { d: "M3 9h18" }],
      ["path", { d: "M3 15h18" }],
      ["path", { d: "M9 3v18" }],
      ["path", { d: "M15 3v18" }],
    ],
  },
  /** lucide `axis-3d` */
  axis: {
    category: "view",
    lucide: "axis-3d",
    nodes: [
      ["path", { d: "M4 4v16h16" }],
      ["path", { d: "m4 20 7-7" }],
    ],
  },
  /** lucide `rotate-3d` */
  orbit: {
    category: "navigate",
    lucide: "rotate-3d",
    nodes: [
      [
        "path",
        {
          d: "M16.466 7.5C15.643 4.237 13.952 2 12 2 9.239 2 7 6.477 7 12s2.239 10 5 10c.342 0 .677-.069 1-.2",
        },
      ],
      ["path", { d: "m15.194 13.707 3.814 1.86-1.86 3.814" }],
      [
        "path",
        {
          d: "M19 15.57c-1.804.885-4.274 1.43-7 1.43-5.523 0-10-2.239-10-5s4.477-5 10-5c4.838 0 8.873 1.718 9.8 4",
        },
      ],
    ],
  },
  /** lucide `hand` */
  pan: {
    category: "navigate",
    lucide: "hand",
    nodes: [
      ["path", { d: "M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" }],
      ["path", { d: "M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" }],
      ["path", { d: "M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" }],
      [
        "path",
        {
          d: "M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15",
        },
      ],
    ],
  },
  /** lucide `grab` */
  grab: {
    category: "navigate",
    lucide: "grab",
    nodes: [
      ["path", { d: "M18 11.5V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4" }],
      ["path", { d: "M14 10V8a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" }],
      ["path", { d: "M10 9.9V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v5" }],
      ["path", { d: "M6 14a2 2 0 0 0-2-2a2 2 0 0 0-2 2" }],
      ["path", { d: "M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8 2 2 0 1 1 4 0" }],
    ],
  },
  /** lucide `zoom-in` */
  "zoom-in": {
    category: "navigate",
    lucide: "zoom-in",
    nodes: [
      ["circle", { cx: "11", cy: "11", r: "8" }],
      ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65" }],
      ["line", { x1: "11", x2: "11", y1: "8", y2: "14" }],
      ["line", { x1: "8", x2: "14", y1: "11", y2: "11" }],
    ],
  },
  /** lucide `zoom-out` */
  "zoom-out": {
    category: "navigate",
    lucide: "zoom-out",
    nodes: [
      ["circle", { cx: "11", cy: "11", r: "8" }],
      ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65" }],
      ["line", { x1: "8", x2: "14", y1: "11", y2: "11" }],
    ],
  },
  /** lucide `scan` */
  "zoom-extents": {
    category: "navigate",
    lucide: "scan",
    nodes: [
      ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2" }],
      ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2" }],
      ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2" }],
      ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2" }],
    ],
  },
  /** lucide `mouse-pointer-2` */
  select: {
    category: "select",
    lucide: "mouse-pointer-2",
    nodes: [
      [
        "path",
        {
          d: "M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z",
        },
      ],
    ],
  },
  /** lucide `square-dashed-mouse-pointer` */
  "select-window": {
    category: "select",
    lucide: "square-dashed-mouse-pointer",
    nodes: [
      [
        "path",
        {
          d: "M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z",
        },
      ],
      ["path", { d: "M5 3a2 2 0 0 0-2 2" }],
      ["path", { d: "M19 3a2 2 0 0 1 2 2" }],
      ["path", { d: "M5 21a2 2 0 0 1-2-2" }],
      ["path", { d: "M9 3h1" }],
      ["path", { d: "M9 21h2" }],
      ["path", { d: "M14 3h1" }],
      ["path", { d: "M3 9v1" }],
      ["path", { d: "M21 9v2" }],
      ["path", { d: "M3 14v1" }],
    ],
  },
  /** lucide `crosshair` */
  crosshair: {
    category: "select",
    lucide: "crosshair",
    nodes: [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["line", { x1: "22", x2: "18", y1: "12", y2: "12" }],
      ["line", { x1: "6", x2: "2", y1: "12", y2: "12" }],
      ["line", { x1: "12", x2: "12", y1: "6", y2: "2" }],
      ["line", { x1: "12", x2: "12", y1: "22", y2: "18" }],
    ],
  },
  /** lucide `pipette` */
  eyedropper: {
    category: "select",
    lucide: "pipette",
    nodes: [
      ["path", { d: "m2 22 1-1h3l9-9" }],
      ["path", { d: "M3 21v-3l9-9" }],
      [
        "path",
        { d: "m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" },
      ],
    ],
  },
  /** lucide `magnet` */
  snap: {
    category: "select",
    lucide: "magnet",
    nodes: [
      [
        "path",
        { d: "m6 15-4-4 6.75-6.77a7.79 7.79 0 0 1 11 11L13 22l-4-4 6.39-6.36a2.14 2.14 0 0 0-3-3L6 15" },
      ],
      ["path", { d: "m5 8 4 4" }],
      ["path", { d: "m12 15 4 4" }],
    ],
  },
  /** lucide `move` */
  move: {
    category: "transform",
    lucide: "move",
    nodes: [
      ["path", { d: "M12 2v20" }],
      ["path", { d: "m15 19-3 3-3-3" }],
      ["path", { d: "m19 9 3 3-3 3" }],
      ["path", { d: "M2 12h20" }],
      ["path", { d: "m5 9-3 3 3 3" }],
      ["path", { d: "m9 5 3-3 3 3" }],
    ],
  },
  /** lucide `rotate-cw` */
  rotate: {
    category: "transform",
    lucide: "rotate-cw",
    nodes: [
      ["path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" }],
      ["path", { d: "M21 3v5h-5" }],
    ],
  },
  /** lucide `scale-3d` */
  scale: {
    category: "transform",
    lucide: "scale-3d",
    nodes: [
      ["path", { d: "M5 7v11a1 1 0 0 0 1 1h11" }],
      ["path", { d: "M5.293 18.707 11 13" }],
      ["circle", { cx: "19", cy: "19", r: "2" }],
      ["circle", { cx: "5", cy: "5", r: "2" }],
    ],
  },
  /** lucide `pencil` */
  draw: {
    category: "draw",
    lucide: "pencil",
    nodes: [
      [
        "path",
        {
          d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
        },
      ],
      ["path", { d: "m15 5 4 4" }],
    ],
  },
  /** lucide `spline` */
  spline: {
    category: "draw",
    lucide: "spline",
    nodes: [
      ["circle", { cx: "19", cy: "5", r: "2" }],
      ["circle", { cx: "5", cy: "19", r: "2" }],
      ["path", { d: "M5 17A12 12 0 0 1 17 5" }],
    ],
  },
  /** lucide `pentagon` */
  polygon: {
    category: "draw",
    lucide: "pentagon",
    nodes: [
      [
        "path",
        {
          d: "M10.83 2.38a2 2 0 0 1 2.34 0l8 5.74a2 2 0 0 1 .73 2.25l-3.04 9.26a2 2 0 0 1-1.9 1.37H7.04a2 2 0 0 1-1.9-1.37L2.1 10.37a2 2 0 0 1 .73-2.25z",
        },
      ],
    ],
  },
  /** lucide `rectangle-horizontal` */
  rectangle: {
    category: "draw",
    lucide: "rectangle-horizontal",
    nodes: [["rect", { width: "20", height: "12", x: "2", y: "6", rx: "2" }]],
  },
  /** lucide `circle` */
  circle: {
    category: "draw",
    lucide: "circle",
    nodes: [["circle", { cx: "12", cy: "12", r: "10" }]],
  },
  /** lucide `scissors` */
  cut: {
    category: "edit",
    lucide: "scissors",
    nodes: [
      ["circle", { cx: "6", cy: "6", r: "3" }],
      ["path", { d: "M8.12 8.12 12 12" }],
      ["path", { d: "M20 4 8.12 15.88" }],
      ["circle", { cx: "6", cy: "18", r: "3" }],
      ["path", { d: "M14.8 14.8 20 20" }],
    ],
  },
  /** lucide `split` */
  split: {
    category: "edit",
    lucide: "split",
    nodes: [
      ["path", { d: "M16 3h5v5" }],
      ["path", { d: "M8 3H3v5" }],
      ["path", { d: "M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" }],
      ["path", { d: "m15 9 6-6" }],
    ],
  },
  /** lucide `undo-2` */
  undo: {
    category: "edit",
    lucide: "undo-2",
    nodes: [
      ["path", { d: "M9 14 4 9l5-5" }],
      ["path", { d: "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" }],
    ],
  },
  /** lucide `redo-2` */
  redo: {
    category: "edit",
    lucide: "redo-2",
    nodes: [
      ["path", { d: "m15 14 5-5-5-5" }],
      ["path", { d: "M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13" }],
    ],
  },
  /** lucide `ruler` */
  "measure-distance": {
    category: "measure",
    lucide: "ruler",
    nodes: [
      [
        "path",
        {
          d: "M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z",
        },
      ],
      ["path", { d: "m14.5 12.5 2-2" }],
      ["path", { d: "m11.5 9.5 2-2" }],
      ["path", { d: "m8.5 6.5 2-2" }],
      ["path", { d: "m17.5 15.5 2-2" }],
    ],
  },
  /** lucide `bold` */
  bold: {
    category: "chrome",
    lucide: "bold",
    nodes: [["path", { d: "M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" }]],
  },
  /** lucide `italic` */
  italic: {
    category: "chrome",
    lucide: "italic",
    nodes: [
      ["line", { x1: "19", x2: "10", y1: "4", y2: "4" }],
      ["line", { x1: "14", x2: "5", y1: "20", y2: "20" }],
      ["line", { x1: "15", x2: "9", y1: "4", y2: "20" }],
    ],
  },
  /** lucide `underline` */
  underline: {
    category: "chrome",
    lucide: "underline",
    nodes: [
      ["path", { d: "M6 4v6a6 6 0 0 0 12 0V4" }],
      ["line", { x1: "4", x2: "20", y1: "20", y2: "20" }],
    ],
  },
  /** 직접 그림 — 두 끝점(원)을 잇는 선분. */
  line: {
    category: "draw",
    nodes: [
      ["path", { d: "M6.4 17.6 17.6 6.4" }],
      ["circle", { cx: "5", cy: "19", r: "2" }],
      ["circle", { cx: "19", cy: "5", r: "2" }],
    ],
  },
  /** 직접 그림 — 꺾인 선. 끝점만 원이다(선과 같은 획). */
  polyline: {
    category: "draw",
    nodes: [
      ["path", { d: "M5 16.3 10 8l4 6 4.8-6.4" }],
      ["circle", { cx: "4", cy: "18", r: "2" }],
      ["circle", { cx: "20", cy: "6", r: "2" }],
    ],
  },
  /** 직접 그림 — 점 추가. 채운 점과 더하기. */
  "add-point": {
    category: "draw",
    nodes: [
      ["circle", { cx: "9", cy: "15", r: "3", fill: "currentColor" }],
      ["path", { d: "M18 3v6" }],
      ["path", { d: "M15 6h6" }],
    ],
  },
  /** 직접 그림 — 오프셋. 안쪽 도형을 같은 간격으로 부풀린 바깥 윤곽(모서리가 더 둥글다). */
  offset: {
    category: "edit",
    nodes: [
      ["rect", { width: "8", height: "8", x: "8", y: "8", rx: "1" }],
      ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "5" }],
    ],
  },
  /** 직접 그림 — 돌출(push/pull). 바닥 면에서 위로 뽑는 화살표. */
  extrude: {
    category: "edit",
    nodes: [
      ["path", { d: "M12 13 3 17l9 4 9-4z" }],
      ["path", { d: "M12 13V3" }],
      ["path", { d: "m8 7 4-4 4 4" }],
    ],
  },
  /** 직접 그림 — 줌 영역. 점선 창의 모서리에 돋보기를 얹는다. */
  "zoom-window": {
    category: "navigate",
    nodes: [
      ["path", { d: "M3 5a2 2 0 0 1 2-2" }],
      ["path", { d: "M8.25 3h.5" }],
      ["path", { d: "M12 3a2 2 0 0 1 2 2" }],
      ["path", { d: "M14 8.25v.5" }],
      ["path", { d: "M3 8.25v.5" }],
      ["path", { d: "M5 14a2 2 0 0 1-2-2" }],
      ["path", { d: "M8.25 14h.5" }],
      ["circle", { cx: "16", cy: "16", r: "4" }],
      ["path", { d: "m21 21-2.2-2.2" }],
    ],
  },
  /** 직접 그림 — 면적 측정. 빗금 친 면. */
  "measure-area": {
    category: "measure",
    nodes: [
      ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }],
      ["path", { d: "m3 13 8 8" }],
      ["path", { d: "m3 5 16 16" }],
      ["path", { d: "m9 3 12 12" }],
    ],
  },
  /** 직접 그림 — 단면. 상자 위를 지나는 절단 평면. */
  "section-plane": {
    category: "view",
    nodes: [
      ["path", { d: "M12 5 22 10 12 15 2 10z" }],
      ["path", { d: "M5 11.5V16l7 3.5 7-3.5v-4.5" }],
      ["path", { d: "M12 15v4.5" }],
    ],
  },
  /** 직접 그림 — 아이소 뷰(3D). 아래 셋(평면 · 정면 · 측면)과 같은 상자. */
  "view-iso": {
    category: "view",
    nodes: [
      ["path", { d: "M12 2 21 7v10l-9 5-9-5V7z" }],
      ["path", { d: "m3 7 9 5 9-5" }],
      ["path", { d: "M12 12v10" }],
    ],
  },
  /** 직접 그림 — 평면 뷰. 윗면을 채운다. */
  "view-top": {
    category: "view",
    nodes: [
      ["path", { d: "M12 2 21 7 12 12 3 7z", fill: "currentColor" }],
      ["path", { d: "M12 2 21 7v10l-9 5-9-5V7z" }],
      ["path", { d: "M12 12v10" }],
    ],
  },
  /** 직접 그림 — 정면 뷰. 왼쪽 면을 채운다. */
  "view-front": {
    category: "view",
    nodes: [
      ["path", { d: "m3 7 9 5v10l-9-5z", fill: "currentColor" }],
      ["path", { d: "M12 2 21 7v10l-9 5-9-5V7z" }],
      ["path", { d: "m12 12 9-5" }],
    ],
  },
  /** 직접 그림 — 측면 뷰. 오른쪽 면을 채운다. */
  "view-side": {
    category: "view",
    nodes: [
      ["path", { d: "m21 7-9 5v10l9-5z", fill: "currentColor" }],
      ["path", { d: "M12 2 21 7v10l-9 5-9-5V7z" }],
      ["path", { d: "m3 7 9 5" }],
    ],
  },
} satisfies Record<string, Glyph>;

/** 글리프 이름(kebab-case) — `icons` 맵의 키이자 컴포넌트 이름(`Icon` + PascalCase)의 원천. */
export type GlyphName = keyof typeof table;

/** 글리프 표 — 이름 → 글리프. */
export const GLYPHS: Readonly<Record<GlyphName, Glyph>> = table;

/** 글리프 이름 전부 — 정본(표) 순서. 묶음은 `category` 가 가른다. */
export const glyphNames = Object.keys(GLYPHS) as GlyphName[];
