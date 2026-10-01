# ResizableHandle

`import { ResizableHandle } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## ResizableHandle

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/ResizablePanels.tsx`

패널 사이의 손잡이 — `role="separator"`. 끌기 · 화살표(Shift 네 배) · Home(하한) · End(상한) · Enter/더블클릭(접기)로 `controls` 패널의 크기를 바꾼다.

물려받는 props: `ComponentProps<"div">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `controls` | `string` | 예 |  | 이 손잡이가 조절하는 패널의 id(`aria-controls`). |
| `label` | `string` |  | `"Resize panel"` | 손잡이의 접근 가능한 이름(`aria-label`). |
| `step` | `number` |  | `16` | 화살표 한 번의 보폭(px). Shift 를 함께 누르면 네 배다. |
