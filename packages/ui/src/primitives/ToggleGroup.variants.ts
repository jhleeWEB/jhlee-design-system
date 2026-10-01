import { cva } from "../cn";

/* `*.variants.ts` 는 지시문·훅·Radix 가 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Button.variants.ts 와 같은 이유).
 * 켜짐 여부는 축이 아니라 상태다 — Radix 가 칸에 찍는 `data-state="on"` 을 선택자로 읽는다(Tabs 의 data-state=active 와 같은 자리).
 * `segmented` 의 트랙 여백은 Tabs 와 같이 `p-1` 이다 — 바깥 `rounded-lg`(12) − 여백(4) = 안쪽 `rounded-md`(8) 로 토큰끼리 동심원이 된다. */

/**
 * 토글 묶음의 변형 — `variant` · `size`.
 */
export const toggleGroupVariants = cva("inline-flex shrink-0 items-center", {
  variants: {
    /**
     * 모양.
     * - `segmented` — 옅은 파란 트랙 위에 켜진 칸이 흰 pill 로 선다(Tabs · SegmentedControl 과 같은 모양). 보기 방식 같은 작은 전환
     * - `outline` — 테두리 상자들이 붙은 줄. 켜진 칸은 옅은 주색 바탕 · 주색 글자. 도구 막대의 서식 토글(굵게 · 기울임)
     */
    variant: {
      segmented: "rounded-lg bg-primary-track p-1",
      outline: "gap-1",
    },
    /**
     * 크기 — 칸 높이.
     * - `sm` — 낮은 칸 · 라벨 글자
     * - `md` — 기본 칸 · 컨트롤 글자
     */
    size: { sm: "", md: "" },
  },
  defaultVariants: { variant: "segmented", size: "md" },
});

/** 토글 한 칸의 변형 — `variant` · `size`(묶음의 것을 이어받는다). */
export const toggleGroupItemVariants = cva(
  [
    /* Radix 칸은 네이티브 button 이다 — UA 테두리 · 바탕을 걷는다(Tabs 칸과 같은 첫 줄). */
    "appearance-none border-0 bg-transparent",
    "inline-flex cursor-pointer items-center justify-center gap-2 font-medium whitespace-nowrap",
    "text-muted-foreground transition-colors duration-fast hover:text-foreground-2",
    "focus-visible:focus-ring focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      /**
       * 모양 — `ToggleGroup` 의 `variant` 와 같은 값이다.
       * - `segmented` — 켜진 칸이 흰 pill · 파란 글자로 선다
       * - `outline` — 칸마다 테두리 상자, 켜진 칸은 옅은 주색 바탕 · 주색 테두리 · 주색 글자
       */
      variant: {
        segmented: [
          "rounded-md",
          "data-[state=on]:bg-card data-[state=on]:text-primary data-[state=on]:shadow-chip",
        ],
        outline: [
          "rounded-md border border-solid border-border-strong bg-card",
          "data-[state=on]:border-primary-line data-[state=on]:bg-accent data-[state=on]:text-primary",
        ],
      },
      /**
       * 크기 — `ToggleGroup` 의 `size` 와 같은 값이다.
       * - `sm` — 낮은 칸 · 라벨 글자
       * - `md` — 기본 칸 · 컨트롤 글자
       */
      size: {
        sm: "h-6 min-w-6 px-2 text-label",
        md: "h-7 min-w-7 px-3 text-control",
      },
    },
    compoundVariants: [
      /* `outline` 칸은 트랙 없이 홀로 서므로 컨트롤 높이 사다리를 쓴다 — 입력 · 버튼과 한 줄에 선다. */
      { variant: "outline", size: "sm", class: "h-ctl-sm min-w-(--height-ctl-sm)" },
      { variant: "outline", size: "md", class: "h-ctl min-w-(--height-ctl)" },
    ],
    defaultVariants: { variant: "segmented", size: "md" },
  },
);
