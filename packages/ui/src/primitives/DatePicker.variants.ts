import { cva } from "../cn";

/* `*.variants.ts` 는 지시문·훅이 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Select.variants.ts 와 같은 이유). */

/**
 * 날짜 고르기 트리거의 변형 — `size` · `invalid`. 높이 · 바탕 · 테두리를 `inputVariants` · `selectTriggerVariants` 와 **같은 사다리**로 맞춘다:
 * 폼 한 줄에 Input · Select · DatePicker 가 나란히 서면 한 벌로 읽혀야 한다. `aria-invalid` 에도 반응한다(`FieldControl` 이 ARIA 로 꽂는다, #47).
 * 고른 날은 `tnum`(원칙 3), 자리표시는 흐린 글자다(`data-placeholder`).
 */
export const datePickerTriggerVariants = cva(
  [
    "flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 border bg-muted text-left text-foreground",
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
       * 크기 — 컨트롤 높이 사다리(`h-ctl-*`). Input · Select 의 같은 이름과 높이 · 글자가 같다(값 글자는 세 단 모두 `text-control`, #80).
       * - `sm` — 작은 컨트롤 높이
       * - `md` — 기본 컨트롤 높이
       * - `lg` — 큰 컨트롤 높이 · 넓은 가로 여백
       */
      size: {
        sm: "h-ctl-sm px-3 text-control",
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
