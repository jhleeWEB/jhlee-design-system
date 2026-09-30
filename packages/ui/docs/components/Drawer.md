# Drawer

`import { Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerHeader, DrawerTrigger } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Drawer

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Drawer.tsx`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### DrawerBody

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Drawer.tsx`

물려받는 props: `ClassAttributes<HTMLDivElement>`, `HTMLAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### DrawerClose

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Drawer.tsx`

물려받는 props: `DialogCloseProps`, `RefAttributes<HTMLButtonElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### DrawerContent

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Drawer.tsx`

물려받는 props: `Omit<React.ComponentPropsWithRef<typeof Dialog.Content>, "forceMount">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `showOverlay` | `boolean` |  |  | 모달성은 바꾸지 않고 스크림만 숨긴다. 비모달 Drawer에는 Radix가 스크림을 렌더하지 않는다. |
| `side` | `"left" \| "right" \| "bottom" \| null` |  | `"right"` | 값: `right` · `left` · `bottom` |
| `size` | `"sm" \| "md" \| "lg" \| null` |  | `"md"` | 값: `sm` · `md` · `lg` |

### DrawerHeader

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Drawer.tsx`

description을 생략하고 별도 Description도 없으면 DrawerContent에 aria-describedby={undefined}를 지정한다.

물려받는 props: `Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "title">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `title` | `ReactNode` | 예 |  |  |
| `description` | `ReactNode` |  |  |  |

### DrawerTrigger

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Drawer.tsx`

물려받는 props: `DialogTriggerProps`, `RefAttributes<HTMLButtonElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
