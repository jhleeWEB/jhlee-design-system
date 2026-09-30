# SelectContent

`import { SelectContent } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## SelectContent

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Select.tsx`

목록 상자 — DropdownMenu 와 같은 면(카드 바탕 · `shadow-pop`)이다. 포털의 수명은 DS 가 소유하므로 `forceMount` 는 공개하지 않는다.
기본 배치는 트리거 아래(`position="popper"`)이고 폭은 트리거보다 좁아지지 않는다. 목록이 길면 뷰포트 안에서 스크롤한다.

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
