import { cva } from "../cn";

/* 서버에서도 호출 가능한 변형 모듈(Button.variants.ts 와 같은 이유). 축은 `orientation` 하나 — 패널이 늘어서는 방향이다.
 * 접힘 · 끄는 중은 축이 아니라 상태라 `data-state` · `data-resizing` 으로 드러나고 클래스는 그 data 선택자로 붙는다. */

/** 패널 묶음 뿌리의 변형 — `orientation`(패널이 늘어서는 방향). */
export const resizablePanelsVariants = cva("flex min-h-0 min-w-0", {
  variants: {
    orientation: {
      horizontal: "flex-row",
      vertical: "flex-col",
    },
  },
  defaultVariants: { orientation: "horizontal" },
});

/** 패널 한 칸 — 크기가 정해진 패널은 주축으로 줄지도 늘지도 않는다(인라인 크기가 그 값을 든다). 접기 전환만 움직이고 끄는 동안은 멈춘다. */
export const resizablePanelVariants = cva([
  "relative flex min-h-0 min-w-0 flex-col overflow-hidden",
  "data-[sized]:shrink-0 data-[sized]:grow-0",
  "transition-[width,height] duration-slow ease-out-quick data-[resizing]:transition-none motion-reduce:transition-none",
]);

/* 손잡이 — 보이는 것은 1px 헤어라인이고 잡히는 것은 양옆으로 넓힌 의사 요소다. 선을 굵게 그리면 «여백이 아니라 선이 구조를 만든다» 가 깨지고,
 * 1px 만 잡히게 하면 끌기가 과녁 맞히기가 된다. 포커스·호버·끄는 중에는 선이 primary 로 물든다 — «지금 이것을 잡고 있다». */
/** 손잡이(separator)의 변형 — `orientation`(묶음의 방향. 선은 그에 수직으로 선다). */
export const resizableHandleVariants = cva(
  [
    "relative z-raised shrink-0 touch-none bg-border select-none",
    "transition-colors duration-fast before:absolute",
    "hover:bg-primary data-[resizing]:bg-primary",
    "focus-visible:bg-primary focus-visible:focus-ring focus-visible:outline-none",
  ],
  {
    variants: {
      orientation: {
        horizontal: "w-px cursor-col-resize self-stretch before:-inset-x-2 before:inset-y-0",
        vertical: "h-px cursor-row-resize self-stretch before:inset-x-0 before:-inset-y-2",
      },
    },
    defaultVariants: { orientation: "horizontal" },
  },
);
