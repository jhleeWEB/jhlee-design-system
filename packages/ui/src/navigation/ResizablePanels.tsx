"use client";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import { cn } from "../cn";
import {
  resizableHandleVariants,
  resizablePanelsVariants,
  resizablePanelVariants,
} from "./ResizablePanels.variants";

/* 크기를 끌어 바꾸는 패널 묶음 — 3.0.0 이 지운 3열 셸(#49)의 «검사 패널 폭» 을 사용자에게 돌려준다(#60).
 *
 * 외부 의존(react-resizable-panels)을 들이지 않고 작게 쓴다. 이유 셋:
 *  - 작업대의 패널은 «비율» 이 아니라 **px 폭**으로 산다(사이드바 300 · 인스펙터 340 — 토큰). 화면이 넓어져도 인스펙터가 같이 넓어지면
 *    늘어난 폭이 캔버스가 아니라 표로 간다. 남는 폭은 언제나 크기 없는 패널(캔버스, `flex-1`)이 가져간다.
 *  - 필요한 것은 손잡이 하나가 패널 하나를 조절하는 것뿐이다 — 다중 손잡이의 연쇄 재분배는 작업대에 없다.
 *  - 접근성 계약(WAI-ARIA Window Splitter: separator · aria-valuenow/min/max · aria-controls · 화살표/Home/End/Enter)을 이 파일에서 직접 지킨다.
 *
 * 손잡이는 `controls` 로 **자기가 조절하는 패널을 이름으로** 가리킨다(= `aria-controls`). 위치로 추측하지 않는다 — 패널이 손잡이 앞에 있으면
 * 손잡이를 오른쪽(아래)으로 옮길 때 커지고, 뒤에 있으면(오른쪽 인스펙터) 작아진다. 방향은 DOM 순서에서 그때그때 읽는다.
 *
 * 저장은 **선택**이다(usePanelLayout 과 같은 원칙). `storageKey` 를 주면 크기와 비제어 접힘이 localStorage 에 남는다. 다만 읽기는
 * 마운트 뒤 레이아웃 이펙트에서 한다 — 초기화 함수에서 읽으면 서버 HTML(기본값)과 첫 클라이언트 렌더(저장본)가 달라 하이드레이션이 어긋난다.
 * 제어 접힘(`collapsed` prop)은 저장하지 않는다 — 그 상태는 호출처(예: usePanelLayout 의 storageKey)가 든다. */

type Orientation = "horizontal" | "vertical";

interface PanelConfig {
  readonly minSize: number;
  readonly maxSize: number | undefined;
  readonly collapsible: boolean;
  readonly collapsedSize: number;
  readonly defaultSize: number | undefined;
  readonly defaultCollapsed: boolean;
  /** 제어 접힘 — undefined 면 묶음이 든다. */
  readonly collapsed: boolean | undefined;
}

interface Stored {
  sizes: Record<string, number>;
  collapsed: Record<string, boolean>;
}

interface GroupCtx {
  orientation: Orientation;
  stored: Stored;
  configs: Readonly<Record<string, PanelConfig>>;
  resizing: string | null;
  register: (id: string, config: PanelConfig, onCollapsedChange: ((v: boolean) => void) | undefined) => void;
  unregister: (id: string) => void;
  setSize: (id: string, size: number) => void;
  setCollapsed: (id: string, value: boolean) => void;
  setResizing: (id: string | null) => void;
}

const Ctx = createContext<GroupCtx | null>(null);

function useGroup(part: string): GroupCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`${part} must be rendered inside <ResizablePanels>`);
  return ctx;
}

function sameConfig(a: PanelConfig | undefined, b: PanelConfig): boolean {
  if (!a) return false;
  return (Object.keys(b) as (keyof PanelConfig)[]).every((k) => a[k] === b[k]);
}

const EMPTY: Stored = { sizes: {}, collapsed: {} };

/** 다른 탭이 같은 키를 고치면 따라간다(이 탭에서 아직 손대지 않았다면). */
function subscribeStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readRaw(storageKey: string | undefined): string | null {
  if (!storageKey) return null;
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function parseStored(raw: string | null): Stored {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as Partial<Stored>;
    const sizes: Record<string, number> = {};
    const collapsed: Record<string, boolean> = {};
    /* 저장본은 신뢰하지 않는다 — 다른 버전이 남긴 모양이거나 손으로 고친 값일 수 있다. 숫자·불리언만 받는다. */
    for (const [k, v] of Object.entries(parsed.sizes ?? {}))
      if (typeof v === "number" && Number.isFinite(v)) sizes[k] = v;
    for (const [k, v] of Object.entries(parsed.collapsed ?? {})) if (typeof v === "boolean") collapsed[k] = v;
    return { sizes, collapsed };
  } catch {
    return EMPTY;
  }
}

