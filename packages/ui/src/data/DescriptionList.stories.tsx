import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { DescriptionList } from "./DescriptionList";

/* 3스토리 계약(본보기 Button.stories). 축은 cva 가 아니라 줄마다의 `numeric` · `provisional` 이다 —
 * Variants 는 두 불리언의 네 조합을 한 목록에 줄로 그린다. */
const meta = {
  title: "Data/DescriptionList",
  component: DescriptionList,
  args: {
    className: "w-drawer-sm",
    rows: [
      { k: "Permitted", v: "38,420 m²", numeric: true },
      { k: "Consumed", v: "37,118 m²", numeric: true },
      { k: "Balance", v: "1,302 m²", numeric: true, provisional: true },
    ],
  },
} satisfies Meta<typeof DescriptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // color-contrast: 이름(dt)의 muted-foreground 가 bg-background 위에서 4.33 — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #20 · #24)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Balance")).toBeInTheDocument();
    await expect(canvas.getByTitle("Provisional")).toHaveTextContent("1,302 m²");
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  // color-contrast: 이름(dt)의 muted-foreground — 토큰 값의 몫(#20 · #24)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  args: {
    rows: [
      { k: "text", v: "North-east" },
      { k: "numeric", v: "1,234.50", numeric: true },
      { k: "provisional", v: "Pending review", provisional: true },
      { k: "numeric · provisional", v: "98.00", numeric: true, provisional: true },
      { k: "A long name that truncates before it pushes the value", v: "12" },
    ],
  },
};

export const ThemeContrast: Story = {
  // color-contrast: 라이트의 muted-foreground 라벨·이름 — 토큰 값의 몫(#20 · #24)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <ThemePair>
      <DescriptionList {...args} />
    </ThemePair>
  ),
};
