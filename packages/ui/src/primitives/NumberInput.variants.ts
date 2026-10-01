import { cva } from "../cn";

/* `*.variants.ts` 는 지시문·훅·Radix 가 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Input.variants.ts 와 같은 이유, 계획 §2.5-g).
 * 입력 칸 자체는 `inputVariants` 를 그대로 쓴다(Input 위에 지었다). 여기는 증감 버튼만 든다 — 입력과 **같은 높이 사다리**의 정사각이라야
 * 폼 한 줄에서 입력 · 버튼이 한 덩어리로 읽힌다. */

/** 증감 버튼의 변형 — `size`(입력과 같은 높이의 정사각). */
export const numberInputStepperVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer appearance-none items-center justify-center",
    "rounded-md border border-solid border-border-strong bg-muted text-muted-foreground",
    "transition-colors duration-fast hover:border-foreground-2 hover:text-foreground",
    "focus-visible:focus-ring focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      /**
       * 크기 — 입력의 `size` 와 같은 값이다(정사각 버튼).
       * - `sm` — 작은 컨트롤 높이
       * - `md` — 기본 컨트롤 높이
       * - `lg` — 큰 컨트롤 높이
       */
      size: {
        sm: "h-ctl-sm w-ctl-sm",
        md: "h-ctl w-ctl",
        lg: "h-ctl-lg w-ctl-lg",
      },
    },
    defaultVariants: { size: "md" },
  },
);
