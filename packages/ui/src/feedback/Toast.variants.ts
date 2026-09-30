import { cva, type VariantProps } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 토스트의 변형 — `tone` 마다 테두리 강조. */
export const toastVariants = cva(
  [
    "ds-toast group pointer-events-auto relative flex w-full items-start gap-3",
    "rounded-lg border border-solid border-l-3 bg-card p-4 shadow-pop",
    "text-body text-foreground",
  ],
  {
    variants: {
      tone: {
        neutral: "border-border border-l-foreground-2",
        success: "border-border border-l-success",
        warning: "border-border border-l-warning",
        destructive: "border-border border-l-destructive",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

/** 토스트가 받는 톤. */
export type ToastTone = NonNullable<VariantProps<typeof toastVariants>["tone"]>;
