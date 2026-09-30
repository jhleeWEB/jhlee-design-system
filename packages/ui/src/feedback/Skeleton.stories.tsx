import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Skeleton, SkeletonText } from "./Skeleton";

/* 3스토리 계약(본보기 primitives/Button.stories). shimmer 는 무한 애니메이션이라 VRT(Playwright 의 animations: "disabled")가
 * 첫 프레임으로 되돌려 찍는다 — 픽셀이 시각에 흔들리지 않는다. */
const shapeValues = ["bar", "circle"] as const;

const meta = {
  title: "Feedback/Skeleton",
  component: Skeleton,
  args: { shape: "bar", h: 12, w: 160 },
  argTypes: { shape: { control: "select", options: shapeValues } },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="skeleton"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <div className="flex w-(--size-toast) flex-col gap-6">
      <div className="flex items-center gap-4">
        {shapeValues.map((shape) => (
          <Skeleton key={shape} {...args} shape={shape} h={28} w={shape === "circle" ? undefined : 120} />
        ))}
      </div>
      <SkeletonText lines={3} />
      <SkeletonText lines={1} />
    </div>
  ),
};

export const ThemeContrast: Story = {
  // color-contrast: ThemePair 의 라벨(muted-foreground · background) — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <ThemePair>
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center gap-3">
          <Skeleton {...args} shape="circle" h={28} w={undefined} />
          <Skeleton {...args} />
        </div>
        <SkeletonText />
      </div>
    </ThemePair>
  ),
};
