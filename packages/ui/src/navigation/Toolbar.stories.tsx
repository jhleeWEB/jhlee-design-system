import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { IconMeasureDistance, IconPan, IconSelect, IconZoomIn } from "../icons/icons";
import { Button } from "../primitives/Button";
import { Toolbar, ToolbarDivider, ToolbarSpacer } from "./Toolbar";

/* 3스토리 계약(본보기 Button.stories). 축은 없고 자리가 둘이다 — 크롬 한 줄(기본)과 캔버스 위 부유 클러스터(`onCanvas`).
 * 부유 클러스터는 캔버스 바탕(`bg-canvas`) 위에 둬야 `on-canvas` 의 반투명이 제 모습이다. */
function Tools() {
  return (
    <>
      <Button variant="ghost" size="icon-sm" aria-label="Select">
        <IconSelect />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Pan">
        <IconPan />
      </Button>
      <ToolbarDivider />
      <Button variant="ghost" size="icon-sm" aria-label="Measure">
        <IconMeasureDistance />
      </Button>
      <ToolbarSpacer />
      <Button variant="ghost" size="icon-sm" aria-label="Zoom in">
        <IconZoomIn />
      </Button>
    </>
  );
}

const meta = {
  title: "Navigation/Toolbar",
  component: Toolbar,
  args: { "aria-label": "Drawing tools", onCanvas: false },
  render: (args) => (
    <div className="w-(--size-panel)">
      <Toolbar {...args}>
        <Tools />
      </Toolbar>
    </div>
  ),
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const toolbar = canvas.getByRole("toolbar", { name: "Drawing tools" });
    await expect(toolbar).toBeInTheDocument();
    await expect(canvas.getAllByRole("button")).toHaveLength(4);
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: () => (
    <div className="flex flex-col gap-6">
      <Toolbar aria-label="Chrome row" className="w-(--size-panel)">
        <Tools />
      </Toolbar>
      <div className="bg-canvas p-6">
        <Toolbar aria-label="On canvas" onCanvas className="w-(--size-panel)">
          <Tools />
        </Toolbar>
      </div>
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      <Toolbar {...args} className="w-(--size-panel)">
        <Tools />
      </Toolbar>
      <div className="bg-canvas p-6">
        <Toolbar {...args} onCanvas className="w-(--size-panel)">
          <Tools />
        </Toolbar>
      </div>
    </ThemePair>
  ),
};
