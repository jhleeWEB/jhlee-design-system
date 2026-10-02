import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { MOTION } from "../generated/tokens";
import { ToastProvider, useToast, type ToastOptions } from "./Toast";
import * as stories from "./Toast.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 유일한 픽스처다. 실패 0 이 계약이다(#43). */
describeComponentContract(stories, { slot: "toast-viewport", axes: ["position", "tone"] });

/** 버튼 하나로 알림 하나를 띄운다. */
function Fire({ options }: { options: ToastOptions }) {
  const { toast } = useToast();
  return <button onClick={() => toast(options)}>Fire</button>;
}

function show(options: ToastOptions, providerDuration?: number) {
  render(
    <ToastProvider {...(providerDuration === undefined ? {} : { duration: providerDuration })}>
      <Fire options={options} />
    </ToastProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Fire" }));
  const toast = document.querySelector<HTMLElement>('[data-slot="toast"]');
  if (!toast) throw new Error("toast not rendered");
  return toast;
}

const progressOf = (toast: HTMLElement) => toast.querySelector<HTMLElement>('[data-slot="toast-progress"]');

afterEach(cleanup);

describe("Toast 진행 막대(#76)", () => {
  it("시간이 없으면 Provider 의 기본 시간으로 줄어든다", () => {
    const bar = progressOf(show({ title: "Saved" }));
    expect(bar).not.toBeNull();
    expect(bar?.style.animationDuration).toBe(`${MOTION.toastDefaultMs}ms`);
    expect(bar).toHaveAttribute("aria-hidden", "true");
  });

  it("알림의 duration 이 Provider 기본값을 이긴다", () => {
    expect(progressOf(show({ title: "Saved", duration: 9000 }, 3000))?.style.animationDuration).toBe(
      "9000ms",
    );
  });

  it("duration 0(닫을 때까지 남는다)이면 막대가 없다 — 알림 쪽이든 Provider 쪽이든", () => {
    expect(progressOf(show({ title: "Failed", duration: 0 }))).toBeNull();
    cleanup();
    expect(progressOf(show({ title: "Failed" }, 0))).toBeNull();
  });

  it("Radix 가 타이머를 멈추면(뷰포트에 포커스) 막대도 멈추고, 포커스가 나가면 다시 간다", () => {
    const toast = show({ title: "Saved", duration: 6000 });
    expect(toast).not.toHaveAttribute("data-paused");
    const close = screen.getByRole("button", { name: "Dismiss" });
    act(() => close.focus());
    expect(toast).toHaveAttribute("data-paused");
    act(() => close.blur());
    expect(toast).not.toHaveAttribute("data-paused");
  });
});

describe("Toast 톤 표시(#76)", () => {
  it.each([
    ["success", true],
    ["warning", true],
    ["destructive", true],
    ["neutral", false],
  ] as const)("%s — 톤 아이콘 %s", (tone, hasIcon) => {
    const toast = show({ title: "Notice", tone, duration: 0 });
    expect(toast).toHaveAttribute("data-tone", tone);
    expect(toast.querySelector('[data-slot="toast-icon"]') !== null).toBe(hasIcon);
    /* 아이콘은 장식이다 — 판정은 제목 글자가 말한다. */
    if (hasIcon)
      expect(toast.querySelector('[data-slot="toast-icon"]')).toHaveAttribute("aria-hidden", "true");
  });

  it("왼쪽 띠가 없다 — 판정 톤은 면 · 테두리 · 글자를 함께 물들인다", () => {
    const toast = show({ title: "Saved", tone: "success", duration: 0 });
    expect(toast.className).not.toMatch(/border-l-/);
    expect(toast.className).toMatch(/bg-success-soft/);
    expect(toast.className).toMatch(/text-success/);
  });
});
