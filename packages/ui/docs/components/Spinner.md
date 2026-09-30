# Spinner

`import { Spinner } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Spinner

서버에서도 렌더 가능(지시문 없음) · 원본 `src/feedback/Spinner.tsx`

물려받는 props: `React.SVGAttributes<SVGSVGElement>`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `tone` | `ToneInput<SpinnerTone> \| null` |  | `"neutral"` | 값: `neutral` — 기본, 글자색을 따른다 · `muted` · `primary` · `accent` — deprecated alias of "primary" · `current` — deprecated alias of "neutral" · `default` — deprecated alias of "neutral" |
| `label` | `string` |  |  | 스크린리더에 읽히는 문구. 버튼 안처럼 이미 `aria-busy` 가 있는 자리에서는 비운다. |
| `size` | `"sm" \| "md" \| "lg" \| null` |  | `"md"` | 값: `sm` · `md` · `lg` |
