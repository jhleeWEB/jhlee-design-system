# ScrollArea

`import { ScrollArea } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## ScrollArea

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/ScrollArea.tsx`

스크롤 영역 — 스크롤하거나 막대를 끄는 동안만 얇은 스크롤바가 보인다.

Radix의 type="scroll"은 종료 판정에 100ms를 더하므로 DS의 500ms 계약과 어긋난다.
스크롤바는 항상 마운트하고 실제 스크롤·드래그 활동만 직접 재서 표시한다.

물려받는 props: `Omit<ComponentPropsWithRef<typeof Radix.Root>, "type" | "scrollHideDelay" | "asChild">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `viewportRef` | `Ref<HTMLDivElement>` |  | `undefined` | 실제로 스크롤되는 뷰포트 요소의 ref — 스크롤 위치를 읽거나 옮길 때. |
| `viewportClassName` | `string` |  | `undefined` | 뷰포트에 더할 className — 안쪽 패딩·높이 제한은 뿌리가 아니라 여기에 둔다. |
| `viewportProps` | `Omit<Omit<ScrollAreaViewportProps & RefAttributes<HTMLDivElement>, "ref">, "asChild"> & { "data-slot"?: string; }` |  | `undefined` | 뷰포트에 펼칠 나머지 속성(`onScroll` 은 표시 타이머와 합성된다). |
| `orientation` | `"both" \| "horizontal" \| "vertical"` |  | `"both"` | 값: `both` — 둘 다 · `horizontal` — 가로만 · `vertical` — 세로만 |
