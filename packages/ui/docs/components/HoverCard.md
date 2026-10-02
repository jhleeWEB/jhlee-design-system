# HoverCard

`import { HoverCard, HoverCardContent, HoverCardTrigger } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## HoverCard

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/HoverCard.tsx`

호버 카드의 루트 — 열림 상태(`open` · `defaultOpen` · `onOpenChange`)와 지연(`openDelay` · `closeDelay`)만 든다. 자기 DOM 은 없다(Radix `HoverCard.Root`).

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### HoverCardContent

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/HoverCard.tsx`

호버 카드 상자 — 포털로 뜬다. 면과 꼬리는 Popover 와 같고 폭은 팝오버 상한에 고정이다.

물려받는 props: `Omit<React.ComponentPropsWithRef<typeof Radix.Content>, "forceMount">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `onCanvas` | `boolean` |  | `false` | 캔버스 위에 얹힌다 — 반투명 + 블러로 도면이 비친다. 끄면 불투명한 카드 면이다. |
| `arrow` | `boolean` |  | `false` | 트리거를 가리키는 꼬리를 단다 — 트리거가 여럿 모인 목록에서 어느 것의 카드인지 흐릴 때만. |

### HoverCardTrigger

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/overlay/HoverCard.tsx`

호버하면 카드를 여는 요소 — 기본은 `<a>` 다. `asChild` 로 DS 링크·버튼을 쓴다. 키보드 포커스로도 열린다.

물려받는 props: `HoverCardTriggerProps`, `RefAttributes<HTMLAnchorElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
