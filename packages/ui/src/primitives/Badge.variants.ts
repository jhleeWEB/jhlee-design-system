import { cva, type VariantProps } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 배지의 변형 — `tone` 과 `provisional`(TBV 점선). */
export const badgeVariants = cva(
  "leading-normal inline-flex items-center gap-2 rounded-sm border px-3 py-px text-label whitespace-nowrap",
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
