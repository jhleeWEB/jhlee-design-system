"use client";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "../cn";

/** 경로의 조각 하나. `href` 가 있으면 링크, 없으면 `onSelect` 를 부르는 버튼이 된다(마지막 조각은 둘 다 무시한다). */
export interface Crumb {
  /** 조각에 보일 이름. */
  label: ReactNode;
  /**
   * 링크가 아닌 조각을 눌렀을 때 — 라우터 없는 화면 전환.
   * @default undefined
   */
  onSelect?: () => void;
  /**
   * 링크 주소. 있으면 `<a>` 로 렌더한다.
   * @default undefined
   */
  href?: string;
}

/** `Breadcrumb` 의 props — `<nav>` 속성에 경로 조각을 더한다. */
export interface BreadcrumbProps extends ComponentProps<"nav"> {
  /** 뿌리에서 현재 위치까지의 조각. 마지막 조각이 현재 위치(`aria-current="page"`)다. */
  items: readonly Crumb[];
}

/** 경로 — 「지금 무엇을 보고 있나」. 마지막 조각은 링크가 아니다(현재 위치이므로). */
export function Breadcrumb({ items, className, ...rest }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex min-w-0 items-center gap-2 text-control text-muted-foreground", className)}
      {...rest}
      data-slot="breadcrumb"
    >
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex min-w-0 items-center gap-2">
            {i > 0 ? (
              <span aria-hidden="true" className="text-foreground-disabled select-none">
                /
              </span>
            ) : null}
            {last ? (
              <span aria-current="page" className="min-w-0 truncate font-semibold text-foreground">
                {item.label}
              </span>
            ) : item.href ? (
              <a href={item.href} className="min-w-0 truncate hover:text-foreground hover:underline">
                {item.label}
              </a>
            ) : (
              <button
                data-slot="breadcrumb-link"
                type="button"
                onClick={item.onSelect}
                className="min-w-0 cursor-pointer appearance-none truncate rounded-md border-0 bg-transparent p-0 text-inherit hover:text-foreground hover:underline focus-visible:focus-ring focus-visible:outline-none"
              >
                {item.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
