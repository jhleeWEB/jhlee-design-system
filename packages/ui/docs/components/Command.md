# Command

`import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Command

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Command.tsx`

명령의 루트 — 검색어와 강조 항목을 든다. `CommandInput`(키보드 ↓/↑ · Enter 를 받는다) · `CommandList` 를 담는다.

물려받는 props: `Omit<React.ComponentPropsWithRef<"div">, "defaultValue">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `label` | `string` |  | `"Commands"` | 입력과 목록의 접근성 이름 — 화면에는 보이지 않는다. 화면 문자열이라 영어로 적는다. |
| `search` | `string` |  | `undefined` | 제어 모드의 검색어 — `onSearchChange` 와 함께 쓴다. 생략하면 입력이 스스로 든다(비제어). |
| `defaultSearch` | `string` |  | `""` | 비제어 모드의 첫 검색어. |
| `onSearchChange` | `(search: string) => void` |  | `undefined` | 검색어가 바뀔 때. |
| `shouldFilter` | `boolean` |  | `true` | 검색어로 항목을 거를지 — 끄면 항목을 전부 보이고 거르기는 호출처가 한다(서버 검색 결과처럼). |
| `filter` | `(value: string, search: string, keywords: readonly string[]) => boolean` |  | `대소문자를 무시한 부분 일치` | 항목 하나가 보이는가 — 값 · 검색어 · 키워드를 받는다. |
| `loop` | `boolean` |  | `false` | ↓/↑ 가 목록 끝에서 반대편 끝으로 돈다. |
| `defaultValue` | `string` |  | `undefined` | 처음 강조할 항목의 `value` — Combobox 가 고른 값을 열 때 그 항목에서 시작하게 한다. 사용자가 움직이거나 검색하면 놓는다. |
| `surface` | `"card" \| "plain" \| null` |  | `"card"(CommandDialog · ComboboxContent 안에서는 "plain")` | 값: `card` — 카드 바탕 · 테두리 · `plain` — 바탕 · 테두리 없음. 이미 면이 있는 상자(대화상자 · 팝오버) 안 |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### CommandDialog

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Command.tsx`

명령 팔레트 — 스크림 위 화면 위쪽 1/5 자리에 뜨는 대화상자. 자식으로 `Command`(입력 · 목록)를 둔다 — 그 `Command` 의 기본 면은 `plain` 이다.
포커스 트랩 · 스크롤 락 · Escape · 포커스 복귀는 Radix Dialog 가 맡는다(Modal 과 같다). 위치를 가운데가 아니라 위쪽에 두는 이유:
검색할수록 목록이 줄어드는데 가운데 정렬이면 입력이 위아래로 튄다.

물려받는 props: `Omit<React.ComponentPropsWithRef<typeof Dialog.Content>, "forceMount" | "title">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `open` | `boolean` |  | `undefined` | 제어 모드의 열림. |
| `defaultOpen` | `boolean` |  | `false` | 비제어 모드의 첫 열림. |
| `onOpenChange` | `(open: boolean) => void` |  | `undefined` | 열림이 바뀔 때 — Escape · 스크림 클릭 · 항목 실행 뒤 닫기에 쓴다. |
| `title` | `string` |  | `"Command palette"` | 대화상자의 접근성 이름 — 화면에는 보이지 않는다(입력이 곧 머리다). 화면 문자열이라 영어로 적는다. |
| `description` | `string` |  | `undefined` | 보이지 않는 한 줄 설명 — 대화상자의 `aria-describedby` 가 된다. 없으면 describedby 를 비운다. |

### CommandEmpty

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Command.tsx`

보이는 항목이 없을 때만 그려지는 문장 — "No results found." 처럼. 가운데 정렬의 흐린 글자.

물려받는 props: `ClassAttributes<HTMLDivElement>`, `HTMLAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### CommandGroup

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Command.tsx`

항목 묶음(`role="group"`) — 안의 항목이 전부 걸러지면 머리글과 함께 숨는다.

물려받는 props: `React.ComponentPropsWithRef<"div">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `heading` | `ReactNode` |  | `undefined` | 묶음의 머리글 — mono 대문자 미세라벨(DropdownMenuLabel 과 같은 모양). 묶음의 접근성 이름이 된다. |

### CommandInput

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Command.tsx`

검색 입력 — 돋보기 아이콘과 함께 상자 머리에 선다. 포커스가 여기 머물고 목록의 강조는 `aria-activedescendant` 로 가리킨다.

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### CommandItem

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Command.tsx`

실행·선택 항목(`role="option"`) — 검색어에 맞지 않으면 그려지지 않는다. 강조되면 DropdownMenu 항목과 같은 옅은 면이 깔린다.

물려받는 props: `Omit<React.ComponentPropsWithRef<"div">, "onSelect">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `value` | `string` |  | `children 이 문자열이면 그 글자` | 거르기와 `onSelect` 에 쓰는 값. |
| `keywords` | `readonly string[]` |  | `[]` | 값 밖에서도 맞힐 낱말 — "Export as PDF" 를 "print" 로도 찾게. |
| `disabled` | `boolean` |  | `false` | 고를 수 없게 — 보이지만 강조·실행을 건너뛴다. |
| `onSelect` | `(value: string) => void` |  | `undefined` | 누르거나 Enter 로 실행할 때 — 항목의 `value` 를 받는다. |
| `tone` | `"neutral" \| "destructive"` |  | `"neutral"` | 값: `neutral` — 일반 동작(기본) · `destructive` — 되돌릴 수 없는 동작(삭제). 글자와 강조 면이 붉다 |
| `shortcut` | `string` |  | `undefined` | 오른쪽에 붙는 단축키 표기(`Kbd` 칩) — "⌘K". 표기일 뿐 키를 묶지 않는다. |

### CommandList

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Command.tsx`

거른 항목의 목록(`role="listbox"`) — 길면 `--size-command-list`(300px) 안에서 DS 스크롤바(`ScrollArea`)로 스크롤한다. 항목 · 묶음 · 빈 상태 · 구분선을 담는다.
스크롤은 바깥 ScrollArea 의 뷰포트가 맡고(#87 — 예전에는 listbox 가 `overflow-y-auto` 로 브라우저 기본 막대를 그렸다), 키보드 탐색의
`scrollIntoView({ block: "nearest" })` 는 가장 가까운 스크롤 조상인 그 뷰포트를 움직인다. className · ref · rest 는 listbox 에 닿는다.
보이는 항목이 하나도 없으면 listbox 역할을 내려놓는다 — 옵션 없는 listbox 는 ARIA 위반(aria-required-children)이고, 그때 안에는 빈 상태 문장뿐이다.

물려받는 props: `ClassAttributes<HTMLDivElement>`, `HTMLAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### CommandSeparator

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Command.tsx`

묶음 사이 구분선 — 목록의 안쪽 여백까지 가로지른다. 검색 중에는 숨는다(거른 결과 사이의 선은 묶음을 가르지 못한다).

물려받는 props: `ClassAttributes<HTMLDivElement>`, `HTMLAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
