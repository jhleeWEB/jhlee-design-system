/* 클래스 합성 — 이 시스템의 유일한 자리(#1198).
 *
 * `twMerge` 를 **설정 없이** 쓰면 안 된다. `theme.css` 가 Tailwind 기본 사다리를 `initial` 로
 * 지우고 자기 이름(`rounded-control` · `shadow-pop` · `text-body`)을 넣었기 때문에, 기본 설정의
 * twMerge 는 그것들을 모르는 임의 클래스로 보고 **충돌을 해소하지 않는다** — 소비자가
 * `className="rounded-modal"` 로 덮어써도 컴포넌트의 `rounded-control` 이 함께 남아 나중에
 * 선언된 쪽이 이기는, 설명되지 않는 동작이 된다. 그래서 사다리를 여기 한 번 더 적는다.
 *
 * `theme.css` 의 사다리를 고치면 **이 파일도 함께 고친다.** 둘이 갈리면 증상은 «덮어쓰기가
 * 가끔 안 먹는다» 로 나타나 추적하기 어렵다.
 */
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  override: {
    theme: {
      radius: ["none", "chip", "control", "card", "float", "modal", "full"],
      shadow: ["none", "chip", "card", "pop", "modal"],
      text: ["micro", "label", "body", "control", "title", "readout", "display"],
      animate: ["in-pop", "in-fade", "in-rise", "shimmer"],
      ease: ["out-quick"],
    },
  },
  extend: {
    /* `theme.css` 가 `@utility` 로 손수 낸 것들. **Tailwind 네임스페이스가 아니라서**
       twMerge 가 모르고, 모르면 «충돌 없음» 으로 보아 **둘 다 남긴다**.
       실측으로 `cn("h-ctl", "h-auto")` 가 둘을 다 남겼고, 그러면 승자가 생성 CSS 의 소스
       순서에 달린다 — 호출처가 `h-auto` 로 높이를 풀려 해도 안 풀리는 조용한 실패다.
       (#1202 의 적대적 검토가 실제로 이 모양을 두 건 잡았다.) */
    classGroups: {
      h: [{ h: ["ctl", "ctl-sm", "ctl-lg"] }],
      w: [{ w: ["ctl", "ctl-sm", "ctl-lg", "rail"] }],
      gap: [{ gap: ["shell"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export { cva, type VariantProps } from "class-variance-authority";
