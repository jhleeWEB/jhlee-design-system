import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { Calendar } from "./Calendar";
import * as stories from "./Calendar.stories";

/* 공통 계약(slot · slot-locked · className · ref · rest · axes · axe) — 스토리 `Default` 가 유일한 픽스처다. */
describeComponentContract(stories, { slot: "calendar" });

afterEach(cleanup);

const TODAY = new Date(2026, 9, 1);
const day = (name: string) => screen.getByRole("button", { name });

describe("Calendar 동작", () => {
  it("한 칸만 Tab 순서에 있다 — 고른 날, 없으면 오늘", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Calendar today={TODAY} />);
    await user.tab(); // 이전 달
    await user.tab(); // 다음 달
    await user.tab();
    expect(day("Thursday, October 1, 2026")).toHaveFocus();
    expect(day("Thursday, October 1, 2026")).toHaveAttribute("aria-current", "date");

    rerender(<Calendar today={TODAY} value={new Date(2026, 9, 14)} />);
    expect(day("Wednesday, October 14, 2026")).toHaveAttribute("tabindex", "0");
    expect(day("Wednesday, October 14, 2026").closest("td")).toHaveAttribute("aria-selected", "true");
  });

  it("화살표는 하루 · 한 주, Home/End 는 주의 처음 · 끝으로 칸을 옮긴다", async () => {
    const user = userEvent.setup();
    render(<Calendar today={TODAY} />);
    day("Thursday, October 1, 2026").focus();
    await user.keyboard("{ArrowRight}{ArrowDown}");
    expect(day("Friday, October 9, 2026")).toHaveFocus();
    await user.keyboard("{Home}");
    expect(day("Sunday, October 4, 2026")).toHaveFocus();
    await user.keyboard("{End}");
    expect(day("Saturday, October 10, 2026")).toHaveFocus();
    // 달 경계를 화살표로 넘으면 보이는 달도 넘어간다.
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(screen.getByRole("grid", { name: "September 2026" })).toBeInTheDocument();
    expect(day("Saturday, September 26, 2026")).toHaveFocus();
  });

  it("PageUp/PageDown 은 한 달(Shift 면 한 해)을 넘기고, Enter 로 고른다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onMonthChange = vi.fn<(month: Date) => void>();
    render(<Calendar today={TODAY} onValueChange={onValueChange} onMonthChange={onMonthChange} />);
    day("Thursday, October 1, 2026").focus();
    await user.keyboard("{PageDown}");
    expect(screen.getByRole("grid", { name: "November 2026" })).toBeInTheDocument();
    expect(day("Sunday, November 1, 2026")).toHaveFocus();
    await user.keyboard("{Shift>}{PageUp}{/Shift}");
    expect(day("Saturday, November 1, 2025")).toHaveFocus();
    expect(onMonthChange.mock.calls.map(([m]) => m.getTime())).toEqual([
      new Date(2026, 10, 1).getTime(),
      new Date(2025, 10, 1).getTime(),
    ]);
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(new Date(2025, 10, 1));
    expect(day("Saturday, November 1, 2025")).toHaveAttribute("data-selected", "");
  });

  it("범위 밖과 고를 수 없는 날은 고르지 못하고, 키보드 이동은 범위에서 멈춘다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Calendar
        today={TODAY}
        min={new Date(2026, 9, 1)}
        max={new Date(2026, 9, 31)}
        isDateDisabled={(d) => d.getDate() === 2}
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByRole("button", { name: "Previous month" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();

    await user.click(day("Friday, October 2, 2026"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(day("Friday, October 2, 2026")).toHaveAttribute("aria-disabled", "true");

    day("Thursday, October 1, 2026").focus();
    await user.keyboard("{ArrowLeft}");
    expect(day("Thursday, October 1, 2026")).toHaveFocus();
    await user.keyboard("{PageDown}{PageDown}");
    expect(day("Saturday, October 31, 2026")).toHaveFocus();
  });

  it("머리의 이전 · 다음 버튼이 달을 넘긴다 — 제어 모드에서는 month 를 따른다", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [month, setMonth] = useState(new Date(2026, 0, 1));
      return <Calendar today={TODAY} month={month} onMonthChange={setMonth} weekStartsOn={1} />;
    }
    render(<Controlled />);
    expect(screen.getByRole("grid", { name: "January 2026" })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader").map((th) => th.textContent)).toEqual([
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa",
      "Su",
    ]);
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByRole("grid", { name: "December 2025" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next month" }));
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("grid", { name: "February 2026" })).toBeInTheDocument();
  });
});
