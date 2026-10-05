import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { toneValues } from "../lib/tone";
import { Readout, ReadoutItem } from "./Readout";

/* 3스토리 계약(본보기 Button.stories). 묶음의 축은 `size` · `variant`, 칸의 축은 `tone` — Variants 는 size × variant 격자 안에
 * 톤 여섯을 칸으로 늘어놓는다. 판정색 칸에는 언제나 `status` 글자를 함께 준다(원칙 2). 상태 칸(`kind="status"`, #106)은 수치 칸과 한 묶음에
 * 섞어 그린다 — 둘이 다른 종류로 읽히는지가 볼 것이다. */
const sizeValues = ["sm", "md"] as const;
const variantValues = ["inline", "floating"] as const;
const statusOf: Record<(typeof toneValues)[number], string | undefined> = {
  neutral: undefined,
  primary: "Selected",
  success: "Within limit",
  warning: "Near limit",
  destructive: "Over limit",
  info: "Estimated",
};

const meta = {
  title: "Data/Readout",
  component: Readout,
  args: { size: "md", variant: "inline", className: "w-dialog-sm" },
  argTypes: {
    size: { control: "select", options: sizeValues },
    variant: { control: "select", options: variantValues },
  },
  render: (args) => (
    <Readout {...args}>
      <ReadoutItem label="Built-up" value="37,118" unit="m²" />
      <ReadoutItem label="Coverage" value="42.5" unit="%" tone="success" status="Within limit" />
      <ReadoutItem label="Height" value="68.4" unit="m" tone="destructive" status="Over limit" />
    </Readout>
  ),
} satisfies Meta<typeof Readout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Built-up").tagName).toBe("DT");
    await expect(canvas.getByText("Over limit")).toBeInTheDocument();
    await expect(canvas.getByText("Over limit").closest("[data-tone]")).toHaveAttribute(
      "data-tone",
      "destructive",
    );
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <div className="flex flex-col gap-8">
      <Matrix
        rows={variantValues}
        cols={sizeValues}
        rowLabel="variant"
        colLabel="size"
        cell={(variant, size) => (
          <Readout {...args} variant={variant} size={size} className="w-dialog-md">
            {toneValues.map((tone) => (
              <ReadoutItem
                key={tone}
                label={tone}
                value="1,250.5"
                unit="m²"
                tone={tone}
                status={statusOf[tone]}
              />
            ))}
          </Readout>
        )}
      />
      {sizeValues.map((size) => (
        <Readout key={size} {...args} size={size} className="w-dialog-md">
          <ReadoutItem label="Units" value="412" />
          <ReadoutItem label="Coverage" value="42.5" unit="%" tone="success" status="Within limit" />
          <ReadoutItem label="Contact status" kind="status" value="Contacts checked" tone="success" />
          <ReadoutItem label="Review" kind="status" value="Unresolved" tone="warning" />
          <ReadoutItem label="Assembly" kind="status" value="Fixed layout" />
        </Readout>
      ))}
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      <Readout {...args}>
        <ReadoutItem label="Built-up" value="37,118" unit="m²" />
        <ReadoutItem label="Coverage" value="42.5" unit="%" tone="success" status="Within limit" />
        <ReadoutItem label="Height" value="58.0" unit="m" tone="warning" status="Near limit" />
        <ReadoutItem label="Setback" value="2.1" unit="m" tone="destructive" status="Over limit" />
      </Readout>
      <Readout {...args}>
        <ReadoutItem label="Units" value="412" />
        <ReadoutItem label="Contact status" kind="status" value="Contacts checked" tone="success" />
        <ReadoutItem label="Assembly" kind="status" value="Fixed layout" />
      </Readout>
      <Readout {...args} size="sm" variant="floating">
        <ReadoutItem label="Units" value="412" />
        <ReadoutItem label="Selected" value="3" tone="primary" status="Selected" />
        <ReadoutItem label="Efficiency" value="0.81" tone="info" status="Estimated" />
      </Readout>
    </ThemePair>
  ),
};
