/* `*.variants.ts` 는 지시문·훅·Radix 가 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Select.variants.ts 와 같은 이유).
 *
 * Combobox 트리거는 Select 트리거와 **같은 사다리**다(size sm/md/lg · invalid · aria-invalid · data-placeholder) — 폼 한 줄에 Select · Combobox ·
 * Input 이 나란히 서면 높이·바탕·테두리가 같아야 한 벌로 읽힌다. cva 를 새로 쓰지 않고 Select 의 객체를 이 이름으로 다시 내보낸다:
 * 같은 객체라 두 트리거가 따로 자랄 수 없다(#61). 목록 상자의 면은 Popover(`popoverContentVariants`), 항목은 Command 의 것이다. */
export { selectTriggerVariants as comboboxTriggerVariants } from "./Select.variants";
