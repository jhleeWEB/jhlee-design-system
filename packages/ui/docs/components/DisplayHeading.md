# DisplayHeading

`import { DisplayHeading } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## DisplayHeading

서버에서도 렌더 가능(지시문 없음) · 원본 `src/primitives/Editorial.tsx`

들머리 제목 — 한 패널에 하나만. UA 여백은 걷는다(간격은 부모의 `gap` 이 정한다).

물려받는 props: `ClassAttributes<HTMLHeadingElement>`, `HTMLAttributes<HTMLHeadingElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `as` | `"h1" \| "h2" \| "h3"` |  | `"h2"` | 값: `h1` — 페이지의 첫 제목 · `h2` — 패널의 들머리. 기본값 · `h3` — 패널 안 구획의 들머리 |
