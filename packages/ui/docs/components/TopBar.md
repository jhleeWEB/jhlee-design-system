# TopBar

`import { TopBar } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## TopBar

서버에서도 렌더 가능(지시문 없음) · 원본 `src/navigation/TopBar.tsx`

상단바 — 제목 · eyebrow · 브레드크럼 · 동작 슬롯을 한 줄에 고정 순서로 놓는다.

물려받는 props: `Omit<ComponentProps<"header">, "title">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `title` | `ReactNode` | 예 |  | 화면 제목 — 제목 요소(`h1` 기본)로 렌더한다. |
| `eyebrow` | `ReactNode` |  | `undefined` | 제목 옆의 작은 대문자 줄 — 프로젝트 · 관할 · 단계. |
| `breadcrumb` | `ReactNode` |  | `undefined` | 경로 — `Breadcrumb` 을 그대로 넣는다. 제목 뒤에 세로 구분선과 함께 선다. |
| `leading` | `ReactNode` |  | `undefined` | 제목 앞 — 로고 · 사이드바 토글. |
| `actions` | `ReactNode` |  | `undefined` | 오른쪽 끝의 동작 — 버튼 묶음 · 패널 토글. |
| `headingLevel` | `1 \| 2 \| 3` |  | `1` | 제목 요소의 단계. 상단바가 화면의 첫 제목이면 1, 셸 안의 하위 화면이면 2. |
| `size` | `"sm" \| "md"` |  | `"md"` | 값: `sm` — 44px(밀도 높은 도구 화면) · `md` — 56px(기본) |
