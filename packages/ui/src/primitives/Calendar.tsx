"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "../icons/icons";

import { cn } from "../cn";
import {
  MONTH_NAMES,
  WEEKDAY_NAMES,
  addDays,
  addMonths,
  clampDay,
  compareDays,
  formatLongDate,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
} from "../lib/date";
import { Button } from "./Button";
import { calendarDayVariants } from "./Calendar.variants";

/* 달력 — 한 달의 격자에서 날짜 하나를 고른다(#62).
 *
 * 의존성(react-day-picker)을 들이지 않고 손으로 짰다. 근거는 PR 에 적었고 요지는 이렇다: 우리가 필요한 것은 «하루 고르기 · 영어 고정 라벨 ·
 * 토큰 유틸만 쓰는 칸» 뿐인데, react-day-picker 10 은 date-fns · @date-fns/tz 를 끌고 오고(로캘 · 시간대 · 범위 · 여러 달 —
 * 쓰지 않을 기능), 자기 클래스 모델 위에 우리 토큰을 다시 입혀야 하며, data-slot · ref · className 계약을 부품마다 다시 뚫어야 한다.
 *
 * 접근성은 WAI-ARIA APG «Date Picker Dialog» 의 격자를 따른다: `<table role="grid">` 를 달 이름이 이름 짓고(aria-labelledby),
 * 날 칸은 roving tabindex(한 칸만 Tab 순서에 있다) · 화살표(하루 · 한 주) · PageUp/PageDown(한 달, Shift 면 한 해) · Home/End(주의 처음 · 끝).
 * 고른 날은 칸(td)의 `aria-selected`, 오늘은 `aria-current="date"`, 날의 이름은 «Thursday, October 1, 2026» 이다.
 * 뿌리는 `role="group"` 이라 `aria-label`(«Start date» 처럼 무엇을 고르는 달력인가)을 받을 수 있다.
 * 격자는 늘 6주다 — 달마다 높이가 바뀌면 팝오버가 달을 넘길 때마다 출렁인다. */

/** `Calendar` 의 props — `<div>` 속성(ref 포함, `defaultValue` · `onChange` 제외) + 값 · 보이는 달 · 범위. 날짜는 현지 자정의 `Date` 다. */
export interface CalendarProps extends Omit<React.ComponentPropsWithRef<"div">, "defaultValue" | "onChange"> {
  /**
   * 고른 날(제어). `null` 은 «고른 날 없음».
   * @default undefined
   */
  value?: Date | null | undefined;
  /**
   * 고른 날의 첫 값(비제어).
   * @default null
   */
  defaultValue?: Date | null | undefined;
  /**
   * 날을 골랐을 때 — 그 날의 현지 자정.
   * @default undefined
   */
  onValueChange?: ((date: Date) => void) | undefined;
  /**
   * 보이는 달(제어) — 그 달의 아무 날.
   * @default undefined
   */
  month?: Date | undefined;
  /**
   * 처음 보일 달(비제어). 주지 않으면 고른 날의 달, 그것도 없으면 오늘의 달이다.
   * @default undefined
   */
  defaultMonth?: Date | undefined;
  /**
   * 보이는 달이 바뀔 때 — 그 달 1일.
   * @default undefined
   */
  onMonthChange?: ((month: Date) => void) | undefined;
  /**
   * 고를 수 있는 가장 이른 날. 그 앞은 흐리고 고를 수 없으며 키보드 이동도 여기서 멈춘다.
   * @default undefined
   */
  min?: Date | undefined;
  /**
   * 고를 수 있는 가장 늦은 날.
   * @default undefined
   */
  max?: Date | undefined;
  /**
   * 범위 안에서도 고를 수 없는 날 — 주말 · 휴일처럼.
   * @default undefined
   */
  isDateDisabled?: ((date: Date) => boolean) | undefined;
  /**
   * 오늘 — `aria-current="date"` 가 서는 날. 스토리 · 테스트는 고정한다(시각 회귀가 날마다 갈리지 않게).
   * @default new Date()
   */
  today?: Date | undefined;
  /**
   * 주의 첫날.
   * - `0` — 일요일
   * - `1` — 월요일
   * @default 0
   */
  weekStartsOn?: 0 | 1;
  /**
   * 마운트하자마자 고른 날(없으면 오늘 · 그 달 1일) 칸에 초점을 둔다 — DatePicker 가 팝오버를 열 때.
   * @default false
   */
  initialFocus?: boolean;
}

/**
 * 달력 — 한 달 격자에서 날짜 하나를 고른다. 머리의 이전 · 다음 버튼과 PageUp/PageDown 으로 달을 넘긴다.
 * 날짜는 시각 없는 현지 자정이고 라벨은 로캘과 무관한 영어다.
 * @slot calendar
 */
