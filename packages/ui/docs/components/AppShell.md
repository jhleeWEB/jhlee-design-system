# AppShell

`import { AppShell } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## AppShell

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/legacy/shell.tsx`

> **@deprecated** 다음 마이너에서 제거 — `@jhleeweb/squircle-design-system/legacy` 에서 import 한다

레거시 셸 `AppShell`.

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `topbar` | `ReactNode` | 예 |  |  |
| `parameters` | `ReactNode` | 예 |  |  |
| `viewer` | `ReactNode` | 예 |  |  |
| `inspect` | `ReactNode` |  |  | 좁은 화면에서 숨는다. **검사 패널에만 있는 정보는 두지 않는다** — 판정은 HUD 에도 나와야 한다. |
| `inspectOpen` | `boolean` |  |  | 검사 패널의 열림 상태. 닫힌 열의 폭은 inspectCollapseTo에 따른다. |
| `inspectId` | `string` |  |  | 외부 접기 버튼의 aria-controls와 연결한다. |
| `inspectCollapseTo` | `"hidden" \| "strip"` |  |  | 값: `hidden` · `strip` |
