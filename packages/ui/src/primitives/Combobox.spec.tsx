import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { CommandEmpty } from "../overlay/Command";
import { Combobox, ComboboxContent, ComboboxItem, ComboboxTrigger } from "./Combobox";
import * as stories from "./Combobox.stories";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "./Field";

/* 공통 계약을 스토리 `Default` 로 — 탐침은 트리거에 얹힌다(D3, #44). 열린 상자는 모달이 아니라 aria-hidden-focus 면제가 없다. */
describeComponentContract(stories, { slot: "combobox-trigger", axes: ["size"] });

afterEach(cleanup);

const sheets = {
  "a-101": "Ground floor plan",
  "a-102": "Typical floor plan",
  "a-301": "Section A–A",
} as const;
type SheetId = keyof typeof sheets;

function Sheets({
  onValueChange,
  invalid,
  error,
}: {
  onValueChange?: (value: string) => void;
  invalid?: boolean;
  error?: string;
}) {
  const [value, setValue] = useState("");
  return (
    <Field invalid={invalid ?? false}>
      <FieldLabel>Sheet</FieldLabel>
      <Combobox
        value={value}
        onValueChange={(next) => {
          onValueChange?.(next);
          setValue(next);
        }}
      >
        <FieldControl>
          <ComboboxTrigger placeholder="Pick a sheet">{sheets[value as SheetId]}</ComboboxTrigger>
        </FieldControl>
        <ComboboxContent label="Sheets">
          <CommandEmpty>No sheet found.</CommandEmpty>
          {Object.entries(sheets).map(([id, label]) => (
            <ComboboxItem key={id} value={id} keywords={[id]} disabled={id === "a-102"}>
              {label}
            </ComboboxItem>
          ))}
        </ComboboxContent>
      </Combobox>
      <FieldDescription>Markup target.</FieldDescription>
      <FieldError>{error}</FieldError>
    </Field>
  );
}

const trigger = () => screen.getByRole("combobox", { name: "Sheet" });
const search = () => screen.getByRole("combobox", { name: "Sheets" });

describe("Combobox 동작", () => {
  it("Field 와 이어진다 — 라벨이 이름, 설명이 describedby, 값이 비면 자리표시", () => {
    render(<Sheets />);
    expect(trigger()).toHaveTextContent("Pick a sheet");
    expect(trigger()).toHaveAttribute("data-placeholder", "");
    expect(trigger()).toHaveAttribute("aria-describedby", screen.getByText("Markup target.").id);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveAttribute("data-size", "md");
  });

  it("열면 검색 입력에 포커스가 가고, 타이핑으로 거른 뒤 ↓ · Enter 로 고르면 닫히고 트리거로 돌아온다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Sheets onValueChange={onValueChange} />);
    await user.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(search()).toHaveFocus();
    await user.keyboard("plan");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Ground floor plan",
      "Typical floor plan",
    ]);
    // 비활성(Typical) 을 건너뛰어 강조는 Ground 에 머문다.
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("a-101");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger()).toHaveTextContent("Ground floor plan");
    expect(trigger()).not.toHaveAttribute("data-placeholder");
    expect(trigger()).toHaveFocus();
  });

  it("다시 열면 고른 항목이 강조되고 체크 표시가 선다 · 키워드(시트 번호)로도 찾는다", async () => {
    const user = userEvent.setup();
    render(<Sheets />);
    await user.click(trigger());
    await user.click(screen.getByRole("option", { name: "Section A–A" }));
    await user.click(trigger());
    const chosen = screen.getByRole("option", { name: "Section A–A" });
    expect(chosen).toHaveAttribute("data-checked", "");
    expect(search()).toHaveAttribute("aria-activedescendant", chosen.id);
    await user.keyboard("a-101");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Ground floor plan"]);
  });

  it("Escape 는 값을 바꾸지 않고 닫는다 · 맞는 항목이 없으면 빈 상태", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Sheets onValueChange={onValueChange} />);
    await user.click(trigger());
    await user.keyboard("zzz");
    expect(screen.getByText("No sheet found.")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger()).toHaveTextContent("Pick a sheet");
  });

  it("FieldError 가 있으면 트리거가 aria-invalid 가 된다 · invalid prop 은 data-invalid 를 단다", () => {
    render(<Sheets error="Pick a sheet to attach the markup." />);
    expect(trigger()).toHaveAttribute("aria-invalid", "true");
    cleanup();
    render(
      <Combobox>
        <ComboboxTrigger aria-label="Layer" invalid size="sm" />
      </Combobox>,
    );
    const layer = screen.getByRole("combobox", { name: "Layer" });
    expect(layer).toHaveAttribute("aria-invalid", "true");
    expect(layer).toHaveAttribute("data-invalid", "");
    expect(layer).toHaveAttribute("data-size", "sm");
  });
});
