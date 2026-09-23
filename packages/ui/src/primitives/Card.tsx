import { Children, Fragment, cloneElement, createContext, isValidElement, useContext, useId, useMemo } from "react";

import { cn, cva, type VariantProps } from "../cn";

/* 카드 — 이 제품의 기본 구획.
 *
 * 앞선 판은 헤어라인 격자였다(「여백이 아니라 선이 구조를 만든다」). 참고 화면은 그 반대다 —
 * 카드가 옅은 바닥 위에 **떠 있고** 여백이 경계이며 그림자가 층위를 만든다. 실측으로
 * 카드 사이 12px · 반경 10–12px · 아주 낮은 불투명도의 큰 블러였다.
 *
 * ── 접기 ────────────────────────────────────────────────────────────────────
 * 접기는 **별도 컴포넌트가 아니라 카드의 상태**다. 사이드 패널과 뷰 카드가 같은 것을 원하는데
 * 둘을 다른 컴포넌트로 만들면 셰브론 방향·포커스·저장 규칙이 두 벌로 갈린다.
 *
 * 규칙 둘이 이 구현을 결정한다.
 *   1. **접혀도 돌아갈 길이 사라지지 않는다.** 접힌 자리에는 세로 탭이나 머리줄이 남고,
 *      그것 자체가 되돌리는 버튼이다. 어딘가의 메뉴에서만 되살릴 수 있으면 사용자가 방금
 *      무엇을 없앴는지 기억해야 한다.
 *   2. **내용을 언마운트하지 않는다.** `hidden` 으로 감춘다. 언마운트하면 스크롤 위치와
 *      패널 안의 지역 상태(펼친 섹션, 입력 중이던 값)가 날아가 접기가 파괴적 동작이 된다.
 */

interface CardCtx {
  collapsible: boolean;
  collapsed: boolean;
  toggle: () => void;
  contentId: string;
  label: string;
  side: "left" | "right";
}
const Ctx = createContext<CardCtx | null>(null);

