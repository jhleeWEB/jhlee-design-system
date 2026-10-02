import { cva } from "../cn";

/* `*.variants.ts` 는 지시문·훅·Radix 가 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Button.variants.ts 와 같은 이유).
 *
 * 축은 뿌리의 `variant` 하나다(#84). 여기서는 `contained` 의 바깥 상자만 그린다 — 항목의 상자 · 구분선 · 트리거의 포커스 링은 theme.css 의
 * `.ds-accordion*` 규칙이 `data-variant` 로 가른다. 그 규칙이 접기 모션(grid-template-rows 전이 · visibility 지연)과 같은 요소에 걸려 있어
 * 한 자리에 있어야 읽히기 때문이다. 뿌리는 값을 컨텍스트로 내려 항목 · 트리거가 저마다 `data-variant` 를 찍는다 — 아코디언 안에 다른 변형의
 * 아코디언을 넣어도 바깥 값이 안으로 새지 않는다(자손 선택자였다면 샌다). */

/** 아코디언 뿌리의 변형 — `variant`. 항목을 따로 세우는가(카드), 한 상자에 담는가, 상자 없이 구분선만 두는가. */
export const accordionVariants = cva("ds-accordion", {
  variants: {
    /**
     * 항목을 담는 모양. 셋 다 트리거는 면 제목(`text-body font-semibold`), 본문은 보조 문장(흐린 `text-body`)이다.
     * - `separated` — 항목마다 따로 선 카드(테두리와 카드 면, 모서리 rounded-lg). 기본값 — 문서 흐름 안의 접이식 구획
     * - `contained` — 상자 하나(테두리와 카드 면, 모서리 rounded-lg) 안에서 항목을 헤어라인 구분선으로 가른다. 패널 안의 설정 묶음
     * - `flush` — 상자 없이 항목 사이 구분선과 제목 줄만 남긴다. 인스펙터 구획(Figma 속성 패널처럼 — 패널 가장자리까지 여백 없이 놓아 선이 끝까지 닿게)
     */
    variant: {
      separated: "",
      contained: "rounded-lg border border-solid border-border bg-card",
      flush: "",
    },
  },
  defaultVariants: { variant: "separated" },
});
