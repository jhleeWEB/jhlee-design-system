import { Popover as Radix, Slot } from "radix-ui";

import { cn } from "../cn";

/* 팝오버 — 툴팁과 달리 **조작이 들어간다**(법규 근거 · 범례 제어 · 작은 폼).
 * 캔버스 위에 뜨는 경우가 많아 `onCanvas` 로 배경을 비칠 수 있게 둔다. */
export const Popover = Radix.Root;
export const PopoverTrigger = Radix.Trigger;
export const PopoverAnchor = Radix.Anchor;
export const PopoverClose = Radix.Close;

/** 포털의 마운트 수명은 DS가 소유하므로 Content만 forceMount하는 조합은 공개하지 않는다. */
export interface PopoverContentProps
  extends Omit<React.ComponentPropsWithRef<typeof Radix.Content>, "forceMount"> {
  /** 캔버스 위에 얹힌다 — 반투명 + 블러로 도면이 비친다. */
  onCanvas?: boolean;
  arrow?: boolean;
}

export function PopoverContent({
  className,
  onCanvas,
  arrow,
  sideOffset = 6,
  children,
  asChild = false,
  ...rest
}: PopoverContentProps) {
  return (
    <Radix.Portal>
      <Radix.Content
        asChild={asChild}
        data-slot="popover"
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-(--radix-popover-trigger-width) min-w-[180px] max-w-[min(360px,calc(100vw-24px))]",
          "rounded-float border border-line p-5 shadow-pop",
          "text-body text-ink animate-in-pop focus-visible:outline-none",
          onCanvas ? "on-canvas" : "bg-surface",
          className,
        )}
        {...rest}
      >
        {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
        {arrow ? <Radix.Arrow className="fill-surface stroke-line" width={10} height={5} /> : null}
      </Radix.Content>
    </Radix.Portal>
  );
}
