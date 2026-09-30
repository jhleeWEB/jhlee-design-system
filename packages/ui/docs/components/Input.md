# Input

`import { Input } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Input

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Input.tsx`

물려받는 props: `Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">`, `RefAttributes<HTMLInputElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `suffix` | `string` |  |  | 값 뒤에 붙는 단위 — "m", "m²", "%". 입력 안에 겹쳐 그리므로 값이 가려지지 않게 패딩을 준다. |
| `size` | `"sm" \| "md" \| "lg" \| null` |  | `"md"` | 값: `sm` · `md` · `lg` |
| `numeric` | `boolean \| null` |  | `"false"` |  |
| `invalid` | `boolean \| null` |  | `"false"` |  |
