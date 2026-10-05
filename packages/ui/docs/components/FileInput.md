# FileInput

`import { FileInput } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## FileInput

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/FileInput.tsx`

파일 입력 — 고르기 버튼 · 고른 파일 이름과 크기 · 지우기. 같은 상자에 파일을 끌어다 놓아도 된다. `Field` 안에서 라벨 · 설명 · 오류와 이어진다.
`ref` 와 나머지 속성은 숨긴 `<input type="file">` 으로, `className` 은 상자로 간다.

물려받는 props: `Omit<React.ComponentPropsWithRef<"input">, "type" | "size" | "value" | "defaultValue" | "children">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `onFilesChange` | `((files: File[]) => void)` |  | `undefined` | 고른 파일이 바뀔 때 — 고르기 · 놓기 · 지우기 모두. 지우면 빈 배열이다. `multiple` 이 아니면 길이는 0 또는 1. |
| `chooseLabel` | `string` |  | `"Choose file"` | 고르기 버튼의 글자. |
| `placeholder` | `string` |  | `"No file chosen"` | 아직 고르지 않았을 때 이름 자리에 서는 글자. |
| `size` | `"sm" \| "md" \| "lg" \| null` |  | `"md"` | 값: `sm` — 작은 컨트롤 높이 · `md` — 기본 컨트롤 높이 · `lg` — 큰 컨트롤 높이 |
| `invalid` | `boolean \| null` |  | `"false"` | 검증 실패 — 파괴색 테두리. `Field` 안에서는 `aria-invalid` 로 켜진다. |
