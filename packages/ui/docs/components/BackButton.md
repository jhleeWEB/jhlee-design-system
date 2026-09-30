# BackButton

`import { BackButton } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## BackButton

서버에서도 렌더 가능(지시문 없음) · 원본 `src/navigation/BackButton.tsx`

뒤로가기의 동작은 라우터가 소유하고 모양·아이콘은 모든 페이지에서 공유한다.

물려받는 props: `Omit<Omit<ButtonProps, "asChild">, "ref">`, `RefAttributes<HTMLButtonElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `tone` | `ToneInput<ButtonTone> \| null` |  | `"neutral"` | 값: `destructive` — 파괴적 동작 · `neutral` — 기본 · `primary` — 주된 동작 · `accent` — deprecated alias of "primary" · `current` — deprecated alias of "neutral" · `danger` — deprecated alias of "destructive" · `default` — deprecated alias of "neutral" |
| `variant` | `"link" \| "solid" \| "outline" \| "ghost" \| null` |  |  | 값: `ghost` — 상자 없음. 도구 막대·목록 안의 가벼운 동작 · `link` — 글자만. 문장 안의 동작 — 높이·가로 패딩이 없다 · `outline` — 외곽선. 기본값 — 보조 동작 · `solid` — 채움. 화면에 하나뿐인 주된 동작 |
| `size` | `"sm" \| "md" \| "lg" \| "icon-sm" \| "icon" \| "icon-lg" \| null` |  |  | 값: `icon` — 아이콘 전용 정사각, 기본 높이 · `icon-lg` — 아이콘 전용 정사각, 큰 높이 · `icon-sm` — 아이콘 전용 정사각, 작은 높이 · `lg` — 큰 컨트롤 높이 · `md` — 기본 컨트롤 높이 · `sm` — 작은 컨트롤 높이 |
| `loading` | `boolean` |  | `false` | 진행 중. 스피너로 라벨을 **대체하지 않는다** — 폭이 흔들리면 옆 버튼이 밀린다. |
