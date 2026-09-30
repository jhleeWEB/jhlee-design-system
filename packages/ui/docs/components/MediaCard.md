# MediaCard

`import { MediaCard } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## MediaCard

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/MediaCard.tsx`

물려받는 props: `Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "onSelect">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `title` | `ReactNode` | 예 |  |  |
| `eyebrow` | `ReactNode` |  |  | 제목 위 작은 라벨 — "Candidate 03" · "Dahisar". |
| `description` | `ReactNode` |  |  |  |
| `media` | `ReactNode` |  |  | 썸네일. 없으면 그 칸 자체가 사라진다. |
| `mediaRatio` | `"none" \| "16/9" \| "4/3" \| "1/1" \| "plan" \| null` |  |  | 값: `1/1` · `16/9` · `4/3` · `none` · `plan` |
| `mediaWidth` | `string` |  |  | 가로 배치일 때 썸네일 폭. 세로 배치에서는 무시된다. |
| `mediaOverlay` | `ReactNode` |  |  | 썸네일 위 좌상단에 얹히는 것 — 순번 · 상태 점. |
| `meta` | `ReactNode` |  |  | 제목 아래 줄 — 배지 · KPI. |
| `actions` | `ReactNode` |  |  | 오른쪽 아래(세로) 또는 오른쪽 끝(가로)에 붙는 조치. 카드 클릭과 독립적으로 동작한다. |
| `onSelect` | `(() => void)` |  |  | 주면 카드 전체가 눌린다. 접근 이름은 `title`. |
| `elevation` | `"raised" \| "flat" \| "flush" \| null` |  | `"raised"` | 값: `raised` · `flat` · `flush` |
| `orientation` | `"vertical" \| "horizontal" \| null` |  | `"vertical"` | 값: `vertical` · `horizontal` |
| `selected` | `boolean \| null` |  | `"false"` |  |
| `interactive` | `boolean \| null` |  | `"false"` |  |
