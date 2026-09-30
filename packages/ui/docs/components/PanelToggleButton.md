# PanelToggleButton

`import { PanelToggleButton } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## PanelToggleButton

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/PanelToggleButton.tsx`

물려받는 props: `Omit<ButtonProps, "children" | "onClick" | "size" | "variant" | "asChild">`, `RefAttributes<HTMLButtonElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `open` | `boolean` | 예 |  |  |
| `onOpenChange` | `(open: boolean) => void` | 예 |  |  |
| `label` | `string` | 예 |  | 아이콘만 보여도 어느 패널을 여닫는지 툴팁과 접근성 이름에 남긴다. |
| `controls` | `string` |  |  |  |
| `tone` | `ToneInput<ButtonTone> \| null` |  |  | 값: `destructive` — 파괴적 동작 · `neutral` — 기본 · `primary` — 주된 동작 · `accent` — deprecated alias of "primary" · `current` — deprecated alias of "neutral" · `danger` — deprecated alias of "destructive" · `default` — deprecated alias of "neutral" |
| `loading` | `boolean` |  |  | 진행 중. 스피너로 라벨을 **대체하지 않는다** — 폭이 흔들리면 옆 버튼이 밀린다. |
