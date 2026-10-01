# Collapsible

`import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Collapsible

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Collapsible.tsx`

접기의 루트 — 열림 상태를 들고 `CollapsibleTrigger` · `CollapsibleContent` 를 담는다.

물려받는 props: `CollapsibleProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### CollapsibleContent

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Collapsible.tsx`

접히는 본문 — 접혀도 DOM 에 남고(`inert` · `aria-hidden`) 접힐 때 안의 포커스를 트리거로 돌려보낸다. `className` 은 본문 상자(안쪽)로 간다.

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### CollapsibleTrigger

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Collapsible.tsx`

여닫는 버튼 — 라벨 뒤에 셰브론을 스스로 단다(열리면 뒤집힌다). `asChild` 면 자식 요소(DS `Button` 등)를 그대로 쓰고 장식·모양을 붙이지 않는다.

물려받는 props: `React.ComponentPropsWithRef<typeof Radix.Trigger>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `variant` | `"row" \| "inline" \| null` |  | `"row"` | 값: `row` — 폭을 채우는 줄. 라벨 · 셰브론이 양 끝에 서고 hover 에 옅은 면이 깔린다. 패널 안의 «고급 설정» 같은 구획 머리 · `inline` — 글자 폭만큼의 링크형 버튼. 목록 끝의 «3 more» 처럼 문장 흐름 안에서 펼친다 |
