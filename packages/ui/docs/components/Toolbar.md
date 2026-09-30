# Toolbar

`import { Toolbar, ToolbarDivider, ToolbarSpacer } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Toolbar

서버에서도 렌더 가능(지시문 없음) · 원본 `src/navigation/Toolbar.tsx`

툴바 — 캔버스 위 또는 그 바로 위의 한 줄. `onCanvas` 면 떠 있는 클러스터가 된다.
캔버스 위에 뜨는 경우 배경이 비쳐야 도면이 가려지지 않으므로 `on-canvas` 유틸리티를 쓴다.

물려받는 props: `ComponentProps<"div">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `onCanvas` | `boolean` |  | `false` | 캔버스 위에 떠 있는 클러스터로 그린다 — 반투명 바탕(`on-canvas`)·둥근 모서리·그림자. 끄면 크롬 한 줄(아래 테두리)이다. |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### ToolbarDivider

서버에서도 렌더 가능(지시문 없음) · 원본 `src/navigation/Toolbar.tsx`

툴바 안의 시각적 구분. `role="separator"` 를 주면 스크린리더가 툴바 항목 수를 잘못 센다.

물려받는 props: `ClassAttributes<HTMLSpanElement>`, `HTMLAttributes<HTMLSpanElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### ToolbarSpacer

서버에서도 렌더 가능(지시문 없음) · 원본 `src/navigation/Toolbar.tsx`

뒤따르는 항목을 툴바의 오른쪽 끝으로 민다(`margin-left: auto`).

물려받는 props: `ClassAttributes<HTMLSpanElement>`, `HTMLAttributes<HTMLSpanElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
