import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { Spinner } from "./Spinner";

/* 3스토리 계약(본보기 primitives/Button.stories). 회전은 무한 애니메이션이라 VRT(Playwright 의 animations: "disabled")가
 * 첫 프레임으로 되돌려 찍는다. `label` 이 있는 칸만 status 로 읽히고 나머지는 장식으로 숨는다. */
const sizeValues = ["sm", "md", "lg"] as const;
const toneValues = ["neutral", "muted", "primary"] as const;

const meta = {
  title: "Feedback/Spinner",
  component: Spinner,
  args: { size: "md", tone: "neutral", label: "Loading" },
  argTypes: {
    size: { control: "select", options: sizeValues },
    tone: { control: "select", options: toneValues },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  },
};

export const Variants: Story = {
  // color-contrast: Matrix 의 행·열 라벨(muted-foreground · background) — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  tags: ["!manifest"],
  render: (args) => (
    <Matrix
      rows={toneValues}
      cols={sizeValues}
      rowLabel="tone"
      colLabel="size"
      cell={(tone, size) => <Spinner {...args} tone={tone} size={size} label={`Loading · ${tone} ${size}`} />}
    />
  ),
};

export const ThemeContrast: Story = {
  // color-contrast: ThemePair 의 라벨(muted-foreground · background) — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <ThemePair>
      {toneValues.map((tone) => (
        <Spinner key={tone} {...args} tone={tone} label={`Loading · ${tone}`} />
      ))}
    </ThemePair>
  ),
};
