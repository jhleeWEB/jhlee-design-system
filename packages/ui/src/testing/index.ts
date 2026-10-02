/**
 * `@jhleeweb/jhlee-design-system/testing` — 소비 레포의 검사에 쓰는 순수 함수(#26 → #36).
 * 화면 코드가 아니다 — 컴포넌트·CSS 를 끌어오지 않고 DOM 도 쓰지 않는다. 소비 레포의 `__arch__` 래칫이 부른다.
 * 스쿼클 폐기(#36)와 함께 픽셀 프로파일(`profileCorner` 등)과 원형 예외 목록(`DEFAULT_ROUND_SELECTORS`)은 지웠다.
 */
export {
  auditCorners,
  countByFile,
  CONCENTRIC_PREFIX,
  type CornerFinding,
  type CornerRule,
  type CornerSource,
} from "./corner-audit";
