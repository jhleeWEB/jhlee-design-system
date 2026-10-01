import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";
import * as stories from "./Tabs.stories";

/* 공통 계약을 스토리 `Default` 로 — 탐침은 탭 뿌리에 얹힌다(D3, #44). 축(variant)은 목록 부품의 것이라 render-all 픽스처가 본다. */
describeComponentContract(stories, { slot: "tabs" });

afterEach(cleanup);

function Drawing({
  variant,
  onValueChange,
}: {
  variant?: "segmented" | "underline";
  onValueChange?: (v: string) => void;
}) {
  return (
    <Tabs defaultValue="plan" {...(onValueChange ? { onValueChange } : {})}>
      <TabsList aria-label="Drawing" {...(variant ? { variant } : {})}>
        <TabsTrigger value="plan">Plan</TabsTrigger>
        <TabsTrigger value="model" disabled>
          Model
        </TabsTrigger>
        <TabsTrigger value="section">Section</TabsTrigger>
      </TabsList>
      <TabsContent value="plan">Plan body</TabsContent>
      <TabsContent value="model">Model body</TabsContent>
      <TabsContent value="section">Section body</TabsContent>
    </Tabs>
  );
}

describe("Tabs 동작", () => {
  it("칸을 누르면 그 패널이 보이고 패널은 칸 이름을 단다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Drawing onValueChange={onValueChange} />);
    expect(screen.getByRole("tabpanel", { name: "Plan" })).toHaveTextContent("Plan body");
    await user.click(screen.getByRole("tab", { name: "Section" }));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("section");
    expect(screen.getByRole("tab", { name: "Section" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Section" })).toHaveTextContent("Section body");
    expect(screen.queryByText("Plan body")).not.toBeInTheDocument();
  });

  it("화살표 · Home · End 로 옮기면 곧바로 활성화되고 비활성 칸은 건너뛴다", async () => {
    const user = userEvent.setup();
    render(<Drawing />);
    await user.tab();
    expect(screen.getByRole("tab", { name: "Plan" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    const section = screen.getByRole("tab", { name: "Section" });
    expect(section).toHaveFocus();
    expect(section).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Plan" })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{End}");
    expect(section).toHaveAttribute("aria-selected", "true");
    // Tab 은 칸 줄을 떠나 활성 패널로 간다(roving tabindex).
    await user.tab();
    expect(screen.getByRole("tabpanel", { name: "Section" })).toHaveFocus();
  });

  it("variant 는 목록과 칸에 함께 찍힌다 — 기본은 segmented", () => {
    const { unmount } = render(<Drawing />);
    expect(screen.getByRole("tablist", { name: "Drawing" })).toHaveAttribute("data-variant", "segmented");
    expect(screen.getByRole("tab", { name: "Plan" })).toHaveAttribute("data-variant", "segmented");
    unmount();
    render(<Drawing variant="underline" />);
    expect(screen.getByRole("tablist", { name: "Drawing" })).toHaveAttribute("data-variant", "underline");
    for (const tab of screen.getAllByRole("tab")) expect(tab).toHaveAttribute("data-variant", "underline");
  });
});
