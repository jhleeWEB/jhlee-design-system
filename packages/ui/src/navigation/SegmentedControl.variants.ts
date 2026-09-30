import { cva } from "../cn";

/* `*.variants.ts` 는 지시문·훅이 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Button.variants.ts 와 같은 이유).
 * 트랙(뿌리)의 `p-0.5`(2px)는 4px 격자 밖이라 린트 기준선에 붙들려 있어 컴포넌트 파일에 남겨 둔다 — 여기로 옮기면 같은 위반이 새 파일의
 * 새 위반이 된다. 칸의 동심원 반경(임의값 calc)도 컴포넌트 파일에 둔다 — corner.spec 이 .tsx 의 임의 반경을 목록으로 붙든다.
 * 칸의 활성 여부는 축이 아니라 상태다(`aria-checked`) — 컴포넌트가 따로 붙인다. */

/** 세그먼트 한 칸의 변형 — `size`. */
export const segmentedControlItemVariants = cva(
  [
    "appearance-none border-0 bg-transparent",
    "cursor-pointer px-3 font-medium transition-colors duration-fast",
    "focus-visible:focus-ring focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-45",
  ],
  {
    variants: {
      size: {
        sm: "h-6 text-label",
        md: "h-7 text-control",
      },
    },
    defaultVariants: { size: "md" },
  },
);
