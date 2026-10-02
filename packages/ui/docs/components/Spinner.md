# Spinner

`import { Spinner } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Spinner

서버에서도 렌더 가능(지시문 없음) · 원본 `src/feedback/Spinner.tsx`

스피너 — «돌고 있다» 만 말한다. 얼마나 남았는지는 `Progress` 가 맡는다.

물려받는 props: `React.ComponentProps<"svg">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg" \| null` |  | `"md"` | 값: `sm` — 12px · 버튼·입력 안처럼 좁은 자리 · `md` — 16px · 본문 줄 옆(기본) — 크롬 아이콘과 같은 크기 · `lg` — 24px · 패널·빈자리의 가운데 |
| `tone` | `SpinnerTone \| null` |  | `"neutral"` | 값: `neutral` — 글자색을 따른다(기본) · `muted` — 보조 자리의 흐린 회색(스피너 전용 값) · `primary` — 주된 동작의 진행 |
| `label` | `string` |  | `undefined` | 스크린리더에 읽히는 문구(`role="status"`). 비우면 장식으로 숨긴다 — 버튼 안처럼 이미 `aria-busy` 가 있는 자리에서는 비운다. |
