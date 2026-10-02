# Table

`import { Table, TableCaption } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Table

서버에서도 렌더 가능(지시문 없음) · 원본 `src/data/Table.tsx`

수치 표의 뿌리 — 가로 스크롤 영역 안의 `<table>`. `className`·`ref` 는 `<table>` 에 닿는다.

물려받는 props: `ClassAttributes<HTMLTableElement>`, `TableHTMLAttributes<HTMLTableElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### TableCaption

서버에서도 렌더 가능(지시문 없음) · 원본 `src/data/Table.tsx`

표의 이름(`<caption>`) — 스크린리더가 표에 들어설 때 읽는다. `Table` 의 **첫 자식**으로 둔다(HTML 규칙).

물려받는 props: `React.ComponentProps<"caption">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `side` | `CaptionSide` |  | `"top"` | 값: `top` — 표 위 · `bottom` — 표 아래(출처 · 주석) |
| `visuallyHidden` | `boolean` |  | `false` | 화면에서 숨기고 스크린리더만 읽는다 — 보이는 제목이 따로 있을 때도 표의 이름은 남긴다. |
