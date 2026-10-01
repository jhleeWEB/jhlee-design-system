import { cva } from "../cn";

/* `*.variants.ts` 는 지시문·훅이 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Button.variants.ts 와 같은 이유).
 * 활성 여부는 축이 아니라 상태다 — Radix 가 탭에 찍는 `data-state="active"` 를 선택자로 읽는다(SegmentedControl 의 aria-checked 와 같은 자리). */

/**
 * 탭 목록의 변형 — `variant`.
 * `segmented` 는 SegmentedControl 과 같은 옅은 파란 트랙 위의 흰 pill 이다. 트랙 안쪽 여백을 `p-1` 로 두어 바깥 `rounded-lg`(12) −
 * 여백(4) = 안쪽 `rounded-md`(8) 로 **토큰끼리** 동심원이 된다 — SegmentedControl 의 `p-0.5` 는 간격 격자 밖이라 새 코드에 옮기지 않았다.
 */
export const tabsListVariants = cva("flex shrink-0 items-center", {
  variants: {
    /**
     * 모양.
     * - `segmented` — 트랙 위의 흰 pill(SegmentedControl 과 같은 모양). 도구 줄 · 카드 머리의 작은 전환
     * - `underline` — 아래 경계선 위의 밑줄. 페이지 · 패널 머리의 큰 구획 전환
     */
    variant: {
      segmented: "inline-flex rounded-lg bg-primary-track p-1",
      underline: "gap-4 border-b border-border",
    },
  },
  defaultVariants: { variant: "segmented" },
});

/** 탭 한 칸의 변형 — `variant`(목록의 것을 이어받는다). */
export const tabsTriggerVariants = cva(
  [
    /* Radix 칸은 네이티브 button 이다 — UA 테두리·바탕을 걷는다(SegmentedControl 칸과 같은 첫 줄). */
    "appearance-none border-0 bg-transparent",
    "inline-flex cursor-pointer items-center justify-center gap-2 font-medium whitespace-nowrap",
    "text-muted-foreground transition-colors duration-fast",
    "focus-visible:focus-ring focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-45",
  ],
  {
    variants: {
      /**
       * 모양 — `TabsList` 의 `variant` 와 같은 값이다.
       * - `segmented` — 활성 칸이 흰 pill · 파란 글자로 선다
       * - `underline` — 활성 칸 아래에 파란 밑줄이 선다
       */
      variant: {
        segmented: [
          "h-7 rounded-md px-3 text-control hover:text-foreground-2",
          "data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-chip",
        ],
        underline: [
          "relative h-ctl px-1 text-control hover:text-foreground",
          "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent",
          "data-[state=active]:text-foreground data-[state=active]:after:bg-primary",
        ],
      },
    },
    defaultVariants: { variant: "segmented" },
  },
);
