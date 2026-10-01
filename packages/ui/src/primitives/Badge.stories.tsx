import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { Badge, StatusDot } from "./Badge";

/* 3스토리 계약(본보기 Button.stories). Badge 모듈은 StatusDot 도 내보낸다 — 점은 Variants · ThemeContrast 에 함께 그린다. */
const toneValues = ["neutral", "primary", "success", "warning", "destructive"] as const;
const shapeValues = ["plain", "dot", "provisional"] as const;

const meta = {
  title: "Primitives/Badge",
  component: Badge,
  args: { children: "Pass", tone: "success" },
  argTypes: {
    tone: { control: "select", options: toneValues },
    provisional: { control: "boolean" },
    dot: { control: "boolean" },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Pass")).toHaveAttribute("data-tone", "success");
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Matrix
        rows={toneValues}
        cols={shapeValues}
        rowLabel="tone"
        colLabel="shape"
        cell={(tone, shape) => (
          <Badge {...args} tone={tone} dot={shape === "dot"} provisional={shape === "provisional"}>
            {tone}
          </Badge>
        )}
      />
      <div className="flex items-center gap-3">
        {toneValues.map((tone) => (
          <StatusDot key={tone} tone={tone} label={tone} />
        ))}
      </div>
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      {toneValues.map((tone) => (
        <Badge key={tone} {...args} tone={tone} dot>
          {tone}
        </Badge>
      ))}
      {toneValues.map((tone) => (
        <StatusDot key={tone} tone={tone} label={tone} />
      ))}
    </ThemePair>
  ),
};
