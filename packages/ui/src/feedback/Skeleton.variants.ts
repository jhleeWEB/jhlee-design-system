import { cva, type VariantProps } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 스켈레톤의 변형 — `shape` 가 모서리를 고른다. shimmer 면은 축이 아니라 컴포넌트가 든다. */
export const skeletonVariants = cva("", {
  variants: {
    shape: { bar: "rounded-sm", circle: "rounded-full" },
  },
  defaultVariants: { shape: "bar" },
});

/** 스켈레톤이 받는 모양. */
export type SkeletonShape = NonNullable<VariantProps<typeof skeletonVariants>["shape"]>;
