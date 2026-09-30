/* 생성물 — 손으로 고치지 않는다.
 * 정본: packages/ui/tokens/ 의 DTCG JSON → tokens/build.mjs · 재생성 `pnpm tokens:build` · 최신성 `pnpm tokens:check` (#15) */

/** 역할 이름 사다리 — 네임스페이스별, 정본 순. @theme 의 것(rounded-* · text-* · font-* …)과 생성 @utility 의 것(layer → z-* · duration → duration-*). twMerge(cn.ts)가 충돌을 해소하려면 이 이름들을 알아야 한다. */
export const LADDERS = {
  "ease": ["out-quick"],
  "animate": ["in-pop", "in-fade", "in-rise", "shimmer"],
  "duration": ["instant", "fast", "base", "slow"],
  "text": ["micro", "label", "body", "control", "title", "readout", "display"],
  "tracking": ["tight", "caps"],
  "font-weight": ["normal", "medium", "semibold", "bold"],
  "radius": ["none", "chip", "control", "card", "float", "modal", "full"],
  "shadow": ["none", "chip", "card", "pop", "modal"],
  "layer": ["raised", "sticky", "scrim", "modal", "popover", "toast", "tooltip"],
  "height": ["ctl-sm", "ctl", "ctl-lg"],
  "container": ["dialog-sm", "dialog-md", "dialog-lg", "dialog-xl", "drawer-sm", "drawer-md", "drawer-lg", "menu", "popover-min", "popover-max"],
} as const;
