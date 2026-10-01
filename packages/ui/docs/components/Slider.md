# Slider

`import { Slider } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Slider

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Slider.tsx`

슬라이더 — 값 하나(`[50]`) 또는 범위(`[20, 80]`)를 고른다. 값은 언제나 배열이다(Radix 계약). 드래그 중에는 `onValueChange`,
놓거나 키보드 조작이 끝나면 `onValueCommit` 이 한 번 온다 — 무거운 재계산은 commit 에 건다.
스크린리더 이름은 `aria-label`(또는 `aria-labelledby`)로 주고, 손잡이에 옮겨 단다 — 범위면 «이름 minimum» · «이름 maximum» 이 된다.

물려받는 props: `Omit<React.ComponentPropsWithRef<typeof Radix.Root>, "asChild" | "orientation" | "children">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `marks` | `readonly SliderMark[]` |  | `undefined` | 트랙 아래 눈금과 라벨 — 라벨은 mono + tabular-nums 다. 스크린리더는 손잡이의 값으로 읽으므로 눈금은 장식이다. |
| `showValue` | `boolean` |  | `false` | 트랙 오른쪽에 지금 값을 mono + tabular-nums 로 적는다. 범위면 «아래 – 위» 다. 폭은 `min`·`max` 의 표기 길이로 고정해 값이 바뀌어도 트랙이 흔들리지 않는다. |
| `formatValue` | `((value: number) => string)` |  | `String` | 값 → 글자. `showValue` 의 표시와 손잡이의 `aria-valuetext` 에 함께 쓴다(단위를 붙이는 자리 — `(v) => \`${v} m\``). |
| `size` | `"sm" \| "md" \| null` |  | `"md"` | 값: `sm` — 낮은 띠 · 얇은 트랙 · 작은 손잡이. 패널 안 촘촘한 줄 · `md` — 작은 컨트롤 높이의 띠 · 기본 트랙 · 기본 손잡이 |
