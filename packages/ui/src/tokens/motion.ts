/*
 * 모션 시간 상수(계획 §2.2 «모션» · §2.6 B1, #15).
 *
 * JS 가 읽는 시간은 여기 한 곳이다. 전에는 Toast(4200 · 240) · ScrollArea(500) · Tooltip(350) 이 각자 숫자를 들고 있어
 * «토스트 퇴장(CSS 180ms)이 큐 유예(JS 240ms) 안에 끝나야 한다» 같은 불변식을 검사할 자리가 없었다 — 값이 두 언어에 흩어져
 * 있으면 한쪽만 고쳐도 아무도 모른다. `motion.spec` 이 이 상수와 CSS(toast.css · theme.css)의 ms 를 대조하고, B3 가
 * 생성물(`generated/tokens.ts`)로 이 파일을 대체할 때 `generated-parity.spec` 이 값의 동일성을 증명한다.
 *
 * 값은 전부 실측이다(2026-09-30): toast.css 의 enter 220ms · exit 180ms, Toast.tsx 의 큐 정리 유예 240ms 와 기본 4200ms,
 * ScrollArea.tsx 의 숨김 지연 500ms 와 theme.css 스크롤바 페이드 200ms, Tooltip.tsx 의 350ms, theme.css 의 접기 200ms.
 */

/** 시간 상수 — 단위는 전부 ms. CSS 쪽 짝은 `motion.spec` 이 대조한다. */
export const MOTION = {
  /** 접기 전환 — theme.css 의 `--motion-collapse-duration`. 카드·아코디언·뷰 패널이 같은 박자를 읽는다. */
  collapseMs: 200,
  /** 토스트 등장 — toast.css `ds-toast-enter`. */
  toastEnterMs: 220,
  /** 토스트 퇴장 — toast.css `ds-toast-exit`. `toastQueueGraceMs` 보다 짧아야 Presence 가 퇴장을 끝낸 뒤 큐에서 빠진다. */
  toastExitMs: 180,
  /** 닫힌 토스트를 큐에서 지우기까지의 유예 — 퇴장 애니메이션이 끝날 시간을 준다. */
  toastQueueGraceMs: 240,
  /** 토스트 자동 닫힘 기본값. `0` 은 호출처에서 `Infinity` 로 바뀐다. */
  toastDefaultMs: 4200,
  /** 스크롤 활동이 멈춘 뒤 스크롤바를 숨기기까지 — Radix `scrollHideDelay` 대신 DS 가 직접 잰다(ScrollArea.tsx 주석). */
  scrollHideDelayMs: 500,
  /** 스크롤바 페이드아웃 — theme.css `.ds-scroll-area-scrollbar` 의 `transition: opacity`. 숨김 지연보다 길 수 없다. */
  scrollFadeMs: 200,
  /** 툴팁 지연 — Radix `delayDuration` 기본값. */
  tooltipDelayMs: 350,
} as const;
