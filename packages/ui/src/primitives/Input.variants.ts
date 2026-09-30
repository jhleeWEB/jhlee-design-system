import { cva } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 입력 필드의 변형 — `size` · `invalid` · `numeric`(mono + tabular-nums). */
export const inputVariants = cva(
  [
    "w-full min-w-0 border bg-surface-2 text-ink",
    "rounded-control transition-colors duration-100",
    "placeholder:text-disabled",
    "focus-visible:focus-ring focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-45",
    /* 숫자 입력의 스피너는 24px 높이에서 잡을 수 없는 크기가 된다 — 드래그와 키보드로 바꾼다. */
    "[&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none",
    "[&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none",
    "[-moz-appearance:textfield]",
  ],
  {
    variants: {
      size: {
        sm: "h-ctl-sm px-3 text-body",
        md: "h-ctl px-3 text-control",
        lg: "h-ctl-lg px-4 text-control",
      },
      invalid: {
        true: "border-danger focus-visible:outline-danger",
        false: "border-line-strong hover:border-ink-2",
      },
      numeric: { true: "tnum text-right", false: "" },
    },
    defaultVariants: { size: "md", invalid: false, numeric: false },
  },
);
