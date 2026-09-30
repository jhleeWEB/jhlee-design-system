# Tr

`import { Tr } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Tr

서버에서도 렌더 가능(지시문 없음) · 원본 `src/data/Table.tsx`

표 행(`<tr>`) — 본문 안에서만 호버 면이 붙는다.

물려받는 props: `React.ComponentProps<"tr">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `selected` | `boolean` |  | `false` | 선택된 행 — `aria-selected` 로 나가고 강조 면(`bg-accent`)이 붙는다. |
