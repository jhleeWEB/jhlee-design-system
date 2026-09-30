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
  // color-contrast: text-muted-foreground 가 페이지 바탕(bg-background)·트랙 위에서 4.5:1 미만 — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Back" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  // color-contrast: text-muted-foreground 가 페이지 바탕(bg-background)·트랙 위에서 4.5:1 미만 — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
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
  // color-contrast: ThemePair 의 테마 라벨과 muted 글자 — 토큰 값의 몫(#23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <ThemePair>
      <BackButton {...args} />
      <BackButton {...args} variant="outline" />
    </ThemePair>
  ),
};
