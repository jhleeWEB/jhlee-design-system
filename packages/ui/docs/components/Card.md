# Card

`import { Card, CardCollapse, CardHeader, CardWell } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Card

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Card.tsx`

카드 — 이 제품의 기본 구획. `collapsed` + `onCollapsedChange` 를 주면 접힌다(`collapseTo` 로 세로 탭 또는 머리줄).

물려받는 props: `React.ComponentPropsWithRef<"div">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `header` | `ReactNode` |  | `undefined` | 머리줄을 명시하면 사용자 정의 컴포넌트로 감싸도 헤더 접기에서 항상 남는다. |
| `collapsed` | `boolean` |  | `undefined` | 주면 이 카드는 접힌다. 제어 컴포넌트이므로 `onCollapsedChange` 도 함께 준다. 둘 다 없으면 접히지 않는 카드다. |
| `onCollapsedChange` | `((collapsed: boolean) => void)` |  | `undefined` | 접기 버튼·세로 탭을 누르면 다음 상태로 불린다. |
| `collapseTo` | `"header" \| "strip"` |  | `"header"` | 값: `header` — 머리줄만. **세로로 쌓인** 칸 — 접으면 높이를 아래에 돌려준다 · `strip` — 세로 탭. **가로로 나란히 놓인** 패널·뷰 — 접으면 폭을 옆에 돌려준다 |
| `collapsedLabel` | `string` |  | `"panel"` | 세로 탭에 적히는 이름. `collapseTo="strip"` 이면 필수다. |
| `collapsedSignal` | `ReactNode` |  | `undefined` | 접혔을 때도 남는 신호 — 미해결 판정 수 같은 것. 없으면 자리도 없다. |
| `side` | `"left" \| "right"` |  | `"left"` | 값: `left` — 왼쪽 가장자리. 셰브론은 오른쪽(펼치면 내용이 오른쪽으로 자란다) · `right` — 오른쪽 가장자리. 셰브론은 왼쪽 |
| `elevation` | `"raised" \| "flat" \| "flush" \| null` |  | `"raised"` | 값: `raised` — 그림자로 떠 있는 카드. 기본값 · `flat` — 테두리만. 카드 안에 다시 칸을 나눌 때 · `flush` — 각진 테두리. 격자에 붙는 칸 |
| `pad` | `"none" \| "sm" \| "md" \| "lg" \| null` |  | `"none"` | 값: `none` — 없음. 기본값 — 머리줄·웰이 자기 여백을 갖는다 · `sm` — 12px · `md` — 16px · `lg` — 20px |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### CardCollapse

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Card.tsx`

머리줄 밖에 두는 접기 버튼 — 접히는 카드 안에서만 그려진다(아니면 `null`).

물려받는 props: `ClassAttributes<HTMLButtonElement>`, `ButtonHTMLAttributes<HTMLButtonElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### CardHeader

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Card.tsx`

카드 머리 — 제목은 왼쪽, 메타는 오른쪽. 접히는 카드면 접기 버튼이 자동으로 붙는다.

물려받는 props: `Omit<React.ComponentPropsWithRef<"div">, "title">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `title` | `ReactNode` |  | `undefined` | 제목 — `headingLevel` 이 있으면 그 수준의 제목 요소로, 없으면 `div` 로 그린다. |
| `meta` | `ReactNode` |  | `undefined` | 오른쪽 끝의 메타 — 치수 · 상태. tabular-nums 로 그린다. |
| `leading` | `ReactNode` |  | `undefined` | 제목 앞의 장식 — 아이콘 · 순번. |
| `headingLevel` | `2 \| 3 \| 4` |  | `undefined` | 제목 요소의 수준. - `2` — `h2` - `3` — `h3` - `4` — `h4` |
| `collapseButton` | `boolean` |  | `true` | 보기 전용 뷰도 본문 DOM 구조는 유지하고 접기 조작만 뺄 수 있다. |
| `variant` | `"default" \| "panel" \| null` |  | `"default"` | 값: `default` — 일반 카드의 여백 · `panel` — 뷰·페이지 패널. 같은 최소 높이·아래 테두리·홈통을 공유한다 |

### CardWell

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Card.tsx`

카드 안의 «웰» — 캔버스가 앉는 한 단 들어간 면.

물려받는 props: `ClassAttributes<HTMLDivElement>`, `HTMLAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
