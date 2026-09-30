# FieldError

`import { FieldError } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## FieldError

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Field.tsx`

검증 오류 문장 — 내용이 있을 때만 그려지고, 그려지면 필드를 실패(`aria-invalid`)로 만들며 `aria-describedby` 에 실린다.
파괴색 글자다 — 색만으로 말하지 않도록 문장이 곧 신호다(원칙 2).

물려받는 props: `ClassAttributes<HTMLParagraphElement>`, `HTMLAttributes<HTMLParagraphElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
