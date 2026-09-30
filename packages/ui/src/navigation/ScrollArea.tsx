"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  type PointerEvent,
  type Ref,
} from "react";
import { ScrollArea as Radix } from "radix-ui";

import { cn } from "../cn";
import { MOTION } from "../generated/tokens";

// 뷰포트와 스크롤바의 고정 구조는 DS가 소유하므로 Root/Viewport의 asChild는 지원하지 않는다.
/** `ScrollArea` 의 props — Radix Root 속성(ref 는 뿌리에 닿는다)에 뷰포트 손잡이와 스크롤 방향을 더한다. */
export interface ScrollAreaProps extends Omit<
  ComponentPropsWithRef<typeof Radix.Root>,
  "type" | "scrollHideDelay" | "asChild"
> {
  /**
   * 실제로 스크롤되는 뷰포트 요소의 ref — 스크롤 위치를 읽거나 옮길 때.
   * @default undefined
   */
  viewportRef?: Ref<HTMLDivElement>;
  /**
   * 뷰포트에 더할 className — 안쪽 패딩·높이 제한은 뿌리가 아니라 여기에 둔다.
   * @default undefined
   */
  viewportClassName?: string;
  /**
   * 뷰포트에 펼칠 나머지 속성(`onScroll` 은 표시 타이머와 합성된다).
   * @default undefined
   */
  viewportProps?: Omit<ComponentPropsWithoutRef<typeof Radix.Viewport>, "asChild"> & {
    /** 뷰포트의 data-slot — 소비자가 자기 이름을 붙일 때. */
    "data-slot"?: string;
  };
  /**
   * 스크롤바를 달 방향 — `vertical` — 세로만 · `horizontal` — 가로만 · `both` — 둘 다
   * @default "both"
   */
  orientation?: "vertical" | "horizontal" | "both";
}

/**
 * 스크롤 영역 — 스크롤하거나 막대를 끄는 동안만 얇은 스크롤바가 보인다.
 *
 * Radix의 type="scroll"은 종료 판정에 100ms를 더하므로 DS의 500ms 계약과 어긋난다.
 * 스크롤바는 항상 마운트하고 실제 스크롤·드래그 활동만 직접 재서 표시한다.
 */
export function ScrollArea({
  className,
  children,
  viewportRef,
  viewportClassName,
  viewportProps,
  orientation = "both",
  ...rest
}: ScrollAreaProps) {
  const [active, setActive] = useState(false);
  const hideTimer = useRef<number | null>(null);
  const dragPointer = useRef<number | null>(null);
  const detachDrag = useRef<(() => void) | null>(null);
  const clearHide = useCallback(() => {
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    hideTimer.current = null;
  }, []);
  const scheduleHide = useCallback(() => {
    clearHide();
    if (dragPointer.current !== null) return;
    hideTimer.current = window.setTimeout(() => {
      hideTimer.current = null;
      setActive(false);
    }, MOTION.scrollHideDelayMs);
  }, [clearHide]);
  useEffect(
    () => () => {
      clearHide();
      detachDrag.current?.();
    },
    [clearHide],
  );

  const beginDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    detachDrag.current?.();
    clearHide();
    dragPointer.current = event.pointerId;
    setActive(true);
    const finish = () => {
      detachDrag.current?.();
      detachDrag.current = null;
      dragPointer.current = null;
      scheduleHide();
    };
    const end = (up: globalThis.PointerEvent) => {
      if (up.pointerId === dragPointer.current) finish();
    };
    // 포인터 캡처가 바깥으로 이동하거나 브라우저가 드래그를 취소해도 표시 상태를 회수한다.
    window.addEventListener("pointerup", end, true);
    window.addEventListener("pointercancel", end, true);
    window.addEventListener("blur", finish);
    detachDrag.current = () => {
      window.removeEventListener("pointerup", end, true);
      window.removeEventListener("pointercancel", end, true);
      window.removeEventListener("blur", finish);
    };
  };
  const { className: viewportPropsClassName, onScroll, ...viewportRest } = viewportProps ?? {};
  const scrollbar = (axis: "vertical" | "horizontal") => (
    <Radix.Scrollbar
      key={axis}
      data-slot="scroll-area-scrollbar"
      orientation={axis}
      className="ds-scroll-area-scrollbar"
      onPointerDownCapture={beginDrag}
    >
      <Radix.Thumb data-slot="scroll-area-thumb" className="ds-scroll-area-thumb" />
    </Radix.Scrollbar>
  );
  return (
    <Radix.Root
      {...rest}
      data-slot="scroll-area"
      data-scroll-active={active ? "true" : "false"}
      type="always"
      className={cn("ds-scroll-area relative flex min-h-0 min-w-0 flex-col overflow-hidden", className)}
    >
      <Radix.Viewport
        data-slot="scroll-area-viewport"
        {...viewportRest}
        ref={viewportRef}
        className={cn("ds-scroll-area-viewport", viewportPropsClassName, viewportClassName)}
        onScroll={(event) => {
          setActive(true);
          scheduleHide();
          onScroll?.(event);
        }}
      >
        {children}
      </Radix.Viewport>
      {orientation !== "horizontal" ? scrollbar("vertical") : null}
      {orientation !== "vertical" ? scrollbar("horizontal") : null}
    </Radix.Root>
  );
}
