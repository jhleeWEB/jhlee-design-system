import { cva } from "../cn";

/* `*.variants.ts` 는 지시문·훅·Radix 가 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Table.variants.ts 와 같은 이유).
 *
 * 칸 사이 1px 선은 **틈(`gap-px`)으로** 그린다 — 묶음 바탕이 테두리색이고 칸이 카드 바탕이라 틈이 곧 선이다. `divide-x` 는 줄바꿈(flex-wrap)된
 * 두 번째 줄의 첫 칸에도 왼쪽 선을 그어 선이 겹친다(옛 Hud 의 같은 기법, legacy shell.css `.hud`).
 * 값 글자 크기는 묶음의 `data-size` 를 칸이 그룹 선택자로 읽는다 — 컨텍스트를 쓰지 않으니 Readout 은 서버에서도 렌더된다. */

/** 수치 묶음의 변형 — `size` · `variant`. */
export const readoutVariants = cva(
  "group/readout m-0 flex min-w-0 flex-wrap gap-px overflow-hidden rounded-lg border border-border bg-border",
  {
    variants: {
      /**
       * 크기 — 값 글자의 크기.
       * - `sm` — 제목 크기의 값. 패널 안의 작은 묶음
       * - `md` — 판독(readout) 크기의 큰 값. 캔버스 위 실시간 지표
       */
      size: { sm: "", md: "" },
      /**
       * 놓임.
       * - `inline` — 패널 · 카드 안에 그림자 없이 선다
       * - `floating` — 캔버스 위에 뜬다 — 부유 레이어의 그림자(`shadow-pop`)
       */
      variant: { inline: "", floating: "shadow-pop" },
    },
    defaultVariants: { size: "md", variant: "inline" },
  },
);

/** 칸 값의 변형 — `tone` · `kind`. 판정색은 값 글자에만 입힌다(원칙 2) — 라벨 · 단위 · `status` 글자가 색 없이도 뜻을 말한다. */
export const readoutValueVariants = cva("m-0 flex min-w-0 flex-col gap-1 font-medium", {
  variants: {
    /**
     * 칸의 종류 — 값 자리에 무엇이 서는가.
     * - `value` — 수치. mono + tabular-nums 의 큰 글자
     * - `status` — 상태를 말하는 글자("Contacts checked"). sans 본문 글자 + 톤 점 — 옆 칸의 수치와 다른 종류로 읽힌다
     */
    kind: {
      value: "tnum text-readout group-data-[size=sm]/readout:text-title",
      status: "font-sans text-body",
    },
    /**
     * 판정 톤 — 값 글자의 색.
     * - `neutral` — 판정 없음(기본 글자색)
     * - `primary` — 지금 고른 것 · 주된 것
     * - `success` — 통과
     * - `warning` — 주의
     * - `destructive` — 실패
     * - `info` — 안내
     */
    tone: {
      neutral: "text-foreground",
      primary: "text-primary",
      success: "text-success",
      warning: "text-warning",
      destructive: "text-destructive",
      info: "text-info",
    },
  },
  defaultVariants: { tone: "neutral", kind: "value" },
});