/** `ResizablePanels` 의 props — `<div>` 속성에 방향과 저장 키를 더한다. */
export interface ResizablePanelsProps extends ComponentProps<"div"> {
  /**
   * 패널이 늘어서는 방향 — `horizontal` — 좌우로 늘어서고 손잡이는 세로선(폭 조절) · `vertical` — 위아래로 쌓이고 손잡이는 가로선(높이 조절)
   * @default "horizontal"
   */
  orientation?: Orientation;
  /**
   * 저장 키 — 주면 패널 크기와 비제어 접힘이 localStorage 에 남는다. 스토리·테스트에서는 주지 않는다(결정적 렌더).
   * @default undefined
   */
  storageKey?: string;
}

/**
 * 크기를 끌어 바꾸는 패널 묶음. 크기가 정해진 패널(`defaultSize` 또는 끌어서 정한 크기)은 그 px 를 지키고, 크기 없는 패널(`flex-1`)이 남는 폭을 갖는다.
 * 패널 사이에 `ResizableHandle` 을 두고 `controls` 로 조절할 패널의 id 를 준다.
 */
export function ResizablePanels({
  className,
  orientation: orientationProp,
  storageKey,
  children,
  ...rest
}: ResizablePanelsProps) {
  const orientation = orientationProp ?? "horizontal";
  /* 저장본은 외부 저장소로 읽는다 — 서버 스냅숏(null)으로 하이드레이션한 뒤 클라이언트 값으로 다시 그리므로 서버 HTML 과 어긋나지 않는다.
     이 탭에서 한 번이라도 바꾸면(`local`) 그 뒤로는 local 이 이기고 저장본에 쓴다. */
  const raw = useSyncExternalStore(
    subscribeStorage,
    () => readRaw(storageKey),
    () => null,
  );
  const saved = useMemo(() => parseStored(raw), [raw]);
  const [local, setLocal] = useState<Stored | null>(null);
  const stored = local ?? saved;
  const [configs, setConfigs] = useState<Record<string, PanelConfig>>({});
  const [resizing, setResizing] = useState<string | null>(null);
  const callbacks = useRef(new Map<string, ((v: boolean) => void) | undefined>());
  const configsRef = useRef(configs);
  useLayoutEffect(() => {
    configsRef.current = configs;
  }, [configs]);

  const apply = useCallback(
    (update: (prev: Stored) => Stored) => {
      setLocal((prevLocal) => {
        const prev = prevLocal ?? saved;
        const next = update(prev);
        if (next === prev) return prevLocal;
        if (storageKey) {
          try {
            window.localStorage.setItem(storageKey, JSON.stringify(next));
          } catch {
            /* 저장에 실패해도 화면은 계속 동작한다. 패널 크기는 편의이지 데이터가 아니다. */
          }
        }
        return next;
      });
    },
    [storageKey, saved],
  );

  const register = useCallback<GroupCtx["register"]>((id, config, onCollapsedChange) => {
    callbacks.current.set(id, onCollapsedChange);
    setConfigs((prev) => (sameConfig(prev[id], config) ? prev : { ...prev, [id]: config }));
  }, []);
  const unregister = useCallback((id: string) => {
    callbacks.current.delete(id);
    setConfigs((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);
  const setSize = useCallback(
    (id: string, size: number) =>
      apply((prev) => (prev.sizes[id] === size ? prev : { ...prev, sizes: { ...prev.sizes, [id]: size } })),
    [apply],
  );
  const setCollapsed = useCallback(
    (id: string, value: boolean) => {
      /* 제어 패널은 상태를 호출처에 넘기기만 한다 — 같은 값을 두 곳이 들면 어긋난다(«상태는 한 곳에서 소유한다»). */
      if (configsRef.current[id]?.collapsed === undefined)
        apply((prev) =>
          prev.collapsed[id] === value ? prev : { ...prev, collapsed: { ...prev.collapsed, [id]: value } },
        );
      callbacks.current.get(id)?.(value);
    },
    [apply],
  );

  const ctx = useMemo<GroupCtx>(
    () => ({
      orientation,
      stored,
      configs,
      resizing,
      register,
      unregister,
      setSize,
      setCollapsed,
      setResizing,
    }),
    [orientation, stored, configs, resizing, register, unregister, setSize, setCollapsed],
  );

  return (
    <Ctx.Provider value={ctx}>
      <div
        className={cn(resizablePanelsVariants({ orientation }), className)}
        {...rest}
        data-slot="resizable-panels"
        data-orientation={orientationProp ?? "horizontal"}
        data-resizing={resizing === null ? undefined : ""}
      >
        {children}
      </div>
    </Ctx.Provider>
  );
}

/** `ResizablePanel` 의 props — `<div>` 속성에 크기·한계·접힘을 더한다. 크기는 전부 px 다. */
export interface ResizablePanelProps extends Omit<ComponentProps<"div">, "id"> {
  /** 패널 id — 손잡이의 `controls`(= `aria-controls`)와 저장본의 키가 이것을 가리킨다. 문서 안에서 유일해야 한다. */
  id: string;
  /**
   * 처음 크기(px). 없으면 인라인 크기를 쓰지 않고 `className` 이 정한다(`flex-1` 캔버스 · `w-(--size-inspector)` 같은 토큰 폭) — 끌기 시작하면 그때의 실측이 출발점이다.
   * @default undefined
   */
  defaultSize?: number;
  /**
   * 끌어서 줄일 수 있는 하한(px). Home 키가 이 크기로 보낸다.
   * @default 0
   */
  minSize?: number;
  /**
   * 끌어서 늘릴 수 있는 상한(px). 없으면 맞은편 이웃이 0 이 될 때까지다. End 키가 이 크기로 보낸다.
   * @default undefined
   */
  maxSize?: number;
  /**
   * 접을 수 있다 — 손잡이의 Enter · 더블클릭이 접고 펴며, 하한의 절반 아래로 끌면 접힌다.
   * @default false
   */
  collapsible?: boolean;
  /**
   * 접혔을 때 남는 크기(px). 0 이면 본문이 `inert` 가 된다(보이지 않는 것에 포커스가 가지 않게).
   * @default 0
   */
  collapsedSize?: number;
  /**
   * 접힘(제어). 주면 상태는 호출처가 든다 — `usePanelLayout` 의 `isCollapsed(id)` 를 그대로 넣는다.
   * @default undefined
   */
  collapsed?: boolean;
  /**
   * 처음 접힘(비제어).
   * @default false
   */
  defaultCollapsed?: boolean;
  /**
   * 접힘이 바뀌려 할 때 — 손잡이 Enter · 더블클릭 · 끌어 접기. 제어 모드면 여기서 상태를 바꾼다.
   * @default undefined
   */
  onCollapsedChange?: (collapsed: boolean) => void;
}

/** 묶음 안의 패널 한 칸. 접혀도 마운트를 유지한다(본문의 초안·스크롤·WebGL 수명을 지키려고) — 대신 `inert` 로 입력을 막는다. */
export function ResizablePanel({
  id,
  className,
  style,
  defaultSize,
  minSize = 0,
  maxSize,
  collapsible = false,
  collapsedSize = 0,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  children,
  ...rest
}: ResizablePanelProps) {
  const group = useGroup("ResizablePanel");
  const { register, unregister } = group;
  const config = useMemo<PanelConfig>(
    () => ({
      minSize,
      maxSize,
      collapsible,
      collapsedSize,
      defaultSize,
      defaultCollapsed,
      collapsed: collapsedProp,
    }),
    [minSize, maxSize, collapsible, collapsedSize, defaultSize, defaultCollapsed, collapsedProp],
  );
  useLayoutEffect(() => register(id, config, onCollapsedChange), [register, id, config, onCollapsedChange]);
  useLayoutEffect(() => () => unregister(id), [unregister, id]);

  const collapsed = collapsible && (collapsedProp ?? group.stored.collapsed[id] ?? defaultCollapsed);
  const size = collapsed ? collapsedSize : (group.stored.sizes[id] ?? defaultSize);
  const dimension = group.orientation === "horizontal" ? "width" : "height";
  const sized: CSSProperties | undefined = size === undefined ? undefined : { [dimension]: size };
  const hidden = collapsed && collapsedSize === 0;

  /* 밖에서(상단바 버튼 등) 접었는데 포커스가 패널 안에 있었다면 보이지 않는 곳에 남는다 — 이 패널을 가리키는 컨트롤(aria-controls)로 옮긴다.
     옛 3열 셸(AppShell)이 하던 일을 패널이 맡는다. */
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!hidden || !el || !el.contains(el.ownerDocument.activeElement)) return;
    const trigger = [...el.ownerDocument.querySelectorAll<HTMLElement>("[aria-controls]")].find(
      (c) => c.getAttribute("aria-controls") === id && !el.contains(c) && !c.closest("[inert]"),
    );
    trigger?.focus();
  }, [hidden, id]);

  return (
    <div
      ref={ref}
      id={id}
      className={cn(resizablePanelVariants(), className)}
      style={sized ? { ...style, ...sized } : style}
      inert={hidden}
      {...rest}
      data-slot="resizable-panel"
      data-state={collapsed ? "closed" : "open"}
      data-sized={size === undefined ? undefined : ""}
      data-resizing={group.resizing === id ? "" : undefined}
    >
      {children}
    </div>
  );
}

