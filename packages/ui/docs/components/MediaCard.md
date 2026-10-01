# MediaCard

`import { MediaCard } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## MediaCard

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/MediaCard.tsx`

내용 카드 — 고를 수 있는 후보 한 개(썸네일 · 제목 · 메타 · 조치). `onSelect` 를 주면 카드 전체가 눌린다.

물려받는 props: `Omit<React.ComponentPropsWithRef<"div">, "title" | "onSelect">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `title` | `ReactNode` | 예 |  | 제목 — `onSelect` 가 있으면 카드 전체를 누르는 버튼의 접근 이름이 된다. |
| `eyebrow` | `ReactNode` |  | `undefined` | 제목 위 작은 라벨 — "Candidate 03" · "Dahisar". |
| `description` | `ReactNode` |  | `undefined` | 제목 아래 설명 — 두 줄에서 자른다. |
| `media` | `ReactNode` |  | `undefined` | 썸네일. 없으면 그 칸 자체가 사라진다. |
| `mediaRatio` | `"1/1" \| "16/9" \| "4/3" \| "none" \| "plan" \| null` |  | `"plan"` | 값: `1/1` — 정사각 · `16/9` — 와이드 · `4/3` — 표준 · `none` — 비율 없음. 썸네일 내용의 높이를 따른다 · `plan` — 3:2. 도면 썸네일 — 필지는 대개 가로로 길다 |
| `mediaWidth` | `string` |  | `"132px"` | 가로 배치일 때 썸네일 폭(CSS 길이). 세로 배치에서는 무시된다. |
| `mediaOverlay` | `ReactNode` |  | `undefined` | 썸네일 위 좌상단에 얹히는 것 — 순번 · 상태 점. |
| `meta` | `ReactNode` |  | `undefined` | 제목 아래 줄 — 배지 · KPI. |
| `actions` | `ReactNode` |  | `undefined` | 오른쪽 아래(세로) 또는 오른쪽 끝(가로)에 붙는 조치. 카드 클릭과 독립적으로 동작한다. |
| `onSelect` | `(() => void)` |  | `undefined` | 주면 카드 전체가 눌린다. 접근 이름은 `title`. |
| `elevation` | `"raised" \| "flat" \| "flush" \| null` |  | `"raised"` | 값: `raised` — 그림자로 떠 있다. 기본값 · `flat` — 테두리만 · `flush` — 각진 테두리. 격자에 붙는 칸 |
| `orientation` | `"vertical" \| "horizontal" \| null` |  | `"vertical"` | 값: `vertical` — 썸네일 위, 글 아래. 격자의 기본 · `horizontal` — 썸네일 왼쪽, 글 오른쪽. 목록 한 줄 |
| `selected` | `boolean \| null` |  | `"false"` | 선택됨 — 테두리 두께가 아니라 색(primary 링)으로 말한다. |
| `interactive` | `boolean \| null` |  | `"false"` | 눌리는 카드 — MediaCard 는 `onSelect` 가 있으면 스스로 켠다. |
