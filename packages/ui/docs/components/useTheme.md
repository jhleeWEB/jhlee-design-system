# useTheme

`import { useTheme } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## useTheme

훅 · 원본 `src/navigation/useTheme.ts`

테마 전환 훅 — `html[data-theme]` 을 읽고 쓴다. 뒤집히는 것은 크롬뿐이다(캔버스는 다크가 없다).
같은 문서의 모든 `useTheme` 이 같은 값을 본다. 첫 페인트의 깜빡임은 훅이 막지 못한다 — 저장한 값을 `<head>` 의 인라인 스크립트로 먼저 쓴다(README «테마 전환»).

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `options` | `{ storageKey?: string; } \| undefined` |  |  |  |
