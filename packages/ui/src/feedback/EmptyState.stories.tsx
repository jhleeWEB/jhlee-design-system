import type { Meta, StoryObj } from "@storybook/react-vite";
import { LuFolderOpen } from "react-icons/lu";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Button } from "../primitives/Button";
import { EmptyState } from "./EmptyState";

/* 3스토리 계약(본보기 primitives/Button.stories). 빈 상태는 «무엇을 하면 채워지는가» 를 말한다 — 그래서 모든 스토리가 action 을 든다. */
const sizeValues = ["default", "compact"] as const;

const meta = {
  title: "Feedback/EmptyState",
  component: EmptyState,
  args: {
    size: "default",
    title: "No project selected",
    description: "Pick a project from the list or create one, then its files become available.",
    icon: <LuFolderOpen aria-hidden="true" />,
    action: (
      <Button variant="solid" tone="primary">
        Create project
      </Button>
    ),
  },
  argTypes: { size: { control: "select", options: sizeValues } },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  /* 빈 상태는 카드·패널 면 위에 선다 — 페이지 배경 위의 muted 글자는 토큰 대비 미달(#23)이라 실제 자리(bg-card)에 둔다. */
  render: (args) => (
    <div className="w-(--size-sheet-md) rounded-lg border border-border bg-card">
      <EmptyState {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Create project" })).toBeEnabled();
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <div className="flex flex-col gap-6">
      {sizeValues.map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <span className="font-mono text-micro text-foreground">size · {size}</span>
          <div className="rounded-lg border border-border bg-card">
            <EmptyState {...args} size={size} />
          </div>
        </div>
      ))}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-micro text-foreground">no icon · no description</span>
        <div className="rounded-lg border border-border bg-card">
          <EmptyState {...args} size="compact" icon={undefined} description={undefined} />
        </div>
      </div>
    </div>
  ),
};

export const ThemeContrast: Story = {
  args: { size: "compact" },
  render: (args) => (
    <ThemePair>
      <div className="w-full rounded-lg border border-border bg-card">
        <EmptyState {...args} />
      </div>
    </ThemePair>
  ),
};
