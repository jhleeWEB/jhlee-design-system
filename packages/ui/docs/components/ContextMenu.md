# ContextMenu

`import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## ContextMenu

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/ContextMenu.tsx`

우클릭 메뉴의 루트 — 열림 알림(`onOpenChange`)과 모달성(`modal`)만 든다. 자기 DOM 은 없다(Radix `ContextMenu.Root`). 열림은 트리거의 우클릭이 정한다(`open` prop 이 없다).

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### ContextMenuCheckboxItem

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/ContextMenu.tsx`

켜고 끄는 항목 — `checked` · `onCheckedChange`. 켜지면 왼쪽에 체크 표시가 선다.

물려받는 props: `ContextMenuCheckboxItemProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### ContextMenuContent

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/ContextMenu.tsx`

메뉴 상자 — 포인터 자리에 뜬다. 포털의 마운트 수명은 DS 가 소유하므로 Content 만 forceMount 하는 조합은 공개하지 않는다.

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### ContextMenuGroup

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/ContextMenu.tsx`

항목 묶음 — 시각 구분 없이 의미만 묶는다(구분선은 `ContextMenuSeparator`).

물려받는 props: `ContextMenuGroupProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### ContextMenuItem

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/ContextMenu.tsx`

실행 항목 — 누르면 동작하고 메뉴가 닫힌다.

물려받는 props: `React.ComponentPropsWithRef<typeof Radix.Item>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `tone` | `"neutral" \| "destructive"` |  | `"neutral"` | 값: `neutral` — 일반 동작(기본) · `destructive` — 되돌릴 수 없는 동작(삭제). 글자와 강조 면이 붉다 |
| `shortcut` | `string` |  | `undefined` | 오른쪽에 흐리게 붙는 단축키 표기 — "⌘S". 표기일 뿐 키를 묶지 않는다. |

### ContextMenuLabel

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/ContextMenu.tsx`

묶음의 머리글 — mono 대문자 미세라벨. 누를 수 없다.

물려받는 props: `ContextMenuLabelProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### ContextMenuRadioGroup

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/ContextMenu.tsx`

라디오 항목 묶음 — `value` · `onValueChange` 로 하나를 고른 상태를 든다.

물려받는 props: `ContextMenuRadioGroupProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### ContextMenuRadioItem

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/ContextMenu.tsx`

라디오 항목 — `ContextMenuRadioGroup` 안에서 하나만 고른다. 고르면 왼쪽에 점이 선다.

물려받는 props: `ContextMenuRadioItemProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### ContextMenuSeparator

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/ContextMenu.tsx`

묶음 사이 구분선 — 메뉴 상자의 안쪽 여백까지 가로지른다.

물려받는 props: `ContextMenuSeparatorProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### ContextMenuSub

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/ContextMenu.tsx`

하위 메뉴의 루트 — `ContextMenuSubTrigger` 와 `ContextMenuSubContent` 를 묶는다. 자기 DOM 은 없다(Radix `ContextMenu.Sub`).

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### ContextMenuSubContent

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/ContextMenu.tsx`

하위 메뉴 상자 — 메뉴 상자와 같은 면.

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### ContextMenuSubTrigger

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/ContextMenu.tsx`

하위 메뉴를 여는 항목 — 오른쪽에 펼침 화살표가 붙는다.

물려받는 props: `ContextMenuSubTriggerProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### ContextMenuTrigger

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/ContextMenu.tsx`

우클릭을 받는 영역 — 기본은 `<span>` 이다. 블록 영역(캔버스 · 카드 · 표 행)이면 `asChild` 로 그 요소를 쓴다.
`disabled` 면 브라우저의 기본 메뉴가 뜬다.

물려받는 props: `ContextMenuTriggerProps`, `RefAttributes<HTMLSpanElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
