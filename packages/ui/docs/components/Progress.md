# Progress

`import { Progress } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Progress

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/feedback/Progress.tsx`

진행 막대 — 값이 있을 때만 쓴다. 값이 없으면 `Spinner` 다.

물려받는 props: `React.ComponentProps<typeof RadixProgress.Root>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `tone` | `ProgressTone \| null` |  | `"primary"` | 값: `primary` — 지금 진행 중인 주된 작업(기본) · `success` — 허용량 안에서 끝났다 · `warning` — 상한에 가깝다 · `destructive` — 상한을 넘었다(100% 초과) · `neutral` — 판정 없는 단순 채움 |
| `value` | `number \| null` |  | `null` | 0–100(밖의 값은 잘라 그린다). `null` 이면 미판정(indeterminate)으로 그린다. |
