import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../stories/decorators/ThemePair";
import { Legend, LegendItem } from "./Legend";

/* 3스토리 계약(본보기 primitives/Button.stories). 범례는 **캔버스**다 — 흰 바탕 고정 · radius 0 · 무채색 · 다크 없음. ThemeContrast 의 두 칸이
 * 같은 픽셀이어야 한다(CanvasScale 과 같은 구조적 약속). 축은 목록의 `orientation` 과 항목의 `swatch` · `pattern` —
 * Variants 는 무늬 넷 × swatch 일곱(28칸)과 두 방향을 함께 그린다. 도면 바닥(`bg-canvas`) 위에 올려 그린다. */
const swatchValues = ["ink", "ink-2", "muted", "line-strong", "line", "grid", "surface"] as const;
const patternValues = ["fill", "outline", "hatch", "line"] as const;

const meta = {
  title: "Canvas/Legend",
  component: Legend,
  args: { orientation: "vertical" },
  argTypes: { orientation: { control: "select", options: ["vertical", "horizontal"] } },
  decorators: [
    (Story) => (
      <div className="inline-block bg-canvas p-4">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Legend {...args}>
      <LegendItem swatch="ink">Wall</LegendItem>
      <LegendItem swatch="muted" pattern="hatch">
        Core
      </LegendItem>
      <LegendItem swatch="line-strong" pattern="outline">
        Boundary
      </LegendItem>
      <LegendItem swatch="ink-2" pattern="line">
        Dimension
      </LegendItem>
    </Legend>
  ),
} satisfies Meta<typeof Legend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const list = canvas.getByRole("list", { name: "Legend" });
    await expect(list).toHaveAttribute("data-slot", "legend");
    await expect(canvas.getAllByRole("listitem")).toHaveLength(4);
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <div className="flex flex-col gap-6">
      {/* 무늬마다 한 상자, 상자 안에 swatch 일곱 단 — Matrix(크롬 글자)를 쓰지 않는 것은 캔버스 위에서 크롬 글자가 다크에서 흰 바탕 위 흰 글자가 되기 때문이다. */}
      <div className="flex items-start gap-4">
        {patternValues.map((pattern) => (
          <Legend {...args} key={pattern} aria-label={`Pattern ${pattern}`}>
            {swatchValues.map((swatch) => (
              <LegendItem key={swatch} swatch={swatch} pattern={pattern}>
                {pattern} · {swatch}
              </LegendItem>
            ))}
          </Legend>
        ))}
      </div>
      <Legend {...args} orientation="horizontal" aria-label="Horizontal legend" className="w-dialog-sm">
        <LegendItem swatch="ink">Wall</LegendItem>
        <LegendItem swatch="muted" pattern="hatch">
          Core
        </LegendItem>
        <LegendItem swatch="line-strong" pattern="outline">
          Boundary
        </LegendItem>
        <LegendItem swatch="ink-2" pattern="line">
          Dimension
        </LegendItem>
        <LegendItem swatch="grid">Grid</LegendItem>
      </Legend>
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      {(theme) => (
        <Legend {...args} aria-label={`Legend ${theme}`}>
          <LegendItem swatch="ink">Wall</LegendItem>
          <LegendItem swatch="muted" pattern="hatch">
            Core
          </LegendItem>
          <LegendItem swatch="line-strong" pattern="outline">
            Boundary
          </LegendItem>
          <LegendItem swatch="ink-2" pattern="line">
            Dimension
          </LegendItem>
        </Legend>
      )}
    </ThemePair>
  ),
};
