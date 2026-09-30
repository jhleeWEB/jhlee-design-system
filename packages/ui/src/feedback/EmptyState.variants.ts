import { cva, type VariantProps } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 빈 상태의 변형 — `size` 가 여백과 사이 간격을 고른다. 제목 글자 크기는 같은 축의 `emptyStateTitleVariants` 가 맞춘다. */
export const emptyStateVariants = cva("flex flex-col items-center justify-center text-center", {
  variants: {
    size: {
      /* 삼항 두 개(여백 · 제목)가 축의 값 목록을 따로 들고 있던 것을 cva 로 모은다(#43) — 클래스는 그대로다. */
      default: "gap-4 p-12",
      compact: "gap-3 p-6",
    },
  },
  defaultVariants: { size: "default" },
});

/** 빈 상태 제목의 변형 — 루트와 같은 `size` 축. 패널 안의 좁은 자리에서는 본문 크기로 줄인다. */
export const emptyStateTitleVariants = cva("font-semibold text-foreground", {
  variants: {
    size: { default: "text-title", compact: "text-body" },
  },
  defaultVariants: { size: "default" },
});

/** 빈 상태가 받는 크기. */
export type EmptyStateSize = NonNullable<VariantProps<typeof emptyStateVariants>["size"]>;
