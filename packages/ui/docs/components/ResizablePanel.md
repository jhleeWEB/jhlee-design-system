# ResizablePanel

`import { ResizablePanel } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## ResizablePanel

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/ResizablePanels.tsx`

묶음 안의 패널 한 칸. 접혀도 마운트를 유지한다(본문의 초안·스크롤·WebGL 수명을 지키려고) — 대신 `inert` 로 입력을 막는다.

물려받는 props: `Omit<ComponentProps<"div">, "id">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `id` | `string` | 예 |  | 패널 id — 손잡이의 `controls`(= `aria-controls`)와 저장본의 키가 이것을 가리킨다. 문서 안에서 유일해야 한다. |
| `defaultSize` | `number` |  | `undefined` | 처음 크기(px). 없으면 인라인 크기를 쓰지 않고 `className` 이 정한다(`flex-1` 캔버스 · `w-(--size-inspector)` 같은 토큰 폭) — 끌기 시작하면 그때의 실측이 출발점이다. |
| `minSize` | `number` |  | `0` | 끌어서 줄일 수 있는 하한(px). Home 키가 이 크기로 보낸다. |
| `maxSize` | `number` |  | `undefined` | 끌어서 늘릴 수 있는 상한(px). 없으면 맞은편 이웃이 0 이 될 때까지다. End 키가 이 크기로 보낸다. |
| `collapsible` | `boolean` |  | `false` | 접을 수 있다 — 손잡이의 Enter · 더블클릭이 접고 펴며, 하한의 절반 아래로 끌면 접힌다. |
| `collapsedSize` | `number` |  | `0` | 접혔을 때 남는 크기(px). 0 이면 본문이 `inert` 가 된다(보이지 않는 것에 포커스가 가지 않게). |
| `collapsed` | `boolean` |  | `undefined` | 접힘(제어). 주면 상태는 호출처가 든다 — `usePanelLayout` 의 `isCollapsed(id)` 를 그대로 넣는다. |
| `defaultCollapsed` | `boolean` |  | `false` | 처음 접힘(비제어). |
| `onCollapsedChange` | `(collapsed: boolean) => void` |  | `undefined` | 접힘이 바뀌려 할 때 — 손잡이 Enter · 더블클릭 · 끌어 접기. 제어 모드면 여기서 상태를 바꾼다. |
