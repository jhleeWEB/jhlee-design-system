import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { Checkbox, RadioGroup, RadioGroupItem, Switch } from "./Choice";

/* 3스토리 계약(본보기 Button.stories). Choice 모듈의 대표는 Checkbox — 라디오·스위치는 Variants · ThemeContrast 에 함께 그린다.
 * 셋의 뜻이 다르다(Choice.tsx 머리 주석): 체크박스는 독립 켬, 라디오는 하나 고름, 스위치는 즉시 적용. */
const kindValues = ["checkbox", "radio", "switch"] as const;
const stateValues = ["off", "on", "disabled off", "disabled on"] as const;
type Kind = (typeof kindValues)[number];
type State = (typeof stateValues)[number];

const meta = {
  title: "Primitives/Choice",
  component: Checkbox,
  args: { "aria-label": "Snap to grid", defaultChecked: true },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("checkbox", { name: "Snap to grid" })).toBeChecked();
  },
};

function Cell({ kind, state }: { kind: Kind; state: State }) {
  const on = state.endsWith("on");
  const disabled = state.startsWith("disabled");
  const label = `${kind} ${state}`;
  if (kind === "checkbox") return <Checkbox aria-label={label} checked={on} disabled={disabled} />;
  if (kind === "switch") return <Switch aria-label={label} checked={on} disabled={disabled} />;
  return (
    <RadioGroup aria-label={label} value={on ? "a" : ""} disabled={disabled}>
      <RadioGroupItem value="a" aria-label={label} />
    </RadioGroup>
  );
}

export const Variants: Story = {
  tags: ["!manifest"],
  // color-contrast: Matrix 머리(text-micro muted-foreground)와 판정 톤 글자 — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Matrix
        rows={kindValues}
        cols={stateValues}
        rowLabel="kind"
        colLabel="state"
        cell={(kind, state) => <Cell kind={kind} state={state} />}
      />
      <div className="flex items-center gap-3 font-sans text-body text-foreground">
        <Checkbox {...args} aria-label="Indeterminate" checked="indeterminate" />
        <span>indeterminate</span>
      </div>
    </div>
  ),
};

export const ThemeContrast: Story = {
  // color-contrast: ThemePair 머리(text-micro muted-foreground, 라이트) — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <ThemePair>
      <Checkbox {...args} />
      <Checkbox aria-label="Show dimensions" />
      <RadioGroup aria-label="Units" defaultValue="m" className="flex gap-2">
        <RadioGroupItem value="m" aria-label="Metres" />
        <RadioGroupItem value="ft" aria-label="Feet" />
      </RadioGroup>
      <Switch aria-label="Live update" defaultChecked />
      <Switch aria-label="Snap" />
    </ThemePair>
  ),
};
