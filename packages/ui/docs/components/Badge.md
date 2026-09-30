# Badge

`import { Badge } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Badge

서버에서도 렌더 가능(지시문 없음) · 원본 `src/primitives/Badge.tsx`

물려받는 props: `React.HTMLAttributes<HTMLSpanElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `tone` | `ToneInput<BadgeTone> \| null` |  | `"neutral"` | 값: `neutral` — 기본 · `primary` · `success` · `warning` · `destructive` · `accent` — deprecated alias of "primary" · `current` — deprecated alias of "neutral" · `danger` — deprecated alias of "destructive" · `default` — deprecated alias of "neutral" · `ok` — deprecated alias of "success" · `warn` — deprecated alias of "warning" |
| `dot` | `boolean` |  |  |  |
| `children` | `ReactNode` | 예 |  |  |
| `provisional` | `boolean \| null` |  | `"false"` |  |
