import { cva } from "../cn";

/* 서버에서도 호출 가능한 변형 모듈(Button.variants.ts 와 같은 이유). 축은 `size` 하나 — 높이만 바뀌고 글자와 간격은 그대로다.
 * 높이는 토큰(--size-topbar-*)이다: md 56px 은 옛 3열 셸의 --topbar-h, sm 44px 은 컨트롤 lg 와 같은 높이(#60). */

/** 상단바의 변형 — `size`(높이). */
export const topBarVariants = cva(
  "flex w-full min-w-0 shrink-0 items-center gap-3 border-b border-border bg-card px-4 font-sans text-foreground",
  {
    variants: {
      size: {
        sm: "h-(--size-topbar-sm)",
        md: "h-(--size-topbar-md)",
      },
    },
    defaultVariants: { size: "md" },
  },
);
