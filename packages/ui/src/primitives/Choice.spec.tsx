import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { Checkbox, RadioGroup, RadioGroupItem, Switch } from "./Choice";
import * as stories from "./Choice.stories";
import { checkboxVariants, radioGroupItemVariants, switchVariants } from "./Choice.variants";
import { Field, FieldControl, FieldLabel } from "./Field";

/* 공통 계약(C3) — 스토리 `Default` 가 유일한 픽스처다. 같은 모듈의 부품(RadioGroup · RadioGroupItem · Switch)은 render-all.spec 의 FIXTURES 가 돈다(#48). */
describeComponentContract(stories, { slot: "checkbox", axes: ["size"] });

afterEach(cleanup);

const sizes = ["sm", "md", "lg"] as const;

describe("선택 컨트롤의 size 축(#80)", () => {
  it("셋 다 기본은 md 이고 data-size 로 찍힌다", () => {
    render(
      <>
        <Checkbox aria-label="Grid" />
        <RadioGroup aria-label="Units" defaultValue="m">
          <RadioGroupItem value="m" aria-label="Metres" />
        </RadioGroup>
        <Switch aria-label="Snap" />
      </>,
    );
    expect(screen.getByRole("checkbox", { name: "Grid" })).toHaveAttribute("data-size", "md");
    expect(screen.getByRole("radio", { name: "Metres" })).toHaveAttribute("data-size", "md");
    expect(screen.getByRole("switch", { name: "Snap" })).toHaveAttribute("data-size", "md");
  });

  it.each(sizes)("%s — 상자 · 트랙의 치수 클래스가 단마다 하나다", (size) => {
    const box = { sm: "size-3.5", md: "size-4", lg: "size-5" }[size];
    const track = { sm: "h-4 w-7", md: "h-5 w-9", lg: "h-6 w-11" }[size];
    expect(checkboxVariants({ size }).split(" ")).toContain(box);
    expect(radioGroupItemVariants({ size }).split(" ")).toContain(box);
    expect(switchVariants({ size })).toContain(track);
    render(<Switch size={size} aria-label="Live" />);
    expect(screen.getByRole("switch")).toHaveAttribute("data-size", size);
  });

  it("체크박스는 rounded-xs(작은 표시), 라디오 · 스위치는 원이다", () => {
    expect(checkboxVariants().split(" ")).toContain("rounded-xs");
    expect(radioGroupItemVariants().split(" ")).toContain("rounded-full");
    expect(switchVariants().split(" ")).toContain("rounded-full");
  });

  it("UA 버튼 여백을 걷는다 — 16px 상자 안쪽이 아이콘을 담는다", () => {
    /* preflight 가 없어 Radix 의 <button> 에 UA 의 `padding: 1px 6px` 이 남으면 16px 상자의 안쪽 폭이 2px 이 된다(#80 실측). */
    expect(checkboxVariants().split(" ")).toContain("p-0");
    expect(radioGroupItemVariants().split(" ")).toContain("p-0");
  });
});

describe("상태", () => {
  it("섞임(indeterminate)은 aria-checked=mixed 이고 체크 대신 가로줄을 그린다", () => {
    render(<Checkbox aria-label="Layers" checked="indeterminate" />);
    const box = screen.getByRole("checkbox", { name: "Layers" });
    expect(box).toHaveAttribute("aria-checked", "mixed");
    const indicator = box.querySelector("span[data-state]");
    expect(indicator).toHaveAttribute("data-state", "indeterminate");
    const [check, dash] = [...box.querySelectorAll("path")];
    expect(check).toHaveClass("group-data-[state=indeterminate]/check:hidden");
    expect(dash).toHaveClass("hidden", "group-data-[state=indeterminate]/check:inline");
  });

  it("라벨(Field)을 누르면 체크박스가 바뀐다 — 작은 상자도 라벨이 누르는 자리다", async () => {
    const user = userEvent.setup();
    render(
      <Field orientation="horizontal">
        <FieldControl>
          <Checkbox size="sm" />
        </FieldControl>
        <FieldLabel>Show dimensions</FieldLabel>
      </Field>,
    );
    const box = screen.getByRole("checkbox", { name: "Show dimensions" });
    expect(box).not.toBeChecked();
    await user.click(screen.getByText("Show dimensions"));
    expect(box).toBeChecked();
  });

  it("스위치는 눌러 켜고 손잡이가 같은 상태를 단다", async () => {
    const user = userEvent.setup();
    render(<Switch size="lg" aria-label="Live update" />);
    const track = screen.getByRole("switch", { name: "Live update" });
    await user.click(track);
    expect(track).toBeChecked();
    expect(track.querySelector("span")).toHaveAttribute("data-state", "checked");
    expect(track.querySelector("span")).toHaveClass("size-5", "data-[state=checked]:translate-x-5");
  });

  it("라디오는 고른 점의 지름이 상자 단을 따른다", () => {
    render(
      <RadioGroup aria-label="Units" defaultValue="m">
        <RadioGroupItem size="lg" value="m" aria-label="Metres" />
      </RadioGroup>,
    );
    const radio = screen.getByRole("radio", { name: "Metres" });
    expect(radio).toHaveAttribute("data-size", "lg");
    expect(radio.querySelector("span")).toHaveClass("size-2.5");
  });
});
