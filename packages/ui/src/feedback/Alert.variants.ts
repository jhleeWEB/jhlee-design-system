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
 *  - `neutral` 은 판정이 아닌 **상주 안내문**(출처 띠 · 늘 떠 있는 설명)이다 — 유채색은 판정에만 쓰므로 물들이지 않는다: 카드 면 · 기본 테두리 ·
 *    `foreground-2` 글자(토스트 · 배지의 neutral 과 같은 무채색 문법, #105).
 *  - 모서리도 토스트와 같은 `rounded-lg`(면, #80 역할 표) — 예전 `rounded-md`(컨트롤의 단)는 같은 면을 다른 반경으로 그렸다.
 */
export const alertVariants = cva(
  /* font-sans 를 스스로 든다 — Toast · Button 과 같은 이유: font-sans 밖(body 의 대체 글꼴 스택)에 놓이면 같은 13px 가 한 단 굵어 보였다.
     #80 에서 body 도 같은 스택이 되어 지금은 겹치지만, 소비 앱이 body 글꼴을 따로 정해도 이 면은 UI 글꼴로 서게 남겨 둔다.
     줄 높이는 text-body 의 20px 그대로다 — 예전 leading-relaxed(13 × 1.625 = 21.1px)는 첫 줄이 아이콘 칸(h-5, 20px)보다 1px 남짓 커서
     아이콘이 반 픽셀 위로 떴다(#82). */
  "flex max-w-full min-w-0 gap-3 rounded-lg border border-solid p-4 font-sans text-body",
  {
    variants: {
      tone: {
        neutral: "border-border bg-card text-foreground-2",
        info: "border-info/25 bg-info-soft text-info",
        success: "border-success/25 bg-success-soft text-success",
        warning: "border-warning/25 bg-warning-soft text-warning",
        destructive: "border-destructive/25 bg-destructive-soft text-destructive",
      },
    },
    defaultVariants: { tone: "info" },
  },
);

/** 알림이 받는 톤 — 안내가 기본이다. `neutral` 은 판정 없는 상주 안내문, 주된 것(`primary`)은 없다. */
export type AlertTone = NonNullable<VariantProps<typeof alertVariants>["tone"]>;
