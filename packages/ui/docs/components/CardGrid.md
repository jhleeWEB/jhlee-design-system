# CardGrid

`import { CardGrid } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## CardGrid

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/MediaCard.tsx`

카드 격자 — `auto-fit` 으로 항목이 남는 폭을 나눠 갖는다.

물려받는 props: `ClassAttributes<HTMLDivElement>`, `HTMLAttributes<HTMLDivElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `min` | `string` |  | `"240px"` | 열 하나의 최소 폭(CSS 길이) — 이보다 좁아지면 열 수가 준다. |
