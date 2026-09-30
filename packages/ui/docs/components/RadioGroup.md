# RadioGroup

`import { RadioGroup, RadioGroupItem } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## RadioGroup

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Choice.tsx`

라디오 묶음 — 여럿 중 하나를 고른다. Radix `RadioGroup.Root` 에 `data-slot` 만 더한다(배치는 소비자 `className`).

물려받는 props: `RadioGroupProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### RadioGroupItem

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Choice.tsx`

라디오 한 개 — `RadioGroup` 안에서만 쓴다.

물려받는 props: `RadioGroupItemProps`, `RefAttributes<HTMLButtonElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
