# Accordion

`import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Accordion

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Accordion.tsx`

접이식 구획 묶음 — `type="single"` 은 하나만, `"multiple"` 은 여럿을 연다. 제어(`value`)·비제어(`defaultValue`) 모두 받는다.

물려받는 props: `AccordionProps`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### AccordionContent

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Accordion.tsx`

구획의 본문 — 접혀도 DOM 에 남고(`inert` · `aria-hidden`) 접힐 때 안의 포커스를 트리거로 돌려보낸다.

물려받는 props: `ComponentProps<typeof Radix.Content>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `contentClassName` | `string` |  | `undefined` | 본문의 패딩·grid·gap은 안쪽에 둔다. 바깥 className은 접기 애니메이션 구획이다. |

### AccordionHeader

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Accordion.tsx`

구획의 제목 줄 — 제목 요소(기본 `h3`)로 렌더되어 문서 개요에 실린다. `AccordionTrigger` 를 담는다.

물려받는 props: `AccordionHeaderProps`, `RefAttributes<HTMLHeadingElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### AccordionItem

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Accordion.tsx`

구획 하나 — `value` 가 뿌리의 열린 값과 맞으면 열린다. `AccordionHeader` · `AccordionContent` 를 담는다.

물려받는 props: `AccordionItemProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### AccordionTrigger

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Accordion.tsx`

여닫는 버튼 — 라벨 뒤에 방향 표시(chevron)를 스스로 단다. `asChild` 면 자식 요소를 그대로 쓴다.

물려받는 props: `AccordionTriggerProps`, `RefAttributes<HTMLButtonElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
