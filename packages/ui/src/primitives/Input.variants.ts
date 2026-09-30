import { cva } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 입력 필드의 변형 — `size` · `invalid` · `numeric`(mono + tabular-nums). */
export const inputVariants = cva(
  [
    "w-full min-w-0 border bg-muted text-foreground",
    "rounded-md transition-colors duration-fast",
    "placeholder:text-foreground-disabled",
    "focus-visible:focus-ring focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-45",
    /* `FieldControl` 은 invalid 를 prop 이 아니라 `aria-invalid` 로 꽂는다(#47) — 같은 파괴색 테두리를 ARIA 로도 켠다. */
    "aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive",
    /* 숫자 입력의 스피너는 24px 높이에서 잡을 수 없는 크기가 된다 — 드래그와 키보드로 바꾼다. */
    "[&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none",
    "[&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none",
    "[-moz-appearance:textfield]",
  ],
  {
    variants: {
      /**
       * 크기 — 컨트롤 높이 사다리(`h-ctl-*`).
       * - `sm` — 작은 컨트롤 높이 · 본문 글자
       * - `md` — 기본 컨트롤 높이
       * - `lg` — 큰 컨트롤 높이 · 넓은 가로 여백
       */
      size: {
        sm: "h-ctl-sm px-3 text-body",
        md: "h-ctl px-3 text-control",
        lg: "h-ctl-lg px-4 text-control",
      },
      /** 검증 실패 — 파괴색 테두리와 `aria-invalid`. */
      invalid: {
        true: "border-destructive focus-visible:outline-destructive",
        false: "border-border-strong hover:border-foreground-2",
      },
      /** 수치 — 오른쪽 정렬 + mono tabular-nums(원칙 3). */
      numeric: { true: "text-right tnum", false: "" },
    },
    defaultVariants: { size: "md", invalid: false, numeric: false },
  },
);
