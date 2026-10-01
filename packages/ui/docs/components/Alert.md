# Alert

`import { Alert } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Alert

서버에서도 렌더 가능(지시문 없음) · 원본 `src/feedback/Alert.tsx`

인라인 경고 — 흐름 안에 남는 알림. 아이콘·제목·색이 함께 말한다(색만으로 말하지 않는다).

물려받는 props: `Omit<React.ComponentProps<"div">, "title">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `tone` | `AlertTone \| null` |  | `"info"` | 값: `info` — 안내. 판정이 아니라 알아 둘 것(기본) · `success` — 통과·완료 · `warning` — 주의. 진행은 되지만 확인이 필요하다 · `destructive` — 실패·위반. 고치기 전에는 진행할 수 없다 |
| `title` | `ReactNode` |  | `undefined` | 굵은 첫 줄 — 무슨 일인지 한 문장. 없으면 본문만 그린다. `title` 을 Omit 하고 다시 선언한다 — DOM 의 `title` 은 툴팁 문자열이라 ReactNode 를 못 받는다. |
| `action` | `ReactNode` |  | `undefined` | 오른쪽 끝에 붙는 조치 — 대개 버튼 하나. |
