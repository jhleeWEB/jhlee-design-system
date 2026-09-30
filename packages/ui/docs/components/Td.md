# Td

`import { Td } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Td

서버에서도 렌더 가능(지시문 없음) · 원본 `src/data/Table.tsx`

표 본문 칸(`<td>`) — `numeric` · `tone` 축은 `tableCellVariants` 가 소유하고 `data-tone`(해석된 값)으로 찍힌다.

물려받는 props: `Omit<React.ComponentProps<"td">, "tone">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `numeric` | `boolean` |  | `false` | 수치 칸 — 우측 정렬 + mono + tabular-nums(원칙 3). |
| `tone` | `ToneInput<CellTone>` |  | `"neutral"` | 값: `neutral` — 판정 없음(본문 글자색) · `success` — 통과 · `warning` — 주의 · `destructive` — 실패 · `current` — deprecated alias of "neutral" · `danger` — deprecated alias of "destructive" · `default` — deprecated alias of "neutral" · `ok` — deprecated alias of "success" · `warn` — deprecated alias of "warning" |
