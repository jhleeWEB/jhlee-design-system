# Tooltip

`import { Tooltip, TooltipProvider } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Tooltip

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Tooltip.tsx`

물려받는 props: `Pick<React.ComponentPropsWithoutRef<typeof Radix.Content>, "side" | "align" | "sideOffset">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `children` | `ReactNode` | 예 |  | 띄울 대상. 포커스 가능한 요소여야 키보드에서도 보인다. |
| `label` | `ReactNode` | 예 |  |  |
| `shortcut` | `string` |  |  | 오른쪽에 흐리게 붙는 단축키 — "Zoom to fit" + "⇧2". |
| `delayDuration` | `number` |  |  |  |
| `open` | `boolean` |  |  |  |
| `onOpenChange` | `((open: boolean) => void)` |  |  |  |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### TooltipProvider

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Tooltip.tsx`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
