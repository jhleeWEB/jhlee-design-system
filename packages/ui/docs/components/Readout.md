# Readout

`import { Readout, ReadoutItem } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Readout

서버에서도 렌더 가능(지시문 없음) · 원본 `src/data/Readout.tsx`

수치 묶음 — 칸(`ReadoutItem`)을 한 줄에 나란히 두고 좁으면 줄을 바꾼다. 칸 사이는 1px 선이다.

물려받는 props: `ComponentPropsWithRef<"dl">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `live` | `boolean` |  | `false` | 값이 바뀌면 스크린리더가 읽는다(`aria-live="polite"`). 드래그처럼 값이 빠르게 바뀌는 자리에서는 끄고, 확정된 결과만 보이는 자리에서 켠다. |
| `variant` | `"inline" \| "floating" \| null` |  | `"inline"` | 값: `inline` — 패널 · 카드 안에 그림자 없이 선다 · `floating` — 캔버스 위에 뜬다 — 부유 레이어의 그림자(`shadow-pop`) |
| `size` | `"sm" \| "md" \| null` |  | `"md"` | 값: `sm` — 제목 크기의 값. 패널 안의 작은 묶음 · `md` — 판독(readout) 크기의 큰 값. 캔버스 위 실시간 지표 |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### ReadoutItem

서버에서도 렌더 가능(지시문 없음) · 원본 `src/data/Readout.tsx`

판독 한 칸 — 라벨 · 값 · 단위, 그리고 판정(`tone` + `status`). 판정색은 값과 `status` 글자에만 입힌다.

물려받는 props: `Omit<ComponentPropsWithRef<"div">, "children">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `label` | `ReactNode` | 예 |  | 칸의 이름(`<dt>`) — mono 대문자 미세라벨. |
| `value` | `ReactNode` | 예 |  | 값(`<dd>`) — mono + tabular-nums. 숫자 서식(천 단위 쉼표 · 소수 자리)은 앱이 정한다. |
| `unit` | `string` |  | `undefined` | 값 뒤의 단위 — "m²", "%", "units". 값보다 작고 흐리다. |
| `status` | `ReactNode` |  | `undefined` | 판정을 말하는 글자 — "Over limit" · "Within range". `tone` 이 색을 줄 때 함께 준다: 상태는 언제나 글자와 병기한다(원칙 2). |
| `tone` | `"neutral" \| "primary" \| "success" \| "warning" \| "destructive" \| "info" \| null` |  | `"neutral"` | 값: `neutral` — 판정 없음(기본 글자색) · `primary` — 지금 고른 것 · 주된 것 · `success` — 통과 · `warning` — 주의 · `destructive` — 실패 · `info` — 안내 |
