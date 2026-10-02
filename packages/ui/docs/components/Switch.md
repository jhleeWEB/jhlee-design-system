# Switch

`import { Switch } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Switch

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Choice.tsx`

스위치 — **즉시 적용되는** 켬/끔. 폼을 제출해야 반영되는 것에는 체크박스를 쓴다.

물려받는 props: `React.ComponentPropsWithRef<typeof RadixSwitch.Root>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg" \| null` |  | `"md"` | 값: `sm` — 28 × 16px · 표 칸 · 촘촘한 목록 · `md` — 36 × 20px · 폼과 설정 패널(기본) · `lg` — 44 × 24px · 터치 화면 · 넓은 설정 카드 |
