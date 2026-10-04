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
      /**
       * 배치.
       * - `vertical` — 썸네일 위, 글 아래. 격자의 기본
       * - `horizontal` — 썸네일 왼쪽, 글 오른쪽. 목록 한 줄
       */
      orientation: {
        vertical: "flex-col",
        horizontal: "flex-row items-stretch",
      },
      /**
       * 층위 — Card 와 같은 셋.
       * - `raised` — 그림자로 떠 있다. 기본값
       * - `flat` — 테두리만
       * - `flush` — 각진 테두리. 격자에 붙는 칸
       */
      elevation: {
        raised: "rounded-lg shadow-card hover:shadow-pop",
        flat: "rounded-lg border border-border hover:border-border-strong",
        flush: "rounded-none border border-border",
      },
      /** 선택됨 — 테두리 두께가 아니라 색(primary 링)으로 말한다. */
      selected: {
        true: "",
        false: "",
      },
      /** 눌리는 카드 — MediaCard 는 `onSelect` 가 있으면 스스로 켠다. */
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

/** 내용 카드 설명의 변형 — 몇 줄에서 자르는가(`lines`). */
export const mediaCardDescriptionVariants = cva("mt-1 mb-0 text-body text-muted-foreground", {
  variants: {
    /**
     * 설명을 자르는 줄 수.
     * - `2` — 두 줄. 격자에서 카드 높이를 맞춘다. 기본값
     * - `3` — 세 줄
     * - `none` — 자르지 않는다. 잘리면 안 되는 근거 문장
     */
    lines: {
      2: "line-clamp-2",
      3: "line-clamp-3",
      none: "",
    },
  },
  defaultVariants: { lines: 2 },
});
