# ThemeToggle

`import { ThemeToggle } from "@jhleeweb/jhlee-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## ThemeToggle

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/navigation/ThemeToggle.tsx`

라이트/다크 전환 아이콘 버튼 — 상단바 오른쪽 끝에 둔다. 아이콘과 이름은 **누르면 갈 테마**를 말한다(라이트에서는 달 · «Switch to dark theme»).
`html[data-theme]` 을 쓰므로 뒤집히는 것은 크롬뿐이다. OS 설정으로 되돌리는 세 번째 선택이 필요하면 `useTheme` 과 `SegmentedControl` 로 짓는다.

물려받는 props: `Omit<ButtonProps, "children" | "onClick" | "size" | "variant" | "asChild">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `storageKey` | `string` |  | `undefined` | 저장 키 — 주면 고른 테마가 localStorage 에 남는다(`useTheme` 의 `storageKey`). |
| `tone` | `ButtonTone \| null` |  | `"neutral"` | 값: `destructive` — 파괴적 동작 · `neutral` — 기본 · `primary` — 주된 동작 |
| `loading` | `boolean` |  | `false` | 진행 중. 스피너로 라벨을 **대체하지 않는다** — 폭이 흔들리면 옆 버튼이 밀린다. |
