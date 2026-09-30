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
  // color-contrast: 판정 톤 글자(success 등)가 옅은 면 위에서 4.5:1 미달 — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Pass")).toHaveAttribute("data-tone", "success");
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  // color-contrast: Matrix 머리(text-micro muted-foreground)와 판정 톤 배지 글자 — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
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
  // color-contrast: ThemePair 머리(text-micro muted-foreground, 라이트) — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
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
