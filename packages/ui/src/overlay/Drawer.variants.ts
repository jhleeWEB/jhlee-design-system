import { cva } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 서랍 패널의 변형 — `side` 와 `size` 의 조합이 폭·높이를 정한다. */
export const drawerVariants = cva(
  [
    "fixed z-modal flex flex-col overflow-hidden bg-card shadow-modal",
    "text-body text-foreground focus-visible:outline-none",
  ],
  {
    variants: {
      side: {
        right: "inset-y-0 right-0 h-dvh border-l border-border",
        left: "inset-y-0 left-0 h-dvh border-r border-border",
        bottom: "inset-x-0 bottom-0 w-full rounded-t-xl border-t border-border",
      },
      size: { sm: "", md: "", lg: "" },
    },
    compoundVariants: [
      /* `w-screen`(100vw) + 상한(--container-drawer-*) = 옛 `w-[min(폭,100vw)]`(#22). 아래쪽 서랍의 높이는 같은 값의 토큰이 없어 남는다. */
      { side: "right", size: "sm", class: "w-screen max-w-drawer-sm" },
      { side: "right", size: "md", class: "w-screen max-w-drawer-md" },
      { side: "right", size: "lg", class: "w-screen max-w-drawer-lg" },
      { side: "left", size: "sm", class: "w-screen max-w-drawer-sm" },
      { side: "left", size: "md", class: "w-screen max-w-drawer-md" },
      { side: "left", size: "lg", class: "w-screen max-w-drawer-lg" },
      { side: "bottom", size: "sm", class: "h-[min(var(--size-sheet-sm),90dvh)]" },
      { side: "bottom", size: "md", class: "h-[min(var(--size-sheet-md),90dvh)]" },
      { side: "bottom", size: "lg", class: "h-[min(70dvh,90dvh)]" },
    ],
    defaultVariants: { side: "right", size: "md" },
  },
);
