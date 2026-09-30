/* 아이콘 치수의 한 벌(계획 §2.3 «아이콘 단일 출처»).
 *
 * react-icons/lu 의 아이콘은 호출처마다 `size={16} strokeWidth={2}` 를 따로 적어 왔다 — 값이 흩어지면 같은 크롬 안에서 아이콘 굵기가
 * 조금씩 달라진다(jsx-size-number 래칫). 크롬 아이콘은 16px · 획 2 한 가지이고 호출처는 `{...ICON}` 으로 펼친다.
 * 크기를 바꾸는 자리는 클래스(`size-4` · `[&_svg]:size-4`)가 맡는다 — 이 값은 CSS 가 없을 때의 속성 기본값이다. */

/** 크롬 아이콘의 기본 속성 — react-icons 에 펼친다. `aria-hidden` · `focusable` 은 장식 아이콘의 기본이다. */
export const ICON = {
  size: 16,
  strokeWidth: 2,
  "aria-hidden": true,
  focusable: false,
} as const;

/**
 * 손으로 그린 16 뷰박스 아이콘(Card 의 접기 셰브론)의 속성. 획 1.6 은 16px 에서 1.6px 이라 Lu 아이콘(24 뷰박스 · 획 2 → 1.33px)보다
 * 조금 굵다 — Lu 로 바꾸면 접힌 카드 머리의 픽셀이 바뀌므로(VRT 0 조건) 값을 그대로 옮겨 두고 교체는 시각 변경 PR 에 맡긴다.
 */
export const INLINE_ICON = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;
