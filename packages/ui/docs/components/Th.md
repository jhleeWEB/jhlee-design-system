# Th

`import { Th } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Th

서버에서도 렌더 가능(지시문 없음) · 원본 `src/data/Table.tsx`

열 머리 칸(`<th>`) — mono 대문자 라벨. `scope` 의 기본은 `col` 이다.

물려받는 props: `React.ComponentProps<"th">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `numeric` | `boolean` |  | `false` | 수치 열의 머리 — 본문 칸(`Td numeric`)과 같은 우측 정렬. |
