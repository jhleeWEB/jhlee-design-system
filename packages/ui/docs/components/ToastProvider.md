# ToastProvider

`import { ToastProvider } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## ToastProvider

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/feedback/Toast.tsx`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `children` | `ReactNode` | 예 |  |  |
| `limit` | `number` |  |  | 화면에 동시에 보일 최대 개수. 넘치면 오래된 것부터 닫는다. |
| `duration` | `number` |  |  | 기본 노출 시간(ms). 판정 실패처럼 읽는 데 시간이 걸리는 것은 호출처가 늘린다. |
| `position` | `"bottom-right" \| "bottom-center" \| "top-right" \| "top-center"` |  |  | 값: `bottom-center` · `bottom-right` · `top-center` · `top-right` |
