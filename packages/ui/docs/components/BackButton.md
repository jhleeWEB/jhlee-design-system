# BackButton

`import { BackButton } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## BackButton

서버에서도 렌더 가능(지시문 없음) · 원본 `src/navigation/BackButton.tsx`

뒤로가기의 동작은 라우터가 소유하고 모양·아이콘은 모든 페이지에서 공유한다.

물려받는 props: `Omit<ButtonProps, "asChild" | "variant" | "size" | "tone" | "loading">`, `RefAttributes<HTMLButtonElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `variant` | `"ghost" \| "link" \| "outline" \| "solid" \| null` |  | `"ghost"` | 값: `ghost` — 바탕 없음(뒤로가기의 기본) · `link` — 밑줄 글자 · `outline` — 외곽선 · `solid` — 채움 |
| `size` | `"icon" \| "icon-lg" \| "icon-sm" \| "lg" \| "md" \| "sm" \| null` |  | `"sm"` | 값: `icon` — 정사각 아이콘 · `icon-lg` — 큰 정사각 아이콘 · `icon-sm` — 작은 정사각 아이콘 · `lg` — 큰 컨트롤 높이 · `md` — 기본 컨트롤 높이 · `sm` — 작은 컨트롤 높이(기본) |
| `tone` | `ButtonTone \| null` |  | `"neutral"` | 값: `destructive` — 파괴적 동작 · `neutral` — 기본 · `primary` — 주된 동작 |
| `loading` | `boolean` |  | `false` | 진행 중 — 스피너를 라벨 앞에 더하고 누름을 막는다. |
