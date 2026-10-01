"use client";
import { createContext, useContext, type ReactElement, type ReactNode } from "react";
import { IconChevronLeft, IconChevronRight, IconMoreHorizontal } from "../icons/icons";
import { Slot } from "radix-ui";

import { cn, type VariantProps } from "../cn";
import { paginationLinkVariants } from "./Pagination.variants";

/* 페이지 나눔 — 긴 목록의 «몇 쪽째인가» 와 쪽 사이 이동(#62).
 *
 * 랜드마크는 `<nav aria-label="Pagination">` 하나, 칸은 `<ul><li>` 목록이다(스크린리더가 «list, 7 items» 로 규모를 먼저 말한다).
 * 지금 쪽은 `aria-current="page"` 로 말하고 색은 그 상태를 거들 뿐이다(원칙 2).
 * 칸은 기본이 `<button>`(같은 화면 안 목록)이고, 주소가 있는 쪽(서버 렌더 목록 · 라우터)은 `renderLink` 가 돌려준 요소(내용을 받은 링크)에 칸을 **얹는다**(Radix `Slot`, asChild) —
 * `<a href>` 든 라우터의 `<Link>` 든 이벤트 · ARIA · ref 를 그 요소가 받는다(design-system-patterns «합성하는 요소의 책임»).
 * 이전 · 다음이 끝에 닿으면 링크를 만들지 않고 비활성 버튼을 둔다 — 갈 곳 없는 링크는 `href` 가 없어 키보드로 닿지 않는 «죽은 링크» 가 된다. */

type PaginationSize = NonNullable<VariantProps<typeof paginationLinkVariants>["size"]>;

const PaginationSizeContext = createContext<PaginationSize>("md");

/** 번호 줄 — 쪽 번호와 생략(`"ellipsis"`). 첫 쪽 · 끝 쪽 · 지금 쪽 ± `siblingCount` 를 늘 보이고, 한 쪽만 건너뛰는 생략은 그 쪽 번호로 채운다. */
function pageItems(page: number, pageCount: number, siblingCount: number): (number | "ellipsis")[] {
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  // 첫 · 끝 · 지금 · 생략 둘 = 5칸 + 이웃 양쪽. 이보다 적으면 생략할 것이 없다.
  const slots = siblingCount * 2 + 5;
  if (pageCount <= slots) return range(1, pageCount);
  const left = Math.max(page - siblingCount, 1);
  const right = Math.min(page + siblingCount, pageCount);
  const leftGap = left > 3;
  const rightGap = right < pageCount - 2;
  const edge = siblingCount * 2 + 3;
  if (!leftGap) return [...range(1, edge), "ellipsis", pageCount];
  if (!rightGap) return [1, "ellipsis", ...range(pageCount - edge + 1, pageCount)];
  return [1, "ellipsis", ...range(left, right), "ellipsis", pageCount];
}

/** `PaginationLink` 의 props — `<button>` 속성(ref 포함) + `asChild` · `isActive`. */
export interface PaginationLinkProps extends React.ComponentPropsWithRef<"button"> {
  /**
   * 칸을 자식 요소(`<a href>` · 라우터 `<Link>`)에 얹는다 — 모양 · `aria-current` · 핸들러가 그 요소로 간다.
   * @default false
   */
  asChild?: boolean;
  /**
   * 지금 쪽 — `aria-current="page"` 를 달고 주색으로 선다.
   * @default false
   */
  isActive?: boolean;
}

/**
 * 페이지 칸 하나 — 번호 · 이전 · 다음이 같은 모양이다. 기본은 `<button>`, `asChild` 면 자식 링크에 얹힌다. 크기는 감싼 `Pagination` 의 `size` 를 따른다.
 * `Pagination` 이 칸을 다 그리므로 직접 쓸 일은 쪽 줄을 손으로 짤 때뿐이다.
 * @slot pagination-link
 */
export function PaginationLink({
  asChild = false,
  isActive = false,
  className,
  type,
  ...rest
}: PaginationLinkProps) {
  const size = useContext(PaginationSizeContext);
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      type={asChild ? type : (type ?? "button")}
      aria-current={isActive ? "page" : undefined}
      className={cn(paginationLinkVariants({ size }), className)}
      {...rest}
      data-slot="pagination-link"
      data-size={size satisfies PaginationSize}
    />
  );
}

