# DataTable

`import { DataTable } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## DataTable

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/data/DataTable.tsx`

명세서 표 — 한 열 정렬 · 행 선택 · 합계 줄 · 줄 높이를 지키는 로딩. 수치 열은 우측 정렬 + mono + tabular-nums.

물려받는 props: `Omit<React.ComponentProps<"div">, "onSelect" | "children">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `columns` | `readonly Column<Row>[]` | 예 |  | 열 정의. 순서대로 그린다. |
| `rows` | `readonly Row[]` | 예 |  | 행 데이터. 정렬해도 이 배열은 바꾸지 않는다. |
| `rowKey` | `(row: Row, index: number) => string` | 예 |  | 각 행의 안정적인 키. |
| `caption` | `string` | 예 |  | 표의 이름. 스크린리더가 읽고, `captionVisible` 이면 화면에도 보인다. |
| `captionVisible` | `boolean` |  | `false` | 캡션을 화면에도 보인다. 끄면 스크린리더만 읽는다. |
| `selectedKey` | `string` |  | `undefined` | 선택된 행의 키. 캔버스 선택과 연동하는 자리다. |
| `onSelect` | `((key: string, row: Row) => void)` |  | `undefined` | 행을 골랐을 때 — 주면 첫 칸에 선택 radio 가 붙고 행 클릭이 선택이 된다. 없으면 표는 읽기 전용이다. |
| `totalLabel` | `string` |  | `"Total"` | 합계 줄 첫 칸의 라벨 — 합계 줄은 `columns[].total` 이 하나라도 있으면 자동으로 켜진다. |
| `loading` | `boolean` |  | `false` | 값이 아직 없다. 줄 높이를 유지한 스켈레톤을 그린다. |
| `loadingRows` | `number` |  | `4` | 로딩 중 스켈레톤 줄 수. |
| `empty` | `ReactNode` |  | `"No rows."` | 행이 없을 때. 「없다」가 아니라 「무엇을 하면 채워지는가」를 적는다. |
| `stickyHeader` | `boolean` |  | `false` | 머리를 스크롤 위에 고정한다. 긴 명세서에서 열 이름을 잃지 않는다. |
| `className` | `string` |  | `undefined` | 바깥 `<div>` 에 합쳐지는 클래스(tailwind-merge). |
