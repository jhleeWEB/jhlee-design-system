# Field

`import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Field

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Field.tsx`

필드의 루트 — 라벨 · 컨트롤 · 설명 · 오류가 쓸 id 를 만들어 나눠 준다. 배치는 `orientation`(위아래 · 한 줄)만 고른다.

물려받는 props: `React.ComponentPropsWithRef<"div">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `invalid` | `boolean` |  | `false` | 검증 실패 — 컨트롤에 `aria-invalid` 를 꽂는다. 주지 않아도 `FieldError` 에 내용이 있으면 실패로 본다. |
| `disabled` | `boolean` |  | `false` | 필드 전체를 비활성으로 — 컨트롤에 `disabled` 를 꽂고 라벨을 흐리게 한다. |
| `orientation` | `"vertical" \| "horizontal" \| null` |  | `"vertical"` | 값: `vertical` — 라벨 · 컨트롤 · 설명 · 오류를 위에서 아래로 쌓는다(입력 · 선택) · `horizontal` — 컨트롤과 라벨을 한 줄에, 설명 · 오류는 다음 줄에 둔다(체크박스 · 스위치) |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### FieldControl

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Field.tsx`

컨트롤 자리 — 자식 컨트롤 하나에 id · `aria-describedby`(그려진 설명 · 오류) · `aria-invalid` · `disabled` 를 꽂는다.
자기 DOM 은 없다(Radix `Slot`) — `data-slot` 은 자식의 것(`input` · `select-trigger` · `checkbox` …)이 남는다.
자식에 `id` 를 따로 적지 않는다 — 라벨의 `htmlFor` 와 어긋난다.

물려받는 props: `React.ComponentPropsWithRef<typeof Slot.Root>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `aria-describedby` | `string` |  | `undefined` | 필드의 설명·오류 **밖의** 설명 id — 필드가 만든 id 뒤에 이어 붙는다. 자식에 직접 `aria-describedby` 를 적으면 이 연결 전체를 덮으니 여기로 넘긴다. |

### FieldDescription

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Field.tsx`

컨트롤 아래의 도움말 — 컨트롤의 `aria-describedby` 에 실린다. 흐린 라벨 글자.

물려받는 props: `ClassAttributes<HTMLParagraphElement>`, `HTMLAttributes<HTMLParagraphElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### FieldError

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Field.tsx`

검증 오류 문장 — 내용이 있을 때만 그려지고, 그려지면 필드를 실패(`aria-invalid`)로 만들며 `aria-describedby` 에 실린다.
파괴색 글자다 — 색만으로 말하지 않도록 문장이 곧 신호다(원칙 2).

물려받는 props: `ClassAttributes<HTMLParagraphElement>`, `HTMLAttributes<HTMLParagraphElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_

### FieldLabel

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Field.tsx`

컨트롤의 이름 — `htmlFor` 가 `FieldControl` 의 id 를 가리키므로 누르면 컨트롤로 간다. 필드가 비활성이면 흐려진다.

물려받는 props: `LabelProps`, `RefAttributes<HTMLLabelElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
