# FieldControl

`import { FieldControl } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## FieldControl

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Field.tsx`

컨트롤 자리 — 자식 컨트롤 하나에 id · `aria-describedby`(그려진 설명 · 오류) · `aria-invalid` · `disabled` 를 꽂는다.
자기 DOM 은 없다(Radix `Slot`) — `data-slot` 은 자식의 것(`input` · `select-trigger` · `checkbox` …)이 남는다.
자식에 `id` 를 따로 적지 않는다 — 라벨의 `htmlFor` 와 어긋난다.

물려받는 props: `React.ComponentPropsWithRef<typeof Slot.Root>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `aria-describedby` | `string` |  | `undefined` | 필드의 설명·오류 **밖의** 설명 id — 필드가 만든 id 뒤에 이어 붙는다. 자식에 직접 `aria-describedby` 를 적으면 이 연결 전체를 덮으니 여기로 넘긴다. |
