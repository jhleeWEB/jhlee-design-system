/* 아이콘 서브패스 `@jhleeweb/jhlee-design-system/icons`(#64) — react-icons 를 걷어내고 이 저장소가 소유하는 SVG 아이콘.
 *
 *   import { IconOrbit, IconMove, icons } from "@jhleeweb/jhlee-design-system/icons";
 *
 * 컴포넌트는 `IconX`(장식 — aria-hidden) · `<IconX title="Orbit" />`(이름 있는 그림 — role="img"). 크기 기본 16(`--size-icon-md`) · 획 2 ·
 * currentColor. lucide 에서 옮긴 글리프의 고지는 `LICENSE-lucide.txt`(배포물 `dist/icons/`)에 있다. 순수 모듈이다 — "use client" 가 없다.
 */
export * from "./icons";
export { createIcon, iconComponentName, type IconComponent, type IconProps } from "./createIcon";
export {
  GLYPHS,
  glyphNames,
  type Glyph,
  type GlyphCategory,
  type GlyphName,
  type GlyphNode,
  type GlyphTag,
} from "./glyphs";
