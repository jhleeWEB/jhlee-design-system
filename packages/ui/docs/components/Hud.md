# Hud

`import { Hud, HudCell } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Hud

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/legacy/shell.tsx`

> **@deprecated** 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다

레거시 셸 `Hud`.

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `children` | `ReactNode` | 예 |  |  |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### HudCell

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/legacy/shell.tsx`

> **@deprecated** 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다

레거시 셸 `HudCell`.

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `k` | `string` | 예 |  |  |
| `v` | `ReactNode` | 예 |  |  |
| `u` | `string` |  |  |  |
| `verdict` | `Verdict` |  |  | 값: `danger` — deprecated alias of "destructive" · `ok` — deprecated alias of "success" · `warn` — deprecated alias of "warning" |
