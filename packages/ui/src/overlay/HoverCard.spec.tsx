import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./HoverCard";
import * as stories from "./HoverCard.stories";

/* 공통 계약을 스토리 `Default` 로 — 탐침은 열린 상자에 얹힌다(D3, #44). */
describeComponentContract(stories, { slot: "hover-card" });

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function Sheet({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  return (
    <HoverCard openDelay={0} closeDelay={0} {...(onOpenChange ? { onOpenChange } : {})}>
      <HoverCardTrigger href="#a-101">A-101</HoverCardTrigger>
      <HoverCardContent>Ground floor plan</HoverCardContent>
    </HoverCard>
  );
}

describe("HoverCard 동작", () => {
  it("포인터를 올리면 열리고 떠나면 닫힌다", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Sheet onOpenChange={onOpenChange} />);
    expect(screen.queryByText("Ground floor plan")).not.toBeInTheDocument();
    await user.hover(screen.getByRole("link", { name: "A-101" }));
    expect(await screen.findByText("Ground floor plan")).toHaveAttribute("data-slot", "hover-card");
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await user.unhover(screen.getByRole("link", { name: "A-101" }));
    await vi.waitFor(() => expect(screen.queryByText("Ground floor plan")).not.toBeInTheDocument());
  });

  it("키보드 포커스로도 열리고 Escape 로 닫힌다", async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    await user.tab();
    expect(screen.getByRole("link", { name: "A-101" })).toHaveFocus();
    expect(await screen.findByText("Ground floor plan")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await vi.waitFor(() => expect(screen.queryByText("Ground floor plan")).not.toBeInTheDocument());
  });

  it("onCanvas 는 data-on-canvas 를, arrow 는 꼬리를 단다", async () => {
    render(
      <HoverCard open>
        <HoverCardTrigger href="#a">A</HoverCardTrigger>
        <HoverCardContent onCanvas arrow>
          Body
        </HoverCardContent>
      </HoverCard>,
    );
    await act(async () => {});
    const card = screen.getByText("Body");
    expect(card).toHaveAttribute("data-on-canvas", "");
    expect(card).toHaveClass("on-canvas");
    expect(card.querySelector("svg")).not.toBeNull();
  });
});
