import { Children, Fragment, cloneElement, createContext, isValidElement, useContext, useId, useLayoutEffect, useMemo, useRef } from "react";

import { cn, cva, type VariantProps } from "../cn";
import "./card-motion.css";

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
 *   2. **내용을 언마운트하지 않는다.** 같은 본문을 접고 입력만 잠근다. 언마운트하면 스크롤 위치와
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
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLButtonElement>(null);
  const stripScroll = useRef<{ top: number; left: number } | null>(null);
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

  const stripMode = collapsible && collapseTo === "strip";
  const headerCollapse = collapsible && collapseTo === "header";
  const collapsedRef = useRef(isCollapsed);
  useLayoutEffect(() => { collapsedRef.current = isCollapsed; }, [isCollapsed]);

  /* 고정 폭은 width로, 남는 폭을 나누는 카드는 flex-basis/grow로 보간한다.
     접힌 채 처음 마운트해도 원래 클래스·인라인 크기를 읽고, 측정 과정은 그리지 않는다. */
  useLayoutEffect(() => {
    const element = rootRef.current;
    if (!stripMode || !element) return;
    const transition = element.style.getPropertyValue("transition");
    const priority = element.style.getPropertyPriority("transition");
    element.style.setProperty("transition", "none", "important");
    element.dataset.cardMeasuring = "true";
    const computed = getComputedStyle(element);
    element.dataset.cardFlexible = Number(computed.flexGrow) > 0 || (computed.flexBasis !== "auto" && computed.flexBasis !== "") ? "true" : "false";
    const rememberWidth = () => {
      const style = getComputedStyle(element);
      const width = element.getBoundingClientRect().width
        - (parseFloat(style.borderLeftWidth) || 0) - (parseFloat(style.borderRightWidth) || 0)
        - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
      if (width > 0) element.style.setProperty("--card-content-width", `${width}px`);
    };
    rememberWidth();
    delete element.dataset.cardMeasuring;
    // 닫힌 초기 상태를 먼저 확정해야 첫 렌더가 펼침→접힘 애니메이션으로 보이지 않는다.
    element.getBoundingClientRect();
    if (transition) element.style.setProperty("transition", transition, priority);
    else element.style.removeProperty("transition");
    const observer = new ResizeObserver(() => {
      if (!collapsedRef.current) rememberWidth();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [stripMode, className, pad, style?.width, style?.minWidth, style?.maxWidth, style?.flex, style?.flexBasis, style?.flexGrow, style?.flexShrink]);

  useLayoutEffect(() => {
    const element = rootRef.current;
    if (!stripMode || !element) return;
    if (isCollapsed && stripScroll.current === null) {
      // 카드 자체가 스크롤되어 있어도 절대 위치 탭은 화면 밖으로 따라 올라가면 안 된다.
      stripScroll.current = { top: element.scrollTop, left: element.scrollLeft };
      element.scrollTop = 0;
      element.scrollLeft = 0;
    } else if (!isCollapsed && stripScroll.current) {
      element.scrollTop = stripScroll.current.top;
      element.scrollLeft = stripScroll.current.left;
      stripScroll.current = null;
    }
  }, [stripMode, isCollapsed]);

  useLayoutEffect(() => {
    const element = rootRef.current, content = contentRef.current;
    if (!collapsible || !element || !content) return;
    const active = document.activeElement;
    if (isCollapsed && active && content.contains(active)) {
      const trigger = stripMode ? stripRef.current : element.querySelector<HTMLButtonElement>('[data-slot="card-header"] [data-slot="card-collapse"]');
      (trigger ?? element).focus({ preventScroll: true });
    } else if (!isCollapsed && active === stripRef.current) {
      (content.querySelector<HTMLButtonElement>('[data-slot="card-collapse"]') ?? content).focus({ preventScroll: true });
    }
  }, [collapsible, isCollapsed, stripMode]);

  const childList = headerCollapse ? flattenCardChildren(children) : [];
  const isHeader = (child: React.ReactNode) => isValidElement(child) && child.type === CardHeader;
  /* 셰브론은 **누르면 일어날 일**을 가리킨다. 왼쪽에 붙은 패널을 펼치면 내용이 오른쪽으로
     자라므로 오른쪽을 가리킨다. */
  const pointing = side === "left" ? "right" : "left";

  return (
    <Ctx.Provider value={ctx}>
      <div
        ref={rootRef}
        data-slot="card"
        data-collapsed={isCollapsed || undefined}
        data-collapse-to={collapsible ? collapseTo : undefined}
        tabIndex={collapsible ? -1 : undefined}
        className={cn("group/card", cardVariants({ elevation, pad }), className)}
        style={style}
        {...rest}
      >
        {stripMode ? (
          <>
            <button
              ref={stripRef}
              data-slot="card-collapse"
              data-card-strip=""
              type="button"
              aria-expanded={!isCollapsed}
              aria-hidden={!isCollapsed || undefined}
              inert={!isCollapsed || undefined}
              tabIndex={isCollapsed ? 0 : -1}
              aria-controls={contentId}
              onClick={ctx.toggle}
              title={`Expand ${ctx.label}`}
              className={cn(
                "appearance-none border-0 bg-transparent p-0 font-inherit text-inherit",
                "ds-card-strip flex cursor-pointer flex-col items-center gap-2 py-2.5",
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
            <div ref={contentRef} id={contentId} data-slot="card-content" className="ds-card-strip-content" aria-hidden={isCollapsed || undefined} inert={isCollapsed || undefined} tabIndex={-1}>
              {children}
            </div>
          </>
        ) : headerCollapse ? (
          <>
            {childList.filter(isHeader)}
            {/* grid의 한 행을 줄여 내용 높이를 보간한다. 본문과 그 자식의 DOM 위치는 변하지 않는다. */}
            <div ref={contentRef} id={contentId} data-slot="card-content" className="ds-card-header-content" aria-hidden={isCollapsed || undefined} inert={isCollapsed || undefined} tabIndex={-1}>
              <div className="ds-card-header-inner">{childList.filter(child => !isHeader(child))}</div>
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
