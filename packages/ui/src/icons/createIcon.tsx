import type { ComponentProps, ReactElement } from "react";

import { ICON } from "../lib/icons";
import { GLYPHS, type GlyphName } from "./glyphs";

/** 아이콘 컴포넌트의 props — `<svg>` 속성에 크기와 접근성 이름을 더한다. */
export interface IconProps extends Omit<ComponentProps<"svg">, "children"> {
  /**
   * 너비·높이 속성. CSS 가 없을 때의 기본값이다 — 크롬은 대개 감싼 요소의 `[&_svg]:size-4` 같은 클래스가 크기를 정하고, 클래스가 이긴다.
   * 기본 16 은 토큰 `--size-icon-md` 와 같다(`lib/icons.ts` 의 ICON, 대조는 `icons.spec`).
   * @default 16
   */
  size?: number | string;
  /**
   * 접근성 이름. 주면 `role="img"` 와 `<title>` 이 붙고, 없으면 장식으로 보고 `aria-hidden` 이다 — 버튼 안의 아이콘은 버튼의
   * `aria-label` 이 이름을 맡으므로 비워 둔다.
   */
  title?: string;
}

/** `createIcon` 이 돌려주는 컴포넌트 — `displayName` 은 `Icon<PascalCase>` 다. */
export type IconComponent = ((props: IconProps) => ReactElement) & {
  readonly displayName: string;
  readonly glyph: GlyphName;
};

/** `zoom-in` → `IconZoomIn` · `view-3d` → `IconView3d`. */
export function iconComponentName(name: GlyphName): string {
  return `Icon${name.replace(/(^|-)([a-z0-9])/g, (_, _sep: string, c: string) => c.toUpperCase())}`;
}

/**
 * 글리프 이름 하나로 아이콘 컴포넌트를 만든다. 훅·핸들러가 없는 순수 컴포넌트라 서버 컴포넌트에서도 그대로 쓴다("use client" 없음).
 *
 * 속성은 react-icons 5 의 lucide 렌더(`stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" round`)와 같다 —
 * 옮기기 전과 픽셀이 같아야 기존 VRT 가 0 diff 로 남는다(#64). 소비자 props 가 기본값을 덮을 수 있게 펼침은 기본값 뒤에 둔다.
 */
export function createIcon(name: GlyphName): IconComponent {
  const glyph = GLYPHS[name];
  function Icon({ size = ICON.size, title, ...rest }: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={ICON.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        width={size}
        height={size}
        role={title ? "img" : undefined}
        aria-hidden={title ? undefined : ICON["aria-hidden"]}
        focusable={ICON.focusable}
        data-slot="icon"
        {...rest}
      >
        {title ? <title>{title}</title> : null}
        {glyph.nodes.map(([Tag, attrs], i) => (
          <Tag key={i} {...attrs} />
        ))}
      </svg>
    );
  }
  Icon.displayName = iconComponentName(name);
  Icon.glyph = name;
  return Icon;
}
