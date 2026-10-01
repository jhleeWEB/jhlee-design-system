"use client";
import { HoverCard as Radix, Slot } from "radix-ui";

import { cn, type VariantProps } from "../cn";
import { hoverCardVariants } from "./HoverCard.variants";

/* 호버 카드 — 링크·이름 위에 포인터를 올리면 **미리보기**를 띄운다(시트 요약 · 작성자 카드).
 * 툴팁과 달리 내용이 풍부하고(제목 · 본문 · 링크), 팝오버와 달리 누르지 않아도 열린다 — 그래서 안의 내용은 **보조**여야 한다:
 * 터치와 스크린리더는 호버로 열 수 없으므로 같은 정보가 트리거의 목적지(링크)에도 있어야 한다(Radix HoverCard 의 접근성 주의).
 * 열림 지연(700ms)·닫힘 지연(300ms)은 Radix 기본값을 그대로 둔다 — 지나가는 포인터에 카드가 튀어나오지 않게 하는 값이다.
 *
 * 부품마다 `data-slot` 을 `{...rest}` **뒤**에 둔다(slot-locked, D3 #44). */

/** 호버 카드의 루트 — 열림 상태(`open` · `defaultOpen` · `onOpenChange`)와 지연(`openDelay` · `closeDelay`)만 든다. 자기 DOM 은 없다(Radix `HoverCard.Root`). */
export const HoverCard = Radix.Root;

/**
 * 호버하면 카드를 여는 요소 — 기본은 `<a>` 다. `asChild` 로 DS 링크·버튼을 쓴다. 키보드 포커스로도 열린다.
 * @slot hover-card-trigger
 */
export function HoverCardTrigger({ className, ...rest }: React.ComponentPropsWithRef<typeof Radix.Trigger>) {
  return <Radix.Trigger className={cn(className)} {...rest} data-slot="hover-card-trigger" />;
}

/** `HoverCardContent` 의 props — Radix `HoverCard.Content` 속성(ref 포함, `forceMount` 제외 — 포털 수명은 DS 가 소유한다) + `onCanvas` · `arrow`. */
export interface HoverCardContentProps
  extends
    Omit<React.ComponentPropsWithRef<typeof Radix.Content>, "forceMount">,
    VariantProps<typeof hoverCardVariants> {
  /**
   * 캔버스 위에 얹힌다 — 반투명 + 블러로 도면이 비친다. 끄면 불투명한 카드 면이다.
   * @default false
   */
  onCanvas?: boolean;
  /**
   * 트리거를 가리키는 꼬리를 단다 — 트리거가 여럿 모인 목록에서 어느 것의 카드인지 흐릴 때만.
   * @default false
   */
  arrow?: boolean;
}

/**
 * 호버 카드 상자 — 포털로 뜬다. 면과 꼬리는 Popover 와 같고 폭은 팝오버 상한에 고정이다.
 * @slot hover-card
 */
export function HoverCardContent({
  className,
  onCanvas = false,
  arrow = false,
  sideOffset = 6,
  children,
  asChild = false,
  ...rest
}: HoverCardContentProps) {
  return (
    <Radix.Portal>
      <Radix.Content
        asChild={asChild}
        sideOffset={sideOffset}
        className={cn(hoverCardVariants({ onCanvas }), "w-popover-max max-w-popover-fluid", className)}
        {...rest}
        data-slot="hover-card"
        data-on-canvas={onCanvas ? "" : undefined}
      >
        {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
        {/* 꼬리 치수는 팝오버와 같은 토큰(--size-arrow-popover-*)이다 — 같은 면에 같은 꼬리. */}
        {arrow ? (
          <Radix.Arrow className="h-(--size-arrow-popover-height) w-(--size-arrow-popover-width) fill-card stroke-border" />
        ) : null}
      </Radix.Content>
    </Radix.Portal>
  );
}
