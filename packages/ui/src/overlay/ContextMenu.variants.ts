/* `*.variants.ts` 는 지시문·훅·Radix 가 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Modal.variants.ts 와 같은 이유).
 *
 * 우클릭 메뉴는 DropdownMenu 와 **같은 면 · 같은 항목**이다 — 여는 방법(우클릭 · 길게 누르기 vs 버튼)만 다르다. 그래서 cva 를 새로 쓰지 않고
 * DropdownMenu 의 객체를 이 이름으로 다시 내보낸다: 같은 객체라 두 메뉴의 면·항목이 따로 자랄 수 없다(#61). */
export {
  dropdownMenuContentVariants as contextMenuContentVariants,
  dropdownMenuItemVariants as contextMenuItemVariants,
} from "./DropdownMenu.variants";
