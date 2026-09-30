import { cva } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/** 모달 내용 상자의 변형 — `size`. */
export const modalVariants = cva(
  [
    "fixed left-1/2 top-1/2 z-modal -translate-x-1/2 -translate-y-1/2",
    "flex max-h-dialog-fluid flex-col overflow-hidden",
    "rounded-xl border border-border bg-card shadow-modal",
    "text-body text-foreground animate-in-pop",
    "focus-visible:outline-none",
  ],
  {
    variants: {
      size: {
        /* 유동 폭(뷰포트 − 여백) + 상한(--container-dialog-*) = 옛 `w-[min(폭,calc(100vw-24px))]` 와 같은 결과다(#22).
           확인 대화 — 문장 하나와 버튼 둘. 이 저장소의 `.confirm` 이 380px 였다. */
        sm: "w-dialog-fluid max-w-dialog-sm",
        md: "w-dialog-fluid max-w-dialog-md",
        /* 설정 — `.setup` 이 1240px 였다. */
        lg: "w-dialog-fluid max-w-dialog-lg",
        /* 갤러리처럼 화면을 거의 채우는 것. `.gallery` 가 1180px 였다. */
        xl: "w-dialog-fluid max-w-dialog-xl",
        full: "h-dialog-fluid w-dialog-fluid",
      },
    },
    defaultVariants: { size: "md" },
  },
);
