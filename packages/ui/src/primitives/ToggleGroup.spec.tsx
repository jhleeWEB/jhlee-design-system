import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LuBold, LuItalic } from "react-icons/lu";
import { afterEach, describe, expect, it, vi } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { ICON } from "../lib/icons";
import { ToggleGroup, ToggleGroupItem } from "./ToggleGroup";
import * as stories from "./ToggleGroup.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 픽스처다. 칸(ToggleGroupItem)은 render-all.spec 의 부품 픽스처가 돈다. */
describeComponentContract(stories, { slot: "toggle-group", axes: ["variant", "size"] });

afterEach(cleanup);

describe("ToggleGroup 동작", () => {
  it("single — radiogroup · radio · aria-checked, 화살표로 옮기고 Space 로 켠다. 켠 칸을 다시 누르면 끈다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleGroup type="single" aria-label="View" defaultValue="plan" onValueChange={onValueChange}>
        <ToggleGroupItem value="plan">Plan</ToggleGroupItem>
        <ToggleGroupItem value="section">Section</ToggleGroupItem>
        <ToggleGroupItem value="model" disabled>
          Model
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole("radiogroup", { name: "View" })).toBeInTheDocument();
    const plan = screen.getByRole("radio", { name: "Plan" });
    expect(plan).toHaveAttribute("aria-checked", "true");

    await user.tab();
    expect(plan).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    const section = screen.getByRole("radio", { name: "Section" });
    expect(section).toHaveFocus();
    await user.keyboard(" ");
    expect(onValueChange).toHaveBeenLastCalledWith("section");
    expect(section).toHaveAttribute("aria-checked", "true");
    expect(plan).toHaveAttribute("aria-checked", "false");
    // 비활성 칸은 건너뛰고 처음으로 돈다.
    await user.keyboard("{ArrowRight}");
    expect(plan).toHaveFocus();

    await user.click(section);
    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(section).toHaveAttribute("aria-checked", "false");
  });

  it("multiple — toolbar · button · aria-pressed, 여러 칸을 함께 켠다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleGroup type="multiple" aria-label="Format" onValueChange={onValueChange}>
        <ToggleGroupItem value="bold" icon={<LuBold {...ICON} />} aria-label="Bold" />
        <ToggleGroupItem value="italic" icon={<LuItalic {...ICON} />} aria-label="Italic" />
      </ToggleGroup>,
    );
    expect(screen.getByRole("toolbar", { name: "Format" })).toBeInTheDocument();
    const bold = screen.getByRole("button", { name: "Bold" });
    const italic = screen.getByRole("button", { name: "Italic" });
    await user.click(bold);
    await user.click(italic);
    expect(onValueChange).toHaveBeenLastCalledWith(["bold", "italic"]);
    expect(bold).toHaveAttribute("aria-pressed", "true");
    expect(italic).toHaveAttribute("aria-pressed", "true");
    await user.click(bold);
    expect(onValueChange).toHaveBeenLastCalledWith(["italic"]);
  });

  it("아이콘 전용 칸은 aria-label 이 타입에서 필수이고, 그 이름으로 읽힌다 — 가로 여백을 걷어 정사각으로 선다", () => {
    render(
      <ToggleGroup type="multiple" aria-label="Format">
        <ToggleGroupItem value="bold" icon={<LuBold {...ICON} />} aria-label="Bold" />
        {/* @ts-expect-error — 아이콘만 든 칸에 aria-label 이 없으면 타입 오류다. */}
        <ToggleGroupItem value="italic" icon={<LuItalic {...ICON} />} />
      </ToggleGroup>,
    );
    const bold = screen.getByRole("button", { name: "Bold" });
    expect(bold).toHaveClass("px-0");
    expect(bold.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("variant · size 는 묶음이 정하고 칸이 이어받는다(data-variant · data-size)", () => {
    render(
      <ToggleGroup type="single" aria-label="View" variant="outline" size="sm">
        <ToggleGroupItem value="plan">Plan</ToggleGroupItem>
      </ToggleGroup>,
    );
    const group = screen.getByRole("radiogroup", { name: "View" });
    expect(group).toHaveAttribute("data-variant", "outline");
    expect(group).toHaveAttribute("data-size", "sm");
    const item = screen.getByRole("radio", { name: "Plan" });
    expect(item).toHaveAttribute("data-variant", "outline");
    expect(item).toHaveAttribute("data-size", "sm");
  });
});
