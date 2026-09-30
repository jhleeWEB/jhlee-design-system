# ScrollArea

`import { ScrollArea } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## ScrollArea

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/ScrollArea.tsx`

물려받는 props: `Omit<ComponentPropsWithRef<typeof Radix.Root>, "type" | "scrollHideDelay" | "asChild">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `viewportRef` | `Ref<HTMLDivElement>` |  |  |  |
| `viewportClassName` | `string` |  |  |  |
| `viewportProps` | `Omit<Omit<ScrollAreaViewportProps & RefAttributes<HTMLDivElement>, "ref">, "asChild"> & { "data-slot"?: string; }` |  |  |  |
| `orientation` | `"vertical" \| "horizontal" \| "both"` |  |  | 값: `both` · `horizontal` · `vertical` |
