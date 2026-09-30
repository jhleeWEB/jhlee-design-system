# FieldLabel

`import { FieldLabel } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## FieldLabel

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Field.tsx`

컨트롤의 이름 — `htmlFor` 가 `FieldControl` 의 id 를 가리키므로 누르면 컨트롤로 간다. 필드가 비활성이면 흐려진다.

물려받는 props: `LabelProps`, `RefAttributes<HTMLLabelElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