/** `ResizableHandle` 의 props — `<div>` 속성에 조절할 패널과 이름 · 키보드 보폭을 더한다. */
export interface ResizableHandleProps extends ComponentProps<"div"> {
  /** 이 손잡이가 조절하는 패널의 id(`aria-controls`). */
  controls: string;
  /**
   * 손잡이의 접근 가능한 이름(`aria-label`).
   * @default "Resize panel"
   */
  label?: string;
  /**
   * 화살표 한 번의 보폭(px). Shift 를 함께 누르면 네 배다.
   * @default 16
   */
  step?: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * 패널 사이의 손잡이 — `role="separator"`. 끌기 · 화살표(Shift 네 배) · Home(하한) · End(상한) · Enter/더블클릭(접기)로 `controls` 패널의 크기를 바꾼다.
 */
export function ResizableHandle({
  className,
  controls,
  label = "Resize panel",
  step = 16,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onDoubleClick,
  ...rest
}: ResizableHandleProps) {
  const group = useGroup("ResizableHandle");
  const { orientation, setSize, setCollapsed, setResizing } = group;
  const config = group.configs[controls];
  const horizontal = orientation === "horizontal";
  const self = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ pointerId: number; origin: number; start: number; sign: 1 | -1 } | null>(null);

  const collapsed =
    !!config?.collapsible &&
    (config.collapsed ?? group.stored.collapsed[controls] ?? config.defaultCollapsed);
  const explicit = group.stored.sizes[controls] ?? config?.defaultSize;

