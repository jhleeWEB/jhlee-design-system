# Badge

`import { Badge } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Badge

서버에서도 렌더 가능(지시문 없음) · 원본 `src/primitives/Badge.tsx`

배지 — 상태를 **글자와 함께** 말한다. 점만 필요한 좁은 자리는 `StatusDot`.

물려받는 props: `React.ComponentPropsWithRef<"span">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `tone` | `BadgeTone \| null` |  | `"neutral"` | 값: `neutral` — 기본 · `primary` — 주된 것 · 지금 고른 것 · `success` — 통과 · `warning` — 주의 · `destructive` — 실패 |
| `dot` | `boolean` |  | `false` | 글자 앞에 톤 색의 점을 둔다 — 목록에서 훑어 읽을 때. |
| `children` | `ReactNode` | 예 |  | 상태를 말하는 글자 — 필수다(원칙 2: 상태는 텍스트와 병기한다). |
| `provisional` | `boolean \| null` |  | `"false"` | 잠정 — 점선 테두리로 «아직 확정이 아니다» 를 말한다(검증 대기). |
