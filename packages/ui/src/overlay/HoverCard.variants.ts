/* `*.variants.ts` 는 지시문·훅·Radix 가 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Modal.variants.ts 와 같은 이유).
 *
 * 호버 카드는 Popover 와 **같은 면**이다(카드 바탕 · `rounded-lg` · `shadow-pop` · `onCanvas` 축) — 둘 다 «트리거 옆에 뜨는 크롬 상자» 다.
 * cva 를 새로 쓰지 않고 Popover 의 객체를 이 이름으로 다시 내보낸다: 같은 객체라 두 상자의 면이 따로 자랄 수 없다(#61).
 * 폭만 다르다 — 호버 카드의 트리거는 대개 짧은 링크라 그 폭을 따르면 상자가 글자 몇 개 폭이 된다. 그래서 컴포넌트가 팝오버 상한에 고정한다. */
export { popoverContentVariants as hoverCardVariants } from "./Popover.variants";
