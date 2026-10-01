import { cva } from "../cn";

/* `*.variants.ts` 는 지시문·훅·Radix 가 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Modal.variants.ts 와 같은 이유).
 * 항목의 변형은 여기 없다 — CommandItem 은 DropdownMenu 항목의 cva(`dropdownMenuItemVariants` — `tone`, `data-highlighted` 면)를 그대로 부른다.
 * 명령 목록과 메뉴는 «하나를 실행한다» 는 같은 일이라 같은 줄로 보여야 한다(#61). */

/**
 * 명령 상자의 변형 — `surface`. 안의 입력 · 목록 · 항목은 같고 바깥 면만 고른다.
 * `CommandDialog` · `ComboboxContent` 안에서는 감싼 상자가 이미 면이라 기본값이 `plain` 으로 바뀐다.
 */
export const commandVariants = cva("flex min-w-0 flex-col overflow-hidden text-body text-foreground", {
  variants: {
    /**
     * 바깥 면.
     * - `card` — 카드 바탕 · 테두리 · `rounded-lg`. 페이지 안에 놓인 명령 목록(설정 검색 · 빠른 이동 패널)
     * - `plain` — 바탕 · 테두리 없음. 이미 면이 있는 상자(대화상자 · 팝오버) 안
     */
    surface: {
      card: "rounded-lg border border-border bg-card",
      plain: "bg-transparent",
    },
  },
  defaultVariants: { surface: "card" },
});
