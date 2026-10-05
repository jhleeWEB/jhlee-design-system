/* 3D 모델링 커서의 정본(#64) — 생성기(`tokens/build.mjs`)가 이 표로 `generated/cursors.css`(:root 의 `--cursor-*`)와
 * `generated/cursors.tailwind.css`(`@utility cursor-cad-*`)를 쓰고, 카탈로그(`Foundations/Cursors`)가 같은 SVG 를 미리보기로 그린다.
 * 소비자는 서브패스 `./cursors.css` 로 둘을 싣는다 — theme.css · tokens.css 에는 없다(5.0.0, #102).
 *
 * 모양: 32×32 SVG, 검정 본체(획 2) 아래에 흰 외곽(획 5 → 바깥으로 1.5px)을 한 번 더 그린다 — 흰 캔버스와 다크 크롬 어느 바탕에서도 읽힌다.
 * 아이콘과 같은 글리프를 쓰는 커서(손 · 돋보기 · 연필 · 스포이트 · 모래시계 …)는 `glyphs.ts` 를 24 → 32 칸 가운데로 옮겨(translate 4 4) 그린다 —
 * 툴 버튼의 아이콘과 그 툴의 커서가 같은 모양이어야 «지금 무슨 툴인가» 가 한눈에 맞는다.
 *
 * 색(black · white)은 토큰이 아니다: data URI 안의 SVG 는 CSS 변수를 읽지 못하고, 커서는 테마와 무관하게 OS 커서처럼 고정 대비여야 한다.
 * 고해상도: SVG 는 벡터라 따로 2x 그림이 필요 없다. `image-set()` 은 `cursor` 에서의 지원이 엔진마다 갈리고(접두사 · 해상도 서술자 ·
 * SVG 후보 처리) 세 엔진 모두에서 확인하지 못해 쓰지 않는다 — 한 장의 SVG 와 키워드 폴백은 Chromium · WebKit · Gecko 가 모두 받는 꼴이다.
 *
 * Node 24 가 빌드 없이 이 파일을 읽으므로(tokens/build.mjs) 상대 import 에 `.ts` 를 단다.
 */
import { GLYPHS, type GlyphName, type GlyphNode } from "../icons/glyphs.ts";

/** 이미지가 실패할 때 쓰는 CSS 커서 키워드 — 이 집합 밖은 `cursors.spec` 이 막는다. */
export const CURSOR_KEYWORDS = [
  "default",
  "move",
  "grab",
  "grabbing",
  "zoom-in",
  "zoom-out",
  "crosshair",
  "copy",
  "not-allowed",
  "wait",
  "ns-resize",
  "ew-resize",
  "nesw-resize",
  "nwse-resize",
] as const;

/** 폴백 키워드. */
export type CursorKeyword = (typeof CURSOR_KEYWORDS)[number];

/** 커서를 이루는 조각 — 32 칸 좌표의 요소, 또는 24 칸 글리프를 가운데로 옮긴 것. */
export type CursorPart = GlyphNode | { readonly glyph: GlyphName };

/** 커서 하나. */
export interface CursorSpec {
  /** 무엇을 할 때의 커서인가 — 카탈로그와 생성 CSS 주석에 실린다. */
  readonly label: string;
  /** 클릭이 일어나는 점(32 칸 좌표, 0–31). 화살표는 끝, 십자는 가운데, 연필·스포이트는 촉. */
  readonly hotspot: readonly [x: number, y: number];
  /** SVG 를 못 그릴 때(오래된 엔진 · 32px 초과를 거부하는 OS) 대신 쓸 키워드. */
  readonly fallback: CursorKeyword;
  /** 그리는 순서대로의 조각 — 외곽층과 본체층에 같은 조각이 두 번 그려진다. */
  readonly parts: readonly CursorPart[];
}

/** 선택 화살표 — 끝이 (6, 3). 채운 본체다. */
const ARROW: GlyphNode = ["path", { d: "M6 3v19l4.6-4.4 3.7 8 3.2-1.5-3.6-7.8H20z", fill: "currentColor" }];

/** 가운데가 비어 있는 십자 — 정밀 지점을 가리지 않는다. 중심 (cx, cy), 팔 길이 `arm`, 가운데 틈 반지름 `gap`. */
function cross(cx: number, cy: number, arm: number, gap: number): GlyphNode[] {
  return [
    ["path", { d: `M${cx} ${cy - gap - arm}v${arm}` }],
    ["path", { d: `M${cx} ${cy + gap}v${arm}` }],
    ["path", { d: `M${cx - gap - arm} ${cy}h${arm}` }],
    ["path", { d: `M${cx + gap} ${cy}h${arm}` }],
  ];
}

