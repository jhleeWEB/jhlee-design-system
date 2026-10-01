import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { BackButton } from "./BackButton";

/* 3스토리 계약(본보기 Button.stories). 축은 Button 의 것 — 뒤로가기가 실제로 쓰는 조합(ghost · outline × sm · md)만 격자로 둔다. */
const variantValues = ["ghost", "outline"] as const;
const sizeValues = ["sm", "md"] as const;

const meta = {
  title: "Navigation/BackButton",
  component: BackButton,
  args: { children: "Back", onClick: fn() },
  argTypes: {
    variant: { control: "select", options: ["solid", "outline", "ghost", "link"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof BackButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Back" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <Matrix
      rows={variantValues}
      cols={sizeValues}
      rowLabel="variant"
      colLabel="size"
      cell={(variant, size) => <BackButton {...args} variant={variant} size={size} />}
    />
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      <BackButton {...args} />
      <BackButton {...args} variant="outline" />
    </ThemePair>
  ),
};
