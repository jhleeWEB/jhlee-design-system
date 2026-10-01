# StatusDot

`import { StatusDot } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## StatusDot

서버에서도 렌더 가능(지시문 없음) · 원본 `src/primitives/Badge.tsx`

상태 점 — 글자를 넣을 수 없는 좁은 자리에서만. 이름(`label`)이 필수다.

물려받는 props: `Omit<React.ComponentPropsWithRef<"span">, "children">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `tone` | `BadgeTone` |  | `"neutral"` | 값: `neutral` — 기본 · `primary` — 주된 것 · `success` — 통과 · `warning` — 주의 · `destructive` — 실패 |
| `label` | `string` | 예 |  | 점의 이름 — `aria-label` 과 `title` 로 간다. 점만으로는 상태를 말할 수 없어 필수다. |
