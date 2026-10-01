import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import * as stories from "./Select.stories";

/* 공통 계약(slot · slot-locked · className · ref · rest · axes · axe)을 스토리 `Default` 로 — 탐침은 트리거에 얹힌다(D3, #44).
 * aria-hidden-focus: 열린 Select 는 바깥을 aria-hidden 으로 가리는데 트리거는 초점을 받을 수 있는 button 이다 — 이유는 Select.stories 머리 주석. */
describeComponentContract(stories, { slot: "select-trigger", axes: ["size"], axeOff: ["aria-hidden-focus"] });

afterEach(cleanup);

function Views({ onValueChange }: { onValueChange?: (value: string) => void }) {
  return (
    <Select defaultValue="plan" {...(onValueChange ? { onValueChange } : {})}>
      <SelectTrigger aria-label="View">
        <SelectValue placeholder="Pick a view" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="plan">Plan</SelectItem>
        <SelectItem value="section" disabled>
          Section
        </SelectItem>
        <SelectItem value="model">Model</SelectItem>
      </SelectContent>
    </Select>
  );
}

describe("Select 동작", () => {
  it("키보드로 열고 화살표로 옮겨 Enter 로 고른다 — 비활성 항목은 건너뛴다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Views onValueChange={onValueChange} />);
    const trigger = screen.getByRole("combobox", { name: "View" });
    expect(trigger).toHaveTextContent("Plan");

    trigger.focus();
    await user.keyboard("{Enter}");
    const listbox = await screen.findByRole("listbox");
    expect(listbox).toHaveAttribute("data-slot", "select-content");
    expect(screen.getByRole("option", { name: "Plan" })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "Model" })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("model");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveTextContent("Model");
    expect(trigger).toHaveFocus();
  });

  it("Escape 는 값을 바꾸지 않고 닫는다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Views onValueChange={onValueChange} />);
    const trigger = screen.getByRole("combobox", { name: "View" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    await screen.findByRole("listbox");
    await user.keyboard("{ArrowDown}{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger).toHaveTextContent("Plan");
  });

  it("값이 없으면 자리표시를 보이고 트리거에 data-placeholder 를 단다", () => {
    render(
      <Select>
        <SelectTrigger aria-label="View">
          <SelectValue placeholder="Pick a view" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="plan">Plan</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole("combobox", { name: "View" });
    expect(trigger).toHaveTextContent("Pick a view");
    expect(trigger).toHaveAttribute("data-placeholder");
  });

  it("invalid 는 aria-invalid · data-invalid 를 달고 size 는 data-size 로 찍힌다", () => {
    render(
      <Select>
        <SelectTrigger aria-label="View" invalid size="sm">
          <SelectValue />
        </SelectTrigger>
      </Select>,
    );
    const trigger = screen.getByRole("combobox", { name: "View" });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("data-invalid", "");
    expect(trigger).toHaveAttribute("data-size", "sm");
  });
});
