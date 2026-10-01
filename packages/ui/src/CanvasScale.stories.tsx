import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../stories/decorators/ThemePair";
import { niceScale } from "./canvas-metrics";
import { CanvasScale } from "./CanvasScale";

/* 3스토리 계약(본보기 primitives/Button.stories). 축척 막대는 **캔버스**다 — 흰 바탕 고정 · 무채색 · 다크 없음. ThemeContrast 의 두 칸이
 * 같은 픽셀이어야 한다(방향 C 의 구조적 약속). 캔버스 면(`bg-canvas`) 위에 올려 그린다. */
const metresPerPixel = [0.01, 0.05, 0.2, 1, 7.5] as const;

const meta = {
  title: "Canvas/CanvasScale",
  component: CanvasScale,
  args: { lengthPx: 80, label: "10 m" },
  decorators: [
    (Story) => (
      <div className="inline-block bg-canvas p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CanvasScale>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "Canvas scale" })).toHaveTextContent("10 m");
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <div className="flex flex-col gap-3">
      {metresPerPixel.map((mpp) => {
        const { lengthM, px } = niceScale(mpp);
        return <CanvasScale key={mpp} {...args} lengthPx={px} label={`${lengthM} m`} />;
      })}
      <CanvasScale {...args} lengthPx={Number.NaN} label="invalid → 0" />
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      <div className="bg-canvas p-4">
        <CanvasScale {...args} />
      </div>
    </ThemePair>
  ),
};
