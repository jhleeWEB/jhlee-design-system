# Skeleton

`import { Skeleton, SkeletonText } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Skeleton

서버에서도 렌더 가능(지시문 없음) · 원본 `src/feedback/Skeleton.tsx`

물려받는 props: `React.HTMLAttributes<HTMLDivElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `h` | `string \| number` |  |  | 바의 높이. 대체할 내용의 line-height 에 맞춘다. |
| `w` | `string \| number` |  |  | 바의 폭. 글줄을 흉내 낼 때 마지막 줄만 짧게 하는 것이 자연스럽다. |
| `shape` | `"circle" \| "bar"` |  |  | 값: `bar` · `circle` |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### SkeletonText

서버에서도 렌더 가능(지시문 없음) · 원본 `src/feedback/Skeleton.tsx`

물려받는 props: `HTMLAttributes<HTMLDivElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `lines` | `number` |  |  |  |
