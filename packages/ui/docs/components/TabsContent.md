# TabsContent

`import { TabsContent } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## TabsContent

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Tabs.tsx`

탭 패널 — `value` 가 활성 칸과 같을 때만 보인다. 키보드로 패널에 들어올 수 있게 포커스 링을 둔다.

물려받는 props: `TabsContentProps`, `RefAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
