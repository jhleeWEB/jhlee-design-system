import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen } from "storybook/test";

import { ThemeSides } from "../../stories/helpers/ThemeSides";
import { Matrix } from "../../stories/helpers/Matrix";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./Select";

/* 3스토리 계약(본보기 Button.stories). 축은 트리거의 `size` · `invalid`.
 * Default · ThemeContrast 는 목록을 **열린 채로** 그린다(DropdownMenu 스토리와 같은 이유 — 상자의 픽셀이 VRT 대상이다).
 * 상자는 트리거 아래로 편다. `avoidCollisions={false}` — 뷰포트 끝에서 위로 뒤집히면 픽셀이 뷰포트 높이에 매인다(DropdownMenu 의 실측).
 * aria-hidden-focus: 열린 Select 는 Radix 가 바깥(트리거가 든 `#storybook-root`)을 aria-hidden 으로 가리는데 트리거는 여전히 초점을 받을 수 있는
 *   button 이다. DropdownMenu 는 `modal={false}` 로 피했지만 Radix Select 에는 모달성 옵션이 없다 — 열린 동안 포커스는 목록 안에 갇혀
 *   트리거에 닿지 않으므로 실사용의 위반이 아니다. 열린 스토리에서만 끈다.
 * `!autodocs` — 문서 페이지에 열린 목록 여럿이 뜨면 포커스가 페이지를 떠난다. */
const sizeValues = ["sm", "md", "lg"] as const;
const stateValues = ["placeholder", "value", "invalid", "disabled"] as const;

const meta = {
  title: "Primitives/Select",
  component: SelectTrigger,
  tags: ["!autodocs"],
  args: { size: "md", "aria-label": "View" },
  argTypes: { size: { control: "select", options: sizeValues } },
} satisfies Meta<typeof SelectTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 목록 부품 전부 — 머리글 · 묶음 · 구분선 · 비활성 항목. */
function Options() {
  return (
    <>
      <SelectGroup>
        <SelectLabel>Drawing</SelectLabel>
        <SelectItem value="plan">Plan</SelectItem>
        <SelectItem value="section">Section</SelectItem>
        <SelectItem value="elevation">Elevation</SelectItem>
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup>
        <SelectLabel>Model</SelectLabel>
        <SelectItem value="massing">Massing</SelectItem>
        <SelectItem value="detail" disabled>
          Detail
        </SelectItem>
      </SelectGroup>
    </>
  );
}

export const Default: Story = {
  parameters: { a11y: { config: { rules: [{ id: "aria-hidden-focus", enabled: false }] } } },
  render: (args) => (
    <div className="w-56">
      <Select open defaultValue="section">
        <SelectTrigger {...args}>
          <SelectValue placeholder="Pick a view" />
        </SelectTrigger>
        <SelectContent avoidCollisions={false}>
          <Options />
        </SelectContent>
      </Select>
    </div>
  ),
  play: async () => {
    const listbox = await screen.findByRole("listbox");
    await expect(listbox).toHaveAttribute("data-slot", "select-content");
    await expect(screen.getByRole("option", { name: "Section" })).toHaveAttribute("aria-selected", "true");
    await expect(screen.getByRole("option", { name: "Detail" })).toHaveAttribute("aria-disabled", "true");
  },
};

/* 트리거의 축 격자 — size × 상태(자리표시 · 값 · 검증 실패 · 비활성). 닫힌 채로 그린다(열린 상자는 Default · ThemeContrast 가 본다). */
export const Variants: Story = {
  tags: ["!manifest"],
  // color-contrast: Matrix 머리(text-micro muted-foreground)와 자리표시 글자 — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <Matrix
      rows={sizeValues}
      cols={stateValues}
      rowLabel="size"
      colLabel="state"
      cell={(size, state) => (
        <div className="w-40">
          <Select
            {...(state === "placeholder" ? {} : { defaultValue: "plan" })}
            disabled={state === "disabled"}
          >
            <SelectTrigger
              {...args}
              size={size}
              invalid={state === "invalid"}
              aria-label={`${size} ${state}`}
            >
              <SelectValue placeholder="Pick a view" />
            </SelectTrigger>
            <SelectContent>
              <Options />
            </SelectContent>
          </Select>
        </div>
      )}
    />
  ),
};

/* 같은 열린 목록을 라이트·다크로 — 포털이 칸을 벗어나므로 상자에 `data-theme` 을 직접 단다. */
export const ThemeContrast: Story = {
  // color-contrast: ThemeSides 칸 머리글(text-muted-foreground 4.33:1)이 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #20 · #24) — DropdownMenu ThemeContrast 와 같은 면제
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: "aria-hidden-focus", enabled: false },
          { id: "color-contrast", enabled: false },
        ],
      },
    },
  },
  render: (args) => (
    <ThemeSides>
      {(theme) => (
        <div className="w-56">
          <Select open defaultValue="section">
            <SelectTrigger {...args} aria-label={`View ${theme}`}>
              <SelectValue placeholder="Pick a view" />
            </SelectTrigger>
            <SelectContent avoidCollisions={false} data-theme={theme}>
              <Options />
            </SelectContent>
          </Select>
        </div>
      )}
    </ThemeSides>
  ),
};
