import { cva } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 버튼의 변형 — `variant`(외형) · `tone`(판정색) · `size`. `tone` 과 `variant` 는 다른 축이다. */
export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-3 whitespace-nowrap",
    "font-sans text-control leading-none",
    /* preflight 가 없으므로 `border` 만으로는 UA 테두리 스타일이 남는다 — solid 를 명시한다. */
    "cursor-pointer appearance-none rounded-control border border-solid transition-colors duration-100",
    "focus-visible:focus-ring focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-45",
    "aria-disabled:pointer-events-none aria-disabled:opacity-45",
    /* 아이콘만 든 버튼이 정사각이 되도록. 텍스트가 있으면 패딩이 이긴다. */
    "[&_svg]:size-7 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        solid: "",
        outline: "bg-surface",
        ghost: "border-transparent bg-transparent",
        link: "h-auto border-transparent bg-transparent p-0 underline-offset-2 hover:underline",
      },
      tone: {
        neutral: "",
        accent: "",
        danger: "",
      },
      size: {
        sm: "h-ctl-sm px-3",
        md: "h-ctl px-4",
        lg: "h-ctl-lg px-6",
        /* 아이콘 전용 — 가로 패딩을 빼고 정사각으로 만든다. */
        "icon-sm": "h-ctl-sm w-ctl-sm p-0",
        icon: "h-ctl w-ctl p-0",
        "icon-lg": "h-ctl-lg w-ctl-lg p-0",
      },
    },
    compoundVariants: [
      /* `link` 는 **상자가 없다.** `size` 가 주는 높이·가로 패딩을 여기서 되돌린다 —
         compoundVariants 가 variants 뒤에 이어 붙으므로 이 한 줄이 이긴다.
         이게 없으면 `variant="link" size="sm"` 이 30px 높이와 12px 패딩을 달고 나와
         글자처럼 보여야 할 것이 칩이 된다(#1202 의 적대적 검토가 잡았다). */
      { variant: "link", class: "h-auto px-0 py-0" },
      { variant: "solid", tone: "neutral", class: "border-line-strong bg-surface-2 text-ink hover:bg-surface-3" },
      { variant: "solid", tone: "accent", class: "border-accent bg-accent text-accent-ink hover:border-accent-hover hover:bg-accent-hover" },
      { variant: "solid", tone: "danger", class: "border-danger bg-danger text-white hover:brightness-110" },
      { variant: "outline", tone: "neutral", class: "border-line-strong text-ink hover:bg-surface-2" },
      { variant: "outline", tone: "accent", class: "border-accent text-accent hover:bg-accent-soft" },
      { variant: "outline", tone: "danger", class: "border-danger text-danger hover:bg-danger-soft" },
      { variant: "ghost", tone: "neutral", class: "text-muted hover:bg-surface-2 hover:text-ink" },
      { variant: "ghost", tone: "accent", class: "text-accent hover:bg-accent-soft" },
      { variant: "ghost", tone: "danger", class: "text-danger hover:bg-danger-soft" },
      { variant: "link", tone: "neutral", class: "text-ink" },
      { variant: "link", tone: "accent", class: "text-accent" },
      { variant: "link", tone: "danger", class: "text-danger" },
    ],
    defaultVariants: { variant: "outline", tone: "neutral", size: "md" },
  },
);
