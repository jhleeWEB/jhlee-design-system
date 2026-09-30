# Sidebar

`import { Sidebar, SidebarGroup, SidebarItem } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Sidebar

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Sidebar.tsx`

물려받는 props: `React.HTMLAttributes<HTMLElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `collapsed` | `boolean` |  |  |  |
| `side` | `"left" \| "right"` |  |  | 값: `left` · `right` |
| `label` | `string` |  |  |  |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### SidebarGroup

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Sidebar.tsx`

물려받는 props: `HTMLAttributes<HTMLDivElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `label` | `string` | 예 |  |  |

### SidebarItem

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Sidebar.tsx`

물려받는 props: `React.ButtonHTMLAttributes<HTMLButtonElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `icon` | `ReactNode` | 예 |  |  |
| `label` | `string` | 예 |  | 접혔을 때 툴팁 문구가 된다. |
| `active` | `boolean` |  |  |  |
| `badge` | `ReactNode` |  |  | 오른쪽에 붙는 숫자 — 항목 수 · 미해결 판정 수. 접히면 숨는다. |
| `shortcut` | `string` |  |  |  |
