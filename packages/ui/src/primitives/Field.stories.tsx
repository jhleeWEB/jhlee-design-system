import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { Checkbox } from "./Choice";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "./Field";
import { Input, Textarea } from "./Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";

/* 3스토리 계약(본보기 Button.stories). 축은 `orientation` 하나 — Variants 는 컨트롤 종류(입력 · 여러 줄 · 선택 · 체크박스) × 상태
 * (설명 · 검증 실패 · 비활성) 격자이고, 체크박스 줄이 `horizontal` 을 본다. 필드의 일은 id 연결이라 play 가 ARIA 를 확인한다. */
const kindValues = ["input", "textarea", "select", "checkbox"] as const;
const stateValues = ["description", "invalid", "disabled"] as const;
type Kind = (typeof kindValues)[number];

function Control({ kind }: { kind: Kind }) {
  switch (kind) {
    case "input":
      return (
        <FieldControl>
          <Input defaultValue="1250" numeric suffix="m²" />
        </FieldControl>
      );
    case "textarea":
      return (
        <FieldControl>
          <Textarea defaultValue="Keep the east setback clear." />
        </FieldControl>
      );
    case "select":
      return (
        <Select defaultValue="plan">
          <FieldControl>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
          </FieldControl>
          <SelectContent>
            <SelectItem value="plan">Plan</SelectItem>
            <SelectItem value="section">Section</SelectItem>
          </SelectContent>
        </Select>
      );
    case "checkbox":
      return (
        <FieldControl>
          <Checkbox defaultChecked />
        </FieldControl>
      );
  }
}

const meta = {
  title: "Primitives/Field",
  component: Field,
  args: { orientation: "vertical" },
  argTypes: { orientation: { control: "select", options: ["vertical", "horizontal"] } },
  render: (args) => (
    <div className="w-64">
      <Field {...args}>
        <FieldLabel>Site area</FieldLabel>
        <FieldControl>
          <Input defaultValue="1250" numeric suffix="m²" />
        </FieldControl>
        <FieldDescription>Gross area inside the boundary.</FieldDescription>
      </Field>
    </div>
  ),
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // color-contrast: 설명 글자(text-muted-foreground)가 페이지 바탕 위에서 4.5:1 미만 — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Site area" });
    const description = canvas.getByText("Gross area inside the boundary.");
    await expect(input).toHaveAttribute("aria-describedby", description.id);
    await expect(input).not.toHaveAttribute("aria-invalid");
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  // color-contrast: Matrix 머리 · 설명(text-muted-foreground) · 비활성 글자 — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <Matrix
      rows={kindValues}
      cols={stateValues}
      rowLabel="control"
      colLabel="state"
      cell={(kind, state) => (
        <Field
          {...args}
          orientation={kind === "checkbox" ? "horizontal" : "vertical"}
          invalid={state === "invalid"}
          disabled={state === "disabled"}
          className="w-56"
        >
          {kind === "checkbox" ? <Control kind={kind} /> : null}
          <FieldLabel>{`${kind} ${state}`}</FieldLabel>
          {kind === "checkbox" ? null : <Control kind={kind} />}
          <FieldDescription>Shown to the reviewer.</FieldDescription>
          {state === "invalid" ? <FieldError>Required before export.</FieldError> : null}
        </Field>
      )}
    />
  ),
};

export const ThemeContrast: Story = {
  // color-contrast: ThemePair 머리 · 설명(text-muted-foreground, 라이트) — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <ThemePair>
      <Field {...args} className="w-56">
        <FieldLabel>Site area</FieldLabel>
        <FieldControl>
          <Input defaultValue="1250" numeric suffix="m²" />
        </FieldControl>
        <FieldDescription>Gross area inside the boundary.</FieldDescription>
      </Field>
      <Field {...args} invalid className="w-56">
        <FieldLabel>Setback</FieldLabel>
        <FieldControl>
          <Input defaultValue="0" numeric suffix="m" />
        </FieldControl>
        <FieldError>Must be at least 3 m.</FieldError>
      </Field>
      <Field orientation="horizontal">
        <FieldControl>
          <Checkbox defaultChecked />
        </FieldControl>
        <FieldLabel>Show grid</FieldLabel>
      </Field>
    </ThemePair>
  ),
};
