import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, waitFor } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { DatePicker } from "./DatePicker";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "./Field";

/* 3스토리 계약(본보기 Button.stories). 축은 트리거의 `size` · `invalid`.
 * Default 는 팝오버를 **열린 채로** 그린다(Select · Popover 스토리와 같은 이유 — 달력 상자의 픽셀이 VRT 대상이다). 트리거는 `#storybook-root` 안에
 * 있고 상자는 포털로 뜬다. 다크의 열린 상자는 VRT 의 다크 실행(html[data-theme])이 Default 로 찍는다 — 상자는 DatePicker 가 소유해
 * ThemeSides 처럼 상자에 `data-theme` 을 달 수 없으므로 ThemeContrast 는 닫힌 트리거를 나란히 둔다.
 * «오늘» 은 상수다(2026-10-01) — `new Date()` 를 쓰면 시각 회귀가 날마다 갈린다.
 * `!autodocs` — 문서 페이지에 열린 팝오버가 뜨면 포커스가 페이지를 떠난다. */
const TODAY = new Date(2026, 9, 1);
const VALUE = new Date(2026, 9, 14);
const sizeValues = ["sm", "md", "lg"] as const;
const stateValues = ["placeholder", "value", "invalid", "disabled"] as const;

const meta = {
  title: "Primitives/DatePicker",
  component: DatePicker,
  tags: ["!autodocs"],
  args: { today: TODAY, size: "md", "aria-label": "Start date", onValueChange: fn() },
  argTypes: { size: { control: "select", options: sizeValues } },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultValue: VALUE, defaultOpen: true },
  render: (args) => (
    <div className="h-96 w-56">
      <DatePicker {...args} />
    </div>
  ),
  play: async () => {
    const dialog = await screen.findByRole("dialog", { name: "Choose date" });
    await expect(dialog).toHaveAttribute("data-slot", "popover");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Wednesday, October 14, 2026" })).toHaveFocus(),
    );
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Matrix
        rows={sizeValues}
        cols={stateValues}
        rowLabel="size"
        colLabel="state"
        cell={(size, state) => (
          <div className="w-40">
            <DatePicker
              {...args}
              {...(state === "placeholder" ? {} : { defaultValue: VALUE })}
              size={size}
              invalid={state === "invalid"}
              disabled={state === "disabled"}
              aria-label={`${size} ${state}`}
            />
          </div>
        )}
      />
      <div className="flex w-64 flex-col gap-4">
        <Field>
          <FieldLabel>Start date</FieldLabel>
          <FieldControl>
            <DatePicker today={TODAY} defaultValue={VALUE} />
          </FieldControl>
          <FieldDescription>First day on site.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel>Handover</FieldLabel>
          <FieldControl>
            <DatePicker today={TODAY} />
          </FieldControl>
          <FieldError>Pick a handover date.</FieldError>
        </Field>
      </div>
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      {(theme) => (
        <div className="flex w-48 flex-col gap-3">
          <DatePicker {...args} aria-label={`Placeholder ${theme}`} />
          <DatePicker {...args} defaultValue={VALUE} aria-label={`Value ${theme}`} />
          <DatePicker {...args} defaultValue={VALUE} invalid aria-label={`Invalid ${theme}`} />
        </div>
      )}
    </ThemePair>
  ),
};
