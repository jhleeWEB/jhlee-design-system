import { cva } from "../cn";

/* `*.variants.ts` 는 지시문·훅·Radix 가 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Button.variants.ts 와 같은 이유).
 * 켜짐 여부는 축이 아니라 상태다 — Radix 가 칸에 찍는 `data-state="on"` 을 선택자로 읽는다(Tabs 의 data-state=active 와 같은 자리).
 * `segmented` 의 트랙은 Tabs · SegmentedControl 과 같은 컨트롤이다(#80) — `rounded-md` + 여백 `p-1` + 칸(sm 22 · md 28px) = 컨트롤 높이(30 · 36px).
 * 칸의 반경은 동심원 `calc(var(--radius-md) - var(--spacing))`(4px)다. 예전 트랙은 `rounded-lg` 에 sm 칸 24px 이라 sm 묶음이 32px 로 서서
 * 같은 줄의 작은 버튼(30px)보다 컸다. 글자는 상자 높이를 따른다 — 30px 이상의 상자(md 칸 · 홀로 선 outline 칸)는 컨트롤 글자(`text-control`),
 * 트랙 안의 22px 칸(sm segmented)만 `text-label` 이다(13.5px 글자가 22px 칸을 꽉 채워 위아래 여백이 1.5px 로 줄었다, #80 실측 — 짝수 사다리(#82)의
 * text-control 14/20 이면 1px, text-label 12/16 이면 3px). 굵기는 둘 다 medium. */

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
      segmented: "rounded-md bg-primary-track p-1",
      outline: "gap-1",
    },
    /**
     * 크기 — 묶음 높이. 글자는 둘 다 컨트롤 글자다.
     * - `sm` — 작은 컨트롤 높이(30px)
     * - `md` — 기본 컨트롤 높이(36px)
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
          "rounded-[calc(var(--radius-md)-var(--spacing))]",
          "data-[state=on]:bg-card data-[state=on]:text-primary data-[state=on]:shadow-chip",
        ],
        outline: [
          "rounded-md border border-solid border-border-strong bg-card",
          "data-[state=on]:border-primary-line data-[state=on]:bg-accent data-[state=on]:text-primary",
        ],
      },
      /**
       * 크기 — `ToggleGroup` 의 `size` 와 같은 값이다. 트랙 안 칸은 22 · 28px, 홀로 선 `outline` 칸은 컨트롤 높이(30 · 36px)다.
       * - `sm` — 작은 칸 · 트랙 안에서는 라벨 글자
       * - `md` — 기본 칸 · 컨트롤 글자
       */
      size: {
        sm: "h-5.5 min-w-5.5 px-2 text-label",
        md: "h-7 min-w-7 px-3 text-control",
      },
    },
    compoundVariants: [
      /* `outline` 칸은 트랙 없이 홀로 서므로 컨트롤 높이 사다리를 쓴다 — 입력 · 버튼과 한 줄에 선다. */
      { variant: "outline", size: "sm", class: "h-ctl-sm min-w-(--height-ctl-sm) text-control" },
      { variant: "outline", size: "md", class: "h-ctl min-w-(--height-ctl)" },
    ],
    defaultVariants: { variant: "segmented", size: "md" },
  },
);
