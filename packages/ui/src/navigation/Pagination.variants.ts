import { cva } from "../cn";

/* `*.variants.ts` 는 지시문·훅이 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Tabs.variants.ts 와 같은 이유).
 * 지금 페이지는 축이 아니라 상태다 — `aria-current="page"` 를 선택자로 읽는다(Tabs 의 data-state=active 와 같은 자리). */

/**
 * 페이지 칸(번호 · 이전 · 다음)의 변형 — `size`. 링크든 버튼이든 같은 모양이다(`asChild`).
 * 지금 페이지는 «지금 고른 것» 이라 주색(primary) 테두리 · 옅은 면으로 선다 — 판정색이 아니다.
 * 번호는 자릿수가 흔들리지 않게 `tnum`(원칙 3)이고, 정사각 칸의 최소 폭이 컨트롤 높이와 같다.
 */
export const paginationLinkVariants = cva(
  [
    "inline-flex cursor-pointer appearance-none items-center justify-center gap-1 rounded-md border border-transparent",
    "bg-transparent font-medium whitespace-nowrap text-foreground-2 no-underline",
    "transition-colors duration-fast hover:bg-muted hover:text-foreground",
    "focus-visible:focus-ring focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45",
    "aria-[current=page]:border-primary-line aria-[current=page]:bg-accent aria-[current=page]:text-primary",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      /**
       * 크기 — 컨트롤 높이 사다리(`h-ctl-*`). 번호 칸은 높이와 같은 최소 폭의 정사각이다. 글자는 두 단 모두 컨트롤 글자다(#80).
       * - `sm` — 작은 컨트롤 높이. 표 아래 · 패널 안
       * - `md` — 기본 컨트롤 높이. 페이지 아래
       */
      size: {
        sm: "h-ctl-sm min-w-(--height-ctl-sm) px-2 text-control",
        md: "h-ctl min-w-(--height-ctl) px-2 text-control",
      },
    },
    defaultVariants: { size: "md" },
  },
);
