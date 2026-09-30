import { cva } from "../cn";

/* 서버에서도 호출 가능한 변형 모듈(Button.variants.ts 와 같은 이유). 접힘(`collapsed`)은 축이 아니라 상태다 — `data-collapsed` 로 드러나고
 * 폭 클래스는 컴포넌트가 붙인다. */

/** 사이드바 뿌리의 변형 — `side`(테두리가 서는 쪽). */
export const sidebarVariants = cva(
  [
    "flex shrink-0 flex-col gap-2 bg-card p-3",
    "transition-[width] duration-base motion-reduce:transition-none",
  ],
  {
    variants: {
      side: {
        left: "border-r border-border",
        right: "border-l border-border",
      },
    },
    defaultVariants: { side: "left" },
  },
);
