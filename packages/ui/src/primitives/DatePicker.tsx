"use client";
import { useId, useState } from "react";
import { IconCalendar } from "../icons/icons";

import { cn, type VariantProps } from "../cn";
import { formatIsoDate } from "../lib/date";
import { Popover, PopoverContent, PopoverTrigger } from "../overlay/Popover";
import { Calendar, type CalendarProps } from "./Calendar";
import { datePickerTriggerVariants } from "./DatePicker.variants";

/* 날짜 고르기 — 트리거 버튼 + 팝오버 + 달력(#62).
 *
 * 트리거는 Select 의 트리거와 같은 모양 · 같은 역할(`combobox`)이다: 라벨(`FieldLabel` 의 htmlFor)이 이름이 되고 고른 날이 값으로 읽힌다.
 * 고른 날은 `2026-10-01`(ISO 8601)로 적는다 — 로캘마다 순서가 바뀌는 `10/01/2026` · `01/10/2026` 은 같은 글자가 다른 날이다. 숫자는 `tnum`.
 * 직접 타이핑하는 입력은 두지 않았다 — 형식 안내 · 파싱 오류 · 부분 입력이 따라오고, 오늘의 쓰임(설정 폼의 날짜 하나)에는 달력이면 된다.
 *
 * `FieldControl` 안에 그대로 넣는다 — 나머지 속성(id · aria-describedby · aria-invalid · disabled)이 트리거 버튼으로 간다.
 * 팝오버를 열면 초점이 고른 날(없으면 오늘) 칸으로 가고, 날을 고르거나 Escape 면 닫혀 초점이 트리거로 돌아온다(Radix Popover). */

type DatePickerSize = NonNullable<VariantProps<typeof datePickerTriggerVariants>["size"]>;

/** `DatePicker` 의 props — 트리거 `<button>` 속성(ref 포함) + 값 · 열림 · 달력 범위 · `size` · `invalid`. */
export interface DatePickerProps
  extends
    Omit<React.ComponentPropsWithRef<"button">, "value" | "defaultValue" | "onChange" | "children">,
    VariantProps<typeof datePickerTriggerVariants>,
    Pick<CalendarProps, "min" | "max" | "isDateDisabled" | "today" | "weekStartsOn"> {
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
   * 날을 골랐을 때 — 그 날의 현지 자정. 팝오버는 곧 닫힌다.
   * @default undefined
   */
  onValueChange?: ((date: Date) => void) | undefined;
  /**
   * 팝오버가 열렸는가(제어).
   * @default undefined
   */
  open?: boolean | undefined;
  /**
   * 처음에 열려 있는가(비제어).
   * @default false
   */
  defaultOpen?: boolean | undefined;
  /**
   * 팝오버가 열리고 닫힐 때.
   * @default undefined
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * 고른 날이 없을 때 트리거에 보일 글자.
   * @default "Pick a date"
   */
  placeholder?: string;
}

/**
 * 날짜 고르기 — 트리거를 누르면 달력 팝오버가 열린다. 고른 날은 `YYYY-MM-DD`(tabular-nums)로 보인다. `FieldControl` 안에 넣어 라벨 · 설명 · 오류와 잇는다.
 * @slot date-picker
 */
export function DatePicker({
  value,
  defaultValue = null,
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  placeholder = "Pick a date",
  min,
  max,
  isDateDisabled,
  today,
  weekStartsOn,
  size,
  invalid,
  className,
  ...rest
}: DatePickerProps) {
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const isOpen = open ?? innerOpen;
  const setOpen = (next: boolean) => {
    if (open === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };
  const [innerValue, setInnerValue] = useState<Date | null>(defaultValue);
  const selected = value !== undefined ? value : innerValue;
  const resolvedSize: DatePickerSize = size ?? "md";
  /* 팝오버 상자의 id 를 우리가 정한다 — combobox 는 aria-controls 가 필수인데(Radix 가 런타임에 달아도 정적 검사는 모른다) 닫혀 있을 때 없는 id 를 가리키지 않게 열린 동안만 단다. */
  const contentId = useId();

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? contentId : undefined}
          aria-invalid={invalid || undefined}
          className={cn(datePickerTriggerVariants({ size: resolvedSize, invalid }), className)}
          {...rest}
          data-slot="date-picker"
          data-size={resolvedSize satisfies DatePickerSize}
          data-placeholder={selected ? undefined : ""}
        >
          {selected ? <span className="tnum">{formatIsoDate(selected)}</span> : <span>{placeholder}</span>}
          <IconCalendar />
        </button>
      </PopoverTrigger>
      <PopoverContent
        id={contentId}
        aria-label="Choose date"
        align="start"
        className="w-auto min-w-0 p-3"
        // 초점은 달력이 마운트하며 고른 날 칸에 둔다(initialFocus) — Radix 가 첫 버튼(이전 달)으로 옮기지 않게 막는다.
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Calendar
          value={selected}
          onValueChange={(date) => {
            if (value === undefined) setInnerValue(date);
            onValueChange?.(date);
            setOpen(false);
          }}
          min={min}
          max={max}
          isDateDisabled={isDateDisabled}
          today={today}
          {...(weekStartsOn === undefined ? {} : { weekStartsOn })}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
