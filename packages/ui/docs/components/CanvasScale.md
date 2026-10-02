# CanvasScale

`import { CanvasScale } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## CanvasScale

서버에서도 렌더 가능(지시문 없음) · 원본 `src/CanvasScale.tsx`

SVG 도면 안과 HTML 위 오버레이에서 같은 모양을 쓰며 위치와 현재 축척은 소비자가 정한다.

물려받는 props: `Omit<ComponentPropsWithRef<"svg">, "children">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `lengthPx` | `number` |  | `0` | 막대 길이(화면 px) — `niceScale()` 의 `px`. 음수·NaN·무한대는 0 으로 그린다. |
| `label` | `string` |  | `""` | 막대 아래 라벨 — `niceScale()` 의 `lengthM` 을 소비자가 단위와 함께 적는다("10 m"). |
