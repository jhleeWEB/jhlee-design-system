import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Stepper, type StepperStep } from "./Stepper";

/* 3스토리 계약(본보기 Button.stories). 축은 `orientation`(줄)과 `status`(단계) — Variants 는 두 방향에 네 상태가 다 서는 단계 줄을 그린다. */
const orientationValues = ["horizontal", "vertical"] as const;

const steps: readonly StepperStep[] = [
  { label: "Site", description: "Boundary and setbacks" },
  { label: "Massing", description: "Floors and footprint" },
  { label: "Units", description: "Mix and areas" },
  { label: "Export", description: "Drawings and schedule" },
];

/** 네 상태가 다 선 단계 — 셋째가 검증에 실패했다. */
const allStates: readonly StepperStep[] = [
  { label: "Site", description: "Boundary and setbacks" },
  { label: "Massing", description: "Floors and footprint" },
  { label: "Units", description: "Mix and areas", status: "error" },
  { label: "Export", description: "Drawings and schedule" },
];

const meta = {
  title: "Navigation/Stepper",
  component: Stepper,
  args: { steps, current: 1, orientation: "horizontal", "aria-label": "Setup progress" },
  argTypes: { orientation: { control: "select", options: orientationValues } },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-dialog-md max-w-full">
      <Stepper {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const items = canvas.getAllByRole("listitem");
    await expect(items[1]).toHaveAttribute("aria-current", "step");
    await expect(items[0]).toHaveTextContent("Complete");
    await expect(items[3]).toHaveTextContent("Upcoming");
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <div className="flex flex-col gap-8">
      <div className="w-dialog-md max-w-full">
        <Stepper {...args} steps={allStates} current={2} aria-label="Horizontal" />
      </div>
      <div className="flex gap-12">
        <Stepper {...args} steps={allStates} current={2} orientation="vertical" aria-label="Vertical" />
        <Stepper
          {...args}
          steps={steps}
          current={steps.length}
          orientation="vertical"
          aria-label="All complete"
        />
      </div>
    </div>
  ),
};

export const ThemeContrast: Story = {
  args: { steps: allStates, current: 2 },
  render: (args) => (
    <ThemePair>
      {(theme) => (
        <div className="flex flex-col gap-6">
          <Stepper {...args} aria-label={`Horizontal ${theme}`} />
          <Stepper {...args} orientation="vertical" aria-label={`Vertical ${theme}`} />
        </div>
      )}
    </ThemePair>
  ),
};
