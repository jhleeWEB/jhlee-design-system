import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen } from "storybook/test";

import { ThemeSides } from "../../stories/helpers/ThemeSides";
import { Matrix } from "../../stories/helpers/Matrix";
import { CommandEmpty, CommandGroup } from "../overlay/Command";
import { Combobox, ComboboxContent, ComboboxItem, ComboboxTrigger } from "./Combobox";
import { Field, FieldControl, FieldDescription, FieldLabel } from "./Field";

/* 3스토리 계약(본보기 Button.stories). 축은 트리거의 `size` · `invalid`(Select 트리거와 같은 사다리) — Variants 는 size × 상태 격자를 닫힌 채로,
 * Default · ThemeContrast 는 상자를 **열린 채로** 그린다(상자의 픽셀이 VRT 대상이다). 트리거는 Field 와 이어 이름 · 설명을 받는다.
 * 상자는 트리거 아래로 편다 — `avoidCollisions={false}` 로 뷰포트 끝에서 뒤집히지 않게 한다(Select 스토리의 실측).
 * ThemeContrast 는 두 상자를 함께 열어 두므로 자동 포커스를 끈다(서로 포커스를 빼앗아 픽셀이 흔들렸다).
 * 열린 상자는 Radix Popover 라 바깥을 aria-hidden 으로 가리지 않는다(모달이 아니다) — Select 의 aria-hidden-focus 면제가 필요 없다.
 * `!autodocs` — 문서 페이지에 열린 상자 여럿이 뜨면 포커스가 페이지를 떠난다. */
const sizeValues = ["sm", "md", "lg"] as const;
const stateValues = ["placeholder", "value", "invalid", "disabled"] as const;

const sheets = [
  { value: "a-101", label: "A-101 Ground floor plan" },
  { value: "a-102", label: "A-102 Typical floor plan" },
  { value: "a-301", label: "A-301 Section A–A" },
  { value: "a-401", label: "A-401 North elevation" },
] as const;
const labelOf = (value: string) => sheets.find((sheet) => sheet.value === value)?.label;

function Sheets() {
  return (
    <>
      <CommandEmpty>No sheet found.</CommandEmpty>
      <CommandGroup heading="Architecture">
        {sheets.map((sheet) => (
          <ComboboxItem key={sheet.value} value={sheet.value}>
            {sheet.label}
          </ComboboxItem>
        ))}
        <ComboboxItem value="s-101" disabled>
          S-101 Structure (locked)
        </ComboboxItem>
      </CommandGroup>
    </>
  );
}

const meta = {
  title: "Primitives/Combobox",
  component: ComboboxTrigger,
  tags: ["!autodocs"],
  args: { size: "md", placeholder: "Pick a sheet" },
  argTypes: { size: { control: "select", options: sizeValues } },
} satisfies Meta<typeof ComboboxTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-64">
      <Field>
        <FieldLabel>Sheet</FieldLabel>
        <Combobox open defaultValue="a-301">
          <FieldControl>
            <ComboboxTrigger {...args}>{labelOf("a-301")}</ComboboxTrigger>
          </FieldControl>
          <ComboboxContent label="Sheets" searchPlaceholder="Search sheets…" avoidCollisions={false}>
            <Sheets />
          </ComboboxContent>
        </Combobox>
        <FieldDescription>The sheet the markup is attached to.</FieldDescription>
      </Field>
    </div>
  ),
  play: async () => {
    const trigger = screen.getByRole("combobox", { name: "Sheet" });
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const listbox = await screen.findByRole("listbox", { name: "Sheets" });
    await expect(listbox).toHaveAttribute("data-slot", "command-list");
    const chosen = screen.getByRole("option", { name: "A-301 Section A–A" });
    await expect(chosen).toHaveAttribute("data-checked", "");
    await expect(chosen).toHaveAttribute("aria-selected", "true");
  },
};

/* 트리거의 축 격자 — size × 상태(자리표시 · 값 · 검증 실패 · 비활성). 닫힌 채로 그린다(열린 상자는 Default · ThemeContrast 가 본다). */
export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <Matrix
      rows={sizeValues}
      cols={stateValues}
      rowLabel="size"
      colLabel="state"
      cell={(size, state) => (
        <div className="w-48">
          <Combobox defaultValue={state === "placeholder" ? "" : "a-101"}>
            <ComboboxTrigger
              {...args}
              size={size}
              invalid={state === "invalid"}
              disabled={state === "disabled"}
              aria-label={`${size} ${state}`}
            >
              {labelOf("a-101")}
            </ComboboxTrigger>
            <ComboboxContent>
              <Sheets />
            </ComboboxContent>
          </Combobox>
        </div>
      )}
    />
  ),
};

/* 같은 열린 상자를 라이트·다크로 — 포털이 칸을 벗어나므로 상자에 `data-theme` 을 직접 단다. */
export const ThemeContrast: Story = {
  render: (args) => (
    <ThemeSides>
      {(theme) => (
        <div className="w-64">
          <Combobox open defaultValue="a-301">
            <ComboboxTrigger {...args} aria-label={`Sheet ${theme}`}>
              {labelOf("a-301")}
            </ComboboxTrigger>
            <ComboboxContent
              label={`Sheets ${theme}`}
              avoidCollisions={false}
              data-theme={theme}
              // 두 상자를 함께 열면 서로 첫 포커스를 빼앗아 강조·스크롤이 흔들린다(VRT 실측) — 스토리 전용으로 자동 포커스를 끈다.
              onOpenAutoFocus={(event) => event.preventDefault()}
            >
              <Sheets />
            </ComboboxContent>
          </Combobox>
        </div>
      )}
    </ThemeSides>
  ),
};
