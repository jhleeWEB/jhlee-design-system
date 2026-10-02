import { cva, type VariantProps } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 스피너의 변형 — `size`(12 · 16 · 24px) 와 `tone`(neutral 은 글자색을 따른다 — 옛 current). `muted` 는 스피너만의 것이다.
 *  예전 24 · 32 · 48px 은 2px 격자 시절 값(`size-6/8/12`)이 두 배로 남은 것이다 — Spinner.tsx 머리 주석의 «기본 크기 12–16px» 로 되돌린다(#80). */
export const spinnerVariants = cva("animate-spin shrink-0 motion-reduce:animate-none", {
  variants: {
    size: { sm: "size-3", md: "size-4", lg: "size-6" },
    tone: { neutral: "text-current", muted: "text-muted-foreground", primary: "text-primary" },
  },
  defaultVariants: { size: "md", tone: "neutral" },
});

/** 스피너가 받는 톤 — `muted` 는 통일 어휘 밖의 스피너 전용 값이다(보조 자리의 회색 스피너). */
export type SpinnerTone = NonNullable<VariantProps<typeof spinnerVariants>["tone"]>;
