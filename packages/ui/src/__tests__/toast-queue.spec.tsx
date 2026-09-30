import type { ComponentProps } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "../feedback/Toast";

/* Radix의 퇴장 presence를 유지해, DOM에서 사라진 뒤에도 앱 큐에 남는 누수를 검증한다. */
vi.mock("radix-ui", async (importOriginal) => {
  const original = await importOriginal<typeof import("radix-ui")>();
  return {
    ...original,
    Toast: {
      ...original.Toast,
      Root: (props: ComponentProps<typeof original.Toast.Root>) => (
        <original.Toast.Root {...props} forceMount />
      ),
    },
  };
});

function Controls() {
  const { toast, dismiss } = useToast();
  return (
    <>
      <button onClick={() => toast({ title: "First", duration: 0 })}>First notification</button>
      <button onClick={() => toast({ title: "Second", duration: 0 })}>Second notification</button>
      <button onClick={() => dismiss(1)}>Dismiss first</button>
    </>
  );
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Toast 큐 수명", () => {
  it("명시적 dismiss도 퇴장 뒤 큐에서 제거한다", () => {
    render(
      <ToastProvider>
        <Controls />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "First notification" }));
    fireEvent.click(screen.getByRole("button", { name: "Dismiss first" }));
    expect(document.querySelector('[data-slot="toast"]')?.getAttribute("data-state")).toBe("closed");
    act(() => vi.advanceTimersByTime(241));
    expect(document.querySelector('[data-slot="toast"]')).toBeNull();
  });

  it("한도를 넘긴 오래된 알림만 제거하고 무기한 알림을 유지한다", () => {
    render(
      <ToastProvider limit={1}>
        <Controls />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "First notification" }));
    fireEvent.click(screen.getByRole("button", { name: "Second notification" }));
    act(() => vi.advanceTimersByTime(10_000));
    const toasts = document.querySelectorAll('[data-slot="toast"]');
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.textContent).toContain("Second");
    expect(toasts[0]?.getAttribute("data-state")).toBe("open");
  });
});
