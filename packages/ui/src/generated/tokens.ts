/* 생성물 — 손으로 고치지 않는다.
 * 정본: packages/ui/tokens/ 의 DTCG JSON → tokens/build.mjs · 재생성 `pnpm tokens:build` · 최신성 `pnpm tokens:check` (#15) */

/** 시간 상수(ms) — tokens/**.json 의 duration 가운데 `$extensions.sds.ts` 가 붙은 것. CSS 쪽 짝은 같은 토큰에서 나온다. */
export const MOTION = {
  /** motion.collapse.duration — 200ms */
  collapseMs: 200,
  /** scroll.hide-delay — 500ms */
  scrollHideDelayMs: 500,
  /** scroll.fade — 200ms */
  scrollFadeMs: 200,
  /** toast.enter — 220ms */
  toastEnterMs: 220,
  /** toast.exit — 180ms */
  toastExitMs: 180,
  /** toast.queue-grace — 240ms */
  toastQueueGraceMs: 240,
  /** toast.default — 4200ms */
  toastDefaultMs: 4200,
  /** tooltip.delay — 350ms */
  tooltipDelayMs: 350,
} as const;