  /* 레이아웃이 정한 값을 읽어 둔다 — 크기를 정하지 않은 패널(className 폭)의 aria-valuenow 와, maxSize 가 없을 때의 aria-valuemax(패널 + 맞은편 이웃)다.
     레이아웃이 없는 환경(jsdom)에서는 둘 다 0 이라 상한을 싣지 않는다. */
  const [layout, setLayout] = useState<{ size: number; room: number }>({ size: 0, room: 0 });
  useLayoutEffect(() => {
    const handle = self.current;
    const panel = handle?.ownerDocument.getElementById(controls);
    if (!handle || !panel) return;
    const before = Boolean(handle.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_PRECEDING);
    const neighbour = before ? handle.nextElementSibling : handle.previousElementSibling;
    const main = (el: Element | null) => {
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      return Math.round(horizontal ? rect.width : rect.height);
    };
    const read = () =>
      setLayout((prev) => {
        const next = { size: main(panel), room: main(neighbour) };
        return prev.size === next.size && prev.room === next.room ? prev : next;
      });
    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(panel);
    if (neighbour) observer.observe(neighbour);
    return () => observer.disconnect();
  }, [controls, horizontal]);

  const minSize = config?.minSize ?? 0;
  const maxSize = config?.maxSize;
  const current = collapsed ? (config?.collapsedSize ?? 0) : (explicit ?? layout.size);
  // 패널과 이웃이 둘 다 0 이면 레이아웃이 없는 것이다(jsdom · display:none). 이웃만 0 이면 패널이 이미 상한에 닿은 것이다.
  const layoutMax = layout.size + layout.room > 0 ? layout.size + layout.room : undefined;
  const valueMax =
    maxSize === undefined ? layoutMax : layoutMax === undefined ? maxSize : Math.min(maxSize, layoutMax);

