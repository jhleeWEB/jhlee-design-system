# Legend

`import { Legend, LegendItem } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Legend

서버에서도 렌더 가능(지시문 없음) · 원본 `src/Legend.tsx`

캔버스 범례 — `LegendItem` 의 목록. 흰 바탕 · 옅은 선 테두리 · radius 0, 테마와 무관하게 같은 모양이다.
스크린리더 이름은 기본 «Legend» 이고 `aria-label` 로 바꾼다.

물려받는 props: `ComponentPropsWithRef<"ul">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `orientation` | `"vertical" \| "horizontal" \| null` |  | `"vertical"` | 값: `vertical` — 한 줄에 한 항목. 도면 모서리의 범례 상자 · `horizontal` — 한 줄에 이어 놓고 넘치면 줄을 바꾼다. 도면 아래 띠 |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### LegendItem

서버에서도 렌더 가능(지시문 없음) · 원본 `src/Legend.tsx`

범례 한 줄 — 스와치(장식, 스크린리더는 건너뛴다) + 라벨(`children`). 스와치는 캔버스 무채색 한 단(`swatch`)과 무늬(`pattern`)로 그린다.

물려받는 props: `ComponentPropsWithRef<"li">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `pattern` | `"fill" \| "outline" \| "hatch" \| "line" \| null` |  | `"fill"` | 값: `fill` — 꽉 찬 사각(면 · 영역) · `outline` — 외곽선만 있는 사각(경계 · 계획선) · `hatch` — 외곽선 + 45° 빗금(단면 · 제외 구역) · `line` — 가로 선 하나(선 요소 · 치수선) |
| `swatch` | `"ink" \| "ink-2" \| "muted" \| "line-strong" \| "line" \| "grid" \| "surface" \| null` |  | `"ink"` | 값: `ink` — 가장 진한 먹(벽 · 주된 선) · `ink-2` — 한 단 옅은 먹 · `muted` — 흐린 먹(보조 선 · 치수) · `line-strong` — 진한 선색 · `line` — 옅은 선색 · `grid` — 격자색 · `surface` — 바탕에서 한 단 들어간 면(채움보다 외곽 · 빗금과 함께 쓴다 — 흰 바탕 위 채움은 거의 보이지 않는다) |
