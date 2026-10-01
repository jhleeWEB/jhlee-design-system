# Drawer

`import { Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerHeader, DrawerTrigger } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Drawer

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Drawer.tsx`

서랍의 루트 — 열림 상태와 모달성(`modal={false}` 면 비모달)을 든다. 자기 DOM 은 없다(Radix `Dialog.Root`).

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### DrawerBody

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Drawer.tsx`

본문 — 이것만 스크롤한다. `ref` 는 스크롤 뷰포트가 아니라 본문 div 다.

물려받는 props: `ClassAttributes<HTMLDivElement>`, `HTMLAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### DrawerClose

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Drawer.tsx`

서랍을 닫는 버튼.

물려받는 props: `DialogCloseProps`, `RefAttributes<HTMLButtonElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### DrawerContent

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Drawer.tsx`

서랍 패널 — 포털 · 스크림 · 포커스 트랩을 함께 그린다. `DrawerHeader` · `DrawerBody` 를 자식으로 둔다.

물려받는 props: `Omit<React.ComponentPropsWithRef<typeof Dialog.Content>, "forceMount">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `side` | `"right" \| "left" \| "bottom" \| null` |  | `"right"` | 값: `right` — 오른쪽 전체 높이(기본). 검사·설정 패널 · `left` — 왼쪽 전체 높이. 탐색·목록 · `bottom` — 아래에서 올라오는 시트. 위 모서리만 둥글다 |
| `size` | `"sm" \| "md" \| "lg" \| null` |  | `"md"` | 값: `sm` — 좁은 목록(폭 280px · 시트 280px) · `md` — 기본(폭 400px · 시트 460px) · `lg` — 넓은 표·폼(폭 620px · 시트 70dvh) |
| `showOverlay` | `boolean` |  | `true` | 모달성은 바꾸지 않고 스크림만 숨긴다. 비모달 Drawer에는 Radix가 스크림을 렌더하지 않는다. |

### DrawerHeader

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Drawer.tsx`

머리줄 — 제목 · 설명 · 닫기 버튼. `children` 은 제목 블록과 닫기 사이에 놓인다.
description을 생략하고 별도 Description도 없으면 DrawerContent에 aria-describedby={undefined}를 지정한다.

물려받는 props: `Omit<React.ComponentPropsWithRef<"div">, "title">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `title` | `ReactNode` | 예 |  | 서랍의 접근성 이름이 되는 제목. |
| `description` | `ReactNode` |  | `undefined` | 제목 아래 한 줄 설명 — 서랍의 `aria-describedby` 가 된다. |

### DrawerTrigger

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Drawer.tsx`

서랍을 여는 버튼. `asChild` 로 DS `Button` 을 트리거로 쓴다.

물려받는 props: `DialogTriggerProps`, `RefAttributes<HTMLButtonElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
