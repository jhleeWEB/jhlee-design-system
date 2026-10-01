# Button

`import { Button, ButtonGroup } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Button

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Button.tsx`

버튼 — 크롬의 동작. `variant`(외형)와 `tone`(판정색)은 다른 축이다.

물려받는 props: `ComponentPropsWithRef<"button">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `tone` | `ButtonTone \| null` |  | `"neutral"` | 값: `neutral` — 기본 · `primary` — 주된 동작 · `destructive` — 파괴적 동작 |
| `asChild` | `boolean` |  | `false` | 래퍼를 만들지 않고 자식 요소에 버튼 스타일을 입힌다 — 링크를 버튼으로 보이게 할 때. |
| `loading` | `boolean` |  | `false` | 진행 중. 스피너로 라벨을 **대체하지 않는다** — 폭이 흔들리면 옆 버튼이 밀린다. |
| `variant` | `"solid" \| "outline" \| "ghost" \| "link" \| null` |  | `"outline"` | 값: `solid` — 채움. 화면에 하나뿐인 주된 동작 · `outline` — 외곽선. 기본값 — 보조 동작 · `ghost` — 상자 없음. 도구 막대·목록 안의 가벼운 동작 · `link` — 글자만. 문장 안의 동작 — 높이·가로 패딩이 없다 |
| `size` | `"sm" \| "md" \| "lg" \| "icon-sm" \| "icon" \| "icon-lg" \| null` |  | `"md"` | 값: `sm` — 작은 컨트롤 높이 · `md` — 기본 컨트롤 높이 · `lg` — 큰 컨트롤 높이 · `icon-sm` — 아이콘 전용 정사각, 작은 높이 · `icon` — 아이콘 전용 정사각, 기본 높이 · `icon-lg` — 아이콘 전용 정사각, 큰 높이 |

## 부품

`data-slot` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.

### ButtonGroup

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Button.tsx`

버튼 묶음 — 사이 경계를 하나로 접어 «한 덩어리» 로 읽히게 한다.

물려받는 props: `ClassAttributes<HTMLDivElement>`, `HTMLAttributes<HTMLDivElement>`

_(DS 가 더하는 prop 없음 — 물려받는 속성만)_
