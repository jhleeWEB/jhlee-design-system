# BackButton

`import { BackButton } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## BackButton

서버에서도 렌더 가능(지시문 없음) · 원본 `src/navigation/BackButton.tsx`

뒤로가기의 동작은 라우터가 소유하고 모양·아이콘은 모든 페이지에서 공유한다.

물려받는 props: `Omit<ButtonProps, "asChild">`, `RefAttributes<HTMLButtonElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `tone` | `ToneInput<ButtonTone> \| null` |  |  | 값: `destructive` — 파괴적 동작 · `neutral` — 기본 · `primary` — 주된 동작 · `accent` — deprecated alias of "primary" · `current` — deprecated alias of "neutral" · `danger` — deprecated alias of "destructive" · `default` — deprecated alias of "neutral" |
| `variant` | `"link" \| "solid" \| "outline" \| "ghost" \| null` |  |  | 값: `ghost` · `link` · `outline` · `solid` |
| `size` | `"sm" \| "md" \| "lg" \| "icon-sm" \| "icon" \| "icon-lg" \| null` |  |  | 값: `icon` · `icon-lg` · `icon-sm` · `lg` · `md` · `sm` |
| `loading` | `boolean` |  |  | 진행 중. 스피너로 라벨을 **대체하지 않는다** — 폭이 흔들리면 옆 버튼이 밀린다. |
