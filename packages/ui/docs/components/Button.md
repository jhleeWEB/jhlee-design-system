# Button

`import { Button, ButtonGroup } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Button

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Button.tsx`

물려받는 props: `ButtonHTMLAttributes<HTMLButtonElement>`, `RefAttributes<HTMLButtonElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `tone` | `ToneInput<ButtonTone> \| null` |  | `"neutral"` | 값: `neutral` — 기본 · `primary` — 주된 동작 · `destructive` — 파괴적 동작 · `accent` — deprecated alias of "primary" · `current` — deprecated alias of "neutral" · `danger` — deprecated alias of "destructive" · `default` — deprecated alias of "neutral" |
| `asChild` | `boolean` |  |  | 래퍼를 만들지 않고 자식 요소에 버튼 스타일을 입힌다 — 링크를 버튼으로 보이게 할 때. |
| `loading` | `boolean` |  |  | 진행 중. 스피너로 라벨을 **대체하지 않는다** — 폭이 흔들리면 옆 버튼이 밀린다. |
| `variant` | `"link" \| "solid" \| "outline" \| "ghost" \| null` |  | `"outline"` | 값: `solid` · `outline` · `ghost` · `link` |
| `size` | `"sm" \| "md" \| "lg" \| "icon-sm" \| "icon" \| "icon-lg" \| null` |  | `"md"` | 값: `sm` · `md` · `lg` · `icon-sm` · `icon` · `icon-lg` |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### ButtonGroup

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Button.tsx`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
