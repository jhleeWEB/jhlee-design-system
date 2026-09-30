"use client";
import { createContext, useContext, useId, useMemo, useState } from "react";

import { cn } from "../cn";
import { Tooltip } from "../overlay/Tooltip";

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

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
  /** 위치. 오른쪽에 두면 테두리가 반대편에 선다. */
  side?: "left" | "right";
  label?: string;
}

export function Sidebar({
  className,
  collapsed = false,
  side = "left",
  label = "Main",
  children,
  ...rest
}: SidebarProps) {
  const id = useId();
  const ctx = useMemo(() => ({ collapsed, id }), [collapsed, id]);
  return (
    <Ctx.Provider value={ctx}>
      <nav
        data-slot="sidebar"
        data-collapsed={collapsed || undefined}
        aria-label={label}
        className={cn(
          "flex shrink-0 flex-col gap-2 bg-card p-3",
          "transition-[width] duration-base motion-reduce:transition-none",
          side === "left" ? "border-r border-border" : "border-l border-border",
          collapsed ? "w-rail items-center" : "w-[var(--panel-w)]",
          className,
        )}
        {...rest}
      >
        {children}
      </nav>
    </Ctx.Provider>
  );
}

export interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  /** 접혔을 때 툴팁 문구가 된다. */
  label: string;
  active?: boolean;
  /** 오른쪽에 붙는 숫자 — 항목 수 · 미해결 판정 수. 접히면 숨는다. */
  badge?: React.ReactNode;
  shortcut?: string;
}

export function SidebarItem({
  className,
  icon,
  label,
  active,
  badge,
  shortcut,
  ...rest
}: SidebarItemProps) {
  const { collapsed } = useContext(Ctx);
  const button = (
    <button
      type="button"
      data-slot="sidebar-item"
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      className={cn(
        "appearance-none border-0 bg-transparent p-0 font-inherit text-inherit cursor-pointer",
        "flex h-ctl-lg shrink-0 items-center gap-4 rounded-md border border-solid border-transparent",
        "text-control text-muted-foreground transition-colors duration-fast",
        "hover:bg-muted hover:text-foreground",
        /* 활성은 **채우지 않고 물들인다.** 참고 화면 실측이 그랬고, 이유가 있다 — 레일은
           상시 보이므로 채워진 액센트 칸이 화면에서 가장 무거운 것이 되어 주 동작 버튼과
           경쟁한다. 옅은 바탕 + 파란 아이콘이면 «여기 있다» 만 말한다. */
        "aria-[current=page]:border-transparent aria-[current=page]:bg-accent aria-[current=page]:text-primary",
        "focus-visible:focus-ring focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-45",
        "[&_svg]:size-8 [&_svg]:shrink-0",
        collapsed ? "w-ctl-lg justify-center p-0" : "w-full px-3",
        className,
      )}
      {...rest}
    >
      {icon}
      {collapsed ? null : (
        <>
          <span className="min-w-0 flex-1 truncate text-left">{label}</span>
          {badge ? <span className="shrink-0 font-mono text-micro opacity-70">{badge}</span> : null}
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

/* 구획. 접히면 제목 대신 구분선만 남는다 — 44px 폭에 대문자 라벨은 들어가지 않는다. */
export function SidebarGroup({
  label,
  className,
  children,
  ...rest
}: { label: string } & React.HTMLAttributes<HTMLDivElement>) {
  const { collapsed } = useContext(Ctx);
  return (
    <div data-slot="sidebar-group" className={cn("flex flex-col gap-1", className)} {...rest}>
      {collapsed ? (
        <hr aria-label={label} className="my-2 w-8 self-center border-0 border-t border-border" />
      ) : (
        <div className="px-3 pb-1 pt-3 font-mono text-micro uppercase tracking-caps text-muted-foreground">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

/* 접기/펴기 상태를 쓰는 쪽에서 들고 있기 위한 훅. URL·localStorage 에 붙이는 것은 앱의 결정이다. */
export function useSidebarCollapse(initial = false) {
  const [collapsed, setCollapsed] = useState(initial);
  return {
    collapsed,
    setCollapsed,
    toggle: () => setCollapsed(c => !c),
    /* 토글 버튼에 그대로 펴 넣는다. */
    triggerProps: {
      "aria-expanded": !collapsed,
      "aria-label": collapsed ? "Expand sidebar" : "Collapse sidebar",
      onClick: () => setCollapsed(c => !c),
    } as const,
  };
}
