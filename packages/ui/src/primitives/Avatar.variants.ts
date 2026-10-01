import { cva } from "../cn";

/* `*.variants.ts` 는 지시문·훅이 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Badge.variants.ts 와 같은 이유). */

/**
 * 아바타의 변형 — `size`. 지름은 4px 격자(`size-6/8/10` = 24/32/40px)이고 이니셜 글자도 함께 커진다.
 * 원형은 `rounded-full` 로만 그린다(모서리 사다리 규칙). 바탕은 중립 면이다 — 사람을 색으로 가르지 않는다(유채색은 판정에만).
 */
export const avatarVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
    "border border-border bg-secondary align-middle font-medium text-foreground-2 select-none",
  ],
  {
    variants: {
      /**
       * 지름.
       * - `sm` — 24px · 표 칸 · 목록의 한 줄
       * - `md` — 32px · 머리줄 · 댓글
       * - `lg` — 40px · 프로필 카드
       */
      size: {
        sm: "size-6 text-micro",
        md: "size-8 text-label",
        lg: "size-10 text-body",
      },
    },
    defaultVariants: { size: "md" },
  },
);

/**
 * 아바타 묶음의 변형 — `size`. 이웃이 서로 겹치도록 음수 간격을 두고, 겹친 자리가 읽히게 각 아바타에 바탕색 고리를 두른다.
 * 겹침 폭은 지름에 비례한다(지름의 1/4 남짓).
 */
export const avatarGroupVariants = cva("inline-flex items-center [&>*]:ring-2 [&>*]:ring-background", {
  variants: {
    /**
     * 묶음 안 아바타의 지름 — `Avatar` 의 같은 이름과 같다.
     * - `sm` — 24px, 4px 겹침
     * - `md` — 32px, 8px 겹침
     * - `lg` — 40px, 8px 겹침
     */
    size: {
      sm: "-space-x-1",
      md: "-space-x-2",
      lg: "-space-x-2",
    },
  },
  defaultVariants: { size: "md" },
});
