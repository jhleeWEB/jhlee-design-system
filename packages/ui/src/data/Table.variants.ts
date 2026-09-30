import { cva, type VariantProps } from "../cn";

/* `*.variants.ts` 는 컴포넌트와 분리된 **서버에서도 호출 가능한** 모듈이다 — 지시문·훅·Radix 가 없어야 한다(계획 §2.5-g).
 * `Td` 와 `DataTable` 의 본문 칸이 같은 축을 쓴다. 예전에는 두 파일이 `tone === …` 조건 셋을 따로 들고 있어 톤이 하나 늘면 한쪽만 자랐다. */

/** 표 본문 칸의 변형 — `numeric`(우측 정렬 + mono + tabular-nums) · `tone`(판정색). 패딩은 표마다 달라 여기 두지 않는다. */
export const tableCellVariants = cva("align-middle", {
  variants: {
    /* 원칙 3: 수치는 mono + tabular-nums. 자릿수가 어긋나면 «합계가 맞는가» 를 눈으로 검산할 수 없다. */
    numeric: { true: "text-right tnum", false: "" },
    tone: {
      neutral: "",
      success: "text-success",
      warning: "text-warning",
      destructive: "text-destructive",
    },
  },
  defaultVariants: { numeric: false, tone: "neutral" },
});

/** 표 칸의 판정 톤 — 셀은 «통과 · 주의 · 실패» 만 말하고, 판정이 없으면 `neutral` 이다. */
export type CellTone = NonNullable<VariantProps<typeof tableCellVariants>["tone"]>;
