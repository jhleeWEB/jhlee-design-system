# Sidebar

`import { Sidebar, SidebarGroup, SidebarItem } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Sidebar

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Sidebar.tsx`

사이드바 — 접힌 rail(아이콘)과 펼친 panel(아이콘 + 라벨) 두 모습을 갖는 내비게이션 랜드마크.

물려받는 props: `ComponentProps<"nav">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `collapsed` | `boolean` |  | `false` | 접힘(rail) — 아이콘만 남고 항목마다 툴팁이 붙는다. 상태는 호출처가 든다(`useSidebarCollapse`). |
| `side` | `"left" \| "right"` |  | `"left"` | 값: `left` — 오른쪽 테두리 · `right` — 왼쪽 테두리 |
| `label` | `string` |  | `"Main"` | 내비게이션 랜드마크의 이름(`aria-label`). |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### SidebarGroup

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Sidebar.tsx`

구획. 접히면 제목 대신 구분선만 남는다 — 44px 폭에 대문자 라벨은 들어가지 않는다.

물려받는 props: `ComponentProps<"div">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `label` | `string` | 예 |  | 구획 제목 — 접히면 구분선의 `aria-label` 로 남는다. |

### SidebarItem

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Sidebar.tsx`

사이드바 항목 — 접히면 스스로 툴팁을 단다(이름 없는 아이콘이 남지 않게).

물려받는 props: `ComponentProps<"button">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `icon` | `ReactNode` | 예 |  | 항목의 아이콘 — 접혀도 남는 유일한 표시다. |
| `label` | `string` | 예 |  | 접혔을 때 툴팁 문구가 된다. |
| `active` | `boolean` |  | `false` | 지금 있는 곳 — `aria-current="page"` 로 옅게 물든다. |
| `badge` | `ReactNode` |  | `undefined` | 오른쪽에 붙는 숫자 — 항목 수 · 미해결 판정 수. 접히면 숨는다. |
| `shortcut` | `string` |  | `undefined` | 접힌 툴팁에 함께 보일 단축키. |
