import { cva, type VariantProps } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 배지의 변형 — `tone` 과 `provisional`(TBV 점선).
 *  높이는 `h-5`(20px)로 못 박는다(#82) — 예전 `py-px leading-normal` 은 1px 여백 + 11 × 1.5 = 16.5px 줄 + 테두리 2 = 20.5px 로 소수였다.
 *  지금은 테두리 2 + 글자 칸 18px 안에 text-label 의 16px 줄이 가운데 선다. 배지는 한 줄(`whitespace-nowrap`)이라 높이를 고정해도 넘치지 않는다. */
export const badgeVariants = cva(
  "inline-flex h-5 items-center gap-2 rounded-sm border px-3 text-label whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-border-strong bg-muted text-foreground-2",
        primary: "border-primary-line bg-accent text-primary",
        success: "border-success-line bg-success-soft text-success",
        warning: "border-warning-line bg-warning-soft text-warning",
        destructive: "border-destructive-line bg-destructive-soft text-destructive",
      },
      /* TBV(검증 대기)처럼 «아직 확정이 아니다» 를 말하는 자리. 점선이 그 뜻을 맡는다. */
      /** 잠정 — 점선 테두리로 «아직 확정이 아니다» 를 말한다(검증 대기). */
      provisional: { true: "border-dashed", false: "" },
    },
    defaultVariants: { tone: "neutral", provisional: false },
  },
);

/** 배지가 받는 톤 — 판정 3색 + 주된 것 + 중립. `info` 는 배지에 없다(안내는 Alert 의 몫). */
export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;
