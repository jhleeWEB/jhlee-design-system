# ToggleGroup

`import { ToggleGroup, ToggleGroupItem } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## ToggleGroup

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/ToggleGroup.tsx`

토글 묶음 — `type="single"`(값 하나, 다시 누르면 끈다) · `type="multiple"`(값 배열). 스크린리더가 읽을 묶음 이름을 `aria-label` 로 준다.
`variant` · `size` 는 안의 칸 모양까지 함께 정한다.

물려받는 props: `Omit<(ToggleGroupSingleProps | ToggleGroupMultipleProps) & RefAttributes<HTMLDivElement>, "asChild">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `variant` | `"segmented" \| "outline" \| null` |  | `"segmented"` | 값: `segmented` — 옅은 파란 트랙 위에 켜진 칸이 흰 pill 로 선다(Tabs · SegmentedControl 과 같은 모양). 보기 방식 같은 작은 전환 · `outline` — 테두리 상자들이 붙은 줄. 켜진 칸은 옅은 주색 바탕 · 주색 글자. 도구 막대의 서식 토글(굵게 · 기울임) |
| `size` | `"sm" \| "md" \| null` |  | `"md"` | 값: `sm` — 낮은 칸 · 라벨 글자 · `md` — 기본 칸 · 컨트롤 글자 |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### ToggleGroupItem

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/ToggleGroup.tsx`

토글 한 칸 — `value` 가 묶음의 값(단일이면 문자열, 다중이면 배열의 원소)이 된다. 모양은 감싼 `ToggleGroup` 의 `variant` · `size` 를 따른다.

물려받는 props: `ToggleGroupItemProps`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `aria-label` | `string` |  | `undefined` | Defines a string value that labels the current element. 칸의 접근 가능한 이름 — 아이콘 전용 칸(`icon` 만)에서는 필수, 글자 칸에서는 글자가 이름이라 생략한다. |
| `icon` | `ReactNode` |  | `undefined` | 칸 앞의 아이콘(16px). 글자 없이 아이콘만 두면 `aria-label` 이 필수다. |
| `children` | `ReactNode` |  | `undefined` | 칸의 글자 — 아이콘 전용 칸에는 없다. |
