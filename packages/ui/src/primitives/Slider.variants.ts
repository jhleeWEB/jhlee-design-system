import { cva } from "../cn";

/* `*.variants.ts` 는 지시문·훅·Radix 가 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Input.variants.ts 와 같은 이유, 계획 §2.5-g).
 *
 * 손잡이 지름을 `--slider-thumb` 하나로 둔다 — 손잡이 크기와 눈금 라벨의 위치 보정(Slider.tsx 의 `markOffset`)이 같은 값을 읽어야 한다.
 * Radix 는 손잡이가 트랙 밖으로 나가지 않게 중심을 «반지름 ~ 폭−반지름» 사이로 옮기므로, 눈금도 같은 구간에 놓아야 끝 눈금이 손잡이 중심과 맞는다. */

/**
 * 슬라이더 조작부(Radix `Slider.Root`)의 변형 — `size`. 높이는 누를 수 있는 띠이고 트랙은 그 가운데에 얇게 선다.
 */
export const sliderVariants = cva(
  [
    "relative flex w-full min-w-0 touch-none items-center select-none",
    "data-disabled:pointer-events-none data-disabled:opacity-45",
  ],
  {
    variants: {
      /**
       * 크기 — 누를 수 있는 띠의 높이 · 트랙 두께 · 손잡이 지름.
       * - `sm` — 낮은 띠 · 얇은 트랙 · 작은 손잡이. 패널 안 촘촘한 줄
       * - `md` — 작은 컨트롤 높이의 띠 · 기본 트랙 · 기본 손잡이
       */
      size: {
        sm: "h-6 [--slider-thumb:calc(var(--spacing)*3)]",
        md: "h-ctl-sm [--slider-thumb:calc(var(--spacing)*4)]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

/** 트랙의 변형 — `size`(조작부의 것을 이어받는다). 채워진 구간은 `bg-primary` — «지금 고른 것» 이다. */
export const sliderTrackVariants = cva("relative grow overflow-hidden rounded-full bg-border-strong", {
  variants: {
    /**
     * 크기 — 조작부의 `size` 와 같은 값이다.
     * - `sm` — 얇은 트랙
     * - `md` — 기본 트랙
     */
    size: { sm: "h-1", md: "h-1.5" },
  },
  defaultVariants: { size: "md" },
});

/** 손잡이 — 카드 바탕의 원에 주색 테두리. 지름은 조작부의 `--slider-thumb` 이다. */
export const sliderThumbClassName = [
  "block size-(--slider-thumb) cursor-grab rounded-full border-2 border-solid border-primary bg-card shadow-chip",
  "transition-colors duration-fast hover:bg-accent active:cursor-grabbing",
  "focus-visible:focus-ring focus-visible:outline-none",
].join(" ");
