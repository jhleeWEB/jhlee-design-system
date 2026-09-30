# DescriptionList

`import { DescriptionList } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## DescriptionList

서버에서도 렌더 가능(지시문 없음) · 원본 `src/data/DescriptionList.tsx`

이름-값 목록(`<dl>` 격자) — 이름은 왼쪽에서 말줄임, 값은 오른쪽 정렬.

물려받는 props: `React.ComponentProps<"dl">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `rows` | `readonly Row[]` | 예 |  | 이름-값 줄들. 순서대로 그린다. |
| `provisionalLabel` | `string` |  | `"Provisional"` | 잠정 값(`provisional`)의 툴팁 문구. 제품 어휘(예: 검증 대기)는 앱이 넘긴다 — 디자인 시스템은 도메인을 모른다. |
