# Alert

`import { Alert } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Alert

서버에서도 렌더 가능(지시문 없음) · 원본 `src/feedback/Alert.tsx`

물려받는 props: `Omit<React.HTMLAttributes<HTMLDivElement>, "title">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `tone` | `ToneInput<AlertTone> \| null` |  | `"info"` | 값: `info` — 기본 · `success` · `warning` · `destructive` · `danger` — deprecated alias of "destructive" · `ok` — deprecated alias of "success" · `warn` — deprecated alias of "warning" |
| `title` | `ReactNode` |  |  |  |
| `action` | `ReactNode` |  |  | 오른쪽 끝에 붙는 조치 — 대개 버튼 하나. |
