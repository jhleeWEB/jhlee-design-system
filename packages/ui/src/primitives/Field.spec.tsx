import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { Checkbox } from "./Choice";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "./Field";
import * as stories from "./Field.stories";
import { Input } from "./Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";

/* 공통 계약을 스토리 `Default` 로 — 탐침은 필드 뿌리에 얹힌다(D3, #44). */
describeComponentContract(stories, { slot: "field", axes: ["orientation"] });

afterEach(cleanup);

describe("Field 의 id 연결", () => {
  it("라벨이 컨트롤의 이름이 되고, 라벨을 누르면 컨트롤로 간다", async () => {
    const user = userEvent.setup();
    render(
      <Field>
        <FieldLabel>Site name</FieldLabel>
        <FieldControl>
          <Input />
        </FieldControl>
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Site name" });
    expect(input).not.toHaveAttribute("aria-describedby");
    await user.click(screen.getByText("Site name"));
    expect(input).toHaveFocus();
  });

  it("aria-describedby 는 그려진 설명 · 오류만 가리키고, 오류가 있으면 aria-invalid 가 선다", async () => {
    const user = userEvent.setup();
    function Form() {
      const [error, setError] = useState<string | null>(null);
      return (
        <>
          <Field>
            <FieldLabel>Setback</FieldLabel>
            <FieldControl aria-describedby="unit-note">
              <Input />
            </FieldControl>
            <FieldDescription>Distance from the boundary.</FieldDescription>
            <FieldError>{error}</FieldError>
          </Field>
          <p id="unit-note">Metres.</p>
          <button type="button" onClick={() => setError(error ? null : "Must be at least 3 m.")}>
            Toggle error
          </button>
        </>
      );
    }
    render(<Form />);
    const input = screen.getByRole("textbox", { name: "Setback" });
    const description = screen.getByText("Distance from the boundary.");
    expect(input).toHaveAttribute("aria-describedby", `${description.id} unit-note`);
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).toHaveAccessibleDescription("Distance from the boundary. Metres.");

    await user.click(screen.getByRole("button", { name: "Toggle error" }));
    const error = screen.getByText("Must be at least 3 m.");
    expect(error).toHaveAttribute("data-slot", "field-error");
    expect(input).toHaveAttribute("aria-describedby", `${description.id} ${error.id} unit-note`);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Setback").closest("[data-slot=field]")).toHaveAttribute("data-invalid", "");

    await user.click(screen.getByRole("button", { name: "Toggle error" }));
    expect(screen.queryByText("Must be at least 3 m.")).not.toBeInTheDocument();
    expect(input).toHaveAttribute("aria-describedby", `${description.id} unit-note`);
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("invalid · disabled 를 컨트롤에 꽂는다", () => {
    render(
      <Field invalid disabled>
        <FieldLabel>Floors</FieldLabel>
        <FieldControl>
          <Input />
        </FieldControl>
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Floors" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toBeDisabled();
  });

  it("Select 트리거와 Checkbox 에도 같은 연결이 닿는다", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Field invalid>
          <FieldLabel>View</FieldLabel>
          <Select defaultValue="plan">
            <FieldControl>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FieldControl>
            <SelectContent>
              <SelectItem value="plan">Plan</SelectItem>
            </SelectContent>
          </Select>
          <FieldDescription>Drawing to export.</FieldDescription>
        </Field>
        <Field orientation="horizontal">
          <FieldControl>
            <Checkbox />
          </FieldControl>
          <FieldLabel>Show grid</FieldLabel>
        </Field>
      </>,
    );
    const trigger = screen.getByRole("combobox", { name: "View" });
    expect(trigger).toHaveAccessibleDescription("Drawing to export.");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("data-slot", "select-trigger");

    const checkbox = screen.getByRole("checkbox", { name: "Show grid" });
    expect(checkbox).not.toBeChecked();
    await user.click(screen.getByText("Show grid"));
    expect(checkbox).toBeChecked();
  });

  it("부품을 Field 밖에서 쓰면 어디서 틀렸는지 말한다", () => {
    expect(() => render(<FieldLabel>Orphan</FieldLabel>)).toThrow("FieldLabel 은 <Field> 안에서만 쓴다");
  });
});
