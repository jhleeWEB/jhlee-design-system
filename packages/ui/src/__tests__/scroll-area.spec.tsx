import { createRef } from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollArea } from "../navigation/ScrollArea";

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });
const slot = (container: HTMLElement, name: string) =>
  container.querySelector<HTMLDivElement>(`[data-slot="scroll-area${name ? `-${name}` : ""}"]`)!;
const shown = (container: HTMLElement) => slot(container, "").getAttribute("data-scroll-active") === "true";
const captureDescriptors = new Map<string, PropertyDescriptor | undefined>();

beforeEach(() => {
  vi.useFakeTimers();
  class TestPointerEvent extends MouseEvent {
    readonly pointerId: number;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
    }
  }
  vi.stubGlobal("PointerEvent", TestPointerEvent);
  for (const method of ["setPointerCapture", "releasePointerCapture", "hasPointerCapture"]) {
    captureDescriptors.set(method, Object.getOwnPropertyDescriptor(HTMLElement.prototype, method));
    Object.defineProperty(HTMLElement.prototype, method, { configurable: true, value: vi.fn(() => false) });
  }
});
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  for (const [method, descriptor] of captureDescriptors) {
    if (descriptor) Object.defineProperty(HTMLElement.prototype, method, descriptor);
    else Reflect.deleteProperty(HTMLElement.prototype, method);
  }
  document.body.style.webkitUserSelect = "";
});

describe("활동 중에만 나타나는 오버레이 스크롤바", () => {
  it("호버만으로 나타나지 않고 마지막 스크롤의 정확히 500ms 뒤 숨기기 시작한다", () => {
    const { container } = render(
      <ScrollArea>
        <p>Content</p>
      </ScrollArea>,
    );
    fireEvent.pointerEnter(slot(container, ""));
    advance(1000);
    expect(shown(container)).toBe(false);
    fireEvent.scroll(slot(container, "viewport"));
    expect(shown(container)).toBe(true);
    advance(499);
    expect(shown(container)).toBe(true);
    advance(1);
    expect(shown(container)).toBe(false);
    fireEvent.pointerEnter(slot(container, "scrollbar"));
    expect(shown(container)).toBe(false);
  });

  it("추가 스크롤은 대기시간을 마지막 이벤트부터 다시 센다", () => {
    const { container } = render(
      <ScrollArea>
        <p>Content</p>
      </ScrollArea>,
    );
    const viewport = slot(container, "viewport");
    fireEvent.scroll(viewport);
    advance(400);
    fireEvent.scroll(viewport);
    advance(499);
    expect(shown(container)).toBe(true);
    advance(1);
    expect(shown(container)).toBe(false);
  });

  it("막대를 끌 때는 멈춰도 유지하고 바깥에서 놓은 뒤 500ms 후 사라진다", () => {
    const { container } = render(
      <ScrollArea>
        <p>Content</p>
      </ScrollArea>,
    );
    fireEvent.scroll(slot(container, "viewport"));
    fireEvent.pointerDown(slot(container, "scrollbar"), { button: 0, pointerId: 7 });
    advance(900);
    expect(shown(container)).toBe(true);
    fireEvent.pointerUp(window, { pointerId: 8 });
    advance(900);
    expect(shown(container)).toBe(true);
    fireEvent.pointerUp(window, { pointerId: 7 });
    advance(499);
    expect(shown(container)).toBe(true);
    advance(1);
    expect(shown(container)).toBe(false);
  });

  it("드래그 취소도 표시 잠금을 해제한다", () => {
    const { container } = render(
      <ScrollArea>
        <p>Content</p>
      </ScrollArea>,
    );
    fireEvent.pointerDown(slot(container, "scrollbar"), { button: 0, pointerId: 3 });
    fireEvent.pointerCancel(window, { pointerId: 3 });
    advance(500);
    expect(shown(container)).toBe(false);
  });

  it("실제 viewport ref와 onScroll을 전달하고 축 변경에도 같은 노드를 유지한다", () => {
    const viewportRef = createRef<HTMLDivElement>();
    const targets: EventTarget[] = [];
    const props = {
      viewportRef,
      viewportClassName: "viewport-owner",
      viewportProps: {
        className: "viewport-props",
        "aria-label": "Scrollable results",
        onScroll: (event: React.UIEvent<HTMLDivElement>) => {
          targets.push(event.currentTarget);
        },
      },
    };
    const { container, rerender, unmount } = render(
      <ScrollArea {...props} id="results">
        <p>Content</p>
      </ScrollArea>,
    );
    const viewport = slot(container, "viewport");
    expect(viewportRef.current).toBe(viewport);
    expect(viewport.getAttribute("aria-label")).toBe("Scrollable results");
    expect(viewport.classList.contains("viewport-owner")).toBe(true);
    expect(viewport.classList.contains("viewport-props")).toBe(true);
    fireEvent.scroll(viewport);
    expect(targets).toEqual([viewport]);
    expect(container.querySelectorAll('[data-slot="scroll-area-scrollbar"]')).toHaveLength(2);
    rerender(
      <ScrollArea {...props} orientation="horizontal">
        <p>Content</p>
      </ScrollArea>,
    );
    expect(viewportRef.current).toBe(viewport);
    expect(container.querySelectorAll('[data-orientation="vertical"]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-orientation="horizontal"]')).toHaveLength(1);
    unmount();
    expect(viewportRef.current).toBeNull();
  });

  it("언마운트하면 숨김 타이머와 바깥 드래그 리스너를 정리한다", () => {
    const scrolling = render(
      <ScrollArea>
        <p>Content</p>
      </ScrollArea>,
    );
    fireEvent.scroll(slot(scrolling.container, "viewport"));
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    scrolling.unmount();
    expect(vi.getTimerCount()).toBe(0);
    const dragging = render(
      <ScrollArea>
        <p>Content</p>
      </ScrollArea>,
    );
    fireEvent.pointerDown(slot(dragging.container, "scrollbar"), { button: 0, pointerId: 2 });
    dragging.unmount();
    expect(vi.getTimerCount()).toBe(0);
    fireEvent.pointerUp(window, { pointerId: 2 });
    expect(vi.getTimerCount()).toBe(0);
  });
});