/* 순서가 카탈로그 순서다 — 선택 · 뷰 조작 · 변형 · 그리기/측정 · 크기 조절 · 상태. */
export const CURSORS = {
  select: { label: "Select", hotspot: [6, 3], fallback: "default", parts: [ARROW] },
  "select-add": {
    label: "Add to selection",
    hotspot: [6, 3],
    fallback: "default",
    parts: [ARROW, ["path", { d: "M26 19v8" }], ["path", { d: "M22 23h8" }]],
  },
  "select-subtract": {
    label: "Remove from selection",
    hotspot: [6, 3],
    fallback: "default",
    parts: [ARROW, ["path", { d: "M22 23h8" }]],
  },
  copy: {
    label: "Copy",
    hotspot: [6, 3],
    fallback: "copy",
    parts: [
      ARROW,
      ["path", { d: "M21 20h8v8h-8z" }],
      ["path", { d: "M25 22v4" }],
      ["path", { d: "M23 24h4" }],
    ],
  },
  orbit: { label: "Orbit", hotspot: [16, 16], fallback: "grab", parts: [{ glyph: "orbit" }] },
  pan: { label: "Pan", hotspot: [16, 16], fallback: "grab", parts: [{ glyph: "pan" }] },
  grab: { label: "Grab", hotspot: [16, 16], fallback: "grab", parts: [{ glyph: "pan" }] },
  grabbing: { label: "Grabbing", hotspot: [16, 16], fallback: "grabbing", parts: [{ glyph: "grab" }] },
  "zoom-in": { label: "Zoom in", hotspot: [15, 15], fallback: "zoom-in", parts: [{ glyph: "zoom-in" }] },
  "zoom-out": { label: "Zoom out", hotspot: [15, 15], fallback: "zoom-out", parts: [{ glyph: "zoom-out" }] },
  "zoom-window": {
    label: "Zoom window",
    hotspot: [10, 10],
    fallback: "zoom-in",
    parts: [
      ...cross(10, 10, 4, 3),
      ["circle", { cx: "21", cy: "21", r: "5" }],
      ["path", { d: "m29 29-4.5-4.5" }],
    ],
  },
  move: {
    label: "Move",
    hotspot: [16, 16],
    fallback: "move",
    parts: [
      ["path", { d: "M16 4v24" }],
      ["path", { d: "M4 16h24" }],
      ["path", { d: "m12 8 4-4 4 4" }],
      ["path", { d: "m12 24 4 4 4-4" }],
      ["path", { d: "m8 12-4 4 4 4" }],
      ["path", { d: "m24 12 4 4-4 4" }],
    ],
  },
  rotate: {
    label: "Rotate",
    hotspot: [16, 16],
    fallback: "grab",
    parts: [{ glyph: "rotate" }, ["circle", { cx: "16", cy: "16", r: "1", fill: "currentColor" }]],
  },
  scale: {
    label: "Scale",
    hotspot: [16, 16],
    fallback: "nesw-resize",
    parts: [
      ["path", { d: "M5 17h10v10H5z" }],
      ["path", { d: "m15 17 11-11" }],
      ["path", { d: "M20 6h6v6" }],
    ],
  },
  crosshair: { label: "Precise", hotspot: [16, 16], fallback: "crosshair", parts: cross(16, 16, 9, 4) },
  snap: {
    label: "Snap",
    hotspot: [16, 16],
    fallback: "crosshair",
    parts: [["path", { d: "M12 12h8v8h-8z" }], ...cross(16, 16, 6, 7)],
  },
  draw: { label: "Draw", hotspot: [6, 26], fallback: "crosshair", parts: [{ glyph: "draw" }] },
  "add-point": {
    label: "Add point",
    hotspot: [12, 12],
    fallback: "crosshair",
    parts: [...cross(12, 12, 5, 3), ["path", { d: "M25 19v8" }], ["path", { d: "M21 23h8" }]],
  },
  measure: {
    label: "Measure",
    hotspot: [10, 10],
    fallback: "crosshair",
    parts: [
      ...cross(10, 10, 4, 3),
      ["path", { d: "m15 27 11-11" }],
      ["path", { d: "m13 25 4 4" }],
      ["path", { d: "m24 14 4 4" }],
    ],
  },
  section: {
    label: "Section",
    hotspot: [10, 10],
    fallback: "crosshair",
    parts: [...cross(10, 10, 4, 3), ["path", { d: "m22 16 7 3.5-7 3.5-7-3.5z" }]],
  },
  eyedropper: { label: "Pick", hotspot: [6, 26], fallback: "crosshair", parts: [{ glyph: "eyedropper" }] },
  "resize-ns": {
    label: "Resize vertically",
    hotspot: [16, 16],
    fallback: "ns-resize",
    parts: [
      ["path", { d: "M16 4v24" }],
      ["path", { d: "m11 9 5-5 5 5" }],
      ["path", { d: "m11 23 5 5 5-5" }],
    ],
  },
  "resize-ew": {
    label: "Resize horizontally",
    hotspot: [16, 16],
    fallback: "ew-resize",
    parts: [
      ["path", { d: "M4 16h24" }],
      ["path", { d: "m9 11-5 5 5 5" }],
      ["path", { d: "m23 11 5 5-5 5" }],
    ],
  },
  "resize-nesw": {
    label: "Resize diagonally (NE–SW)",
    hotspot: [16, 16],
    fallback: "nesw-resize",
    parts: [
      ["path", { d: "M7 25 25 7" }],
      ["path", { d: "M18 7h7v7" }],
      ["path", { d: "M14 25H7v-7" }],
    ],
  },
  "resize-nwse": {
    label: "Resize diagonally (NW–SE)",
    hotspot: [16, 16],
    fallback: "nwse-resize",
    parts: [
      ["path", { d: "m7 7 18 18" }],
      ["path", { d: "M7 14V7h7" }],
      ["path", { d: "M25 18v7h-7" }],
    ],
  },
  "not-allowed": {
    label: "Not allowed",
    hotspot: [16, 16],
    fallback: "not-allowed",
    parts: [
      ["circle", { cx: "16", cy: "16", r: "11" }],
      ["path", { d: "m8.2 8.2 15.6 15.6" }],
    ],
  },
  wait: { label: "Wait", hotspot: [16, 16], fallback: "wait", parts: [{ glyph: "hourglass" }] },
} as const satisfies Readonly<Record<string, CursorSpec>>;

