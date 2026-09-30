import { cva } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 알림 상자의 변형 — `tone` 마다 배경·테두리·글자색 한 벌. */
export const alertVariants = cva(
  "flex min-w-0 max-w-full gap-4 rounded-control border border-l-3 p-5 text-body leading-relaxed",
  {
    variants: {
      tone: {
        info: "border-line border-l-accent bg-surface-2 text-ink-2",
        ok: "border-ok/35 border-l-ok bg-ok-soft text-ink-2",
        warn: "border-warn/35 border-l-warn bg-warn-soft text-ink-2",
        danger: "border-danger/35 border-l-danger bg-danger-soft text-ink-2",
      },
    },
    defaultVariants: { tone: "info" },
  },
);
