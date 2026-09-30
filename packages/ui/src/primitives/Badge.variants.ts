import { cva } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 배지의 변형 — `tone` 과 `provisional`(TBV 점선). */
export const badgeVariants = cva(
  "inline-flex items-center gap-2 whitespace-nowrap rounded-chip border px-3 py-px text-label leading-normal",
  {
    variants: {
      tone: {
        neutral: "border-line-strong bg-surface-2 text-ink-2",
        accent: "border-accent/40 bg-accent-soft text-accent",
        ok: "border-ok/40 bg-ok-soft text-ok",
        warn: "border-warn/40 bg-warn-soft text-warn",
        danger: "border-danger/40 bg-danger-soft text-danger",
      },
      /* TBV(검증 대기)처럼 «아직 확정이 아니다» 를 말하는 자리. 점선이 그 뜻을 맡는다. */
      provisional: { true: "border-dashed", false: "" },
    },
    defaultVariants: { tone: "neutral", provisional: false },
  },
);
