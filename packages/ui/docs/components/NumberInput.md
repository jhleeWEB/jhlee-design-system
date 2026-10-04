# NumberInput

`import { NumberInput } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## NumberInput

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/NumberInput.tsx`

수치 입력 — 범위(`min` · `max`) · 보폭(`step`, Shift ×10) · 단위(`unit`) · 증감 버튼(`stepper`). 값은 mono + tabular-nums 로 오른쪽 정렬이다.
선행 0 정리와 «0 이면 클릭이 전체 선택» 은 Input(`type="number"`)의 계약을 그대로 물려받는다.
`className` 은 바깥 줄(`data-slot="number-input"`)로, 나머지 속성 · ref 는 입력 칸으로 간다.
`nullable` 이면 빈 칸으로 떠날 때 빈 값(`null`)을 확정한다 — 기본은 마지막 확정 값으로 되돌린다.

물려받는 props: `Omit<InputProps, "type" | "value" | "defaultValue" | "onChange" | "suffix" | "numeric" | "min" | "max" | "step">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `value` | `number \| null` |  | `undefined` | 확정 값(제어). 주지 않으면(`undefined`) `defaultValue` 에서 시작해 스스로 든다. `null` 은 «비어 있다» 는 제어 값이다. |
| `defaultValue` | `number \| null` |  | `undefined` | 처음 확정 값(비제어). 없거나 `null` 이면 빈 칸이다. |
| `nullable` | `Nullable` |  | `false` | 빈 값을 확정할 수 있다 — 칸을 비우고 떠나면(blur · Enter) 마지막 값으로 되돌리지 않고 `onValueChange(null)` 을 부른다. «비우면 꺼지는» 선택적 수치에 쓴다. 빈 칸에서의 증감(↑↓ · 버튼)은 `min`(없으면 0)에서 시작한다. |
| `onValueChange` | `((value: Nullable extends true ? number \| null : number) => void)` |  | `undefined` | 확정될 때마다 새 값을 받는다 — 언제나 `min`–`max` 안의 수이고, `nullable` 이면 빈 값은 `null` 이다. |
| `invalid` | `boolean \| null` |  | `false` | 검증 실패 — 파괴색 테두리와 `aria-invalid`(Input 의 같은 이름). |
| `min` | `number` |  | `undefined` | 아래 경계 — 칸을 떠날 때와 증감할 때 여기로 당긴다. |
| `max` | `number` |  | `undefined` | 위 경계 — 칸을 떠날 때와 증감할 때 여기로 당긴다. |
| `step` | `number` |  | `1` | 보폭 — ↑↓ 와 증감 버튼 한 번의 크기. Shift 와 함께면 ×10. 결과는 보폭의 소수 자릿수로 반올림한다(0.1 + 0.2 의 부동소수 꼬리를 지운다). |
| `unit` | `string` |  | `undefined` | 값 뒤의 단위 — "m", "m²", "%". 입력 안에 겹쳐 그린다(Input 의 `suffix`). |
| `stepper` | `boolean` |  | `true` | 오른쪽에 −/+ 버튼을 둔다. 버튼은 탭 순서에 들지 않는다 — 키보드는 칸 안의 ↑↓ 가 같은 일을 한다. |
| `decrementLabel` | `string` |  | `"Decrease"` | − 버튼의 접근 가능한 이름. |
| `incrementLabel` | `string` |  | `"Increase"` | + 버튼의 접근 가능한 이름. |
| `size` | `"sm" \| "md" \| "lg" \| null` |  | `"md"` | 값: `sm` — 작은 컨트롤 높이 · `md` — 기본 컨트롤 높이 · `lg` — 큰 컨트롤 높이 · 넓은 가로 여백 |
