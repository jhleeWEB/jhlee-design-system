# TabsList

`import { TabsList } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## TabsList

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/Tabs.tsx`

탭 칸의 줄 — `variant` 가 줄과 그 안의 칸 모양을 함께 정한다. 스크린리더가 읽을 이름을 `aria-label` 로 준다.

물려받는 props: `React.ComponentPropsWithRef<typeof Radix.List>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `variant` | `"segmented" \| "underline" \| null` |  | `"segmented"` | 값: `segmented` — 트랙 위의 흰 pill(SegmentedControl 과 같은 모양). 도구 줄 · 카드 머리의 작은 전환 · `underline` — 아래 경계선 위의 밑줄. 페이지 · 패널 머리의 큰 구획 전환 |
