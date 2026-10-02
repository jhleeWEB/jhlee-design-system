# Accordion

`import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Accordion

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Accordion.tsx`

접이식 구획 묶음 — `type="single"` 은 하나만, `"multiple"` 은 여럿을 연다. 제어(`value`)·비제어(`defaultValue`) 모두 받는다.
모양은 `variant` 가 고른다 — 따로 선 카드(`separated`) · 한 상자(`contained`) · 인스펙터 구획(`flush`).

물려받는 props: `AccordionProps`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `variant` | `"separated" \| "contained" \| "flush" \| null` |  | `"separated"` | 값: `separated` — 항목마다 따로 선 카드(테두리와 카드 면, 모서리 rounded-lg). 기본값 — 문서 흐름 안의 접이식 구획 · `contained` — 상자 하나(테두리와 카드 면, 모서리 rounded-lg) 안에서 항목을 헤어라인 구분선으로 가른다. 패널 안의 설정 묶음 · `flush` — 상자 없이 항목 사이 구분선과 제목 줄만 남긴다. 인스펙터 구획(Figma 속성 패널처럼 — 패널 가장자리까지 여백 없이 놓아 선이 끝까지 닿게) |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### AccordionContent

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Accordion.tsx`

구획의 본문 — 접혀도 DOM 에 남고(`inert` · `aria-hidden`) 접힐 때 안의 포커스를 트리거로 돌려보낸다.
글자는 보조 문장 역할(`text-body` · 흐린 글자)이다 — 제목과 크기가 같고 굵기 · 색이 가른다. 안에 놓인 컨트롤 · `Fieldset` 은 자기 글자색을 든다.

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
