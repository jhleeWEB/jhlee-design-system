# EmptyState

`import { EmptyState } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## EmptyState

서버에서도 렌더 가능(지시문 없음) · 원본 `src/feedback/EmptyState.tsx`

물려받는 props: `Omit<React.HTMLAttributes<HTMLDivElement>, "title">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `title` | `ReactNode` | 예 |  |  |
| `description` | `ReactNode` |  |  |  |
| `icon` | `ReactNode` |  |  |  |
| `action` | `ReactNode` |  |  |  |
| `size` | `"default" \| "compact"` |  |  | 값: `compact` · `default` — deprecated alias of "neutral" |
