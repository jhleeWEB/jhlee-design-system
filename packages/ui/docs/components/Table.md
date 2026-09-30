# Table

`import { Table } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Table

서버에서도 렌더 가능(지시문 없음) · 원본 `src/data/Table.tsx`

수치 표의 뿌리 — 가로 스크롤 영역 안의 `<table>`. `className`·`ref` 는 `<table>` 에 닿는다.

물려받는 props: `ClassAttributes<HTMLTableElement>`, `TableHTMLAttributes<HTMLTableElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
