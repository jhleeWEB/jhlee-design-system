import { cva } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 카드(구획)의 변형 — `elevation` 과 `pad`. */
export const cardVariants = cva("relative flex min-h-0 min-w-0 flex-col bg-surface", {
  variants: {
    elevation: {
      raised: "rounded-card shadow-card",
      /* 테두리만. 카드 안에 다시 칸을 나눌 때 — 그림자를 겹쳐 쓰면 층위가 흐려진다. */
      flat: "rounded-card border border-line",
      /* 격자에 붙는 칸. 옛 셸과 섞어 쓸 때. */
      flush: "rounded-none border border-line",
    },
    pad: { none: "", sm: "p-3", md: "p-4", lg: "p-5" },
  },
  defaultVariants: { elevation: "raised", pad: "none" },
});
