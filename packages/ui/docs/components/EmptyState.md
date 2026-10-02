# EmptyState

`import { EmptyState } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## EmptyState

서버에서도 렌더 가능(지시문 없음) · 원본 `src/feedback/EmptyState.tsx`

빈 상태 — 비어 있다는 사실보다 채우는 방법을 말한다.

물려받는 props: `Omit<React.ComponentProps<"div">, "title">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `title` | `ReactNode` | 예 |  | 무엇이 비었는가 — 한 줄. DOM 의 `title`(툴팁 문자열)과 이름이 겹치므로 Omit 하고 다시 선언한다. |
| `description` | `ReactNode` |  | `undefined` | 무엇을 하면 채워지는가 — 한두 문장. |
| `icon` | `ReactNode` |  | `undefined` | 제목 위의 흐린 아이콘. 안의 svg 크기는 여기서 맞춘다(32px). |
| `action` | `ReactNode` |  | `undefined` | 빈자리를 채우는 조치 — 대개 버튼 하나. 사실상 필수다. |
| `size` | `"default" \| "compact" \| null` |  | `"default"` | 값: `default` — 화면·카드의 넓은 빈자리(기본) · `compact` — 패널 안의 좁은 자리. 여백과 제목을 줄인다 |
