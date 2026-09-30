"use client";
import { Tooltip as Radix } from "radix-ui";

import { cn } from "../cn";
import { MOTION } from "../generated/tokens";

/* 툴팁 — **면을 뒤집는다**(밝은 UI 위의 어두운 팝). 「일시적이고 내 것이 아니다」를 그것이 말한다.
 * shipped 캔버스 툴들이 공통으로 쓰는 관행이라 토큰(`--chrome-tooltip-*`)으로 못 박아 뒀다.
 *
 * 툴팁에는 **조작이 들어가지 않는다.** 버튼·링크가 필요하면 `Popover` 다 — 툴팁은 포커스를
 * 받지 않으므로 그 안의 것을 키보드로 누를 수 없다. */
export const TooltipProvider = Radix.Provider;

export interface TooltipProps
  extends Pick<
    React.ComponentPropsWithoutRef<typeof Radix.Content>,
    "side" | "align" | "sideOffset"
  > {
  /** 띄울 대상. 포커스 가능한 요소여야 키보드에서도 보인다. */
  children: React.ReactNode;
  label: React.ReactNode;
  /** 오른쪽에 흐리게 붙는 단축키 — "Zoom to fit" + "⇧2". */
  /* `| undefined` 를 명시한다 — `exactOptionalPropertyTypes` 아래에서는 «생략 가능» 과
     «undefined 를 넘겨도 된다» 가 다른 뜻이고, 이 넷은 호출처가 조건부로 넘기는 자리다. */
  shortcut?: string | undefined;
  delayDuration?: number | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
}

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
          data-slot="tooltip"
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "z-tooltip flex items-center gap-3 rounded-lg bg-tooltip px-3 py-2",
            "text-label text-tooltip-foreground shadow-pop animate-in-pop",
            "select-none",
          )}
        >
          {label}
          {shortcut ? (
            <kbd className="font-mono text-micro opacity-60">{shortcut}</kbd>
          ) : null}
          <Radix.Arrow className="fill-tooltip" width={9} height={4} />
        </Radix.Content>
      </Radix.Portal>
    </Radix.Root>
  );
}
