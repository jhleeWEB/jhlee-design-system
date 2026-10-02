# Skeleton

`import { Skeleton, SkeletonText } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Skeleton

서버에서도 렌더 가능(지시문 없음) · 원본 `src/feedback/Skeleton.tsx`

스켈레톤 바 — 곧 올 내용과 같은 높이의 자리. 스크린리더에는 숨긴다.

물려받는 props: `React.ComponentProps<"div">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `h` | `string \| number` |  | `12` | 바의 높이(px 수 또는 CSS 길이). 대체할 내용의 line-height 에 맞춘다. |
| `w` | `string \| number` |  | `undefined` | 바의 폭(px 수 또는 CSS 길이). 글줄을 흉내 낼 때 마지막 줄만 짧게 하는 것이 자연스럽다. 비우면 `bar` 는 부모 폭을 따르고 `circle` 은 `h` 와 같은 정원이 된다. |
| `shape` | `"bar" \| "circle" \| null` |  | `"bar"` | 값: `bar` — 글줄·값 자리. 작은 반경(기본) · `circle` — 아바타·상태 점 자리. 정원 |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### SkeletonText

서버에서도 렌더 가능(지시문 없음) · 원본 `src/feedback/Skeleton.tsx`

글줄 뭉치 — `lines` 줄의 스켈레톤 바. 마지막 줄을 짧게 잘라 문단처럼 보이게 한다.

물려받는 props: `React.ComponentProps<"div">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `lines` | `number` |  | `3` | 줄 수. 마지막 줄만 짧게(62%) 잘라 문단처럼 보이게 한다. |
