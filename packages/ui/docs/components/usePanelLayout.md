# usePanelLayout

`import { usePanelLayout } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## usePanelLayout

훅 · 원본 `src/navigation/usePanelLayout.ts`

여러 패널의 접힘 상태를 한 곳에서 든다. `storageKey` 를 주면 localStorage 에 남고, 주지 않으면(기본) 저장하지 않는다.
`ids` 는 렌더마다 같은 배열이어야 한다(모듈 상수 권장) — 반환값의 메모가 그것에 기댄다.

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `ids` | `readonly K[]` | 예 |  |  |
| `options` | `{ storageKey?: string; initial?: Partial<Record<K, boolean>>; } \| undefined` |  |  |  |
