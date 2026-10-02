/* 생성물 — 손으로 고치지 않는다.
 * 정본: packages/ui/tokens/ 의 DTCG JSON → tokens/build.mjs · 재생성 `pnpm tokens:build` · 최신성 `pnpm tokens:check` (#15) */

/** 시간 상수(ms) — tokens/**.json 의 duration 가운데 `$extensions.jds.ts` 가 붙은 것. CSS 쪽 짝(--duration-*)은 같은 토큰에서 나온다. */
export const MOTION = {
  /** duration.instant — 0ms */
  instantMs: 0,
  /** duration.fast — 100ms */
  fastMs: 100,
  /** duration.base — 150ms */
  baseMs: 150,
  /** duration.slow — 200ms */
  slowMs: 200,
  /** duration.collapse — 200ms */
  collapseMs: 200,
  /** duration.scrollbar.hide-delay — 500ms */
  scrollHideDelayMs: 500,
  /** duration.scrollbar.fade — 200ms */
  scrollFadeMs: 200,
  /** duration.toast.enter — 220ms */
  toastEnterMs: 220,
  /** duration.toast.exit — 180ms */
  toastExitMs: 180,
  /** duration.toast.queue-grace — 240ms */
  toastQueueGraceMs: 240,
  /** duration.toast.default — 4200ms */
  toastDefaultMs: 4200,
  /** duration.tooltip.delay — 350ms */
  tooltipDelayMs: 350,
} as const;
