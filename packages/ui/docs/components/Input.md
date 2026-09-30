# Input

`import { Input } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Input

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Input.tsx`

입력 — 글자와 수치. `numeric` 이면 mono + tabular-nums, `type="number"` 면 선행 0 정리와 0 전체선택을 한다.

물려받는 props: `Omit<React.ComponentPropsWithRef<"input">, "size">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `suffix` | `string` |  | `undefined` | 값 뒤에 붙는 단위 — "m", "m²", "%". 입력 안에 겹쳐 그리므로 값이 가려지지 않게 패딩을 준다. 주면 `className` 은 입력이 아니라 래퍼(`data-slot="input-wrapper"`)로 간다. |
| `size` | `"sm" \| "md" \| "lg" \| null` |  | `"md"` | 값: `sm` — 작은 컨트롤 높이 · 본문 글자 · `md` — 기본 컨트롤 높이 · `lg` — 큰 컨트롤 높이 · 넓은 가로 여백 |
| `numeric` | `boolean \| null` |  | `"false"` | 수치 — 오른쪽 정렬 + mono tabular-nums(원칙 3). |
| `invalid` | `boolean \| null` |  | `"false"` | 검증 실패 — 파괴색 테두리와 `aria-invalid`. |