/** 커서 이름 — `--cursor-<이름>` · `cursor-cad-<이름>`. */
export type CursorName = keyof typeof CURSORS;

/** 커서 이름 전부 — 정본 순서. */
export const cursorNames = Object.keys(CURSORS) as CursorName[];

const camelToKebab = (key: string): string => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

function nodeMarkup([tag, attrs]: GlyphNode): string {
  const list = Object.entries(attrs)
    .map(([k, v]) => ` ${camelToKebab(k)}="${v}"`)
    .join("");
  return `<${tag}${list}/>`;
}

function partMarkup(part: CursorPart): string {
  if ("glyph" in part)
    return `<g transform="translate(4 4)">${GLYPHS[part.glyph].nodes.map(nodeMarkup).join("")}</g>`;
  return nodeMarkup(part);
}

/**
 * 커서 하나의 SVG 문서. 같은 조각을 두 번 그린다 — 흰 외곽(획 5)을 먼저, 검정 본체(획 2)를 위에. 채운 조각은 `currentColor` 라
 * 각 층의 `color` 를 따른다.
 */
export function cursorSvg(name: CursorName): string {
  const body = (CURSORS[name].parts as readonly CursorPart[]).map(partMarkup).join("");
  const layer = (color: string, width: number) =>
    `<g fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" color="${color}">${body}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${layer("white", 5)}${layer("black", 2)}</svg>`;
}

/** SVG 를 CSS `url("data:…")` 안에 넣을 수 있게 줄인다 — 큰따옴표는 작은따옴표로, URL 에서 뜻이 있는 글자만 퍼센트 인코딩한다. */
export function svgDataUri(svg: string): string {
  return `data:image/svg+xml,${svg.replace(/"/g, "'").replace(/[%#<>{}\n]/g, encodeURIComponent)}`;
}

/** CSS `cursor` 값 — `url("data:…") x y, <폴백>`. `--cursor-<이름>` 의 값이다. */
export function cursorValue(name: CursorName): string {
  const { hotspot, fallback } = CURSORS[name];
  return `url("${svgDataUri(cursorSvg(name))}") ${hotspot[0]} ${hotspot[1]}, ${fallback}`;
}
