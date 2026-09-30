import { cva } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 서랍 패널의 변형 — `side` 와 `size` 의 조합이 폭·높이를 정한다. */
export const drawerVariants = cva(
  [
    "fixed z-modal flex flex-col overflow-hidden bg-surface shadow-modal",
    "text-body text-ink focus-visible:outline-none",
  ],
  {
    variants: {
      side: {
        right: "inset-y-0 right-0 h-dvh border-l border-line",
        left: "inset-y-0 left-0 h-dvh border-r border-line",
        bottom: "inset-x-0 bottom-0 w-full rounded-t-modal border-t border-line",
      },
      size: { sm: "", md: "", lg: "" },
    },
    compoundVariants: [
      { side: "right", size: "sm", class: "w-[min(280px,100vw)]" },
      { side: "right", size: "md", class: "w-[min(400px,100vw)]" },
      { side: "right", size: "lg", class: "w-[min(620px,100vw)]" },
      { side: "left", size: "sm", class: "w-[min(280px,100vw)]" },
      { side: "left", size: "md", class: "w-[min(400px,100vw)]" },
      { side: "left", size: "lg", class: "w-[min(620px,100vw)]" },
      { side: "bottom", size: "sm", class: "h-[min(280px,90dvh)]" },
      { side: "bottom", size: "md", class: "h-[min(460px,90dvh)]" },
      { side: "bottom", size: "lg", class: "h-[min(70dvh,90dvh)]" },
    ],
    defaultVariants: { side: "right", size: "md" },
  },
);
