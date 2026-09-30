"use client";
import { Dialog } from "radix-ui";
import { LuX } from "react-icons/lu";

import { Button } from "../primitives/Button";

import { cn, type VariantProps } from "../cn";
import { drawerVariants } from "./Drawer.variants";
import { ScrollArea } from "../navigation/ScrollArea";

/* 서랍 — 화면 가장자리에서 들어온다. 모달과 달리 **캔버스를 덜 가린다**.
 * 긴 목록·설정처럼 보면서 캔버스를 참조해야 하는 것에 쓴다. */

export const Drawer = Dialog.Root;
export const DrawerTrigger = Dialog.Trigger;
export const DrawerClose = Dialog.Close;

/** 포털 수명은 DS가 소유한다. 비모달 동작은 Drawer의 modal={false} 한 곳에서 설정한다. */
export interface DrawerContentProps
  extends
    Omit<React.ComponentPropsWithRef<typeof Dialog.Content>, "forceMount">,
    VariantProps<typeof drawerVariants> {
  /** 모달성은 바꾸지 않고 스크림만 숨긴다. 비모달 Drawer에는 Radix가 스크림을 렌더하지 않는다. */
  showOverlay?: boolean;
}

export function DrawerContent({
  className,
  side,
  size,
  showOverlay = true,
  children,
  ...rest
}: DrawerContentProps) {
  return (
    <Dialog.Portal>
      {showOverlay ? <Dialog.Overlay className="fixed inset-0 z-scrim animate-in-fade bg-scrim" /> : null}
      <Dialog.Content data-slot="drawer" className={cn(drawerVariants({ side, size }), className)} {...rest}>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

/** description을 생략하고 별도 Description도 없으면 DrawerContent에 aria-describedby={undefined}를 지정한다. */
export function DrawerHeader({
  className,
  title,
  description,
  children,
  ...rest
}: Omit<React.ComponentPropsWithRef<"div">, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex shrink-0 items-start gap-4 border-b border-border px-6 py-5", className)}
      {...rest}
    >
      <div className="min-w-0 flex-1">
        <Dialog.Title className="leading-snug m-0 text-title font-semibold text-foreground">
          {title}
        </Dialog.Title>
        {description ? (
          <Dialog.Description className="leading-relaxed mt-1 text-muted-foreground">
            {description}
          </Dialog.Description>
        ) : null}
      </div>
      {/* ModalHeader 와 같은 자리 — 제목 블록과 닫기 사이. 예전에는 children 을 구조분해하지 않아 `...rest` 에 섞여
          div 의 prop 으로 갔는데, JSX 의 명시적 자식이 그 prop 을 덮어 소비자 children 이 조용히 사라졌다(#10). */}
      {children}
      <Dialog.Close asChild>
        <Button
          data-slot="dialog-close"
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close"
          className="-mt-1 -mr-2 shrink-0 [&_svg]:size-4"
        >
          <LuX size={16} strokeWidth={2} aria-hidden="true" focusable={false} />
        </Button>
      </Dialog.Close>
    </div>
  );
}

export function DrawerBody({
  className,
  onScroll,
  onScrollCapture,
  ...rest
}: React.ComponentPropsWithRef<"div">) {
  return (
    <ScrollArea className="min-h-0 min-w-0 flex-auto" viewportProps={{ onScroll, onScrollCapture }}>
      <div data-slot="drawer-body" className={cn("px-6 py-5", className)} {...rest} />
    </ScrollArea>
  );
}
