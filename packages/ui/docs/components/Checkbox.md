# Checkbox

`import { Checkbox } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Checkbox

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Choice.tsx`

체크박스 — 여러 개를 독립적으로 켠다. 섞임(`checked="indeterminate"`)은 체크 대신 가로줄을 그린다.

물려받는 props: `React.ComponentPropsWithRef<typeof RadixCheckbox.Root>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg" \| null` |  | `"md"` | 값: `sm` — 14px · 표 칸 · 촘촘한 목록 · `md` — 16px · 폼과 설정 패널(기본) — 크롬 아이콘(16px)과 같은 크기 · `lg` — 20px · 터치 화면 · 넓은 선택 카드 |
