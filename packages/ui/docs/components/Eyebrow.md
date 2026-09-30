# Eyebrow

`import { Eyebrow } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Eyebrow

서버에서도 렌더 가능(지시문 없음) · 원본 `src/primitives/Editorial.tsx`

들머리 눈썹 — 대문자 mono 한 줄. 순서가 있는 단계에서만 `step` 번호를 붙인다.

물려받는 props: `ClassAttributes<HTMLDivElement>`, `HTMLAttributes<HTMLDivElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `step` | `string` |  | `undefined` | 단계 번호 — «01 / BRIEF» 의 `01`. 순서가 실제로 있는 단계에만 준다. |
