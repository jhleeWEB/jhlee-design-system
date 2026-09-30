import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { Progress } from "./Progress";

/* 3스토리 계약(본보기 primitives/Button.stories). 막대는 이름이 있어야 한다(aria-progressbar-name) — 모든 칸에 aria-label 을 단다.
 * 미판정(value null)의 띠는 한 번 떠오르고 멈춘다(animate-in-rise) — 무한 애니메이션이 아니라 VRT 가 끝 프레임을 찍는다. */
const toneValues = ["primary", "success", "warning", "destructive", "neutral"] as const;
const valueCols = ["0", "40", "100", "indeterminate"] as const;
const valueOf = (col: (typeof valueCols)[number]) => (col === "indeterminate" ? null : Number(col));

const meta = {
  title: "Feedback/Progress",
  component: Progress,
  args: { value: 40, tone: "primary", "aria-label": "Upload" },
  argTypes: { tone: { control: "select", options: toneValues } },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-(--size-toast)">
      <Progress {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("progressbar", { name: "Upload" })).toHaveAttribute("aria-valuenow", "40");
  },
};

export const Variants: Story = {
  // color-contrast: Matrix 의 행·열 라벨(muted-foreground · background) — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  tags: ["!manifest"],
  render: (args) => (
    <Matrix
      rows={toneValues}
      cols={valueCols}
      rowLabel="tone"
      colLabel="value"
      cell={(tone, col) => (
        <div className="w-40">
          <Progress {...args} tone={tone} value={valueOf(col)} aria-label={`${tone} ${col}`} />
        </div>
      )}
    />
  ),
};

export const ThemeContrast: Story = {
  // color-contrast: ThemePair 의 라벨(muted-foreground · background) — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <ThemePair>
      <div className="flex w-full flex-col gap-3">
        {toneValues.map((tone) => (
          <Progress key={tone} {...args} tone={tone} aria-label={`Upload · ${tone}`} />
        ))}
      </div>
    </ThemePair>
  ),
};
