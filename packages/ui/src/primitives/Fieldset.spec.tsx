import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { Switch } from "./Choice";
import { Field, FieldControl, FieldLabel } from "./Field";
import { Fieldset } from "./Fieldset";
import * as stories from "./Fieldset.stories";
import { Input } from "./Input";
import { Slider } from "./Slider";

/* 공통 계약을 스토리 `Default` 로 — 탐침은 첫 묶음 상자(«North»)에 얹힌다. 축(cva)이 없는 컴포넌트다. */
describeComponentContract(stories, { slot: "fieldset" });

afterEach(cleanup);

describe("Fieldset 의 그룹 의미", () => {
  it("legend 가 묶음(role group)의 이름이고, 렌더된 legend 는 fieldset 의 첫 자식이다", () => {
    render(
      <Fieldset legend="Road widths">
        <Field>
          <FieldLabel>Width</FieldLabel>
          <FieldControl>
            <Input />
          </FieldControl>
        </Field>
      </Fieldset>,
    );
    const group = screen.getByRole("group", { name: "Road widths" });
    expect(group.tagName).toBe("FIELDSET");
    expect(group.firstElementChild?.tagName).toBe("LEGEND");
    expect(group.firstElementChild).toHaveAttribute("data-slot", "fieldset-legend");
    expect(group).toContainElement(screen.getByRole("textbox", { name: "Width" }));
    expect(group).not.toHaveAttribute("aria-describedby");
  });

  it("description 은 묶음의 설명으로 이어지고, 넘긴 aria-describedby 는 그 뒤에 붙는다", () => {
    render(
      <>
        <Fieldset legend="Setbacks" description="Applies to every edge." aria-describedby="unit-note">
          <span>Body</span>
        </Fieldset>
        <p id="unit-note">Metres.</p>
      </>,
    );
    const group = screen.getByRole("group", { name: "Setbacks" });
    const description = screen.getByText("Applies to every edge.");
    expect(description).toHaveAttribute("data-slot", "fieldset-description");
    expect(group).toHaveAttribute("aria-describedby", `${description.id} unit-note`);
    expect(group).toHaveAccessibleDescription("Applies to every edge. Metres.");
  });

  it("빈 설명(false · 빈 문자열)은 그리지도 잇지도 않는다", () => {
    const { container } = render(
      <>
        <Fieldset legend="A" description={false} />
        <Fieldset legend="B" description="" />
      </>,
    );
    expect(container.querySelector("[data-slot=fieldset-description]")).toBeNull();
    for (const name of ["A", "B"])
      expect(screen.getByRole("group", { name })).not.toHaveAttribute("aria-describedby");
  });
});

describe("Fieldset 의 disabled(네이티브)", () => {
  it("안의 폼 컨트롤이 전부 꺼진다 — input 과 button 인 Radix Switch 까지", async () => {
    const user = userEvent.setup();
    render(
      <Fieldset legend="Road widths" disabled>
        <Field>
          <FieldLabel>Width</FieldLabel>
          <FieldControl>
            <Input defaultValue="6" />
          </FieldControl>
        </Field>
        <Field orientation="horizontal">
          <FieldControl>
            <Switch />
          </FieldControl>
          <FieldLabel>Edit road widths</FieldLabel>
        </Field>
      </Fieldset>,
    );
    const group = screen.getByRole("group", { name: "Road widths" });
    const input = screen.getByRole("textbox", { name: "Width" });
    const toggle = screen.getByRole("switch", { name: "Edit road widths" });
    expect(group).toBeDisabled();
    // 컨트롤에는 disabled 속성이 없다 — 조상 fieldset 이 끈다.
    expect(input).not.toHaveAttribute("disabled");
    expect(input).toBeDisabled();
    expect(toggle).toBeDisabled();

    await user.type(input, "0");
    expect(input).toHaveValue("6");
    await user.click(toggle);
    expect(toggle).not.toBeChecked();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it("disabled 가 아니면 같은 컨트롤이 그대로 움직인다", async () => {
    const user = userEvent.setup();
    render(
      <Fieldset legend="Road widths">
        <Field orientation="horizontal">
          <FieldControl>
            <Switch />
          </FieldControl>
          <FieldLabel>Edit road widths</FieldLabel>
        </Field>
      </Fieldset>,
    );
    const toggle = screen.getByRole("switch", { name: "Edit road widths" });
    expect(toggle).toBeEnabled();
    await user.click(toggle);
    expect(toggle).toBeChecked();
  });
});

describe("Fieldset 의 disabled 컨텍스트 — 네이티브가 닿지 않는 Slider(#90)", () => {
  it("꺼진 묶음 안의 Slider 는 손잡이가 탭 순서에서 빠지고 키보드가 값을 바꾸지 않는다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Fieldset legend="North" disabled>
        <Slider aria-label="Angle" defaultValue={[10]} onValueChange={onValueChange} showValue />
      </Fieldset>,
    );
    const thumb = screen.getByRole("slider", { name: "Angle" });
    // 슬라이더에는 disabled 를 주지 않았다 — 둘러싼 Fieldset 이 끈다.
    expect(thumb).not.toHaveAttribute("tabindex");
    expect(thumb).toHaveAttribute("data-disabled", "");
    expect(container.querySelector("[data-slot=slider-control]")).toHaveAttribute("aria-disabled", "true");
    // 루트 밖의 값 표기도 함께 낮아지도록 바깥 래퍼에 상태가 선다.
    expect(container.querySelector("[data-slot=slider]")).toHaveAttribute("data-disabled", "");
    await user.tab();
    expect(thumb).not.toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(thumb).toHaveAttribute("aria-valuenow", "10");
  });

  it("바깥 묶음이 꺼지면 안에 다시 둔 묶음의 Slider 도 꺼진다 — 네이티브의 자손 fieldset 규칙과 같다", () => {
    render(
      <Fieldset legend="Setbacks" disabled>
        <Fieldset legend="Front">
          <Slider aria-label="Front setback" defaultValue={[3]} />
        </Fieldset>
      </Fieldset>,
    );
    expect(screen.getByRole("group", { name: "Front" })).toBeDisabled();
    expect(screen.getByRole("slider", { name: "Front setback" })).toHaveAttribute("data-disabled", "");
  });

  it("꺼지지 않은 묶음의 Slider 는 그대로 움직인다", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Fieldset legend="North">
        <Slider aria-label="Angle" defaultValue={[10]} />
      </Fieldset>,
    );
    const thumb = screen.getByRole("slider", { name: "Angle" });
    expect(container.querySelector("[data-slot=slider]")).not.toHaveAttribute("data-disabled");
    await user.tab();
    expect(thumb).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(thumb).toHaveAttribute("aria-valuenow", "11");
  });
});
