import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { Slider } from "./Slider";

/* 3스토리 계약(본보기 Button.stories). 축은 `size` 하나 — Variants 는 size × 모양(단일 · 범위 · 눈금 · 비활성) 격자다.
 * 값 표기(`showValue`)와 눈금 라벨은 mono + tabular-nums(원칙 3). */
const sizeValues = ["sm", "md"] as const;
const kindValues = ["single", "range", "marks", "disabled"] as const;
const marks = [
  { value: 0, label: "0" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 75, label: "75" },
  { value: 100, label: "100" },
];
const metres = (v: number) => `${v} m`;

const meta = {
  title: "Primitives/Slider",
  component: Slider,
  args: {
    "aria-label": "Setback",
    defaultValue: [40],
    min: 0,
    max: 100,
    step: 1,
    size: "md",
    showValue: true,
    formatValue: metres,
    onValueChange: fn(),
    onValueCommit: fn(),
    className: "w-80",
  },
  argTypes: { size: { control: "select", options: sizeValues } },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const thumb = canvas.getByRole("slider", { name: "Setback" });
    await expect(thumb).toHaveAttribute("aria-valuenow", "40");
    await expect(thumb).toHaveAttribute("aria-valuetext", "40 m");
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(args.onValueChange).toHaveBeenLastCalledWith([41]);
    await expect(args.onValueCommit).toHaveBeenLastCalledWith([41]);
    // VRT 가 처음 값을 그리도록 되돌린다.
    await userEvent.keyboard("{ArrowLeft}");
    thumb.blur();
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <Matrix
      rows={kindValues}
      cols={sizeValues}
      rowLabel="kind"
      colLabel="size"
      cell={(kind, size) => (
        <Slider
          {...args}
          size={size}
          aria-label={`${kind} ${size}`}
          defaultValue={kind === "range" ? [20, 70] : [40]}
          marks={kind === "marks" ? marks : undefined}
          disabled={kind === "disabled"}
          className="w-72"
        />
      )}
    />
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      {(theme) => (
        <div className="flex w-80 flex-col gap-6">
          <Slider {...args} aria-label={`Setback ${theme}`} />
          <Slider {...args} aria-label={`Height ${theme}`} defaultValue={[20, 70]} marks={marks} />
        </div>
      )}
    </ThemePair>
  ),
};
