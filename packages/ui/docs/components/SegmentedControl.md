# SegmentedControl

`import { SegmentedControl } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## SegmentedControl

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/SegmentedControl.tsx`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `options` | `readonly SegmentedOption<T>[]` | 예 |  |  |
| `value` | `T` | 예 |  |  |
| `onChange` | `(value: T) => void` | 예 |  |  |
| `label` | `string` | 예 |  | 스크린리더가 읽는 이 컨트롤의 이름 — "View mode" 처럼. |
| `size` | `"sm" \| "md"` |  |  | 값: `md` · `sm` |
| `className` | `string` |  |  |  |
| `disabled` | `boolean` |  |  |  |