export function Calendar({
  value,
  defaultValue = null,
  onValueChange,
  month,
  defaultMonth,
  onMonthChange,
  min,
  max,
  isDateDisabled,
  today: todayProp,
  weekStartsOn = 0,
  initialFocus = false,
  className,
  ...rest
}: CalendarProps) {
  const headingId = useId();
  const gridRef = useRef<HTMLTableElement>(null);
  const today = useMemo(() => startOfDay(todayProp ?? new Date()), [todayProp]);

  const [innerValue, setInnerValue] = useState<Date | null>(defaultValue);
  const selected = value !== undefined ? value : innerValue;
  const [innerMonth, setInnerMonth] = useState(() => startOfMonth(defaultMonth ?? selected ?? today));
  const shown = startOfMonth(month ?? innerMonth);
  const [focusDay, setFocusDay] = useState<Date | null>(null);
  /* 키보드로 칸을 옮긴 렌더 뒤에만 초점을 따라 옮긴다 — 값 · 달이 밖에서 바뀐 렌더가 초점을 훔치면 안 된다. */
  const moveFocus = useRef(false);

  const isDisabled = (date: Date) =>
    (min !== undefined && compareDays(date, min) < 0) ||
    (max !== undefined && compareDays(date, max) > 0) ||
    (isDateDisabled?.(date) ?? false);

  const fallback =
    selected && isSameMonth(selected, shown) ? selected : isSameMonth(today, shown) ? today : shown;
  const active = focusDay && isSameMonth(focusDay, shown) ? focusDay : fallback;

  const focusActive = (options?: FocusOptions) =>
    gridRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus(options);

  useEffect(() => {
    if (initialFocus) focusActive({ preventScroll: true });
    // 마운트 한 번만 — 이후의 초점은 사용자의 것이다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    focusActive();
  });

  const showMonth = (next: Date) => {
    const first = startOfMonth(next);
    if (month === undefined) setInnerMonth(first);
    onMonthChange?.(first);
  };

  const moveTo = (next: Date) => {
    const target = clampDay(next, min, max);
    setFocusDay(target);
    if (!isSameMonth(target, shown)) showMonth(target);
    moveFocus.current = true;
  };

  const select = (date: Date) => {
    if (isDisabled(date)) return;
    setFocusDay(date);
    if (value === undefined) setInnerValue(date);
    onValueChange?.(date);
  };

  const onGridKeyDown = (event: React.KeyboardEvent<HTMLTableElement>) => {
    const fromWeekStart = (active.getDay() - weekStartsOn + 7) % 7;
    const next: Record<string, () => Date> = {
      ArrowLeft: () => addDays(active, -1),
      ArrowRight: () => addDays(active, 1),
      ArrowUp: () => addDays(active, -7),
      ArrowDown: () => addDays(active, 7),
      PageUp: () => addMonths(active, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(active, event.shiftKey ? 12 : 1),
      Home: () => addDays(active, -fromWeekStart),
      End: () => addDays(active, 6 - fromWeekStart),
    };
    const go = next[event.key];
    if (!go) return;
    event.preventDefault();
    moveTo(go());
  };

  const firstCell = addDays(shown, -((shown.getDay() - weekStartsOn + 7) % 7));
  const weeks = Array.from({ length: 6 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(firstCell, w * 7 + d)),
  );
  const weekdays = Array.from({ length: 7 }, (_, i) => WEEKDAY_NAMES[(i + weekStartsOn) % 7] ?? "");

  const prevMonth = addMonths(shown, -1);
  const nextMonth = addMonths(shown, 1);
  const prevDisabled = min !== undefined && compareDays(addDays(shown, -1), min) < 0;
  const nextDisabled = max !== undefined && compareDays(nextMonth, max) > 0;

  return (
    <div
      role="group"
      className={cn("inline-flex flex-col gap-2 text-foreground", className)}
      {...rest}
      data-slot="calendar"
    >
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Previous month"
          disabled={prevDisabled}
          onClick={() => {
            showMonth(prevMonth);
            setFocusDay(clampDay(addMonths(active, -1), min, max));
          }}
        >
          <IconChevronLeft />
        </Button>
        <div id={headingId} aria-live="polite" className="text-body font-semibold">
          {MONTH_NAMES[shown.getMonth()]} <span className="tnum">{shown.getFullYear()}</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Next month"
          disabled={nextDisabled}
          onClick={() => {
            showMonth(nextMonth);
            setFocusDay(clampDay(addMonths(active, 1), min, max));
          }}
        >
          <IconChevronRight />
        </Button>
      </div>
      <table
        ref={gridRef}
        role="grid"
        aria-labelledby={headingId}
        className="border-collapse"
        onKeyDown={onGridKeyDown}
      >
        <thead>
          <tr>
            {weekdays.map((name) => (
              <th
                key={name}
                scope="col"
                abbr={name}
                className="size-8 p-0 text-center font-mono text-micro font-medium tracking-caps text-muted-foreground uppercase"
              >
                {name.slice(0, 2)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]?.getTime()}>
              {week.map((day) => {
                if (!isSameMonth(day, shown))
                  // 달 밖의 빈 칸 — 고를 것이 없어 이름도 없다. 이웃 달의 숫자를 흐리게 채우면 «고를 수 없는 날» 과 같은 모양이 되어 둘이 섞인다.
                  // eslint-disable-next-line jsx-a11y/control-has-associated-label
                  return <td key={day.getTime()} className="p-0" />;
                const isSelected = isSameDay(day, selected);
                const disabled = isDisabled(day);
                return (
                  <td key={day.getTime()} aria-selected={isSelected} className="p-0 text-center">
                    <button
                      type="button"
                      tabIndex={isSameDay(day, active) ? 0 : -1}
                      aria-label={formatLongDate(day)}
                      aria-current={isSameDay(day, today) ? "date" : undefined}
                      aria-disabled={disabled || undefined}
                      data-selected={isSelected ? "" : undefined}
                      className={calendarDayVariants()}
                      onClick={() => select(day)}
                    >
                      {day.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
