# Fieldset

`import { Fieldset } from "@jhleeweb/squircle-design-system"`

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._

## Fieldset

클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다) · 원본 `src/primitives/Fieldset.tsx`

묶음 상자 — 테두리 상자 위 선에 제목(legend)이 걸치는 네이티브 fieldset. 인스펙터의 설정 항목마다 하나씩 세워 `flex flex-col gap-3` 으로 쌓는다.
안의 행은 `Field` 로 짓는다 — 라벨 · 설명 왼쪽 + 컨트롤 오른쪽은 `Field orientation="horizontal"` 에 `flex-nowrap justify-between`.

물려받는 props: `React.ComponentPropsWithRef<"fieldset">`

| prop | 타입 | 필수 | 기본값 | 설명 · 값 |
|---|---|---|---|---|
| `legend` | `ReactNode` | 예 |  | 묶음의 이름 — 위 테두리선에 걸치는 `<legend>`. 스크린리더가 이 글자를 묶음(role `group`)의 이름으로 읽는다. 면 제목 역할(`text-body font-semibold`). |
| `description` | `ReactNode` |  | `undefined` | legend 아래 보조 문장 — 묶음의 `aria-describedby` 로 이어진다(보조 문장 역할, 흐린 `text-body`). 넘긴 `aria-describedby` 는 그 뒤에 붙는다. |
| `disabled` | `boolean` |  | `false` | 묶음 전체를 끈다(네이티브) — 안의 input · select · textarea · button 이 꺼지고, legend · 설명 · 안의 FieldLabel · FieldDescription 이 흐려진다. role 만 단 비(非)폼 컨트롤(Radix Slider 손잡이)은 꺼지지 않으니 그 컨트롤에도 `disabled` 를 준다. |
