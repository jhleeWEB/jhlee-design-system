# Td

`import { Td } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Td

서버에서도 렌더 가능(지시문 없음) · 원본 `src/data/Table.tsx`

물려받는 props: `TdHTMLAttributes<HTMLTableCellElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `numeric` | `boolean` |  |  |  |
| `tone` | `ToneInput<CellTone>` |  |  | 값: `destructive` · `success` · `warning` · `danger` — deprecated alias of "destructive" · `ok` — deprecated alias of "success" · `warn` — deprecated alias of "warning" |
