# Accordion

`import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Accordion

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Accordion.tsx`

물려받는 props: `AccordionProps & RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### AccordionContent

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Accordion.tsx`

물려받는 props: `ComponentPropsWithoutRef<typeof Radix.Content>`, `RefAttributes<HTMLDivElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `contentClassName` | `string` |  |  | 본문의 패딩·grid·gap은 안쪽에 둔다. 바깥 className은 접기 애니메이션 구획이다. |

### AccordionHeader

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Accordion.tsx`

물려받는 props: `Omit<AccordionHeaderProps & RefAttributes<HTMLHeadingElement>, "ref">`, `RefAttributes<HTMLHeadingElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### AccordionItem

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Accordion.tsx`

물려받는 props: `Omit<AccordionItemProps & RefAttributes<HTMLDivElement>, "ref">`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### AccordionTrigger

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Accordion.tsx`

물려받는 props: `Omit<AccordionTriggerProps & RefAttributes<HTMLButtonElement>, "ref">`, `RefAttributes<HTMLButtonElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
