import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { Input, Textarea } from "./Input";

/* 3스토리 계약(본보기 Button.stories). Input 모듈은 Textarea 도 내보낸다 — Variants · ThemeContrast 에 함께 그린다. */
const sizeValues = ["sm", "md", "lg"] as const;
const kindValues = ["text", "numeric", "suffix", "invalid", "disabled"] as const;

/* 값의 끝 → 단위의 앞 간격(px). 수치는 오른쪽 정렬이라 값의 끝은 입력 내용 상자의 오른쪽 끝이다 — 글자 폭을 재지 않아도 된다.
   패딩 공식이 단위의 글자 크기가 아니라 입력의 `ch` 로 셀 때 이 값이 1.4(m) · 3.8(m²) 로 흔들렸다(#90). */
const suffixGap = (input: HTMLElement): number => {
  const suffix = input.nextElementSibling;
  if (!(suffix instanceof HTMLElement)) throw new Error(`${input.getAttribute("aria-label")} 에 단위가 없다`);
  const style = getComputedStyle(input);
  const valueEnd =
    input.getBoundingClientRect().right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight);
  return suffix.getBoundingClientRect().left - valueEnd;
};

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
  play: async ({ canvas }) => {
    for (const size of sizeValues) {
      const gap = suffixGap(canvas.getByRole("textbox", { name: `${size} suffix` }));
      await expect(Math.abs(gap - 4)).toBeLessThan(0.5);
    }
  },
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
  play: async ({ canvas }) => {
    // 한 글자 단위 — 옛 공식에서 값에 붙던 경우다.
    for (const input of canvas.getAllByRole("textbox", { name: "Floor height" }))
      await expect(Math.abs(suffixGap(input) - 4)).toBeLessThan(0.5);
  },
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
