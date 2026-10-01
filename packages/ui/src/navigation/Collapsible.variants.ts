import { cva } from "../cn";

/* `*.variants.ts` 는 지시문·훅·Radix 가 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Button.variants.ts 와 같은 이유).
 * 열림 여부는 축이 아니라 상태다 — Radix 가 트리거에 찍는 `data-state="open"` 을 선택자로 읽는다(셰브론 회전). */

/**
 * 접기 트리거의 변형 — `variant`. 셰브론은 컴포넌트가 붙이고 여기서는 상자와 글자만 정한다.
 * 회전은 Accordion 셰브론과 같은 접기 모션 토큰(`--motion-collapse-*`)을 읽는다 — 한 화면의 두 접기가 같은 박자로 돈다.
 */
export const collapsibleTriggerVariants = cva(
  [
    /* 네이티브 button 의 UA 테두리·바탕을 걷는다(Tabs 칸과 같은 첫 줄). */
    "appearance-none border-0 bg-transparent",
    "flex cursor-pointer items-center gap-2 text-left text-foreground",
    "transition-colors duration-fast",
    "focus-visible:focus-ring focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground",
    "[&>svg]:transition-[rotate] [&>svg]:duration-(--motion-collapse-duration) [&>svg]:ease-(--motion-collapse-easing)",
    "data-[state=open]:[&>svg]:rotate-180",
  ],
  {
    variants: {
      /**
       * 모양.
       * - `row` — 폭을 채우는 줄. 라벨 · 셰브론이 양 끝에 서고 hover 에 옅은 면이 깔린다. 패널 안의 «고급 설정» 같은 구획 머리
       * - `inline` — 글자 폭만큼의 링크형 버튼. 목록 끝의 «3 more» 처럼 문장 흐름 안에서 펼친다
       */
      variant: {
        row: "h-ctl w-full justify-between rounded-md px-3 text-control font-medium hover:bg-muted",
        inline: "inline-flex rounded-sm px-1 text-body text-muted-foreground hover:text-foreground",
      },
    },
    defaultVariants: { variant: "row" },
  },
);
