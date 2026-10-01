import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { NumberInput } from "./NumberInput";

/* 3스토리 계약(본보기 Button.stories). 축은 `size`(Input 과 같은 높이 사다리) — Variants 는 size × 상태(단위 · 버튼 없음 · 경계 · 검증 실패 · 비활성) 격자다. */
const sizeValues = ["sm", "md", "lg"] as const;
const stateValues = ["unit", "no stepper", "at max", "invalid", "disabled"] as const;

const meta = {
  title: "Primitives/NumberInput",
  component: NumberInput,
  args: {
    "aria-label": "Floor height",
    defaultValue: 3.2,
    min: 2.4,
    max: 6,
    step: 0.1,
    unit: "m",
    size: "md",
    onValueChange: fn(),
    className: "w-56",
  },
  argTypes: { size: { control: "select", options: sizeValues } },
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole("spinbutton", { name: "Floor height" });
    await expect(input).toHaveValue(3.2);
    await userEvent.click(canvas.getByRole("button", { name: "Increase" }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(3.3);
    await userEvent.click(canvas.getByRole("button", { name: "Decrease" }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(3.2);
    await expect(input).toHaveValue(3.2);
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <Matrix
      rows={sizeValues}
      cols={stateValues}
      rowLabel="size"
      colLabel="state"
      cell={(size, state) => (
        <NumberInput
          {...args}
          size={size}
          aria-label={`${size} ${state}`}
          unit={state === "no stepper" ? undefined : args.unit}
          stepper={state !== "no stepper"}
          defaultValue={state === "at max" ? 6 : 3.2}
          invalid={state === "invalid"}
          disabled={state === "disabled"}
          className="w-44"
        />
      )}
    />
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      {(theme) => (
        <>
          <NumberInput {...args} aria-label={`Floor height ${theme}`} />
          <NumberInput
            {...args}
            aria-label={`Coverage ${theme}`}
            defaultValue={45}
            min={0}
            max={100}
            step={1}
            unit="%"
          />
          <NumberInput
            {...args}
            aria-label={`Area ${theme}`}
            defaultValue={1250}
            min={0}
            max={undefined}
            step={1}
            unit="m²"
            invalid
          />
        </>
      )}
    </ThemePair>
  ),
};
