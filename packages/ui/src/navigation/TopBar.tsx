import type { ComponentProps, ReactNode } from "react";

import { cn } from "../cn";
import { topBarVariants } from "./TopBar.variants";

/* 상단바 — 3.0.0 이 지운 3열 셸의 TopBar(#49)를 크롬 어휘로 다시 세운다(#60).
 *
 * 순서는 고정이다: [leading] 제목 · eyebrow · 브레드크럼 · children ……… actions. 제목이 언제나 같은 자리에 있어야 화면을 오가도 눈이
 * 헤매지 않는다. 오른쪽 끝(actions)은 «이 화면의 동작» 자리다 — 저장 · 내보내기 · 패널 토글.
 *
 * 훅도 핸들러도 없는 순수 표시 컴포넌트라 `"use client"` 가 없다(서버 컴포넌트에서 그대로 쓴다). 안에 넣는 버튼이 클라이언트면 그것이 경계다. */

/** `TopBar` 의 props — `<header>` 속성에 제목 · 보조 줄 · 브레드크럼 · 동작 슬롯과 높이를 더한다. */
export interface TopBarProps extends Omit<ComponentProps<"header">, "title"> {
  /** 화면 제목 — 제목 요소(`h1` 기본)로 렌더한다. */
  title: ReactNode;
  /**
   * 제목 옆의 작은 대문자 줄 — 프로젝트 · 관할 · 단계.
   * @default undefined
   */
  eyebrow?: ReactNode;
  /**
   * 경로 — `Breadcrumb` 을 그대로 넣는다. 제목 뒤에 세로 구분선과 함께 선다.
   * @default undefined
   */
  breadcrumb?: ReactNode;
  /**
   * 제목 앞 — 로고 · 사이드바 토글.
   * @default undefined
   */
  leading?: ReactNode;
  /**
   * 오른쪽 끝의 동작 — 버튼 묶음 · 패널 토글.
   * @default undefined
   */
  actions?: ReactNode;
  /**
   * 제목 요소의 단계. 상단바가 화면의 첫 제목이면 1, 셸 안의 하위 화면이면 2.
   * @default 1
   */
  headingLevel?: 1 | 2 | 3;
  /**
   * 높이 — `sm` — 44px(밀도 높은 도구 화면) · `md` — 56px(기본)
   * @default "md"
   */
  size?: "sm" | "md";
}

/** 상단바 — 제목 · eyebrow · 브레드크럼 · 동작 슬롯을 한 줄에 고정 순서로 놓는다. */
export function TopBar({
  className,
  title,
  eyebrow,
  breadcrumb,
  leading,
  actions,
  headingLevel = 1,
  size,
  children,
  ...rest
}: TopBarProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <header
      className={cn(topBarVariants({ size }), className)}
      {...rest}
      data-slot="top-bar"
      data-size={size ?? "md"}
    >
      {leading === undefined ? null : <div className="flex shrink-0 items-center gap-2">{leading}</div>}
      <Heading className="m-0 truncate text-title font-semibold text-foreground">{title}</Heading>
      {eyebrow === undefined ? null : (
        <span className="shrink-0 font-mono text-micro font-medium tracking-caps text-muted-foreground uppercase">
          {eyebrow}
        </span>
      )}
      {breadcrumb === undefined ? null : (
        <>
          <span aria-hidden="true" className="h-4 w-px shrink-0 bg-border" />
          <div className="flex min-w-0 items-center">{breadcrumb}</div>
        </>
      )}
      {children}
      {actions === undefined ? null : (
        <div className="ml-auto flex shrink-0 items-center gap-2" data-slot="top-bar-actions">
          {actions}
        </div>
      )}
    </header>
  );
}
