import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { Checkbox, RadioGroup, RadioGroupItem, Switch } from "./Choice";
import { Field, FieldControl, FieldLabel } from "./Field";

/* 3스토리 계약(본보기 Button.stories). Choice 모듈의 대표는 Checkbox — 라디오·스위치는 Variants · ThemeContrast 에 함께 그린다.
 * 셋의 뜻이 다르다(Choice.tsx 머리 주석): 체크박스는 독립 켬, 라디오는 하나 고름, 스위치는 즉시 적용.
 * 축은 셋 다 `size`(sm 14 · md 16 · lg 20px, 스위치는 28×16 · 36×20 · 44×24px, #80) — Variants 는 종류마다 size × 상태 격자와
 * 라벨을 붙인 한 줄(Field 가로 배치)을 그린다. 섞임(indeterminate)은 체크박스에만 있다. */
const sizeValues = ["sm", "md", "lg"] as const;
const checkboxStates = [
  "unchecked",
  "checked",
  "indeterminate",
  "disabled unchecked",
  "disabled checked",
  "disabled indeterminate",
] as const;
const binaryStates = ["off", "on", "disabled off", "disabled on"] as const;

const meta = {
  title: "Primitives/Choice",
  component: Checkbox,
  args: { "aria-label": "Snap to grid", defaultChecked: true },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const box = canvas.getByRole("checkbox", { name: "Snap to grid" });
    await expect(box).toBeChecked();
    await expect(box).toHaveAttribute("data-size", "md");
  },
};

function checkedOf(state: (typeof checkboxStates)[number]): boolean | "indeterminate" {
  if (state.endsWith("indeterminate")) return "indeterminate";
  return state.endsWith("checked") && !state.endsWith("unchecked");
}

export const Variants: Story = {
  tags: ["!manifest"],
  render: () => (
    <div className="flex flex-col gap-6">
      <Matrix
        rows={sizeValues}
        cols={checkboxStates}
        rowLabel="checkbox · size"
        colLabel="state"
        cell={(size, state) => (
          <Checkbox
            size={size}
            aria-label={`Checkbox ${size} ${state}`}
            checked={checkedOf(state)}
            disabled={state.startsWith("disabled")}
          />
        )}
      />
      <Matrix
        rows={sizeValues}
        cols={binaryStates}
        rowLabel="radio · size"
        colLabel="state"
        cell={(size, state) => (
          <RadioGroup
            aria-label={`Radio ${size} ${state}`}
            value={state.endsWith("on") ? "a" : ""}
            disabled={state.startsWith("disabled")}
          >
            <RadioGroupItem size={size} value="a" aria-label={`Radio ${size} ${state}`} />
          </RadioGroup>
        )}
      />
      <Matrix
        rows={sizeValues}
        cols={binaryStates}
        rowLabel="switch · size"
        colLabel="state"
        cell={(size, state) => (
          <Switch
            size={size}
            aria-label={`Switch ${size} ${state}`}
            checked={state.endsWith("on")}
            disabled={state.startsWith("disabled")}
          />
        )}
      />
      {/* 라벨과 한 줄 — 필드 라벨(text-label)의 가운데에 상자가 서는지, 라벨을 눌러도 바뀌는지 본다. */}
      <div className="flex flex-col gap-3 font-sans">
        {sizeValues.map((size) => (
          <div key={size} className="flex items-center gap-6">
            <Field orientation="horizontal">
              <FieldControl>
                <Checkbox size={size} defaultChecked />
              </FieldControl>
              <FieldLabel>{`Show dimensions · ${size}`}</FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <FieldControl>
                <Switch size={size} defaultChecked />
              </FieldControl>
              <FieldLabel>{`Live update · ${size}`}</FieldLabel>
            </Field>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      <Checkbox {...args} />
      <Checkbox aria-label="Show dimensions" />
      <Checkbox aria-label="Some layers" checked="indeterminate" />
      <RadioGroup aria-label="Units" defaultValue="m" className="flex gap-2">
        <RadioGroupItem value="m" aria-label="Metres" />
        <RadioGroupItem value="ft" aria-label="Feet" />
      </RadioGroup>
      <Switch aria-label="Live update" defaultChecked />
      <Switch aria-label="Snap" />
    </ThemePair>
  ),
};
