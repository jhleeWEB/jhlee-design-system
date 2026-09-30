# DataTable

`import { DataTable } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## DataTable

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/data/DataTable.tsx`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `columns` | `readonly Column<Row>[]` | 예 |  |  |
| `rows` | `readonly Row[]` | 예 |  |  |
| `rowKey` | `(row: Row, index: number) => string` | 예 |  | 각 행의 안정적인 키. |
| `caption` | `string` | 예 |  | 표의 이름. 스크린리더가 읽고, `captionVisible` 이면 화면에도 보인다. |
| `captionVisible` | `boolean` |  |  |  |
| `selectedKey` | `string` |  |  | 선택된 행의 키. 캔버스 선택과 연동하는 자리다. |
| `onSelect` | `((key: string, row: Row) => void)` |  |  |  |
| `totalLabel` | `string` |  |  | 합계 줄을 그린다 — `columns[].total` 이 하나라도 있으면 자동으로 켜진다. |
| `loading` | `boolean` |  |  | 값이 아직 없다. 줄 높이를 유지한 스켈레톤을 그린다. |
| `loadingRows` | `number` |  |  |  |
| `empty` | `ReactNode` |  |  | 행이 없을 때. 「없다」가 아니라 「무엇을 하면 채워지는가」를 적는다. |
| `stickyHeader` | `boolean` |  |  | 머리를 스크롤 위에 고정한다. 긴 명세서에서 열 이름을 잃지 않는다. |
| `className` | `string` |  |  |  |
