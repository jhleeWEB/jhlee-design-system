import { cva, type VariantProps } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 컴포넌트 파일은 `"use client"` 라
 * 거기서 export 한 cva 는 Next App Router 의 서버 컴포넌트가 className 을 얻으려 부를 수 없었다(계획 §2.5-g, #10).
 * 이 파일에는 지시문·훅·Radix 가 없어야 한다. */

/**
 * 알림 상자의 변형 — Toast(#76)와 같은 문법이다: `tone` 이 면 · 테두리 · 글자를 한 톤으로 옅게 물들인다(#78).
 * 예전의 왼쪽 띠(`border-l-3`)는 걷었다 — 토스트와 함께 «낡아 보인다» 는 피드백을 받았고, 판정은 톤 아이콘(Alert.tsx 의 TONE_ICON)과
 * 제목 글자가 함께 말한다(색만으로 말하지 않는다).
 *  - 면 `{tone}-soft` · 글자 `{tone}`(제목 · 본문) — 이 쌍은 contrast.spec 이 라이트 · 다크 모두 4.5:1 을 지킨다(info 포함).
 *  - 테두리는 `{tone}` 의 25% — 토스트와 같은 값. 경계는 면의 색이 이미 말하고, 3:1 선(`{tone}-line`)은 흐름 안에서 상자를 무겁게 했다.
 *  - 여백 · 간격(p-4 · gap-3)도 토스트와 같다 — 같은 알림 어휘가 떠 있느냐(토스트) 흐름 안이냐(이것)만 다르다.
 */
export const alertVariants = cva(
  /* font-sans 를 스스로 든다 — Toast · Button 과 같은 이유: font-sans 밖(body 의 대체 글꼴 스택)에 놓이면 같은 13px 가 한 단 굵어 보였다. */
  "flex max-w-full min-w-0 gap-3 rounded-md border border-solid p-4 font-sans text-body leading-relaxed",
  {
    variants: {
      tone: {
        info: "border-info/25 bg-info-soft text-info",
        success: "border-success/25 bg-success-soft text-success",
        warning: "border-warning/25 bg-warning-soft text-warning",
        destructive: "border-destructive/25 bg-destructive-soft text-destructive",
      },
    },
    defaultVariants: { tone: "info" },
  },
);

/** 알림이 받는 톤 — 안내가 기본이고 중립·주된 것은 없다(흐름 안의 알림은 언제나 «무슨 일» 이다). */
export type AlertTone = NonNullable<VariantProps<typeof alertVariants>["tone"]>;
