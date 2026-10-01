import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { SegmentedControl, type SegmentedControlProps } from "./SegmentedControl";

/* 3스토리 계약(본보기 Button.stories). 축은 `size` 하나 — Variants 는 size × 상태(보통 · 한 칸 비활성 · 전체 비활성) 격자다. */
const sizeValues = ["sm", "md"] as const;
const stateValues = ["enabled", "option disabled", "disabled"] as const;
const options = [
  { value: "plan", label: "Plan" },
  { value: "model", label: "Model" },
  { value: "section", label: "Section" },
] as const;

/* 스토리 캔버스에서 눌러 볼 수 있게 값은 스토리가 든다 — 제어 컴포넌트다. */
function Controlled(props: SegmentedControlProps<string>) {
  const [value, setValue] = useState(props.value);
  return (
    <SegmentedControl
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange(next);
      }}
    />
  );
}

const meta = {
  title: "Navigation/SegmentedControl",
  component: SegmentedControl,
  args: { label: "View mode", options, value: "plan", onChange: fn(), size: "md" },
  argTypes: { size: { control: "select", options: sizeValues } },
  render: (args) => <Controlled {...args} />,
} satisfies Meta<SegmentedControlProps<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const model = canvas.getByRole("radio", { name: "Model" });
    await userEvent.click(model);
    await expect(args.onChange).toHaveBeenCalledWith("model");
    await expect(model).toHaveAttribute("aria-checked", "true");
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("radio", { name: "Section" })).toHaveFocus();
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <Matrix
      rows={stateValues}
      cols={sizeValues}
      rowLabel="state"
      colLabel="size"
      cell={(state, size) => (
        <SegmentedControl
          {...args}
          label={`${state} ${size}`}
          size={size}
          disabled={state === "disabled"}
          options={
            state === "option disabled"
              ? options.map((option) => ({ ...option, disabled: option.value === "section" }))
              : options
          }
        />
      )}
    />
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      <SegmentedControl {...args} />
      <SegmentedControl {...args} size="sm" />
    </ThemePair>
  ),
};
