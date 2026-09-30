# SelectValue

`import { SelectValue } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## SelectValue

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Select.tsx`

트리거 안에 고른 항목의 글자를 보인다. 아무것도 고르지 않았으면 `placeholder` 를 흐리게 보인다. 넘치면 말줄임한다.
`className` 은 바깥 상자로 간다 — Radix `Select.Value` 는 받은 className · style 을 버린다(실측, react-select 2.3). ref 와 나머지 속성은 값 요소에 닿는다.

물려받는 props: `SelectValueProps`, `RefAttributes<HTMLSpanElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
