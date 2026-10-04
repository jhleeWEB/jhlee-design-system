import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Button } from "../primitives/Button";
import { Alert } from "./Alert";

/* 3스토리 계약(본보기 primitives/Button.stories). 톤은 중립(상주 안내문, #105) + 판정 넷 — 주된 것(primary)은 없다. */
const toneValues = ["neutral", "info", "success", "warning", "destructive"] as const;

const meta = {
  title: "Feedback/Alert",
  component: Alert,
  args: {
    tone: "info",
    title: "Placeholder values in this pack",
    children: "Values with a dashed underline have not been checked against the source yet.",
  },
  argTypes: { tone: { control: "select", options: toneValues } },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-(--size-toast)">
      <Alert {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent("Placeholder values in this pack");
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <div className="flex w-(--size-toast) flex-col gap-4">
      {toneValues.map((tone) => (
        <Alert key={tone} {...args} tone={tone} title={`Tone · ${tone}`} />
      ))}
      <Alert {...args} tone="warning" title="Title only" children={undefined} />
      <Alert {...args} tone="info" title={undefined} children="Body only — no title line." />
      <Alert
        {...args}
        tone="destructive"
        title="Export failed"
        children="The file could not be written. Try again or pick another folder."
        action={
          <Button size="sm" variant="outline">
            Retry
          </Button>
        }
      />
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      <div className="flex w-full flex-col gap-3">
        {toneValues.map((tone) => (
          <Alert key={tone} {...args} tone={tone} title={`Tone · ${tone}`} />
        ))}
      </div>
    </ThemePair>
  ),
};
