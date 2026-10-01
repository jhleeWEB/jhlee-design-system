import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { DatePicker } from "./DatePicker";
import * as stories from "./DatePicker.stories";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "./Field";

/* 공통 계약(slot · slot-locked · className · ref · rest · axes · axe)을 스토리 `Default`(열린 팝오버)로 — 탐침은 트리거에 얹힌다. */
describeComponentContract(stories, { slot: "date-picker", axes: ["size"] });

afterEach(cleanup);

const TODAY = new Date(2026, 9, 1);

describe("DatePicker 동작", () => {
  it("키보드로 열면 초점이 고른 날로 가고, 화살표로 옮겨 Enter 로 고르면 닫히며 트리거로 돌아온다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        aria-label="Start date"
        today={TODAY}
        defaultValue={new Date(2026, 9, 14)}
        onValueChange={onValueChange}
      />,
    );
    const trigger = screen.getByRole("combobox", { name: "Start date" });
    expect(trigger).toHaveTextContent("2026-10-14");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    trigger.focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("dialog", { name: "Choose date" });
    expect(screen.getByRole("button", { name: "Wednesday, October 14, 2026" })).toHaveFocus();

    await user.keyboard("{ArrowRight}{ArrowRight}{Enter}");
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 16));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveTextContent("2026-10-16");
    expect(trigger).toHaveFocus();
  });

  it("Escape 는 값을 바꾸지 않고 닫는다 · 값이 없으면 자리표시와 오늘 칸", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DatePicker aria-label="Start date" today={TODAY} onValueChange={onValueChange} />);
    const trigger = screen.getByRole("combobox", { name: "Start date" });
    expect(trigger).toHaveTextContent("Pick a date");
    expect(trigger).toHaveAttribute("data-placeholder", "");

    await user.click(trigger);
    expect(screen.getByRole("button", { name: "Thursday, October 1, 2026" })).toHaveFocus();
    await user.keyboard("{ArrowDown}{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger).toHaveTextContent("Pick a date");
  });

  it("Field 와 잇는다 — 라벨이 이름, 설명 · 오류가 aria-describedby, 오류가 aria-invalid", () => {
    render(
      <Field>
        <FieldLabel>Handover</FieldLabel>
        <FieldControl>
          <DatePicker today={TODAY} />
        </FieldControl>
        <FieldDescription>Last day on site.</FieldDescription>
        <FieldError>Pick a handover date.</FieldError>
      </Field>,
    );
    const trigger = screen.getByRole("combobox", { name: "Handover" });
    expect(trigger).toHaveAccessibleDescription("Last day on site. Pick a handover date.");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
  });

  it("비활성 필드에서는 열리지 않는다", async () => {
    const user = userEvent.setup();
    render(
      <Field disabled>
        <FieldLabel>Handover</FieldLabel>
        <FieldControl>
          <DatePicker today={TODAY} />
        </FieldControl>
      </Field>,
    );
    const trigger = screen.getByRole("combobox", { name: "Handover" });
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
