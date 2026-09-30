# StatusDot

`import { StatusDot } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## StatusDot

서버에서도 렌더 가능(지시문 없음) · 원본 `src/primitives/Badge.tsx`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `tone` | `ToneInput<BadgeTone>` |  | `"neutral"` | 값: `neutral` · `primary` · `success` · `warning` · `destructive` · `accent` — deprecated alias of "primary" · `current` — deprecated alias of "neutral" · `danger` — deprecated alias of "destructive" · `default` — deprecated alias of "neutral" · `ok` — deprecated alias of "success" · `warn` — deprecated alias of "warning" |
| `label` | `string` | 예 |  |  |
| `className` | `string` |  |  |  |
