import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { PanelToggleButton } from "./PanelToggleButton";

/* 3스토리 계약(본보기 Button.stories). 제어 컴포넌트라 Default 는 args 그대로(onOpenChange 는 spy), 여닫힘은 Variants 에서 상태로 보인다. */
const meta = {
  title: "Primitives/PanelToggleButton",
  component: PanelToggleButton,
  args: { open: true, label: "inspector", onOpenChange: fn() },
} satisfies Meta<typeof PanelToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    // 누르기는 documented-contracts.spec 이 본다 — 여기서 누르면 hover 가 VRT 스냅샷에 남는다.
    await expect(canvas.getByRole("button", { name: "Collapse the inspector" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  },
};

function Live({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  return <PanelToggleButton open={open} onOpenChange={setOpen} label={label} />;
}

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <div className="flex items-center gap-6 font-sans text-body text-foreground">
      <div className="flex items-center gap-2">
        <PanelToggleButton {...args} open />
        <span>open</span>
      </div>
      <div className="flex items-center gap-2">
        <PanelToggleButton {...args} open={false} />
        <span>closed</span>
      </div>
      <div className="flex items-center gap-2">
        <Live label="parameters" />
        <span>live</span>
      </div>
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      <PanelToggleButton {...args} open />
      <PanelToggleButton {...args} open={false} />
    </ThemePair>
  ),
};
