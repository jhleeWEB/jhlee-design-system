# Breadcrumb

`import { Breadcrumb } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Breadcrumb

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Breadcrumb.tsx`

경로 — 「지금 무엇을 보고 있나」. 마지막 조각은 링크가 아니다(현재 위치이므로).

물려받는 props: `ComponentProps<"nav">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `items` | `readonly Crumb[]` | 예 |  | 뿌리에서 현재 위치까지의 조각. 마지막 조각이 현재 위치(`aria-current="page"`)다. |
