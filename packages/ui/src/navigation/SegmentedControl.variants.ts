import { cva } from "../cn";

/* `*.variants.ts` 는 지시문·훅이 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Button.variants.ts 와 같은 이유).
 * 칸의 활성 여부는 축이 아니라 상태다(`aria-checked`) — 컴포넌트가 따로 붙인다. 칸의 동심원 반경(임의값 calc)은 컴포넌트 파일에 둔다 —
 * corner.spec 이 소스의 임의 반경을 목록으로 붙든다.
 *
 * 트랙은 컨트롤이다(#80) — 모서리는 버튼 · 입력과 같은 `rounded-md` 이고, 칸 높이(sm 22 · md 28px) + 여백 `p-1` 이 컨트롤 높이(30 · 36px)다.
 * 예전 트랙은 `p-0.5`(2px, 4px 격자 밖) 위에 칸 24 · 28px 이라 28 · 32px 로 서서 같은 줄의 버튼보다 낮았고, Tabs · ToggleGroup 의 트랙
 * (36px · `rounded-lg`)과도 모양이 갈렸다. 이제 세 트랙이 같다. */

/** 세그먼트 트랙 — 옅은 파란 바닥 · `rounded-md` · 여백 `p-1`. 높이는 칸이 정한다. */
export const segmentedControlVariants = cva(
  "inline-flex shrink-0 items-center rounded-md bg-primary-track p-1",
);

/** 세그먼트 한 칸의 변형 — `size`. 굵기는 컨트롤 글자(medium)이고 크기는 칸 높이를 따른다 — md 28px 칸은 `text-control`, sm 22px 칸은 `text-label`
 *  (13.5px 글자가 22px 칸을 꽉 채워 위아래 여백이 1.5px 로 줄었다, #80 실측 — ToggleGroup 의 segmented sm 과 같다). 짝수 사다리(#82)에서도
 *  같다: text-control(14/20)이면 위아래 1px, text-label(12/16)이면 3px 가 남는다. */
export const segmentedControlItemVariants = cva(
  [
    "appearance-none border-0 bg-transparent",
    "cursor-pointer font-medium transition-colors duration-fast",
    "focus-visible:focus-ring focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-45",
  ],
  {
    variants: {
      size: {
        sm: "h-5.5 px-2 text-label",
        md: "h-7 px-3 text-control",
      },
    },
    defaultVariants: { size: "md" },
  },
);
