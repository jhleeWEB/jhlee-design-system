# Calendar

`import { Calendar } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Calendar

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Calendar.tsx`

달력 — 한 달 격자에서 날짜 하나를 고른다. 머리의 이전 · 다음 버튼과 PageUp/PageDown 으로 달을 넘긴다.
날짜는 시각 없는 현지 자정이고 라벨은 로캘과 무관한 영어다.

물려받는 props: `Omit<React.ComponentPropsWithRef<"div">, "defaultValue" | "onChange">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `value` | `Date \| null` |  | `undefined` | 고른 날(제어). `null` 은 «고른 날 없음». |
| `defaultValue` | `Date \| null` |  | `null` | 고른 날의 첫 값(비제어). |
| `onValueChange` | `((date: Date) => void)` |  | `undefined` | 날을 골랐을 때 — 그 날의 현지 자정. |
| `month` | `Date` |  | `undefined` | 보이는 달(제어) — 그 달의 아무 날. |
| `defaultMonth` | `Date` |  | `undefined` | 처음 보일 달(비제어). 주지 않으면 고른 날의 달, 그것도 없으면 오늘의 달이다. |
| `onMonthChange` | `((month: Date) => void)` |  | `undefined` | 보이는 달이 바뀔 때 — 그 달 1일. |
| `min` | `Date` |  | `undefined` | 고를 수 있는 가장 이른 날. 그 앞은 흐리고 고를 수 없으며 키보드 이동도 여기서 멈춘다. |
| `max` | `Date` |  | `undefined` | 고를 수 있는 가장 늦은 날. |
| `isDateDisabled` | `((date: Date) => boolean)` |  | `undefined` | 범위 안에서도 고를 수 없는 날 — 주말 · 휴일처럼. |
| `today` | `Date` |  | `new Date()` | 오늘 — `aria-current="date"` 가 서는 날. 스토리 · 테스트는 고정한다(시각 회귀가 날마다 갈리지 않게). |
| `weekStartsOn` | `0 \| 1` |  | `0` | 주의 첫날. - `0` — 일요일 - `1` — 월요일 |
| `initialFocus` | `boolean` |  | `false` | 마운트하자마자 고른 날(없으면 오늘 · 그 달 1일) 칸에 초점을 둔다 — DatePicker 가 팝오버를 열 때. |
