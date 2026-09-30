# DropdownMenu

`import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## DropdownMenu

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/DropdownMenu.tsx`

메뉴의 루트 — 열림 상태(`open` · `defaultOpen` · `onOpenChange`)만 든다. 자기 DOM 은 없다(Radix `DropdownMenu.Root`).

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### DropdownMenuCheckboxItem

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/DropdownMenu.tsx`

켜고 끄는 항목 — `checked` · `onCheckedChange`. 켜지면 왼쪽에 체크 표시가 선다.

물려받는 props: `DropdownMenuCheckboxItemProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### DropdownMenuContent

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/DropdownMenu.tsx`

메뉴 상자. 포털의 마운트 수명은 DS가 소유하므로 Content만 forceMount하는 조합은 공개하지 않는다.

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### DropdownMenuGroup

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/DropdownMenu.tsx`

항목 묶음 — 시각 구분 없이 의미만 묶는다(구분선은 `DropdownMenuSeparator`).

물려받는 props: `DropdownMenuGroupProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### DropdownMenuItem

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/DropdownMenu.tsx`

실행 항목 — 누르면 동작하고 메뉴가 닫힌다.

물려받는 props: `React.ComponentPropsWithRef<typeof Radix.Item>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `tone` | `ToneInput<"neutral" \| "destructive">` |  | `"neutral"` | 값: `neutral` — 일반 동작(기본) · `destructive` — 되돌릴 수 없는 동작(삭제). 글자와 강조 면이 붉다 · `current` — deprecated alias of "neutral" · `danger` — deprecated alias of "destructive" · `default` — deprecated alias of "neutral" |
| `shortcut` | `string` |  | `undefined` | 오른쪽에 흐리게 붙는 단축키 표기 — "⌘S". 표기일 뿐 키를 묶지 않는다. |

### DropdownMenuLabel

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/DropdownMenu.tsx`

묶음의 머리글 — mono 대문자 미세라벨. 누를 수 없다.

물려받는 props: `DropdownMenuLabelProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### DropdownMenuRadioGroup

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/DropdownMenu.tsx`

라디오 항목 묶음 — `value` · `onValueChange` 로 하나를 고른 상태를 든다.

물려받는 props: `DropdownMenuRadioGroupProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### DropdownMenuRadioItem

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/DropdownMenu.tsx`

라디오 항목 — `DropdownMenuRadioGroup` 안에서 하나만 고른다. 고르면 왼쪽에 점이 선다.

물려받는 props: `DropdownMenuRadioItemProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### DropdownMenuSeparator

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/DropdownMenu.tsx`

묶음 사이 구분선 — 메뉴 상자의 안쪽 여백까지 가로지른다.

물려받는 props: `DropdownMenuSeparatorProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### DropdownMenuSub

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/DropdownMenu.tsx`

하위 메뉴의 루트 — `DropdownMenuSubTrigger` 와 `DropdownMenuSubContent` 를 묶는다. 자기 DOM 은 없다(Radix `DropdownMenu.Sub`).

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### DropdownMenuSubContent

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/DropdownMenu.tsx`

하위 메뉴 상자 — 메뉴 상자와 같은 면.

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### DropdownMenuSubTrigger

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/DropdownMenu.tsx`

하위 메뉴를 여는 항목 — 오른쪽에 펼침 화살표가 붙는다.

물려받는 props: `DropdownMenuSubTriggerProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### DropdownMenuTrigger

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/DropdownMenu.tsx`

메뉴를 여는 버튼. `asChild` 로 DS `Button` 을 트리거로 쓴다.

물려받는 props: `DropdownMenuTriggerProps`, `RefAttributes<HTMLButtonElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
