/* 간격 규칙의 어휘(계획 §2.5-d) — 루트 eslint.config.js · 소비자 프리셋(./index.ts) · 매니페스트(scripts/build-manifest.ts)가 같은 한 벌을 읽는다(#31).
 * 실측: 이 패키지의 최다 간격은 12px(gap-3)이고 shadcn 자체가 h-9·px-3·gap-1.5 를 쓰므로 8 의 배수만 허용하면 위반이 51% 다 —
 * 4px 기반에 스텝 화이트리스트가 맞다. 간격 계열(p/m/gap/space/inset/top…)에만 걸고 w/h/size 는 치수라 다른 사다리다. */

/** 허용 스텝 — px = 4 × step. 반스텝(1.5)·7·9·11·14… 는 밖이다. */
export const SPACING_STEPS = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24] as const;

/** 간격 계열 유틸리티 접두 — 이 목록 밖(w·h·size·text)은 간격 규칙의 대상이 아니다. */
export const SPACING_UTILITIES = [
  "p", "px", "py", "pt", "pr", "pb", "pl", "ps", "pe",
  "m", "mx", "my", "mt", "mr", "mb", "ml", "ms", "me",
  "gap", "gap-x", "gap-y", "space-x", "space-y",
  "inset", "inset-x", "inset-y", "top", "right", "bottom", "left", "start", "end",
] as const;

/** `no-restricted-classes` 에 넣는 «격자 밖 간격» 패턴 — 변형 접두(`sm:` `hover:`)와 음수를 허용하고 스텝 밖 숫자만 잡는다. */
export function spacingOffGridPattern(): string {
  const utilities = SPACING_UTILITIES.join("|");
  const steps = SPACING_STEPS.join("|");
  return `^(?:[^\\s:]+:)*-?(?:${utilities})-(?!(?:${steps})$)\\d+(?:\\.\\d+)?$`;
}

/** 사람이 읽는 스텝 목록 — 린트 메시지·llms.txt 가 쓴다. */
export function spacingStepsLabel(): string {
  return SPACING_STEPS.join(" ");
}
