import { cva } from "../cn";

/* `*.variants.ts` 는 지시문·훅·Radix 가 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Modal.variants.ts 와 같은 이유). */

/**
 * 팝오버 면의 변형 — `onCanvas`. 폭은 여기 없다: 팝오버는 트리거 폭을 따르고, 호버 카드는 상한에 고정하고, Combobox 는 트리거 폭에 붙는다 —
 * 면(바탕 · 테두리 · 반경 · 그림자 · 안쪽 여백)만 한 곳에 두어 Popover · HoverCard · Combobox 가 같은 객체를 부른다(#61).
 * 예전에는 Popover 안의 `onCanvas ? "on-canvas" : "bg-card"` 삼항이었다 — 축은 cva 가 소유한다.
 */
export const popoverContentVariants = cva(
  [
    "z-popover rounded-lg border border-border p-5 shadow-pop",
    "animate-in-pop text-body text-foreground focus-visible:outline-none",
  ],
  {
    variants: {
      /** 캔버스 위에 얹힌다 — 반투명 + 블러로 도면이 비친다. 끄면 불투명한 카드 면이다. */
      onCanvas: { true: "on-canvas", false: "bg-card" },
    },
    defaultVariants: { onCanvas: false },
  },
);
