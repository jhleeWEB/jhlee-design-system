"use client";
import { Tooltip as Radix } from "radix-ui";

import { cn } from "../cn";
import { MOTION } from "../generated/tokens";

/* 툴팁 — **면을 뒤집는다**(밝은 UI 위의 어두운 팝). 「일시적이고 내 것이 아니다」를 그것이 말한다.
 * shipped 캔버스 툴들이 공통으로 쓰는 관행이라 토큰(`--chrome-tooltip-*`)으로 못 박아 뒀다.
 *
 * 툴팁에는 **조작이 들어가지 않는다.** 버튼·링크가 필요하면 `Popover` 다 — 툴팁은 포커스를
 * 받지 않으므로 그 안의 것을 키보드로 누를 수 없다. */

/** 툴팁 지연을 공유하는 공급자 — 앱(또는 툴바) 루트에 한 번 둔다. 자기 DOM 은 없다(Radix `Tooltip.Provider`). */
export const TooltipProvider = Radix.Provider;

/**
 * 툴팁의 props — 말풍선(`Tooltip.Content`)의 속성을 그대로 받는다: `className` · `ref` · `data-*` · `aria-*` 는 말풍선에 닿는다.
 * 트리거는 `children` 이고 말풍선의 내용은 `label` 이다.
 */
export interface TooltipProps extends Omit<
  React.ComponentPropsWithRef<typeof Radix.Content>,
  "children" | "content" | "asChild" | "forceMount"
> {
  /** 띄울 대상. 포커스 가능한 요소여야 키보드에서도 보인다. */
  children: React.ReactNode;
  /** 말풍선의 글 — 짧은 명사구. 조작(버튼·링크)은 넣지 않는다. */
  label: React.ReactNode;
  /* `| undefined` 를 명시한다 — `exactOptionalPropertyTypes` 아래에서는 «생략 가능» 과
     «undefined 를 넘겨도 된다» 가 다른 뜻이고, 이 넷은 호출처가 조건부로 넘기는 자리다. */
  /**
   * 오른쪽에 흐리게 붙는 단축키 — "Zoom to fit" + "⇧2".
   * @default undefined
   */
  shortcut?: string | undefined;
  /**
   * 포인터를 올린 뒤 뜨기까지의 지연(ms) — 모션 토큰 `--duration-tooltip-delay`(350ms).
   * @default MOTION.tooltipDelayMs
   */
  delayDuration?: number | undefined;
  /**
   * 제어 모드의 열림 — 생략하면 포인터·포커스가 연다(비제어).
   * @default undefined
   */
  open?: boolean | undefined;
  /**
   * 열림이 바뀔 때.
   * @default undefined
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
}

/**
 * 툴팁 — 트리거(`children`) 위에 말풍선(`label`)을 띄운다. `className` · `ref` · 나머지 속성은 말풍선에 닿는다.
 * @slot tooltip
 */
export function Tooltip({
  children,
  label,
  shortcut,
  side = "top",
  align = "center",
  sideOffset = 6,
  delayDuration = MOTION.tooltipDelayMs,
  open,
  onOpenChange,
  className,
  ...rest
}: TooltipProps) {
  return (
    <Radix.Root
      delayDuration={delayDuration}
      /* Radix 쪽도 필수 시그니처다 — 제어/비제어를 가르는 prop 이라 «없음» 은 생략이어야 한다.
         `undefined` 를 넘기면 제어 컴포넌트로 오해해 툴팁이 영영 열리지 않는다. */
      {...(open === undefined ? {} : { open })}
      {...(onOpenChange === undefined ? {} : { onOpenChange })}
    >
      <Radix.Trigger asChild>{children}</Radix.Trigger>
      <Radix.Portal>
        <Radix.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "z-tooltip flex items-center gap-3 rounded-lg bg-tooltip px-3 py-2",
            "animate-in-pop text-label text-tooltip-foreground shadow-pop",
            "select-none",
            className,
          )}
          {...rest}
          data-slot="tooltip"
        >
          {label}
          {shortcut ? <kbd className="font-mono text-micro opacity-60">{shortcut}</kbd> : null}
          {/* 꼬리 치수는 토큰(--size-arrow-tooltip-*)이 든다 — Radix 의 width/height 속성은 CSS 가 이긴다(jsx-size-number 0). */}
          <Radix.Arrow className="h-(--size-arrow-tooltip-height) w-(--size-arrow-tooltip-width) fill-tooltip" />
        </Radix.Content>
      </Radix.Portal>
    </Radix.Root>
  );
}
