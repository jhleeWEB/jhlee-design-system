# SegmentedControl

`import { SegmentedControl } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## SegmentedControl

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/SegmentedControl.tsx`

배타적 뷰 전환 — 트랙 위의 흰 pill 이 지금 고른 값이다(radiogroup · roving tabindex).

물려받는 props: `Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "role">`, `RefAttributes<HTMLDivElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `options` | `readonly SegmentedOption<T>[]` | 예 |  | 고를 수 있는 값들 — 왼쪽부터 이 순서로 놓인다. |
| `value` | `T` | 예 |  | 지금 고른 값(제어). |
| `onChange` | `(value: T) => void` | 예 |  | 칸을 누르거나 화살표·Home·End 로 옮겼을 때 새 값을 받는다. |
| `label` | `string` | 예 |  | 스크린리더가 읽는 이 컨트롤의 이름 — "View mode" 처럼. |
| `size` | `"sm" \| "md"` |  | `"md"` | 값: `sm` — 30px(작은 컨트롤 높이) · 칸 22px · 라벨 글자 · `md` — 36px(기본 컨트롤 높이) · 칸 28px · 컨트롤 글자 |
| `disabled` | `boolean` |  | `false` | 컨트롤 전체를 고를 수 없게 한다 — 탭 순서에서도 빠진다. |
