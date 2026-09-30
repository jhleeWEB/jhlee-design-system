import { cva } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 카드(구획)의 변형 — `elevation` 과 `pad`. */
export const cardVariants = cva("relative flex min-h-0 min-w-0 flex-col bg-card", {
  variants: {
    /**
     * 층위.
     * - `raised` — 그림자로 떠 있는 카드. 기본값
     * - `flat` — 테두리만. 카드 안에 다시 칸을 나눌 때
     * - `flush` — 각진 테두리. 격자에 붙는 칸
     */
    elevation: {
      raised: "rounded-lg shadow-card",
      /* 테두리만. 카드 안에 다시 칸을 나눌 때 — 그림자를 겹쳐 쓰면 층위가 흐려진다. */
      flat: "rounded-lg border border-border",
      /* 격자에 붙는 칸. 옛 셸과 섞어 쓸 때. */
      flush: "rounded-none border border-border",
    },
    /**
     * 안쪽 여백.
     * - `none` — 없음. 기본값 — 머리줄·웰이 자기 여백을 갖는다
     * - `sm` — 12px
     * - `md` — 16px
     * - `lg` — 20px
     */
    pad: { none: "", sm: "p-3", md: "p-4", lg: "p-5" },
  },
  defaultVariants: { elevation: "raised", pad: "none" },
});

/** 카드 머리의 변형 — `variant`. 배럴에 내보내지 않는다(공개 API 추가는 minor 라 이 리팩터의 몫이 아니다). */
export const cardHeaderVariants = cva("group/head flex min-w-0 shrink-0 items-center gap-3", {
  variants: {
    /**
     * 머리줄의 모양.
     * - `default` — 일반 카드의 여백
     * - `panel` — 뷰·페이지 패널. 같은 최소 높이·아래 테두리·홈통을 공유한다
     */
    variant: {
      default: "px-4 py-3",
      panel: "box-border min-h-12 border-b border-border bg-card px-3 py-2",
    },
  },
  defaultVariants: { variant: "default" },
});
