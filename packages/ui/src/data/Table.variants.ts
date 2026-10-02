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

/**
 * 머리 칸(`Th`)의 변형 — `variant`(열 머리의 메타 라벨 · 줄 머리의 본문 글자) · `numeric`(우측 정렬).
 * 열 머리는 «무엇을 재는가» 를 말하는 메타 라벨이라 mono 대문자이고, 줄 머리는 «무엇의 줄인가» 를 말하는 이름이라 본문 글자다(#108).
 */
export const tableHeadVariants = cva("px-4 py-3 text-left", {
  variants: {
    /**
     * 글자 역할.
     * - `label` — 메타 라벨(mono 대문자 · 흐린 글자 · 아래 구분선). 열 머리의 기본
     * - `text` — 본문 글자(`text-body font-medium`). `scope="row"` 인 줄 머리에 쓴다 — 아래 구분선은 줄(`Tr`)이 긋는다
     */
    variant: {
      label:
        "border-b border-border align-bottom font-mono text-micro font-medium tracking-caps text-muted-foreground uppercase",
      text: "align-middle text-body font-medium text-foreground",
    },
    /** 수치 열의 머리 — 본문 칸(`Td numeric`)과 같은 우측 정렬. */
    numeric: { true: "text-right", false: "" },
  },
  defaultVariants: { variant: "label", numeric: false },
});

/**
 * 표 캡션(`TableCaption`)의 변형 — `side`(표의 위 · 아래) · `visuallyHidden`(스크린리더만).
 * 보이는 캡션의 글자는 `DataTable` 의 `captionVisible` 과 같다(`text-label`, 흐린 글자) — 두 표가 한 화면에 서도 제목이 같은 모양이다.
 */
export const tableCaptionVariants = cva("", {
  variants: {
    /**
     * 캡션이 서는 쪽.
     * - `top` — 표 위. 기본
     * - `bottom` — 표 아래(출처 · 주석)
     */
    side: { top: "caption-top", bottom: "caption-bottom" },
    /** 화면에서 숨기고 스크린리더만 읽는다 — 표의 이름은 남는다. */
    visuallyHidden: {
      true: "sr-only",
      false: "px-4 text-left text-label text-muted-foreground",
    },
  },
  compoundVariants: [
    // 보이는 캡션만 표와의 사이를 띄운다 — 숨긴 캡션(sr-only)에 패딩을 주면 1px 상자가 다시 넓어진다.
    { side: "top", visuallyHidden: false, class: "pb-2" },
    { side: "bottom", visuallyHidden: false, class: "pt-2" },
  ],
  defaultVariants: { side: "top", visuallyHidden: false },
});
