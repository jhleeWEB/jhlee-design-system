# ToastProvider

`import { ToastProvider } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## ToastProvider

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/feedback/Toast.tsx`

토스트 큐와 뷰포트 — 앱 루트에 한 번 둔다. 알림은 `useToast().toast()` 로 띄운다.

물려받는 props: `Omit<React.ComponentProps<typeof RadixToast.Viewport>, "children">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `children` | `ReactNode` | 예 |  | 앱 — 이 안에서 `useToast()` 를 부른다. |
| `limit` | `number` |  | `3` | 화면에 동시에 보일 최대 개수. 넘치면 오래된 것부터 닫는다. |
| `duration` | `number` |  | `MOTION.toastDefaultMs` | 기본 노출 시간(ms). `0` 이면 닫을 때까지 남는다. 판정 실패처럼 읽는 데 시간이 걸리는 것은 호출처가 늘린다. |
| `position` | `ToastPosition \| null` |  | `"bottom-right"` | 값: `bottom-right` — 오른쪽 아래(기본) · `bottom-center` — 아래 가운데 · `top-right` — 오른쪽 위. 토스트는 위에서 내려온다 · `top-center` — 위 가운데. 토스트는 위에서 내려온다 |
