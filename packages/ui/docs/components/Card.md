# Card

`import { Card, CardCollapse, CardHeader, CardWell } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Card

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Card.tsx`

물려받는 props: `React.ComponentPropsWithRef<"div">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `header` | `ReactNode` |  |  | 머리줄을 명시하면 사용자 정의 컴포넌트로 감싸도 헤더 접기에서 항상 남는다. |
| `collapsed` | `boolean` |  |  | 주면 이 카드는 접힌다. 제어 컴포넌트이므로 `onCollapsedChange` 도 함께 준다. |
| `onCollapsedChange` | `((collapsed: boolean) => void)` |  |  |  |
| `collapseTo` | `"strip" \| "header"` |  |  | 값: `header` · `strip` |
| `collapsedLabel` | `string` |  |  | 세로 탭에 적히는 이름. `collapseTo="strip"` 이면 필수다. |
| `collapsedSignal` | `ReactNode` |  |  | 접혔을 때도 남는 신호 — 미해결 판정 수 같은 것. 없으면 자리도 없다. |
| `side` | `"left" \| "right"` |  |  | 값: `left` · `right` |
| `elevation` | `"raised" \| "flat" \| "flush" \| null` |  | `"raised"` | 값: `raised` · `flat` · `flush` |
| `pad` | `"none" \| "sm" \| "md" \| "lg" \| null` |  | `"none"` | 값: `none` · `sm` · `md` · `lg` |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### CardCollapse

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Card.tsx`

물려받는 props: `ClassAttributes<HTMLButtonElement>`, `ButtonHTMLAttributes<HTMLButtonElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### CardHeader

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Card.tsx`

물려받는 props: `Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "title">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `title` | `ReactNode` |  |  |  |
| `meta` | `ReactNode` |  |  |  |
| `leading` | `ReactNode` |  |  |  |
| `variant` | `"default" \| "panel"` |  |  | 값: `panel` · `default` — deprecated alias of "neutral" |
| `headingLevel` | `2 \| 3 \| 4` |  |  |  |
| `collapseButton` | `boolean` |  |  | 보기 전용 뷰도 본문 DOM 구조는 유지하고 접기 조작만 뺄 수 있다. |

### CardWell

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Card.tsx`

물려받는 props: `ClassAttributes<HTMLDivElement>`, `HTMLAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
