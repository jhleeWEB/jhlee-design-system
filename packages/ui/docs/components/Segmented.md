# Segmented

`import { Segmented } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Segmented

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/legacy/controls.tsx`

> **@deprecated** 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다

레거시 컨트롤 `Segmented`.

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `label` | `string` | 예 |  |  |
| `value` | `T` | 예 |  |  |
| `options` | `readonly Option<T>[]` | 예 |  |  |
| `disabled` | `boolean` |  |  |  |
| `onChange` | `(value: T) => void` | 예 |  |  |
