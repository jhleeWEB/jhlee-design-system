import { cva } from "../cn";

/* `*.variants.ts` 는 지시문·훅이 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Badge.variants.ts 와 같은 이유).
 * 날 칸의 상태(오늘 · 고른 날 · 고를 수 없는 날)는 축이 아니라 상태다 — ARIA(`aria-current="date"` · `aria-disabled`)와
 * `data-selected` 를 선택자로 읽는다(Tabs 의 data-state=active 와 같은 자리). */

/**
 * 달력 날 칸(버튼)의 변형. 32px 정사각 · `tnum`(원칙 3 — 날짜 숫자의 자릿수가 흔들리지 않는다).
 * 고른 날은 «지금 고른 것» 이라 주색 면, 오늘은 테두리 · 굵은 글자로만 선다(색으로 판정하지 않는다). 고를 수 없는 날은 흐린 글자이고
 * 초점은 받는다 — 키보드로 그 위를 지나 다음 날로 갈 수 있어야 한다(`disabled` 를 쓰면 화살표 이동이 그 칸에서 끊긴다).
 */
export const calendarDayVariants = cva([
  "inline-flex size-8 cursor-pointer appearance-none items-center justify-center rounded-md border border-transparent bg-transparent",
  "tnum text-body text-foreground transition-colors duration-fast hover:bg-muted",
  "focus-visible:focus-ring focus-visible:outline-none",
  "aria-[current=date]:border-border-strong aria-[current=date]:font-semibold",
  "data-selected:bg-primary data-selected:text-primary-foreground data-selected:hover:bg-primary-hover",
  "aria-disabled:cursor-default aria-disabled:text-foreground-disabled aria-disabled:hover:bg-transparent",
]);
