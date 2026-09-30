# Progress

`import { Progress } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Progress

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/feedback/Progress.tsx`

물려받는 props: `React.ComponentPropsWithoutRef<typeof RadixProgress.Root>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `tone` | `ToneInput<ProgressTone> \| null` |  | `"primary"` | 값: `primary` — 기본 · `success` · `warning` · `destructive` · `neutral` · `accent` — deprecated alias of "primary" · `current` — deprecated alias of "neutral" · `danger` — deprecated alias of "destructive" · `default` — deprecated alias of "neutral" · `ok` — deprecated alias of "success" · `warn` — deprecated alias of "warning" |
| `value` | `number \| null` |  |  | 0–100. `null` 이면 미판정(indeterminate)으로 그린다. |
