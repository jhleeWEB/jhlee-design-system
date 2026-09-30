import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { Input, Textarea } from "./Input";

/* 3스토리 계약(본보기 Button.stories). Input 모듈은 Textarea 도 내보낸다 — Variants · ThemeContrast 에 함께 그린다. */
const sizeValues = ["sm", "md", "lg"] as const;
const kindValues = ["text", "numeric", "suffix", "invalid", "disabled"] as const;

const meta = {
  title: "Primitives/Input",
  component: Input,
  args: { "aria-label": "Site area", defaultValue: "1250", numeric: true, size: "md" },
  argTypes: { size: { control: "select", options: sizeValues } },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Site area" })).toHaveValue("1250");
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  // color-contrast: Matrix 머리(text-micro muted-foreground)와 판정 톤 글자 — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Matrix
        rows={sizeValues}
        cols={kindValues}
        rowLabel="size"
        colLabel="kind"
        cell={(size, kind) => (
          <Input
            {...args}
            size={size}
            aria-label={`${size} ${kind}`}
            numeric={kind === "numeric" || kind === "suffix"}
            suffix={kind === "suffix" ? "m²" : undefined}
            invalid={kind === "invalid"}
            disabled={kind === "disabled"}
            defaultValue={kind === "text" ? "Dahisar East" : "1250"}
            className="w-40"
          />
        )}
      />
      <Textarea aria-label="Notes" defaultValue="Keep the east setback clear." className="w-80" />
      <Textarea aria-label="Invalid notes" invalid defaultValue="Too long." className="w-80" />
    </div>
  ),
};

export const ThemeContrast: Story = {
  // color-contrast: ThemePair 머리(text-micro muted-foreground, 라이트) — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <ThemePair>
      <Input {...args} className="w-40" />
      <Input {...args} aria-label="Floor height" suffix="m" defaultValue="3.2" className="w-40" />
      <Input aria-label="Name" placeholder="Untitled" className="w-40" />
      <Input {...args} aria-label="Invalid area" invalid className="w-40" />
      <Textarea aria-label="Notes" defaultValue="Keep the east setback clear." className="w-80" />
    </ThemePair>
  ),
};
