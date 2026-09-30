# Toolbar

`import { Toolbar, ToolbarDivider, ToolbarSpacer } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Toolbar

서버에서도 렌더 가능(지시문 없음) · 원본 `src/navigation/Toolbar.tsx`

물려받는 props: `HTMLAttributes<HTMLDivElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `onCanvas` | `boolean` |  |  |  |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### ToolbarDivider

서버에서도 렌더 가능(지시문 없음) · 원본 `src/navigation/Toolbar.tsx`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `className` | `string` |  |  |  |

### ToolbarSpacer

서버에서도 렌더 가능(지시문 없음) · 원본 `src/navigation/Toolbar.tsx`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
