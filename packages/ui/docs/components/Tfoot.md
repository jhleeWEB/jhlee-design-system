# Tfoot

`import { Tfoot } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Tfoot

서버에서도 렌더 가능(지시문 없음) · 원본 `src/data/Table.tsx`

표 합계 구역(`<tfoot>`) — 두꺼운 위 경계 · 옅은 면 · 굵은 글자. 합계 줄(`Tr`)을 하나 이상 담는다.

물려받는 props: `ClassAttributes<HTMLTableSectionElement>`, `HTMLAttributes<HTMLTableSectionElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
