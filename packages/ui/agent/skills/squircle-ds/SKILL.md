---
name: squircle-ds
description: Squircle Design System({{name}})으로 화면을 조립할 때 — 컴포넌트·부품·prop 을 매니페스트에서 찾고(Analyze), 토큰 유틸만으로 조립하고(Compose), 린트·타입·다크로 검사한다(Audit). UI 컴포넌트 추가·수정, className·tone·variant 선택, "use client" 경계, 디자인 시스템 위반 수정에 쓴다.
---

# Squircle DS — Analyze → Compose → Audit

규칙은 AGENTS.md 의 «디자인 시스템 계약(에이전트)» 블록에 있다(항상 로드된다). 이 스킬은 **절차**다. 세 단계를 건너뛰지 않는다.

패키지 경로: `node_modules/{{name}}/`. 읽는 순서는 `llms.txt` → `dist/components.manifest.json` → `docs/components/<Name>.md` → `dist/**/*.d.ts`.

## 1. Analyze — 있는 것만 쓴다

1. `llms.txt` 의 «컴포넌트» 색인에서 후보를 고른다. 부품 목록(`부품:`)과 `"use client"` 표시를 본다.
2. 매니페스트에서 대상을 꺼낸다 — prop 이름·타입·필수·기본값·허용 값은 여기가 정본이다:
   ```bash
   jq '.components[] | select(.name == "Select")' node_modules/{{name}}/dist/components.manifest.json
   jq '.components[] | select(.name == "Button") | .props[] | {name, type, required, default, values: [.values[].value]}' node_modules/{{name}}/dist/components.manifest.json
   jq '.utilities[] | select(.kind == "variants") | {name, axes, defaults}' node_modules/{{name}}/dist/components.manifest.json
   jq '.tokens' node_modules/{{name}}/dist/components.manifest.json
   ```
3. **없는 부품·prop 은 지어내지 않는다.** 매니페스트에 없으면 «DS 확장 필요 — <무엇이, 왜>» 로 보고하고 그 자리는 가장 가까운 있는 부품으로 임시 조립한 뒤 TODO 로 표시한다. `@deprecated` 인 것(`./legacy`, 옛 tone 키)은 새 코드에 고르지 않는다.
4. 클라이언트 경계를 정한다 — `client: true` 컴포넌트는 `"use client"` 파일에서만 렌더한다. 서버 컴포넌트에서는 `*Variants` 호출만.

## 2. Compose — 부품 조립, className 은 토큰 유틸만

- 부품 먼저(`Modal` + `ModalContent` + `ModalHeader` …). 설탕(`ConfirmDialog` `DataTable`)은 부품으로 안 될 때만.
- `className` 에는 `tokens` 색인의 이름만: 색 `bg-card` `text-muted-foreground` `border-border` `bg-primary`…, 글자 `text-body` `text-label`…, 반경 `rounded-md`(원형은 `rounded-full`), 그림자 `shadow-pop`, 높이 `h-ctl`, 층 `z-popover`, 시간 `duration-fast`. 간격은 스텝 `0 1 2 3 4 5 6 8 10 12 16 20 24` 만.
- 금지: Tailwind 기본 사다리(`text-sm` `bg-gray-100` `rounded` `shadow-md` `z-50`), hex, `[12px]` 임의값, `style={{ color | background | border }}`, raw `<button> <input> <select> <textarea> <dialog> <table>`, `Modal.Content` 식 정적 컴파운드, 옛 tone 키(`accent` `ok` `warn` `danger`), 옛 유틸(`text-ink` `bg-surface` `rounded-control`).
- 캔버스(도면 면)에는 `canvas-*` 만, 다크 없음. 유채색은 판정(`success/warning/destructive/info`)에만, 상태는 텍스트와 병기. 수치는 `font-mono tabular-nums`.
- 컴포넌트 문서(`docs/components/<Name>.md`)의 값 설명을 따라 `variant`·`tone`·`size` 를 고른다 — 기본값이 이미 맞으면 prop 을 적지 않는다.

## 3. Audit — 위반 0 이 끝

1. 린트 — 소비 레포 `eslint.config.js` 에 프리셋이 있어야 한다(없으면 추가한다):
   ```js
   import { squircleDesignSystem } from "{{name}}/eslint";
   export default [...squircleDesignSystem({ entryPoint: new URL("./src/app/globals.css", import.meta.url).pathname })];
   ```
   `pnpm exec eslint <바꾼 파일>` — `no-unknown-classes`(토큰 밖 클래스) · `no-restricted-classes`(옛 이름·hex·임의값·격자 밖 간격, `--fix` 가 개명) · `react/forbid-elements` · `no-restricted-syntax`(인라인 색) · `ds/legacy-tone` 이 0 이어야 한다.
2. 타입 — `pnpm exec tsc --noEmit` 0. 매니페스트에 없는 prop 은 여기서도 잡힌다.
3. 다크 — `html[data-theme="dark"]` 에서 크롬만 바뀌고 `canvas-*` 는 불변인지 스토리·화면으로 확인한다.
4. 보고 — 바꾼 파일, 쓴 부품, «DS 확장 필요» 목록, 린트·타입 결과를 한 번에 적는다.
