# SelectTrigger

`import { SelectTrigger } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## SelectTrigger

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Select.tsx`

목록을 여는 버튼 — Input 과 같은 높이 사다리(`size`)와 검증 실패(`invalid`)를 갖는다. 안에 `SelectValue` 를 두고, 펼침 화살표는 DS 가 붙인다.
장식(값 · 화살표)을 트리거가 소유하므로 `asChild` 는 받지 않는다.

물려받는 props: `Omit<React.ComponentPropsWithRef<typeof Radix.Trigger>, "asChild">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg" \| null` |  | `"md"` | 값: `sm` — 작은 컨트롤 높이 · 본문 글자 · `md` — 기본 컨트롤 높이 · `lg` — 큰 컨트롤 높이 · 넓은 가로 여백 |
| `invalid` | `boolean \| null` |  | `"false"` | 검증 실패 — 파괴색 테두리와 `aria-invalid`. |