  /** 손잡이를 + 쪽(오른쪽 · 아래)으로 옮길 때 패널이 커지는가(+1) 작아지는가(-1) — 패널이 손잡이 앞에 있으면 커진다. */
  const geometry = () => {
    const handle = self.current;
    const panel = handle?.ownerDocument.getElementById(controls) ?? null;
    if (!handle || !panel) return null;
    const before = Boolean(handle.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_PRECEDING);
    const sign: 1 | -1 = before ? 1 : -1;
    const main = (el: Element | null) => {
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      return horizontal ? rect.width : rect.height;
    };
    /* 상한이 없으면 맞은편 이웃이 0 이 될 때까지다. 레이아웃이 없는 환경(jsdom · 숨은 탭)은 실측이 전부 0 이라 상한을 걸지 않는다. */
    const neighbour = before ? handle.nextElementSibling : handle.previousElementSibling;
    const room = main(neighbour);
    const start = collapsed ? (config?.collapsedSize ?? 0) : (explicit ?? main(panel));
    const cap = main(panel) + room > 0 ? start + room : Number.POSITIVE_INFINITY;
    return { sign, start, max: Math.min(maxSize ?? Number.POSITIVE_INFINITY, cap) };
  };

  const resizeTo = (raw: number, max: number) => {
    if (config?.collapsible && raw < minSize / 2) {
      if (!collapsed) setCollapsed(controls, true);
      return;
    }
    if (collapsed) setCollapsed(controls, false);
    setSize(controls, Math.round(clamp(raw, minSize, max)));
  };

  const toggle = () => {
    if (config?.collapsible) setCollapsed(controls, !collapsed);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const g = geometry();
    if (!g) return;
    const forward = horizontal ? "ArrowRight" : "ArrowDown";
    const backward = horizontal ? "ArrowLeft" : "ArrowUp";
    const delta = step * (event.shiftKey ? 4 : 1);
    if (event.key === forward || event.key === backward) {
      const grow = (event.key === forward ? 1 : -1) * g.sign > 0;
      event.preventDefault();
      /* 접힌 패널에서 키우는 쪽 화살표는 «편다» 다 — 접기 전 크기로 돌아간다. 줄이는 쪽은 할 일이 없다. */
      if (collapsed) {
        if (grow) setCollapsed(controls, false);
        return;
      }
      setSize(controls, Math.round(clamp(g.start + (grow ? delta : -delta), minSize, g.max)));
    } else if (event.key === "Home") {
      event.preventDefault();
      if (collapsed) setCollapsed(controls, false);
      setSize(controls, minSize);
    } else if (event.key === "End") {
      event.preventDefault();
      if (!Number.isFinite(g.max)) return;
      if (collapsed) setCollapsed(controls, false);
      setSize(controls, Math.round(g.max));
    } else if (event.key === "Enter") {
      event.preventDefault();
      toggle();
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (event.defaultPrevented || event.button !== 0) return;
    const g = geometry();
    if (!g) return;
    /* 끄는 동안 글자가 선택되거나 이미지가 끌려가지 않게 기본 동작을 막고, 포커스는 손잡이에 둔다(키보드로 이어서 조절할 수 있게). */
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      origin: horizontal ? event.clientX : event.clientY,
      start: g.start,
      sign: g.sign,
    };
    setResizing(controls);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    const d = drag.current;
    if (!d || d.pointerId !== event.pointerId) return;
    const g = geometry();
    const delta = (horizontal ? event.clientX : event.clientY) - d.origin;
    resizeTo(d.start + delta * d.sign, g?.max ?? maxSize ?? Number.POSITIVE_INFINITY);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== event.pointerId) return;
    drag.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setResizing(null);
  };

  return (
    <div
      ref={self}
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-controls={controls}
      aria-orientation={horizontal ? "vertical" : "horizontal"}
      aria-valuenow={Math.round(current)}
      aria-valuemin={config?.collapsible ? (config.collapsedSize ?? 0) : minSize}
      aria-valuemax={valueMax}
      className={cn(resizableHandleVariants({ orientation }), className)}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        endDrag(event);
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        endDrag(event);
      }}
      onDoubleClick={(event) => {
        onDoubleClick?.(event);
        if (!event.defaultPrevented) toggle();
      }}
      {...rest}
      data-slot="resizable-handle"
      data-orientation={horizontal ? "horizontal" : "vertical"}
      data-state={collapsed ? "closed" : "open"}
      data-resizing={group.resizing === controls ? "" : undefined}
    />
  );
}
