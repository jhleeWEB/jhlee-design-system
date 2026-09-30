# Popover

`import { Popover, PopoverAnchor, PopoverClose, PopoverContent, PopoverTrigger } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Popover

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Popover.tsx`

팝오버의 루트 — 열림 상태(`open` · `defaultOpen` · `onOpenChange`)만 든다. 자기 DOM 은 없다(Radix `Popover.Root`).

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### PopoverAnchor

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Popover.tsx`

트리거가 아닌 요소에 팝오버를 붙일 때의 기준점 — 캔버스 위 선택 영역처럼.

물려받는 props: `PopoverAnchorProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### PopoverClose

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Popover.tsx`

팝오버를 닫는 버튼 — 작은 폼의 「Done」 처럼.

물려받는 props: `PopoverCloseProps`, `RefAttributes<HTMLButtonElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### PopoverContent

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Popover.tsx`

팝오버 상자 — 포털로 뜬다. 폭은 트리거 폭을 따르되 `--container-popover-*` 상하한 안이다.

물려받는 props: `Omit<React.ComponentPropsWithRef<typeof Radix.Content>, "forceMount">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `onCanvas` | `boolean` |  | `false` | 캔버스 위에 얹힌다 — 반투명 + 블러로 도면이 비친다. 끄면 불투명한 카드 면이다. |
| `arrow` | `boolean` |  | `false` | 트리거를 가리키는 꼬리를 단다 — 트리거와 멀리 떨어져 어느 것의 팝오버인지 흐릴 때만. |

### PopoverTrigger

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Popover.tsx`

팝오버를 여는 버튼. `asChild` 로 DS `Button` 을 트리거로 쓴다.

물려받는 props: `PopoverTriggerProps`, `RefAttributes<HTMLButtonElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
