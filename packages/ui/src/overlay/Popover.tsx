"use client";
import { Popover as Radix, Slot } from "radix-ui";

import { cn } from "../cn";

/* 팝오버 — 툴팁과 달리 **조작이 들어간다**(법규 근거 · 범례 제어 · 작은 폼).
 * 캔버스 위에 뜨는 경우가 많아 `onCanvas` 로 배경을 비칠 수 있게 둔다. */
/** 팝오버의 루트 — 열림 상태(`open` · `defaultOpen` · `onOpenChange`)만 든다. 자기 DOM 은 없다(Radix `Popover.Root`). */
export const Popover = Radix.Root;

/**
 * 팝오버를 여는 버튼. `asChild` 로 DS `Button` 을 트리거로 쓴다.
 * @slot popover-trigger
 */
export function PopoverTrigger({ className, ...rest }: React.ComponentPropsWithRef<typeof Radix.Trigger>) {
  // data-slot 은 {...rest} 뒤 — 소비자가 넘긴 data-slot 이 DS 의 손잡이를 덮지 못하게 한다(slot-locked, D3 #44).
  return <Radix.Trigger className={cn(className)} {...rest} data-slot="popover-trigger" />;
}

/**
 * 트리거가 아닌 요소에 팝오버를 붙일 때의 기준점 — 캔버스 위 선택 영역처럼.
 * @slot popover-anchor
 */
export function PopoverAnchor({ className, ...rest }: React.ComponentPropsWithRef<typeof Radix.Anchor>) {
  return <Radix.Anchor className={cn(className)} {...rest} data-slot="popover-anchor" />;
}

/**
 * 팝오버를 닫는 버튼 — 작은 폼의 「Done」 처럼.
 * @slot popover-close
 */
export function PopoverClose({ className, ...rest }: React.ComponentPropsWithRef<typeof Radix.Close>) {
  return <Radix.Close className={cn(className)} {...rest} data-slot="popover-close" />;
}

/** 포털의 마운트 수명은 DS가 소유하므로 Content만 forceMount하는 조합은 공개하지 않는다. */
export interface PopoverContentProps extends Omit<
  React.ComponentPropsWithRef<typeof Radix.Content>,
  "forceMount"
> {
  /**
   * 캔버스 위에 얹힌다 — 반투명 + 블러로 도면이 비친다. 끄면 불투명한 카드 면이다.
   * @default false
   */
  onCanvas?: boolean;
  /**
   * 트리거를 가리키는 꼬리를 단다 — 트리거와 멀리 떨어져 어느 것의 팝오버인지 흐릴 때만.
   * @default false
   */
  arrow?: boolean;
}

/**
 * 팝오버 상자 — 포털로 뜬다. 폭은 트리거 폭을 따르되 `--container-popover-*` 상하한 안이다.
 * @slot popover
 */
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
        sideOffset={sideOffset}
        className={cn(
          "z-popover w-(--radix-popover-trigger-width) max-w-popover-fluid min-w-popover-min",
          "rounded-lg border border-border p-5 shadow-pop",
          "animate-in-pop text-body text-foreground focus-visible:outline-none",
          onCanvas ? "on-canvas" : "bg-card",
          className,
        )}
        {...rest}
        data-slot="popover"
      >
        {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
        {/* 꼬리 치수는 토큰(--size-arrow-popover-*)이 든다 — Radix 의 width/height 속성(기본 10×5)은 CSS 가 이긴다(jsx-size-number 0). */}
        {arrow ? (
          <Radix.Arrow className="h-(--size-arrow-popover-height) w-(--size-arrow-popover-width) fill-card stroke-border" />
        ) : null}
      </Radix.Content>
    </Radix.Portal>
  );
}
