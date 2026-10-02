# AppShell

`import { AppShell } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## AppShell

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/AppShell.tsx`

작업대 셸 — 상단바 · 사이드바 · 본문 · 인스펙터(접기 · 선택적 폭 조절) · 바닥줄.

물려받는 props: `ComponentProps<"div">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `topBar` | `ReactNode` |  | `undefined` | 맨 위 줄 — `TopBar` 를 그대로 넣는다. |
| `sidebar` | `ReactNode` |  | `undefined` | 왼쪽 칸 — `Sidebar`(레일 · 패널). 폭은 사이드바가 정한다. |
| `inspector` | `ReactNode` |  | `undefined` | 오른쪽 인스펙터 — 선택한 것의 수치와 판정. 없으면 칸 자체가 없다. |
| `footer` | `ReactNode` |  | `undefined` | 맨 아래 줄 — 상태 줄 · 규칙 팩 정보. |
| `inspectorOpen` | `boolean` |  | `true` | 인스펙터가 열려 있는가(제어). 닫히면 폭이 0 으로 접히고 본문이 `inert` 가 된다. |
| `onInspectorOpenChange` | `(open: boolean) => void` |  | `undefined` | 인스펙터를 여닫으려 할 때 — 손잡이의 Enter · 더블클릭 · 끌어 접기. 상단바의 토글 버튼은 호출처가 직접 상태를 바꾼다. |
| `inspectorId` | `string` |  | `undefined` | 인스펙터 칸의 id — 토글 버튼의 `aria-controls` 가 가리킬 자리. 주지 않으면 만들어 쓴다. |
| `inspectorLabel` | `string` |  | `"Inspector"` | 인스펙터 칸(complementary 랜드마크)의 이름. |
| `resizable` | `boolean` |  | `false` | 인스펙터 폭을 끌어 바꾼다 — 본문과 인스펙터 사이에 손잡이(separator)가 생긴다. |
| `inspectorDefaultSize` | `number` |  | `undefined` | 인스펙터의 처음 폭(px). 없으면 토큰 폭(`--size-inspector`, 340px)이다. |
| `inspectorMinSize` | `number` |  | `0` | 끌어서 줄일 수 있는 인스펙터 폭의 하한(px). 절반 아래로 끌면 접힌다. |
| `inspectorMaxSize` | `number` |  | `undefined` | 끌어서 늘릴 수 있는 인스펙터 폭의 상한(px). 없으면 본문이 0 이 될 때까지다. |
| `storageKey` | `string` |  | `undefined` | 끌어서 정한 인스펙터 폭을 localStorage 에 남기는 키. 스토리 · 테스트에서는 주지 않는다. |
| `variant` | `"flush" \| "inset"` |  | `"flush"` | 값: `flush` — 칸이 맞붙고 헤어라인이 가른다(옛 3열 셸) · `inset` — 옅은 바닥 위에 카드가 12px 간격으로 뜬다(참고 화면) |
| `mainAs` | `"div" \| "main"` |  | `"main"` | 값: `div` — 이미 `<main>` 이 있는 곳(문서 미리보기 · 셸 안의 셸) · `main` — 화면의 주 랜드마크(한 문서에 하나) |
