# Tooltip

`import { Tooltip, TooltipProvider } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Tooltip

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Tooltip.tsx`

툴팁 — 트리거(`children`) 위에 말풍선(`label`)을 띄운다. `className` · `ref` · 나머지 속성은 말풍선에 닿는다.

물려받는 props: `Omit<React.ComponentPropsWithRef<typeof Radix.Content>, "children" | "content" | "asChild" | "forceMount">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `children` | `ReactNode` | 예 |  | 띄울 대상. 포커스 가능한 요소여야 키보드에서도 보인다. |
| `label` | `ReactNode` | 예 |  | 말풍선의 글 — 짧은 명사구. 조작(버튼·링크)은 넣지 않는다. |
| `shortcut` | `string` |  | `undefined` | 오른쪽에 흐리게 붙는 단축키 — "Zoom to fit" + "⇧2". |
| `delayDuration` | `number` |  | `MOTION.tooltipDelayMs` | 포인터를 올린 뒤 뜨기까지의 지연(ms) — 모션 토큰 `--duration-tooltip-delay`(350ms). |
| `open` | `boolean` |  | `undefined` | 제어 모드의 열림 — 생략하면 포인터·포커스가 연다(비제어). |
| `onOpenChange` | `((open: boolean) => void)` |  | `undefined` | 열림이 바뀔 때. |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### TooltipProvider

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/Tooltip.tsx`

툴팁 지연을 공유하는 공급자 — 앱(또는 툴바) 루트에 한 번 둔다. 자기 DOM 은 없다(Radix `Tooltip.Provider`).

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
