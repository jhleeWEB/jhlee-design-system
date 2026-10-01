# ResizablePanels

`import { ResizablePanels } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## ResizablePanels

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/ResizablePanels.tsx`

크기를 끌어 바꾸는 패널 묶음. 크기가 정해진 패널(`defaultSize` 또는 끌어서 정한 크기)은 그 px 를 지키고, 크기 없는 패널(`flex-1`)이 남는 폭을 갖는다.
패널 사이에 `ResizableHandle` 을 두고 `controls` 로 조절할 패널의 id 를 준다.

물려받는 props: `ComponentProps<"div">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `orientation` | `Orientation` |  | `"horizontal"` | 값: `horizontal` — 좌우로 늘어서고 손잡이는 세로선(폭 조절) · `vertical` — 위아래로 쌓이고 손잡이는 가로선(높이 조절) |
| `storageKey` | `string` |  | `undefined` | 저장 키 — 주면 패널 크기와 비제어 접힘이 localStorage 에 남는다. 스토리·테스트에서는 주지 않는다(결정적 렌더). |
