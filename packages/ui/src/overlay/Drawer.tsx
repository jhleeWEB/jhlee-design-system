import { Dialog } from "radix-ui";
import { LuX } from "react-icons/lu";

import { Button } from "../primitives/Button";

import { cn, cva, type VariantProps } from "../cn";
import { ScrollArea } from "../navigation/ScrollArea";

/* 서랍 — 화면 가장자리에서 들어온다. 모달과 달리 **캔버스를 덜 가린다**.
 * 긴 목록·설정처럼 보면서 캔버스를 참조해야 하는 것에 쓴다. */
const panelVariants = cva(
  [
    "fixed z-50 flex flex-col overflow-hidden bg-surface shadow-modal",
    "text-body text-ink focus-visible:outline-none",
  ],
  {
    variants: {
      side: {
        right: "inset-y-0 right-0 h-dvh border-l border-line",
        left: "inset-y-0 left-0 h-dvh border-r border-line",
        bottom: "inset-x-0 bottom-0 w-full rounded-t-modal border-t border-line",
      },
      size: { sm: "", md: "", lg: "" },
    },
    compoundVariants: [
      { side: "right", size: "sm", class: "w-[min(280px,100vw)]" },
      { side: "right", size: "md", class: "w-[min(400px,100vw)]" },
      { side: "right", size: "lg", class: "w-[min(620px,100vw)]" },
      { side: "left", size: "sm", class: "w-[min(280px,100vw)]" },
      { side: "left", size: "md", class: "w-[min(400px,100vw)]" },
      { side: "left", size: "lg", class: "w-[min(620px,100vw)]" },
      { side: "bottom", size: "sm", class: "h-[min(280px,90dvh)]" },
      { side: "bottom", size: "md", class: "h-[min(460px,90dvh)]" },
      { side: "bottom", size: "lg", class: "h-[min(70dvh,90dvh)]" },
    ],
    defaultVariants: { side: "right", size: "md" },
  },
);

export const Drawer = Dialog.Root;
export const DrawerTrigger = Dialog.Trigger;
export const DrawerClose = Dialog.Close;

/** 포털 수명은 DS가 소유한다. 비모달 동작은 Drawer의 modal={false} 한 곳에서 설정한다. */
export interface DrawerContentProps
  extends Omit<React.ComponentPropsWithRef<typeof Dialog.Content>, "forceMount">,
    VariantProps<typeof panelVariants> {
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
      {showOverlay ? (
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim animate-in-fade" />
      ) : null}
      <Dialog.Content
        data-slot="drawer"
        className={cn(panelVariants({ side, size }), className)}
        {...rest}
      >
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
  ...rest
}: Omit<React.ComponentPropsWithRef<"div">, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex shrink-0 items-start gap-4 border-b border-line px-6 py-5", className)}
      {...rest}
    >
      <div className="min-w-0 flex-1">
        <Dialog.Title className="m-0 text-title font-semibold leading-snug text-ink">
          {title}
        </Dialog.Title>
        {description ? (
          <Dialog.Description className="mt-1 leading-relaxed text-muted">
            {description}
          </Dialog.Description>
        ) : null}
      </div>
      <Dialog.Close asChild>
        <Button data-slot="dialog-close" type="button" variant="ghost" size="icon-sm" aria-label="Close" className="-mr-2 -mt-1 shrink-0 [&_svg]:size-4">
          <LuX size={16} strokeWidth={2} aria-hidden="true" focusable={false} />
        </Button>
      </Dialog.Close>
    </div>
  );
}

export function DrawerBody({ className, onScroll, onScrollCapture, ...rest }: React.ComponentPropsWithRef<"div">) {
  return (
    <ScrollArea className="min-h-0 min-w-0 flex-auto" viewportProps={{ onScroll, onScrollCapture }}>
      <div data-slot="drawer-body" className={cn("px-6 py-5", className)} {...rest} />
    </ScrollArea>
  );
}
