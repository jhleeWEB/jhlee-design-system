import { cva, type VariantProps } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 버튼의 변형 — `variant`(외형) · `tone`(판정색) · `size`. `tone` 과 `variant` 는 다른 축이다. */
export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-3 whitespace-nowrap",
    /* 컨트롤 글자 = text-control · medium(#80 역할 표) — 크기 축(sm · md · lg)은 높이와 여백만 바꾼다. */
    "font-sans text-control leading-none font-medium",
    /* preflight 가 없으므로 `border` 만으로는 UA 테두리 스타일이 남는다 — solid 를 명시한다. */
    "cursor-pointer appearance-none rounded-md border border-solid transition-colors duration-fast",
    "focus-visible:focus-ring focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-45",
    "aria-disabled:pointer-events-none aria-disabled:opacity-45",
    /* 크롬 아이콘은 16px 한 가지다(lib/icons) — 예전 \`size-7\`(28px)은 아이콘을 버튼 높이만큼 키웠다(#73). */
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      /**
       * 외형 — 시각 무게.
       * - `solid` — 채움. 화면에 하나뿐인 주된 동작
       * - `outline` — 외곽선. 기본값 — 보조 동작
       * - `ghost` — 상자 없음. 도구 막대·목록 안의 가벼운 동작
       * - `link` — 글자만. 문장 안의 동작 — 높이·가로 패딩이 없다
       */
      variant: {
        solid: "",
        outline: "bg-card",
        ghost: "border-transparent bg-transparent",
        link: "h-auto border-transparent bg-transparent p-0 underline-offset-2 hover:underline",
      },
      tone: {
        neutral: "",
        primary: "",
        destructive: "",
      },
      /**
       * 크기 — 컨트롤 높이 사다리(`h-ctl-*`).
       * - `sm` — 작은 컨트롤 높이
       * - `md` — 기본 컨트롤 높이
       * - `lg` — 큰 컨트롤 높이
       * - `icon-sm` — 아이콘 전용 정사각, 작은 높이
       * - `icon` — 아이콘 전용 정사각, 기본 높이
       * - `icon-lg` — 아이콘 전용 정사각, 큰 높이
       */
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
      {
        variant: "solid",
        tone: "neutral",
        class: "border-border-strong bg-muted text-foreground hover:bg-secondary",
      },
      {
        variant: "solid",
        tone: "primary",
        class:
          "border-primary bg-primary text-primary-foreground hover:border-primary-hover hover:bg-primary-hover",
      },
      {
        variant: "solid",
        tone: "destructive",
        class:
          "border-destructive bg-destructive text-destructive-foreground hover:border-destructive-hover hover:bg-destructive-hover",
      },
      { variant: "outline", tone: "neutral", class: "border-border-strong text-foreground hover:bg-muted" },
      { variant: "outline", tone: "primary", class: "border-primary text-primary hover:bg-accent" },
      {
        variant: "outline",
        tone: "destructive",
        class: "border-destructive text-destructive hover:bg-destructive-soft",
      },
      {
        variant: "ghost",
        tone: "neutral",
        class: "text-muted-foreground hover:bg-muted hover:text-foreground",
      },
      { variant: "ghost", tone: "primary", class: "text-primary hover:bg-accent" },
      { variant: "ghost", tone: "destructive", class: "text-destructive hover:bg-destructive-soft" },
      { variant: "link", tone: "neutral", class: "text-foreground" },
      { variant: "link", tone: "primary", class: "text-primary" },
      { variant: "link", tone: "destructive", class: "text-destructive" },
    ],
    defaultVariants: { variant: "outline", tone: "neutral", size: "md" },
  },
);

/** 버튼이 받는 톤 — 판정 «통과·주의» 는 버튼의 축이 아니다(원칙 2: 유채색은 판정에만, 버튼은 동작이다). */
export type ButtonTone = NonNullable<VariantProps<typeof buttonVariants>["tone"]>;