/** `Pagination` 의 props — `<nav>` 속성(ref 포함) + 쪽 상태 · `size`. 쪽 번호는 1 부터다. */
export interface PaginationProps
  extends Omit<React.ComponentPropsWithRef<"nav">, "children">, VariantProps<typeof paginationLinkVariants> {
  /** 지금 쪽(1 부터). 상태는 부르는 쪽이 든다 — `onPageChange` 에서 바꿔 다시 넘긴다. */
  page: number;
  /** 전체 쪽 수. 1 보다 작으면 1 로 본다. */
  pageCount: number;
  /**
   * 쪽을 옮길 때 — 새 쪽 번호. 링크 모드(`renderLink`)에서도 누를 때 함께 불린다.
   * @default undefined
   */
  onPageChange?: ((page: number) => void) | undefined;
  /**
   * 지금 쪽 양옆에 늘 보일 이웃 쪽 수 — 그 밖은 첫 쪽 · 끝 쪽만 남기고 생략(…)한다.
   * @default 1
   */
  siblingCount?: number;
  /**
   * 쪽마다 칸을 얹을 링크 요소 — `(page, children) => <a href={`?page=${page}`}>{children}</a>` 나 라우터의 `<Link>`.
   * `children`(번호 · 이전 · 다음)을 그대로 넣는다. 모양 · `aria-current` · 이름은 칸이 얹는다. 주지 않으면 칸은 `<button>` 이다.
   * @default undefined
   */
  renderLink?: ((page: number, children: ReactNode) => ReactElement) | undefined;
}

/**
 * 페이지 나눔 — 이전 · 쪽 번호(생략 포함) · 다음. `nav` 랜드마크이고 지금 쪽에 `aria-current="page"` 가 선다.
 * 같은 화면 목록은 `onPageChange`(버튼), 주소가 있는 목록은 `renderLink`(링크)로 쓴다.
 * @slot pagination
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  renderLink,
  size,
  className,
  "aria-label": ariaLabel = "Pagination",
  ...rest
}: PaginationProps) {
  const resolved: PaginationSize = size ?? "md";
  const count = Math.max(1, Math.floor(pageCount));
  const current = Math.min(Math.max(1, Math.floor(page)), count);

  /** 쪽 하나로 가는 칸 — 링크 모드면 renderLink 요소에 얹고, 아니면 버튼이다. 갈 곳이 없으면(끝) 늘 비활성 버튼이다. */
  const linkTo = (target: number, content: ReactNode, props: PaginationLinkProps) => {
    if (target < 1 || target > count)
      return (
        <PaginationLink {...props} disabled>
          {content}
        </PaginationLink>
      );
    const go = () => onPageChange?.(target);
    if (renderLink)
      return (
        <PaginationLink {...props} asChild onClick={go}>
          {renderLink(target, content)}
        </PaginationLink>
      );
    return (
      <PaginationLink {...props} onClick={go}>
        {content}
      </PaginationLink>
    );
  };

  return (
    <PaginationSizeContext.Provider value={resolved}>
      <nav
        aria-label={ariaLabel}
        className={cn("flex min-w-0 justify-center", className)}
        {...rest}
        data-slot="pagination"
        data-size={resolved satisfies PaginationSize}
      >
        <ul className="m-0 flex list-none flex-wrap items-center gap-1 p-0">
          <li>
            {linkTo(
              current - 1,
              <>
                <IconChevronLeft />
                <span>Previous</span>
              </>,
              { className: "pr-3" },
            )}
          </li>
          {pageItems(current, count, Math.max(0, Math.floor(siblingCount))).map((item, i) =>
            item === "ellipsis" ? (
              <li
                key={`ellipsis-${i}`}
                className="inline-flex min-w-(--height-ctl-sm) items-center justify-center text-muted-foreground"
              >
                <IconMoreHorizontal />
                <span className="sr-only">More pages</span>
              </li>
            ) : (
              <li key={item}>
                {linkTo(item, item, {
                  isActive: item === current,
                  "aria-label": `Page ${item}`,
                  className: "tnum",
                })}
              </li>
            ),
          )}
          <li>
            {linkTo(
              current + 1,
              <>
                <span>Next</span>
                <IconChevronRight />
              </>,
              { className: "pl-3" },
            )}
          </li>
        </ul>
      </nav>
    </PaginationSizeContext.Provider>
  );
}
