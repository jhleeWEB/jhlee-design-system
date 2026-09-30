# Panel

`import { Panel, PanelGroup } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Panel

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/legacy/shell.tsx`

> **@deprecated** 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다

레거시 셸 `Panel`.

물려받는 props: `Pick<CardProps, "collapsed" | "onCollapsedChange" | "collapseTo" | "collapsedLabel" | "collapsedSignal" | "side">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `title` | `string` | 예 |  |  |
| `eyebrow` | `string` |  |  |  |
| `variant` | `"control" \| "inspect"` |  |  | 값: `control` · `inspect` |
| `actions` | `ReactNode` |  |  | 머리 오른쪽의 버튼들(닫기 등). |
| `titleHidden` | `boolean` |  |  | 제목을 화면에서 뺀다 — **이름은 남는다**(`aside[aria-label]`). 그 칸이 무엇인지 자리와 내용으로 이미 아는 패널에서 제목 줄은 한 줄을 통째로 쓰면서 아무것도 말하지 않는다. 머리에 들 것이 하나도 없으면 머리 자체를 그리지 않는다 — 빈 막대를 남기면 자리를 돌려준 것이 아니다. |
| `scrollable` | `boolean` |  |  | 고정 바닥과 별도 스크롤 본문을 가진 패널은 직접 스크롤 영역을 배치한다. |
| `children` | `ReactNode` | 예 |  |  |
| `collapsed` | `boolean` |  |  | 주면 이 카드는 접힌다. 제어 컴포넌트이므로 `onCollapsedChange` 도 함께 준다. |
| `onCollapsedChange` | `((collapsed: boolean) => void)` |  |  |  |
| `collapseTo` | `"strip" \| "header"` |  |  | 값: `header` · `strip` |
| `collapsedLabel` | `string` |  |  | 세로 탭에 적히는 이름. `collapseTo="strip"` 이면 필수다. |
| `collapsedSignal` | `ReactNode` |  |  | 접혔을 때도 남는 신호 — 미해결 판정 수 같은 것. 없으면 자리도 없다. |
| `side` | `"left" \| "right"` |  |  | 값: `left` · `right` |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### PanelGroup

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/legacy/shell.tsx`

> **@deprecated** 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다

레거시 셸 `PanelGroup`.

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `title` | `string` | 예 |  |  |
| `echo` | `ReactNode` |  |  |  |
| `open` | `boolean` |  |  |  |
| `children` | `ReactNode` | 예 |  |  |
