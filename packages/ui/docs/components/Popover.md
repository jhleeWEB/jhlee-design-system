# Popover

`import { Popover, PopoverAnchor, PopoverClose, PopoverContent, PopoverTrigger } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Popover

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Popover.tsx`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### PopoverAnchor

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Popover.tsx`

물려받는 props: `PopoverAnchorProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### PopoverClose

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Popover.tsx`

물려받는 props: `PopoverCloseProps`, `RefAttributes<HTMLButtonElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### PopoverContent

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Popover.tsx`

물려받는 props: `Omit<React.ComponentPropsWithRef<typeof Radix.Content>, "forceMount">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `onCanvas` | `boolean` |  |  | 캔버스 위에 얹힌다 — 반투명 + 블러로 도면이 비친다. |
| `arrow` | `boolean` |  |  |  |

### PopoverTrigger

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Popover.tsx`

물려받는 props: `PopoverTriggerProps`, `RefAttributes<HTMLButtonElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
