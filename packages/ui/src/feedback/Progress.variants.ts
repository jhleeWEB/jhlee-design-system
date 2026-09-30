import { cva, type VariantProps } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 진행 막대(indicator)의 변형 — `tone` 이 판정색을 받는다. */
export const progressVariants = cva("h-full transition-[width] duration-slow motion-reduce:transition-none", {
  variants: {
    tone: {
      primary: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      destructive: "bg-destructive",
      neutral: "bg-foreground-2",
    },
  },
  defaultVariants: { tone: "primary" },
});

/** 진행 막대가 받는 톤. */
export type ProgressTone = NonNullable<VariantProps<typeof progressVariants>["tone"]>;
