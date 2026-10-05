import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "./Field";
import { FileInput } from "./FileInput";

/* 3스토리 계약(본보기 Button.stories). 파일 input 의 값은 스크립트가 정할 수 없다 — «고른 뒤» 의 모습은 play 가 실제로 파일을 올려 만든다
 * (user-event 의 upload 는 change 이벤트까지 낸다). 끌어 올린 동안의 모습은 `data-dragging` 을 낼 수 없어(드래그 이벤트는 사람이 낸다) 옆 spec 이 본다. */
const sizeValues = ["sm", "md", "lg"] as const;

/* 내용 없는 견본 파일 — 이름과 크기(1.5 MB)만 쓴다. */
const planImage = () => new File([new Uint8Array(1572864)], "tower-a-level-03.png", { type: "image/png" });

const meta = {
  title: "Primitives/FileInput",
  component: FileInput,
  args: { "aria-label": "Plan image", accept: "image/*", size: "md", className: "w-80" },
  argTypes: { size: { control: "select", options: sizeValues } },
} satisfies Meta<typeof FileInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    await expect(input).toHaveAccessibleName("Plan image");
    await expect(canvasElement.querySelector('[data-slot="file-input-value"]')).toHaveTextContent(
      "No file chosen",
    );
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  play: async ({ canvasElement }) => {
    // «filled» 줄의 input 에만 파일을 올린다 — 이름 · 크기 · 지우기 버튼이 선다.
    for (const input of canvasElement.querySelectorAll<HTMLInputElement>('input[data-fill="yes"]'))
      await userEvent.upload(input, planImage());
    await expect(canvasElement.querySelectorAll('[data-slot="file-input"][data-filled]')).toHaveLength(4);
  },
  render: (args) => (
    <div className="flex flex-col gap-6 font-sans text-body text-foreground">
      {sizeValues.map((size) => (
        <div key={size} className="flex items-center gap-4">
          <span className="w-12 font-mono text-micro text-muted-foreground">{size}</span>
          <FileInput {...args} size={size} aria-label={`${size} empty`} />
          <FileInput {...args} size={size} aria-label={`${size} filled`} data-fill="yes" />
        </div>
      ))}
      <div className="flex items-center gap-4">
        <span className="w-12 font-mono text-micro text-muted-foreground">state</span>
        <FileInput {...args} aria-label="invalid" invalid data-fill="yes" />
        <FileInput {...args} aria-label="disabled" disabled />
      </div>
      <Field className="w-80">
        <FieldLabel>Plan image</FieldLabel>
        <FieldControl>
          <FileInput accept="image/*" />
        </FieldControl>
        <FieldDescription>PNG or JPG, one sheet per file.</FieldDescription>
      </Field>
      <Field className="w-80">
        <FieldLabel>Survey drawings</FieldLabel>
        <FieldControl>
          <FileInput accept=".pdf" multiple chooseLabel="Choose files" placeholder="No files chosen" />
        </FieldControl>
        <FieldError>Add at least one drawing.</FieldError>
      </Field>
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      {(theme) => (
        <div className="flex flex-col gap-3">
          <FileInput {...args} aria-label={`Plan image ${theme}`} />
          <FileInput {...args} aria-label={`Invalid ${theme}`} invalid />
          <FileInput {...args} aria-label={`Disabled ${theme}`} disabled />
        </div>
      )}
    </ThemePair>
  ),
};
