import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./Collapsible";
import * as stories from "./Collapsible.stories";

/* 공통 계약을 스토리 `Default` 로 — 탐침은 루트에 얹힌다. 축(variant)은 트리거 부품의 것이라 render-all 픽스처가 본다. */
describeComponentContract(stories, { slot: "collapsible" });

afterEach(cleanup);

function Draft({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  return (
    <Collapsible defaultOpen {...(onOpenChange ? { onOpenChange } : {})}>
      <CollapsibleTrigger>Notes</CollapsibleTrigger>
      <CollapsibleContent>
        <input aria-label="Note" defaultValue="" />
      </CollapsibleContent>
    </Collapsible>
  );
}

describe("Collapsible 동작", () => {
  it("트리거를 누르면 aria-expanded 와 본문의 data-state 가 함께 바뀐다", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Draft onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole("button", { name: "Notes" });
    const content = document.querySelector('[data-slot="collapsible-content"]')!;
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", content.id);
    await user.click(trigger);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(content).toHaveAttribute("data-state", "closed");
    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("접혀도 본문은 DOM 에 남아 초안이 보존되고, 접힌 동안 inert · aria-hidden 이다", async () => {
    const user = userEvent.setup();
    render(<Draft />);
    await user.type(screen.getByRole("textbox", { name: "Note" }), "Keep east side clear");
    await user.click(screen.getByRole("button", { name: "Notes" }));
    const content = document.querySelector('[data-slot="collapsible-content"]')!;
    expect(content).toHaveAttribute("aria-hidden", "true");
    expect(content).toHaveAttribute("inert");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Notes" }));
    expect(screen.getByRole("textbox", { name: "Note" })).toHaveValue("Keep east side clear");
    expect(content).not.toHaveAttribute("inert");
  });

  it("제어 모드에서 밖에서 접으면 본문 안의 포커스가 트리거로 돌아간다", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger>Notes</CollapsibleTrigger>
          <CollapsibleContent>
            <button type="button" onClick={() => setOpen(false)}>
              Done
            </button>
          </CollapsibleContent>
        </Collapsible>
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.getByRole("button", { name: "Notes" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Notes" })).toHaveAttribute("aria-expanded", "false");
  });

  it("variant 는 트리거에 data-variant 로 찍힌다 — 기본은 row, asChild 면 모양을 붙이지 않는다", () => {
    render(
      <>
        <Collapsible>
          <CollapsibleTrigger>Row</CollapsibleTrigger>
          <CollapsibleContent>Body</CollapsibleContent>
        </Collapsible>
        <Collapsible>
          <CollapsibleTrigger variant="inline">Inline</CollapsibleTrigger>
          <CollapsibleContent>Body</CollapsibleContent>
        </Collapsible>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <button type="button">Custom</button>
          </CollapsibleTrigger>
          <CollapsibleContent>Body</CollapsibleContent>
        </Collapsible>
      </>,
    );
    expect(screen.getByRole("button", { name: "Row" })).toHaveAttribute("data-variant", "row");
    expect(screen.getByRole("button", { name: "Inline" })).toHaveAttribute("data-variant", "inline");
    const custom = screen.getByRole("button", { name: "Custom" });
    expect(custom).not.toHaveAttribute("data-variant");
    expect(custom).toHaveAttribute("data-slot", "collapsible-trigger");
    expect(custom.querySelector("svg")).toBeNull();
  });
});
