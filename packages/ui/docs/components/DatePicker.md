# DatePicker

`import { DatePicker } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## DatePicker

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/DatePicker.tsx`

날짜 고르기 — 트리거를 누르면 달력 팝오버가 열린다. 고른 날은 `YYYY-MM-DD`(tabular-nums)로 보인다. `FieldControl` 안에 넣어 라벨 · 설명 · 오류와 잇는다.

물려받는 props: `Omit<React.ComponentPropsWithRef<"button">, "value" | "defaultValue" | "onChange" | "children">`, `Pick<CalendarProps, "min" | "max" | "isDateDisabled" | "today" | "weekStartsOn">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `value` | `Date \| null` |  | `undefined` | 고른 날(제어). `null` 은 «고른 날 없음». |
| `defaultValue` | `Date \| null` |  | `null` | 고른 날의 첫 값(비제어). |
| `onValueChange` | `((date: Date) => void)` |  | `undefined` | 날을 골랐을 때 — 그 날의 현지 자정. 팝오버는 곧 닫힌다. |
| `open` | `boolean` |  | `undefined` | 팝오버가 열렸는가(제어). |
| `defaultOpen` | `boolean` |  | `false` | 처음에 열려 있는가(비제어). |
| `onOpenChange` | `((open: boolean) => void)` |  | `undefined` | 팝오버가 열리고 닫힐 때. |
| `placeholder` | `string` |  | `"Pick a date"` | 고른 날이 없을 때 트리거에 보일 글자. |
| `size` | `"sm" \| "md" \| "lg" \| null` |  | `"md"` | 값: `sm` — 작은 컨트롤 높이 · `md` — 기본 컨트롤 높이 · `lg` — 큰 컨트롤 높이 · 넓은 가로 여백 |
| `invalid` | `boolean \| null` |  | `"false"` | 검증 실패 — 파괴색 테두리와 `aria-invalid`. |
| `max` | `Date` |  | `undefined` | 고를 수 있는 가장 늦은 날. |
| `min` | `Date` |  | `undefined` | 고를 수 있는 가장 이른 날. 그 앞은 흐리고 고를 수 없으며 키보드 이동도 여기서 멈춘다. |
| `isDateDisabled` | `((date: Date) => boolean)` |  | `undefined` | 범위 안에서도 고를 수 없는 날 — 주말 · 휴일처럼. |
| `today` | `Date` |  | `new Date()` | 오늘 — `aria-current="date"` 가 서는 날. 스토리 · 테스트는 고정한다(시각 회귀가 날마다 갈리지 않게). |
| `weekStartsOn` | `0 \| 1` |  | `0` | 주의 첫날. - `0` — 일요일 - `1` — 월요일 |
