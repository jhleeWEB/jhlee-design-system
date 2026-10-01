import { cva, type VariantProps } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 알림 상자의 변형 — `tone` 마다 배경·테두리·글자색 한 벌. */
export const alertVariants = cva(
  "flex max-w-full min-w-0 gap-4 rounded-md border border-l-3 p-5 text-body leading-relaxed",
  {
    variants: {
      tone: {
        /* 네 톤이 같은 모양 — {tone}-line 테두리(면 위 3:1) · {tone} 왼쪽 띠 · {tone}-soft 면(#24). info 도 중립 면이 아니라 info-soft 다. */
        info: "border-info-line border-l-info bg-info-soft text-foreground-2",
        success: "border-success-line border-l-success bg-success-soft text-foreground-2",
        warning: "border-warning-line border-l-warning bg-warning-soft text-foreground-2",
        destructive: "border-destructive-line border-l-destructive bg-destructive-soft text-foreground-2",
      },
    },
    defaultVariants: { tone: "info" },
  },
);

/** 알림이 받는 톤 — 안내가 기본이고 중립·주된 것은 없다(흐름 안의 알림은 언제나 «무슨 일» 이다). */
export type AlertTone = NonNullable<VariantProps<typeof alertVariants>["tone"]>;
