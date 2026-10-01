import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { DisplayHeading, Eyebrow, Lede } from "./Editorial";

/* 3스토리 계약(본보기 Button.stories). Editorial 모듈의 대표는 DisplayHeading — 들머리 셋(Eyebrow · DisplayHeading · Lede)은 함께 쓰인다. */
const asValues = ["h1", "h2", "h3"] as const;

const meta = {
  title: "Primitives/Editorial",
  component: DisplayHeading,
  args: { children: "Make room for work.", as: "h2" },
  argTypes: { as: { control: "select", options: asValues } },
} satisfies Meta<typeof DisplayHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 2, name: "Make room for work." })).toBeVisible();
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <div className="flex w-120 flex-col gap-8">
      {asValues.map((as) => (
        <div key={as} className="flex flex-col gap-2">
          <Eyebrow step={as === "h1" ? undefined : `0${as.slice(1)}`}>{`Planning brief · ${as}`}</Eyebrow>
          <DisplayHeading {...args} as={as} />
          <Lede>Set the site, the programme and the rules. The generator fills the rest.</Lede>
        </div>
      ))}
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      <div className="flex flex-col gap-2">
        <Eyebrow step="01">Planning brief</Eyebrow>
        <DisplayHeading {...args} />
        <Lede>Set the site, the programme and the rules.</Lede>
      </div>
    </ThemePair>
  ),
};
