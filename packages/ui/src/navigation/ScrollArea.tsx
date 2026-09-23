import { useCallback, useEffect, useRef, useState, type ComponentPropsWithoutRef, type ComponentPropsWithRef, type PointerEvent, type Ref } from "react";
import { ScrollArea as Radix } from "radix-ui";

import { cn } from "../cn";

// 뷰포트와 스크롤바의 고정 구조는 DS가 소유하므로 Root/Viewport의 asChild는 지원하지 않는다.
export interface ScrollAreaProps extends Omit<ComponentPropsWithRef<typeof Radix.Root>, "type" | "scrollHideDelay" | "asChild"> {
  viewportRef?: Ref<HTMLDivElement>;
  viewportClassName?: string;
  viewportProps?: Omit<ComponentPropsWithoutRef<typeof Radix.Viewport>, "asChild"> & { "data-slot"?: string };
  orientation?: "vertical" | "horizontal" | "both";
}

/* Radix의 type="scroll"은 종료 판정에 100ms를 더하므로 DS의 500ms 계약과 어긋난다.
 * 스크롤바는 항상 마운트하고 실제 스크롤·드래그 활동만 직접 재서 표시한다. */
export function ScrollArea({ className, children, viewportRef, viewportClassName, viewportProps, orientation = "both", ...rest }: ScrollAreaProps) {
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
    }, 500);
  }, [clearHide]);
  useEffect(() => () => {
    clearHide();
    detachDrag.current?.();
  }, [clearHide]);

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
    const end = (up: globalThis.PointerEvent) => { if (up.pointerId === dragPointer.current) finish(); };
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
    <Radix.Scrollbar key={axis} data-slot="scroll-area-scrollbar" orientation={axis} className="ds-scroll-area-scrollbar" onPointerDownCapture={beginDrag}>
      <Radix.Thumb data-slot="scroll-area-thumb" className="ds-scroll-area-thumb" />
    </Radix.Scrollbar>
  );
  return (
    <Radix.Root {...rest} data-slot="scroll-area" data-scroll-active={active ? "true" : "false"} type="always" className={cn("ds-scroll-area relative flex min-h-0 min-w-0 flex-col overflow-hidden", className)}>
      <Radix.Viewport
        data-slot="scroll-area-viewport"
        {...viewportRest}
        ref={viewportRef}
        className={cn("ds-scroll-area-viewport", viewportPropsClassName, viewportClassName)}
        onScroll={event => {
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
