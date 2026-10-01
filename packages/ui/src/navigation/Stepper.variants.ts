import { cva } from "../cn";

/* `*.variants.ts` 는 지시문·훅이 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Tabs.variants.ts 와 같은 이유). */

/**
 * 단계 줄의 변형 — `orientation`. 가로는 단계가 폭을 똑같이 나눠 갖고, 원 옆의 선이 다음 단계까지 남은 폭을 채우며 이름 · 설명은 원 아래에서 칸 폭 안에 줄을 바꾼다.
 * 세로는 원 옆에 이름 · 설명이 서고 원 아래로 선이 내려간다.
 */
export const stepperVariants = cva("m-0 flex list-none p-0", {
  variants: {
    /**
     * 방향.
     * - `horizontal` — 단계를 한 줄에 두고 원 사이를 가로선으로 잇는다. 마법사 머리 · 넓은 화면
     * - `vertical` — 단계를 위에서 아래로 쌓고 표시 원 아래로 세로선을 잇는다. 사이드 패널 · 설명이 긴 단계
     */
    orientation: {
      horizontal:
        "flex-row items-start [&>li]:flex-1 [&>li]:flex-col [&>li]:gap-2 [&>li:not(:last-child)]:pr-2",
      vertical: "flex-col [&>li]:flex-row [&>li]:items-start [&>li]:gap-3 [&>li]:pb-6 [&>li:last-child]:pb-0",
    },
  },
  defaultVariants: { orientation: "horizontal" },
});

/**
 * 단계 표시 원의 변형 — `status`. 색은 상태를 **거들 뿐**이고 상태는 원 옆의 글자(Complete · Current · Upcoming · Error)가 말한다(원칙 2).
 * 주색(primary)은 «지나온 길 · 지금 자리», 파괴색은 판정(실패)에만 쓴다.
 */
export const stepIndicatorVariants = cva(
  [
    "relative z-raised flex size-6 shrink-0 items-center justify-center rounded-full border",
    "tnum text-label font-semibold [&_svg]:size-3",
  ],
  {
    variants: {
      /**
       * 단계의 상태.
       * - `complete` — 끝난 단계. 채운 주색 원 · 체크
       * - `current` — 지금 단계(`aria-current="step"`). 주색 테두리 · 옅은 면 · 번호
       * - `upcoming` — 아직 오지 않은 단계. 중립 테두리 · 흐린 번호
       * - `error` — 실패한 단계. 채운 파괴색 원 · X
       */
      status: {
        complete: "border-primary bg-primary text-primary-foreground",
        current: "border-primary bg-accent text-primary",
        upcoming: "border-border-strong bg-card text-muted-foreground",
        error: "border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: { status: "upcoming" },
  },
);

/**
 * 단계 사이를 잇는 선의 변형 — `orientation` · `complete`. 끝난 단계 뒤의 선은 주색이라 «어디까지 왔나» 가 한눈에 읽힌다.
 * 세로선은 표시 원(24px)의 중심 아래에서 시작해 다음 단계 원 바로 위에서 끝난다.
 */
export const stepConnectorVariants = cva("shrink-0", {
  variants: {
    /**
     * 방향 — `Stepper` 의 같은 이름.
     * - `horizontal` — 표시 원 옆의 가로선, 다음 단계까지 남은 폭을 채운다
     * - `vertical` — 표시 원 아래의 세로선, 단계 아래 여백까지 닿는다
     */
    orientation: {
      horizontal: "h-px min-w-4 flex-1",
      vertical: "absolute top-6 bottom-0 left-3 w-px",
    },
    /** 앞 단계가 끝났다 — 선이 주색이 된다. */
    complete: { true: "bg-primary", false: "bg-border-strong" },
  },
  defaultVariants: { orientation: "horizontal", complete: false },
});