export const cardVariants = cva("relative flex min-h-0 min-w-0 flex-col bg-surface", {
  variants: {
    elevation: {
      raised: "rounded-card shadow-card",
      /* 테두리만. 카드 안에 다시 칸을 나눌 때 — 그림자를 겹쳐 쓰면 층위가 흐려진다. */
      flat: "rounded-card border border-line",
      /* 격자에 붙는 칸. 옛 셸과 섞어 쓸 때. */
      flush: "rounded-none border border-line",
    },
    pad: { none: "", sm: "p-3", md: "p-4", lg: "p-5" },
  },
  defaultVariants: { elevation: "raised", pad: "none" },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** 주면 이 카드는 접힌다. 제어 컴포넌트이므로 `onCollapsedChange` 도 함께 준다. */
  collapsed?: boolean | undefined;
  onCollapsedChange?: ((collapsed: boolean) => void) | undefined;
  /**
   * 접혔을 때 무엇으로 남는가.
   *   strip   세로 탭. **가로로 나란히 놓인** 패널·뷰 — 접으면 폭을 옆에 돌려준다
   *   header  머리줄만. **세로로 쌓인** 칸 — 접으면 높이를 아래에 돌려준다
   */
  collapseTo?: "strip" | "header";
  /** 세로 탭에 적히는 이름. `collapseTo="strip"` 이면 필수다. */
  collapsedLabel?: string;
  /** 접혔을 때도 남는 신호 — 미해결 판정 수 같은 것. 없으면 자리도 없다. */
  collapsedSignal?: React.ReactNode;
  /** 탭이 붙는 가장자리. 셰브론 방향과 세로 글자 방향이 여기서 정해진다. */
  side?: "left" | "right";
}

function Chevron({ pointing, className }: { pointing: "left" | "right" | "up" | "down"; className?: string }) {
  const d = {
    left: "M10 3.5L5.5 8l4.5 4.5",
    right: "M6 3.5L10.5 8 6 12.5",
    up: "M3.5 10L8 5.5l4.5 4.5",
    down: "M3.5 6L8 10.5 12.5 6",
  }[pointing];
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={cn("size-4", className)} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

/* Fragment는 DOM 구획이 아니므로 머리/본문 분류 전에 펼친다. 경로 전체를 key로 쓰면
   서로 다른 Fragment의 같은 지역 key도 충돌하지 않아 접기 중 입력 상태를 보존한다. */
function flattenCardChildren(children: React.ReactNode, ancestry: readonly (string | number)[] = []): React.ReactNode[] {
  return Children.toArray(children).flatMap<React.ReactNode>((child, index) => {
    if (!isValidElement<{ children?: React.ReactNode }>(child)) return [child];
    const path = [...ancestry, child.key ?? index];
    if (child.type === Fragment) return flattenCardChildren(child.props.children, path);
    return [cloneElement(child, { key: JSON.stringify(path) })];
  });
}

export function Card({
  className,
  elevation,
  pad,
  collapsed,
  onCollapsedChange,
  collapseTo = "header",
  collapsedLabel,
  collapsedSignal,
  side = "left",
  style,
  children,
  ...rest
}: CardProps) {
  const contentId = useId();
  const collapsible = collapsed !== undefined && onCollapsedChange !== undefined;
  const isCollapsed = collapsible && collapsed === true;

  const ctx = useMemo<CardCtx>(
    () => ({
      collapsible,
      collapsed: isCollapsed,
      toggle: () => onCollapsedChange?.(!isCollapsed),
      contentId,
      label: collapsedLabel ?? "panel",
      side,
    }),
    [collapsible, isCollapsed, onCollapsedChange, contentId, collapsedLabel, side],
  );

  const strip = isCollapsed && collapseTo === "strip";
  const headerCollapse = collapsible && collapseTo === "header";
  const childList = headerCollapse ? flattenCardChildren(children) : [];
  const isHeader = (child: React.ReactNode) => isValidElement(child) && child.type === CardHeader;
  /* 셰브론은 **누르면 일어날 일**을 가리킨다. 왼쪽에 붙은 패널을 펼치면 내용이 오른쪽으로
     자라므로 오른쪽을 가리킨다. */
  const pointing = side === "left" ? "right" : "left";

  return (
    <Ctx.Provider value={ctx}>
      <div
        data-slot="card"
        data-collapsed={isCollapsed || undefined}
        className={cn(
          "group/card",
          cardVariants({ elevation, pad }),
          collapsible && "transition-[width,flex-grow] duration-150 motion-reduce:transition-none",
          className,
          /* 접힘 클래스는 `className` **뒤에** 온다. 호출처는 펼쳤을 때의 치수를 준다
             (`w-[290px]` · `flex-1`), 접힘은 **모드**이고 그 모드가 소유한 속성은 모드가
             이겨야 한다. 앞에 두면 tailwind-merge 가 뒤의 `w-[290px]` 을 남겨 카드가
             `data-collapsed` 만 달고 그대로 서 있는다 — 실제로 그랬다. */
          strip && "w-9 min-w-0 flex-none overflow-hidden",
          isCollapsed && collapseTo === "header" && "flex-none",
        )}
        style={strip ? { ...style, width: undefined } : style}
        {...rest}
      >
        {strip ? (
          <>
            <button
              data-slot="card-collapse"
              type="button"
              aria-expanded={false}
              aria-controls={contentId}
              onClick={ctx.toggle}
              title={`Expand ${ctx.label}`}
              className={cn(
                "appearance-none border-0 bg-transparent p-0 font-inherit text-inherit",
                "flex size-full cursor-pointer flex-col items-center gap-2 py-2.5",
                "text-muted hover:bg-surface-2 hover:text-ink",
                "focus-visible:focus-ring focus-visible:outline-none",
              )}
            >
              <Chevron pointing={pointing} />
              <span
                className={cn(
                  "flex-1 whitespace-nowrap font-mono text-micro uppercase tracking-caps",
                  "[writing-mode:vertical-rl]",
                  /* 왼쪽 탭은 아래에서 위로 읽는다 — 화면 중앙을 향해 글이 흐르는 쪽. */
                  side === "left" && "rotate-180",
                )}
              >
                {ctx.label}
              </span>
              {collapsedSignal ? <span className="shrink-0">{collapsedSignal}</span> : null}
            </button>
            <div id={contentId} hidden className="flex min-h-0 flex-1 flex-col">
              {children}
            </div>
          </>
        ) : headerCollapse ? (
          <>
            {childList.filter(isHeader)}
            {/* 접기 버튼의 ARIA 대상은 항상 같은 본문이다. contents는 기존 flex/grid 자식의
                배치를 보존하고 hidden은 언마운트 없이 입력·스크롤 상태를 남긴다. */}
            <div id={contentId} data-slot="card-content" hidden={isCollapsed} style={{ display: isCollapsed ? "none" : "contents" }}>
              {childList.filter(child => !isHeader(child))}
            </div>
          </>
        ) : (
          children
        )}
      </div>
    </Ctx.Provider>
  );
}

/* 카드 머리 — 제목은 왼쪽, 치수·상태 같은 메타는 오른쪽. 참고 화면의 «2D Plan … 18.00 × 12.00 m»
   배치가 그것이고, 메타가 오른쪽 끝에 고정되어야 여러 카드의 제목 줄이 같은 리듬으로 읽힌다.
   카드가 접히는 카드면 접기 버튼이 여기 자동으로 붙는다 — 호출처가 매번 달면 빠진다. */
export function CardHeader({
  className,
  title,
  meta,
  children,
  ...rest
}: Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  title?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  const ctx = useContext(Ctx);
  return (
    <div
      data-slot="card-header"
      className={cn("group/head flex shrink-0 items-center gap-3 px-4 py-3", className)}
      {...rest}
    >
      {title ? <div className="min-w-0 truncate text-control font-semibold text-ink">{title}</div> : null}
      {children}
      {meta ? <div className="ml-auto shrink-0 tnum text-label text-muted">{meta}</div> : null}
      {ctx?.collapsible ? (
        <button
          data-slot="card-collapse"
          type="button"
          aria-expanded={!ctx.collapsed}
          aria-controls={ctx.contentId}
          onClick={ctx.toggle}
          title={`${ctx.collapsed ? "Expand" : "Collapse"} ${ctx.label}`}
          className={cn(
            "appearance-none border-0 bg-transparent p-0 font-inherit text-inherit",
            "grid size-6 shrink-0 cursor-pointer place-items-center rounded-control text-muted",
            !meta && "ml-auto",
            "hover:bg-surface-2 hover:text-ink focus-visible:focus-ring focus-visible:outline-none",
            /* 평소에는 흐리다 — 상시 진한 작은 크롬이 카드마다 붙으면 화면이 시끄럽다.
               접혀 있을 때는 그것이 유일한 되돌리는 길이므로 항상 진하다. */
            ctx.collapsed
              ? "opacity-100"
              : "opacity-0 transition-opacity duration-100 group-hover/head:opacity-100 focus-visible:opacity-100",
          )}
        >
          <Chevron pointing={ctx.collapsed ? "down" : "up"} />
        </button>
      ) : null}
    </div>
  );
}

/* 접기 버튼을 **머리줄 밖에** 두어야 할 때. 브리프처럼 편집형 들머리를 갖는 패널은 일반
   머리줄을 원하지 않는데, 그렇다고 접을 길이 없으면 `collapseTo="strip"` 이 한쪽으로만
   동작한다(펼칠 수는 있는데 접을 수가 없다). 호출처가 원하는 자리에 이것을 놓는다. */
export function CardCollapse({ className, ...rest }: React.HTMLAttributes<HTMLButtonElement>) {
  const ctx = useContext(Ctx);
  if (!ctx?.collapsible) return null;
  return (
    <button
      data-slot="card-collapse"
      type="button"
      aria-expanded={!ctx.collapsed}
      aria-controls={ctx.contentId}
      onClick={ctx.toggle}
      title={`${ctx.collapsed ? "Expand" : "Collapse"} ${ctx.label}`}
      className={cn(
        "appearance-none border-0 bg-transparent p-0 font-inherit text-inherit",
        "grid size-6 shrink-0 cursor-pointer place-items-center rounded-control text-muted",
        "hover:bg-surface-2 hover:text-ink focus-visible:focus-ring focus-visible:outline-none",
        ctx.collapsed
          ? "opacity-100"
          : "opacity-0 transition-opacity duration-100 focus-visible:opacity-100 group-hover/card:opacity-100",
        className,
      )}
      {...rest}
    >
      <Chevron pointing={ctx.side === "left" ? "left" : "right"} />
    </button>
  );
}

/* 카드 안의 «웰» — 캔버스가 앉는 자리. 실측에서 카드 면(#ffffff)보다 한 단 들어간
   #f9fbfc 였고, 그 안에 흰 도면 시트가 다시 놓였다. 웰이 없으면 시트와 카드가 한 면으로
   붙어 «종이가 놓여 있다» 는 감각이 사라진다. */
export function CardWell({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-well"
      className={cn("relative min-h-0 flex-1 overflow-hidden rounded-b-card bg-surface-2", className)}
      {...rest}
    />
  );
}
