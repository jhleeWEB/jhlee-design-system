"use client";
import {
  createContext,
  useContext,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";

import { cn } from "../cn";
import { Tooltip } from "../overlay/Tooltip";
import { sidebarVariants } from "./Sidebar.variants";

/* 사이드바 — 두 모습을 한 컴포넌트가 갖는다.
 *   rail(접힘)   아이콘만. 캔버스에 폭을 돌려준다 — 도면 툴의 기본 상태다
 *   panel(펼침)  아이콘 + 라벨
 *
 * 접힌 상태에서 라벨이 사라지므로 **툴팁이 선택이 아니라 필수**다. `SidebarItem` 이
 * 접힘을 알고 스스로 툴팁을 단다 — 호출처에 맡기면 접었을 때 이름 없는 아이콘이 남는다. */

interface SidebarCtx {
  collapsed: boolean;
  id: string;
}
const Ctx = createContext<SidebarCtx>({ collapsed: false, id: "sidebar" });

/** `Sidebar` 의 props — `<nav>` 속성에 접힘·위치·이름을 더한다. */
export interface SidebarProps extends ComponentProps<"nav"> {
  /**
   * 접힘(rail) — 아이콘만 남고 항목마다 툴팁이 붙는다. 상태는 호출처가 든다(`useSidebarCollapse`).
   * @default false
   */
  collapsed?: boolean;
  /**
   * 위치. 오른쪽에 두면 테두리가 반대편에 선다 — `left` — 오른쪽 테두리 · `right` — 왼쪽 테두리
   * @default "left"
   */
  side?: "left" | "right";
  /**
   * 내비게이션 랜드마크의 이름(`aria-label`).
   * @default "Main"
   */
  label?: string;
}

/** 사이드바 — 접힌 rail(아이콘)과 펼친 panel(아이콘 + 라벨) 두 모습을 갖는 내비게이션 랜드마크. */
export function Sidebar({
  className,
  collapsed = false,
  side,
  label = "Main",
  children,
  ...rest
}: SidebarProps) {
  const id = useId();
  const ctx = useMemo(() => ({ collapsed, id }), [collapsed, id]);
  return (
    <Ctx.Provider value={ctx}>
      <nav
        data-collapsed={collapsed || undefined}
        aria-label={label}
        className={cn(
          sidebarVariants({ side }),
          collapsed ? "w-rail items-center" : "w-(--size-panel)",
          className,
        )}
        {...rest}
        data-slot="sidebar"
        data-side={side ?? "left"}
      >
        {children}
      </nav>
    </Ctx.Provider>
  );
}

/** `SidebarItem` 의 props — `<button>` 속성에 아이콘·라벨·활성·배지를 더한다. */
export interface SidebarItemProps extends ComponentProps<"button"> {
  /** 항목의 아이콘 — 접혀도 남는 유일한 표시다. */
  icon: ReactNode;
  /** 접혔을 때 툴팁 문구가 된다. */
  label: string;
  /**
   * 지금 있는 곳 — `aria-current="page"` 로 옅게 물든다.
   * @default false
   */
  active?: boolean;
  /**
   * 오른쪽에 붙는 숫자 — 항목 수 · 미해결 판정 수. 접히면 숨는다.
   * @default undefined
   */
  badge?: ReactNode;
  /**
   * 접힌 툴팁에 함께 보일 단축키.
   * @default undefined
   */
  shortcut?: string;
}

/** 사이드바 항목 — 접히면 스스로 툴팁을 단다(이름 없는 아이콘이 남지 않게). */
export function SidebarItem({ className, icon, label, active, badge, shortcut, ...rest }: SidebarItemProps) {
  const { collapsed } = useContext(Ctx);
  const button = (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      className={cn(
        "cursor-pointer appearance-none border-0 bg-transparent p-0 text-inherit",
        "flex h-ctl-lg shrink-0 items-center gap-4 rounded-md border border-solid border-transparent",
        "text-control text-muted-foreground transition-colors duration-fast",
        "hover:bg-muted hover:text-foreground",
        /* 활성은 **채우지 않고 물들인다.** 참고 화면 실측이 그랬고, 이유가 있다 — 레일은
           상시 보이므로 채워진 액센트 칸이 화면에서 가장 무거운 것이 되어 주 동작 버튼과
           경쟁한다. 옅은 바탕 + 파란 아이콘이면 «여기 있다» 만 말한다. */
        "aria-[current=page]:border-transparent aria-[current=page]:bg-accent aria-[current=page]:text-primary",
        "focus-visible:focus-ring focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-45",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        collapsed ? "w-ctl-lg justify-center p-0" : "w-full px-3",
        className,
      )}
      {...rest}
      data-slot="sidebar-item"
    >
      {icon}
      {collapsed ? null : (
        <>
          <span className="min-w-0 flex-1 truncate text-left">{label}</span>
          {badge ? (
            <span className="shrink-0 font-mono text-micro text-muted-foreground">{badge}</span>
          ) : null}
        </>
      )}
    </button>
  );
  if (!collapsed) return button;
  return (
    <Tooltip label={label} side="right" {...(shortcut === undefined ? {} : { shortcut })}>
      {button}
    </Tooltip>
  );
}

/** `SidebarGroup` 의 props — `<div>` 속성에 구획 제목을 더한다. */
export interface SidebarGroupProps extends ComponentProps<"div"> {
  /** 구획 제목 — 접히면 구분선의 `aria-label` 로 남는다. */
  label: string;
}

/** 구획. 접히면 제목 대신 구분선만 남는다 — 44px 폭에 대문자 라벨은 들어가지 않는다. */
export function SidebarGroup({ label, className, children, ...rest }: SidebarGroupProps) {
  const { collapsed } = useContext(Ctx);
  return (
    <div className={cn("flex flex-col gap-1", className)} {...rest} data-slot="sidebar-group">
      {collapsed ? (
        <hr aria-label={label} className="my-2 w-8 self-center border-0 border-t border-border" />
      ) : (
        <div className="px-3 pt-3 pb-1 font-mono text-micro tracking-caps text-muted-foreground uppercase">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

/** 접기/펴기 상태를 쓰는 쪽에서 들고 있기 위한 훅. URL·localStorage 에 붙이는 것은 앱의 결정이다. */
export function useSidebarCollapse(initial = false) {
  const [collapsed, setCollapsed] = useState(initial);
  return {
    collapsed,
    setCollapsed,
    toggle: () => setCollapsed((c) => !c),
    /* 토글 버튼에 그대로 펴 넣는다. */
    triggerProps: {
      "aria-expanded": !collapsed,
      "aria-label": collapsed ? "Expand sidebar" : "Collapse sidebar",
      onClick: () => setCollapsed((c) => !c),
    } as const,
  };
}
