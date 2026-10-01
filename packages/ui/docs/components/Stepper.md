# Stepper

`import { Stepper } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Stepper

서버에서도 렌더 가능(지시문 없음) · 원본 `src/navigation/Stepper.tsx`

단계 진행 — 순서 있는 목록(`ol`)에 단계마다 원(번호 · 체크 · X) · 이름 · 상태 글자 · 설명을 두고 사이를 선으로 잇는다.
방향은 `orientation`(가로 · 세로).

물려받는 props: `Omit<React.ComponentPropsWithRef<"ol">, "children">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `steps` | `readonly StepperStep[]` | 예 |  | 단계들 — 순서대로. |
| `current` | `number` |  | `0` | 지금 단계의 번호(0 부터) — `aria-current="step"` 이 여기 선다. 단계 수 이상이면 모든 단계가 끝난 것이다. |
| `orientation` | `"vertical" \| "horizontal" \| null` |  | `"horizontal"` | 값: `horizontal` — 단계를 한 줄에 두고 원 사이를 가로선으로 잇는다. 마법사 머리 · 넓은 화면 · `vertical` — 단계를 위에서 아래로 쌓고 표시 원 아래로 세로선을 잇는다. 사이드 패널 · 설명이 긴 단계 |
