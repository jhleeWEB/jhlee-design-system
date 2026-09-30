import { cva } from "../cn";

/* `*.variants.ts` 는 지시문·훅이 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Input.variants.ts 와 같은 이유). */

/**
 * 필드 뿌리의 변형 — `orientation`. 라벨이 컨트롤 위에 서는가(입력 · 선택), 옆에 서는가(체크박스 · 스위치)를 고른다.
 * 가로 배치에서 설명·오류는 줄을 바꿔 한 줄을 다 쓴다 — 짧은 컨트롤 옆에 긴 문장이 끼면 라벨이 밀려난다.
 */
export const fieldVariants = cva("flex min-w-0", {
  variants: {
    /**
     * 배치 방향.
     * - `vertical` — 라벨 · 컨트롤 · 설명 · 오류를 위에서 아래로 쌓는다(입력 · 선택)
     * - `horizontal` — 컨트롤과 라벨을 한 줄에, 설명 · 오류는 다음 줄에 둔다(체크박스 · 스위치)
     */
    orientation: {
      vertical: "flex-col gap-2",
      horizontal: [
        "flex-row flex-wrap items-center gap-x-3 gap-y-1",
        "[&>[data-slot=field-description]]:basis-full [&>[data-slot=field-error]]:basis-full",
      ],
    },
  },
  defaultVariants: { orientation: "vertical" },
});
