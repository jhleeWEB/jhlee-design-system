# Slider

`import { Slider } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Slider

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/legacy/controls.tsx`

> **@deprecated** 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다

레거시 컨트롤 `Slider`.

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `label` | `string` | 예 |  |  |
| `value` | `number` | 예 |  |  |
| `min` | `number` | 예 |  |  |
| `max` | `number` | 예 |  |  |
| `step` | `number` |  |  |  |
| `disabled` | `boolean` |  |  |  |
| `onChange` | `(value: number) => void` |  |  | 없으면 읽기 전용으로 그린다 — 아직 편집을 열지 않은 다이얼도 값은 보여야 한다. |
| `onCommit` | `(value: number) => void` |  |  | 있으면 range 이동은 로컬 draft로만 보이고 입력이 끝날 때 한 번 전달한다. |
| `className` | `string` |  |  |  |
