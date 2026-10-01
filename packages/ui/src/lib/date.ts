/* 날짜 한 벌 — Calendar · DatePicker 가 같은 계산을 읽는다(#62).
 *
 * 날짜는 «현지 자정의 Date» 하나로 다룬다. 시각·시간대를 섞으면 같은 날이 자정 근처에서 둘로 갈린다 — 비교는 연·월·일만 본다.
 * 라벨은 `Intl` 이 아니라 아래 영어 표에서 만든다: 화면 문자열은 영어가 규약이고(AGENTS.md «언어»), 런타임 로캘을 따르면
 * 같은 스토리가 CI(도커)와 개발 기계에서 다른 글자로 그려져 VRT 가 갈린다. */

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** 시각을 걷어낸 같은 날의 현지 자정. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** 그 달 1일. */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** 그 달의 날 수. */
export function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/** n 일 뒤(음수면 앞). */
export function addDays(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

/** n 달 뒤 — 31일에서 한 달 뒤가 다음다음 달로 넘치지 않게 그 달의 마지막 날로 깎는다. */
export function addMonths(date: Date, n: number): Date {
  const first = new Date(date.getFullYear(), date.getMonth() + n, 1);
  return new Date(first.getFullYear(), first.getMonth(), Math.min(date.getDate(), daysInMonth(first)));
}

/** 같은 날인가 — 연·월·일만 본다. */
export function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** 같은 달인가. */
export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** 날짜 순서 — 음수면 a 가 앞이다. */
export function compareDays(a: Date, b: Date): number {
  return startOfDay(a).getTime() - startOfDay(b).getTime();
}

/** `[min, max]` 안으로 깎는다. */
export function clampDay(date: Date, min?: Date, max?: Date): Date {
  if (min && compareDays(date, min) < 0) return startOfDay(min);
  if (max && compareDays(date, max) > 0) return startOfDay(max);
  return date;
}

const pad = (n: number, width: number) => String(n).padStart(width, "0");

/** `2026-10-01` — 로캘에 따라 순서가 바뀌지 않는 표기(ISO 8601). DatePicker 트리거가 쓴다. */
export function formatIsoDate(date: Date): string {
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)}`;
}

/** `Thursday, October 1, 2026` — 날 칸의 접근 가능한 이름. */
export function formatLongDate(date: Date): string {
  return `${WEEKDAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
