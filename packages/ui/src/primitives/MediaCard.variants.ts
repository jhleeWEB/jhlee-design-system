import { cva } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 내용 카드(항목)의 변형 — `orientation` · `elevation` · `selected` · `interactive`. */
export const mediaCardVariants = cva(
  [
    "group relative flex min-w-0 bg-card text-left",
    "transition-[box-shadow,border-color] duration-fast motion-reduce:transition-none",
  ],
  {
    variants: {
      orientation: {
        vertical: "flex-col",
        horizontal: "flex-row items-stretch",
      },
      elevation: {
        raised: "rounded-lg shadow-card hover:shadow-pop",
        flat: "rounded-lg border border-border hover:border-border-strong",
        flush: "rounded-none border border-border",
      },
      selected: {
        true: "",
        false: "",
      },
      interactive: { true: "cursor-pointer", false: "" },
    },
    compoundVariants: [
      /* 선택은 **테두리 두께가 아니라 색**으로 말한다. 두께를 바꾸면 선택될 때 카드가
         1px 씩 움직여 격자 전체가 흔들린다. */
      {
        elevation: "raised",
        selected: true,
        class: "shadow-[0_0_0_2px_var(--chrome-primary),var(--shadow-card)]",
      },
      { elevation: "flat", selected: true, class: "border-primary ring-1 ring-primary" },
      { elevation: "flush", selected: true, class: "border-primary ring-1 ring-primary" },
    ],
    defaultVariants: { orientation: "vertical", elevation: "raised", selected: false, interactive: false },
  },
);

/** 내용 카드 썸네일 칸의 변형 — `orientation` 과 `ratio`. */
export const mediaCardMediaVariants = cva("relative shrink-0 overflow-hidden bg-muted", {
  variants: {
    orientation: {
      vertical: "w-full rounded-t-lg",
      horizontal: "rounded-l-lg",
    },
    ratio: {
      "16/9": "aspect-[16/9]",
      "4/3": "aspect-[4/3]",
      "1/1": "aspect-square",
      /* 도면 썸네일. 필지는 대개 가로로 길다. */
      plan: "aspect-[3/2]",
      none: "",
    },
  },
  defaultVariants: { orientation: "vertical", ratio: "plan" },
});
