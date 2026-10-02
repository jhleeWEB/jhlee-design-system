import { cva, type VariantProps } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/**
 * 토스트의 변형 — `tone` 이 면 · 테두리 · 글자를 한 톤으로 옅게 물들인다(#76).
 * 예전의 왼쪽 띠(`border-l-3`)는 걷었다 — 카드에 색 막대를 붙인 모양은 낡아 보였고(사용자 피드백), 띠 하나가 판정을 혼자 말해
 * 색을 못 읽는 사람에게는 신호가 사라졌다. 이제 판정은 톤 아이콘(Toast.tsx 의 TONE_ICON)과 제목 글자가 함께 말한다.
 *  - 면은 `{tone}-soft`, 글자는 `{tone}` — 이 쌍은 contrast.spec 이 라이트 · 다크 모두 4.5:1 을 지킨다.
 *  - 테두리는 `{tone}` 의 25% — 면 위에서 한 단 진한 테두리만 남는다. Alert · Badge 의 `{tone}-line`(면 위 3:1)보다 옅은 이유는
 *    토스트가 `shadow-pop` 으로 떠 있어 경계를 그림자가 이미 말하기 때문이다(WCAG 1.4.11 의 «식별에 필요한 경계» 가 아니다).
 *  - `overflow-hidden` 은 하단 진행 막대가 둥근 모서리 밖으로 비치지 않게 한다.
 */
export const toastVariants = cva(
  [
    "ds-toast group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden",
    /* font-sans 를 스스로 든다 — 뷰포트는 대개 앱 루트(AppShell 바깥)에 있어 body 의 대체 글꼴 스택(Noto Sans KR …)을 물려받아
       같은 13px 가 한 단 굵어 보였다(#76 실측). Button 도 같은 이유로 글꼴을 든다. #80 에서 body 도 같은 스택(--font-stack-sans)이 되어
       지금은 겹치지만 남겨 둔다 — 소비 앱이 body 글꼴을 따로 정해도 이 면은 UI 글꼴로 선다. */
    "rounded-lg border border-solid p-4 font-sans text-body shadow-pop",
  ],
  {
    variants: {
      tone: {
        neutral: "border-border bg-card text-foreground",
        success: "border-success/25 bg-success-soft text-success",
        warning: "border-warning/25 bg-warning-soft text-warning",
        destructive: "border-destructive/25 bg-destructive-soft text-destructive",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

/** 토스트 보조 문장의 변형 — neutral 은 한 단 옅은 회색, 판정 톤은 제목과 같은 톤 글자(옅은 면 위 4.5:1)다.
 *  줄 높이는 뿌리의 text-body(14/20px)를 물려받는다 — 비율 leading-relaxed 는 소수 px 줄을 내서 걷었다(#82). */
export const toastDescriptionVariants = cva("m-0 mt-1", {
  variants: {
    tone: {
      neutral: "text-muted-foreground",
      success: "text-current",
      warning: "text-current",
      destructive: "text-current",
    },
  },
  defaultVariants: { tone: "neutral" },
});

/** 토스트 뷰포트(쌓이는 자리)의 변형 — `position` 이 화면의 어느 모서리에 붙을지 고른다. */
export const toastViewportVariants = cva(
  "pointer-events-none fixed z-toast m-0 flex max-h-screen w-(--size-toast) max-w-screen list-none flex-col gap-3 p-4 outline-none",
  {
    variants: {
      position: {
        "bottom-right": "right-0 bottom-0 items-end",
        "bottom-center": "bottom-0 left-1/2 -translate-x-1/2 items-center",
        "top-right": "top-0 right-0 items-end",
        "top-center": "top-0 left-1/2 -translate-x-1/2 items-center",
      },
    },
    defaultVariants: { position: "bottom-right" },
  },
);

/** 토스트 뷰포트의 위치. */
export type ToastPosition = NonNullable<VariantProps<typeof toastViewportVariants>["position"]>;

/** 토스트가 받는 톤. */
export type ToastTone = NonNullable<VariantProps<typeof toastVariants>["tone"]>;
