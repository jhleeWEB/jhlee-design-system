# Combobox

`import { Combobox, ComboboxContent, ComboboxItem, ComboboxTrigger } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Combobox

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Combobox.tsx`

콤보박스의 루트 — 값과 열림을 들고 트리거 · 상자를 묶는다. 자기 DOM 은 없다(Radix `Popover.Root` 위).

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `value` | `string` |  | `undefined` | 제어 모드의 값 — `onValueChange` 와 함께 쓴다. 빈 문자열은 «고르지 않음» 이다. |
| `defaultValue` | `string` |  | `""` | 비제어 모드의 첫 값. |
| `onValueChange` | `(value: string) => void` |  | `undefined` | 항목을 골랐을 때 — 고른 항목의 `value` 를 받는다. 이미 고른 항목을 다시 골라도 값은 그대로다(해제하지 않는다). |
| `open` | `boolean` |  | `undefined` | 제어 모드의 열림. |
| `defaultOpen` | `boolean` |  | `false` | 비제어 모드의 첫 열림. |
| `onOpenChange` | `(open: boolean) => void` |  | `undefined` | 열림이 바뀔 때. |
| `children` | `ReactNode` |  | `undefined` | `ComboboxTrigger` 와 `ComboboxContent`. |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### ComboboxContent

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Combobox.tsx`

검색 상자 — Popover 면 위에 검색 입력과 목록을 그린다. 폭은 트리거 폭에 붙되 팝오버 상하한 안이다. 처음 강조는 고른 값의 항목이다.
자식은 `ComboboxItem` 과 `CommandGroup` · `CommandEmpty` · `CommandSeparator` 다.

물려받는 props: `Omit<React.ComponentPropsWithRef<typeof RadixPopover.Content>, "forceMount">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `label` | `string` |  | `"Options"` | 검색 입력 · 목록 · 상자의 접근성 이름 — 화면에는 보이지 않는다. 화면 문자열이라 영어로 적는다. |
| `searchPlaceholder` | `string` |  | `"Search…"` | 검색 입력의 자리표시. |

### ComboboxItem

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Combobox.tsx`

고를 수 있는 항목 — 고른 항목은 왼쪽에 체크 표시가 선다(Select 항목과 같은 자리). 고르면 값이 바뀌고 상자가 닫힌다.

물려받는 props: `Omit<CommandItemProps, "value">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `value` | `string` | 예 |  | 고르면 루트의 값이 되는 문자열. 검색은 이 값과 글자(`children` 이 문자열일 때) · `keywords` 를 함께 본다. |
| `onSelect` | `(value: string) => void` |  | `undefined` | 누르거나 Enter 로 실행할 때 — 항목의 `value` 를 받는다. |
| `tone` | `"neutral" \| "destructive"` |  | `"neutral"` | 값: `destructive` — 되돌릴 수 없는 동작(삭제). 글자와 강조 면이 붉다 · `neutral` — 일반 동작(기본) |
| `disabled` | `boolean` |  | `false` | 고를 수 없게 — 보이지만 강조·실행을 건너뛴다. |
| `keywords` | `readonly string[]` |  | `[]` | 값 밖에서도 맞힐 낱말 — "Export as PDF" 를 "print" 로도 찾게. |
| `shortcut` | `string` |  | `undefined` | 오른쪽에 붙는 단축키 표기(`Kbd` 칩) — "⌘K". 표기일 뿐 키를 묶지 않는다. |

### ComboboxTrigger

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Combobox.tsx`

상자를 여는 버튼(`role="combobox"`) — 고른 값의 글자(`children`)를 보이고, 값이 비면 `placeholder` 를 흐리게 보인다. 펼침 화살표는 DS 가 붙인다.
이름은 `FieldLabel`(FieldControl 로 감쌀 때) 또는 `aria-label` 이 준다.

물려받는 props: `Omit<React.ComponentPropsWithRef<"button">, "value">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `placeholder` | `string` |  | `"Select…"` | 값이 비었을 때 흐리게 보이는 글자. |
| `size` | `"sm" \| "md" \| "lg" \| null` |  | `"md"` | 값: `sm` — 작은 컨트롤 높이 · 본문 글자 · `md` — 기본 컨트롤 높이 · `lg` — 큰 컨트롤 높이 · 넓은 가로 여백 |
| `invalid` | `boolean \| null` |  | `"false"` | 검증 실패 — 파괴색 테두리와 `aria-invalid`. |
