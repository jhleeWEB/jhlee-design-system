import { cva, type VariantProps } from "../cn";

/* `*.variants.ts` 는 지시문·훅·Radix 가 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Button.variants.ts 와 같은 이유).
 *
 * 선택 컨트롤(체크박스 · 라디오 · 스위치)의 크기 축(#80). `--spacing` 이 2px 이던 시절(#1199 이전)에 적힌 `size-7`(체크박스 · 라디오 28px,
 * 의도 14px)과 `h-9 w-16`(스위치 36×64px)이 4px 격자로 돌아오며 **두 배로** 남았다 — 폼 한 줄에서 16px 아이콘 옆의 28px 상자가 가장 큰 것이 됐다.
 * 그래서 세 단을 새로 정하고 기본을 md 로 둔다. 켜짐 · 섞임 · 비활성은 축이 아니라 상태다 — Radix 가 찍는 `data-state` · `disabled` 를 읽는다.
 *   체크박스 · 라디오  sm 14 · md 16 · lg 20px 정사각. 체크박스 모서리는 `xs`(4px — 16px 이하 작은 표시, sm 6px 이면 변의 3/4 가 곡선이라
 *                     라디오 원과 구분이 흐려진다), 라디오는 원. 체크 표시는 상자 안을 채워 함께 커지고 라디오 점은 상자의 절반 남짓이다.
 *   스위치            sm 28×16 · md 36×20 · lg 44×24px. 손잡이 = 트랙 높이 − 4(트랙과 같은 색의 2px 테두리가 위아래), 이동 거리 = 트랙 폭 − 손잡이 − 4.
 *                     예전에는 테두리 1 + 여백 `p-px` 1 이었다 — 테두리가 트랙과 같은 색이라 픽셀은 같고, 1px 여백(홀수 치수)만 사라졌다(#82). */

/** 체크박스 · 라디오가 함께 쓰는 상자 — 꺼짐은 입력과 같은 옅은 면 · 강한 테두리, 켜짐 · 섞임은 주색 채움(«지금 고른 것»).
 *  `p-0` — 상자는 Radix 의 `<button>` 이고 preflight 를 싣지 않으므로 UA 의 `padding: 1px 6px` 이 남는다. 28px 상자에서는 넘친 아이콘이
 *  가운데에 그려져 드러나지 않았지만, 16px 상자에서는 안쪽 폭이 2px 이 되어 체크가 점으로 줄었다(#80 실측). */
const box = [
  "peer flex shrink-0 cursor-pointer appearance-none items-center justify-center border border-solid p-0 transition-colors duration-fast",
  "border-border-strong bg-muted",
  "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
  "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
  "focus-visible:focus-ring focus-visible:outline-none",
  "disabled:pointer-events-none disabled:opacity-45",
  // `FieldControl` 이 꽂는 `aria-invalid` 에 파괴색 테두리로 답한다(#47) — 켜진 상태의 채움은 그대로 둔다.
  "aria-invalid:data-[state=unchecked]:border-destructive",
];

/** 체크박스 상자의 변형 — `size`. 모서리는 `rounded-xs`(4px)다. */
export const checkboxVariants = cva([...box, "rounded-xs"], {
  variants: {
    /**
     * 크기 — 정사각 상자의 한 변. 체크 · 섞임 표시는 상자 안을 채워 함께 커진다.
     * - `sm` — 14px · 표 칸 · 촘촘한 목록
     * - `md` — 16px · 폼과 설정 패널(기본) — 크롬 아이콘(16px)과 같은 크기
     * - `lg` — 20px · 터치 화면 · 넓은 선택 카드
     */
    size: { sm: "size-3.5", md: "size-4", lg: "size-5" },
  },
  defaultVariants: { size: "md" },
});

/** 라디오 상자의 변형 — `size`(체크박스와 같은 단). 원형이다. */
export const radioGroupItemVariants = cva([...box, "rounded-full"], {
  variants: {
    /**
     * 크기 — 원의 지름. 고른 점도 함께 커진다.
     * - `sm` — 14px · 표 칸 · 촘촘한 목록
     * - `md` — 16px · 폼과 설정 패널(기본)
     * - `lg` — 20px · 터치 화면 · 넓은 선택 카드
     */
    size: { sm: "size-3.5", md: "size-4", lg: "size-5" },
  },
  defaultVariants: { size: "md" },
});

/** 라디오의 고른 점 — 상자 `size` 를 이어받는다(6 · 8 · 10px, 상자의 절반 남짓). 지름이 짝수 px 이라 안쪽 폭(12 · 14 · 18)의 가운데에 반 픽셀 없이 앉는다. */
export const radioIndicatorVariants = cva("block rounded-full bg-current", {
  variants: {
    size: { sm: "size-1.5", md: "size-2", lg: "size-2.5" },
  },
  defaultVariants: { size: "md" },
});

/** 스위치 트랙의 변형 — `size`. 꺼짐은 강한 테두리색 트랙, 켜짐은 주색 트랙이다. */
export const switchVariants = cva(
  [
    "peer inline-flex shrink-0 cursor-pointer appearance-none items-center rounded-full border-2 border-solid border-border-strong bg-border-strong p-0",
    "transition-colors duration-fast motion-reduce:transition-none",
    "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
    "focus-visible:focus-ring focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-45",
  ],
  {
    variants: {
      /**
       * 크기 — 트랙의 폭 × 높이. 손잡이는 트랙 높이 − 4px 이다.
       * - `sm` — 28 × 16px · 표 칸 · 촘촘한 목록
       * - `md` — 36 × 20px · 폼과 설정 패널(기본)
       * - `lg` — 44 × 24px · 터치 화면 · 넓은 설정 카드
       */
      size: { sm: "h-4 w-7", md: "h-5 w-9", lg: "h-6 w-11" },
    },
    defaultVariants: { size: "md" },
  },
);

/** 스위치 손잡이 — 트랙 `size` 를 이어받는다. 켜지면 «트랙 폭 − 손잡이 − 4px» 만큼 오른쪽으로 간다(sm 12 · md 16 · lg 20px). */
export const switchThumbVariants = cva(
  [
    "pointer-events-none block rounded-full bg-card shadow-chip",
    "transition-transform duration-fast motion-reduce:transition-none",
  ],
  {
    variants: {
      size: {
        sm: "size-3 data-[state=checked]:translate-x-3",
        md: "size-4 data-[state=checked]:translate-x-4",
        lg: "size-5 data-[state=checked]:translate-x-5",
      },
    },
    defaultVariants: { size: "md" },
  },
);

/** 선택 컨트롤의 크기 — 체크박스 · 라디오 · 스위치가 같은 세 단을 쓴다. */
export type ChoiceSize = NonNullable<VariantProps<typeof checkboxVariants>["size"]>;
