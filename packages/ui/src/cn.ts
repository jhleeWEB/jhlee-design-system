/* 클래스 합성 — 이 시스템의 유일한 자리(#1198 → #18).
 *
 * `twMerge` 를 **설정 없이** 쓰면 안 된다. `@theme` 이 Tailwind 기본 사다리를 `initial` 로 지우고 자기 이름(`rounded-control` ·
 * `shadow-pop` · `text-body` · `font-semibold`)을 넣었기 때문에, 기본 설정의 twMerge 는 그것들을 모르는 임의 클래스로 보고
 * **충돌을 해소하지 않는다** — 소비자가 `className="rounded-modal"` 로 덮어써도 컴포넌트의 `rounded-control` 이 함께 남아
 * 나중에 선언된 쪽이 이기는, 설명되지 않는 동작이 된다.
 *
 * 사다리는 여기 적지 않는다 — 생성물 `generated/ladders.ts` 의 `LADDERS` 가 정본 JSON 에서 나온다(혼용 규칙 ⑥). 예전에는 같은 목록을
 * 손으로 두 번 적었고(theme.css 와 여기) 둘이 갈리면 증상은 «덮어쓰기가 가끔 안 먹는다» 로 나타나 추적하기 어려웠다. `ladders.spec` 이
 * 이 합성기의 실제 동작(뒤엣것이 이기는가)을 생성물 CSS 의 사다리마다 확인한다.
 */
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

import { LADDERS } from "./generated/ladders";

/* 손 @utility(theme.css)의 이름. Tailwind 네임스페이스가 아니라 twMerge 가 모르고, 모르면 «충돌 없음» 으로 보아 **둘 다 남긴다** —
   실측으로 `cn("h-ctl", "h-auto")` 가 둘을 다 남겼고, 그러면 승자가 생성 CSS 의 소스 순서에 달린다(#1202 의 적대적 검토가 두 건 잡았다).
   h-ctl* · w-ctl* 은 @theme 의 height 사다리 이름이고 w-rail · gap-shell 은 셸 치수다 — ladders.spec 이 theme.css 의 @utility 와 대조한다. */
const HAND_UTILITIES = {
  h: [...LADDERS.height],
  w: [...LADDERS.height, "rail"],
  gap: ["shell"],
} as const;

const twMerge = extendTailwindMerge({
  override: {
    theme: {
      radius: [...LADDERS.radius],
      shadow: [...LADDERS.shadow],
      text: [...LADDERS.text],
      animate: [...LADDERS.animate],
      ease: [...LADDERS.ease],
      tracking: [...LADDERS.tracking],
      "font-weight": [...LADDERS["font-weight"]],
    },
  },
  extend: {
    // container 는 리셋하지 않았다 — Tailwind 의 max-w-xs 같은 기본 이름이 살아 있으므로 override 가 아니라 extend 다.
    theme: { container: [...LADDERS.container] },
    classGroups: {
      h: [{ h: HAND_UTILITIES.h }],
      w: [{ w: HAND_UTILITIES.w }],
      gap: [{ gap: HAND_UTILITIES.gap }],
      // 생성 @utility — z-toast · duration-fast. twMerge 의 z · duration 그룹은 숫자만 알아서 역할 이름을 더한다.
      z: [{ z: [...LADDERS.layer] }],
      duration: [{ duration: [...LADDERS.duration] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export { cva, type VariantProps } from "class-variance-authority";
