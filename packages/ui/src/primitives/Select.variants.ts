import { cva } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 서버 컴포넌트가 className 을 얻으려 부를 수 없다(Input.variants.ts 와 같은 이유, 계획 §2.5-g).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/**
 * 선택 트리거의 변형 — `size` · `invalid`. 높이·글자·테두리를 `inputVariants` 와 **같은 사다리**로 맞춘다:
 * 폼 한 줄에 Input 과 Select 가 나란히 서면 높이·바탕·테두리가 같아야 두 컨트롤이 한 벌로 읽힌다.
 * `aria-invalid` 에도 반응한다 — `FieldControl` 이 invalid 를 prop 이 아니라 ARIA 로 꽂기 때문이다(#47).
 */
export const selectTriggerVariants = cva(
  [
    "flex w-full min-w-0 items-center justify-between gap-2 border bg-muted text-left text-foreground",
    "rounded-md transition-colors duration-fast",
    "data-placeholder:text-muted-foreground",
    "focus-visible:focus-ring focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-45",
    "aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive",
    "[&_svg]:shrink-0 [&_svg]:text-muted-foreground",
  ],
  {
    variants: {
      /**
       * 크기 — 컨트롤 높이 사다리(`h-ctl-*`). Input 의 같은 이름과 높이·글자가 같다.
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
    },
    defaultVariants: { size: "md", invalid: false },
  },
);
