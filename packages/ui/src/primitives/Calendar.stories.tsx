import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Calendar } from "./Calendar";

/* 3스토리 계약(본보기 Button.stories). 축이 없다 — Variants 는 날 칸의 상태(오늘 · 고른 날 · 범위 밖 · 고를 수 없는 날)와 주의 첫날을 나란히 둔다.
 * «오늘» 은 상수다(2026-10-01) — `new Date()` 를 쓰면 시각 회귀가 날마다 갈린다. 날짜는 현지 자정이라 CI(도커 UTC)와 개발 기계가 같은 칸을 그린다. */
const TODAY = new Date(2026, 9, 1);
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

const meta = {
  title: "Primitives/Calendar",
  component: Calendar,
  args: {
    today: TODAY,
    defaultValue: new Date(2026, 9, 14),
    "aria-label": "Start date",
    onValueChange: fn(),
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const grid = canvas.getByRole("grid", { name: "October 2026" });
    await expect(canvas.getByRole("button", { name: "Thursday, October 1, 2026" })).toHaveAttribute(
      "aria-current",
      "date",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Tuesday, October 20, 2026" }));
    await expect(args.onValueChange).toHaveBeenCalledWith(new Date(2026, 9, 20));
    await expect(grid).toBeInTheDocument();
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <div className="flex flex-wrap items-start gap-8">
      <Calendar {...args} aria-label="Plain" defaultValue={null} />
      <Calendar
        {...args}
        aria-label="Range"
        min={new Date(2026, 9, 5)}
        max={new Date(2026, 9, 24)}
        isDateDisabled={isWeekend}
      />
      <Calendar {...args} aria-label="Monday first" weekStartsOn={1} />
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      {(theme) => (
        <Calendar
          {...args}
          aria-label={`Start date ${theme}`}
          min={new Date(2026, 9, 5)}
          isDateDisabled={isWeekend}
        />
      )}
    </ThemePair>
  ),
};
