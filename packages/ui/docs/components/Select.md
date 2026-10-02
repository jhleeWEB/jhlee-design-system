# Select

`import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Select

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Select.tsx`

선택의 루트 — 값(`value` · `defaultValue` · `onValueChange`)과 열림(`open` · `onOpenChange`)을 든다. 자기 DOM 은 없다(Radix `Select.Root`).

물려받는 props: `SelectSharedProps`, `{ value?: string; defaultValue?: string; onValueChange?(value: string): void; }`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### SelectContent

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Select.tsx`

목록 상자 — DropdownMenu 와 같은 면(카드 바탕 · `shadow-pop`)이다. 포털의 수명은 DS 가 소유하므로 `forceMount` 는 공개하지 않는다.
기본 배치는 트리거 아래(`position="popper"`)이고 폭은 트리거보다 좁아지지 않는다. 목록이 길면 뷰포트 안에서 스크롤한다.

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### SelectGroup

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Select.tsx`

항목 묶음 — 시각 구분 없이 의미만 묶는다. 머리글은 `SelectLabel`, 구분선은 `SelectSeparator`.

물려받는 props: `SelectGroupProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### SelectItem

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Select.tsx`

고를 수 있는 항목 — `value` 가 루트의 값이 된다. 고른 항목은 왼쪽에 체크 표시가 선다. 글자(`children`)가 트리거에 그대로 옮겨 적힌다.

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### SelectLabel

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Select.tsx`

묶음의 머리글 — mono 대문자 미세라벨(DropdownMenuLabel 과 같은 모양). 고를 수 없다.

물려받는 props: `SelectLabelProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### SelectSeparator

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Select.tsx`

묶음 사이 구분선 — 목록 상자의 안쪽 여백까지 가로지른다.

물려받는 props: `SelectSeparatorProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### SelectTrigger

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Select.tsx`

목록을 여는 버튼 — Input 과 같은 높이 사다리(`size`)와 검증 실패(`invalid`)를 갖는다. 안에 `SelectValue` 를 두고, 펼침 화살표는 DS 가 붙인다.
장식(값 · 화살표)을 트리거가 소유하므로 `asChild` 는 받지 않는다.

물려받는 props: `Omit<React.ComponentPropsWithRef<typeof Radix.Trigger>, "asChild">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg" \| null` |  | `"md"` | 값: `sm` — 작은 컨트롤 높이 · `md` — 기본 컨트롤 높이 · `lg` — 큰 컨트롤 높이 · 넓은 가로 여백 |
| `invalid` | `boolean \| null` |  | `"false"` | 검증 실패 — 파괴색 테두리와 `aria-invalid`. |

### SelectValue

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Select.tsx`

트리거 안에 고른 항목의 글자를 보인다. 아무것도 고르지 않았으면 `placeholder` 를 흐리게 보인다. 넘치면 말줄임한다.
`className` 은 바깥 상자로 간다 — Radix `Select.Value` 는 받은 className · style 을 버린다(실측, react-select 2.3). ref 와 나머지 속성은 값 요소에 닿는다.

물려받는 props: `SelectValueProps`, `RefAttributes<HTMLSpanElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
