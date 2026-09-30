/**
 * `@jhleeweb/squircle-design-system/testing` — 소비 레포의 검사에 쓰는 순수 함수(#26).
 * 화면 코드가 아니다 — 컴포넌트·CSS 를 끌어오지 않고 DOM 도 쓰지 않는다. 소비 레포의 `__arch__` 래칫과 Playwright 스펙이 부른다.
 */
export {
  auditCorners,
  countByFile,
  CONCENTRIC_PREFIX,
  DEFAULT_ROUND_SELECTORS,
  type CornerAuditOptions,
  type CornerFinding,
  type CornerRule,
  type CornerSource,
} from "./corner-audit";
export {
  coverageFromRgba,
  fitCorner,
  insideCorner,
  pixelCoverage,
  profileCorner,
  synthesizeCorner,
  CIRCLE_EXPONENT,
  SQUIRCLE_EXPONENT,
  SQUIRCLE_RATIO,
  type CornerFit,
  type CornerProfile,
  type CornerRaster,
  type Rgb,
} from "./corner-profile";
