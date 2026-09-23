import { Dialog } from "radix-ui";

import { cn, cva, type VariantProps } from "../cn";

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

export interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof Dialog.Content>,
    VariantProps<typeof panelVariants> {
  /** 스크림 없이 연다 — 캔버스를 계속 조작해야 하는 검사 서랍용. */
  modal?: boolean;
}

export function DrawerContent({
  className,
  side,
  size,
  modal = true,
  children,
  ...rest
}: DrawerContentProps) {
  return (
    <Dialog.Portal>
      {modal ? (
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

export function DrawerHeader({
  className,
  title,
  description,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
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
        <Dialog.Title className="text-title font-semibold leading-snug text-ink">
          {title}
        </Dialog.Title>
        {description ? (
          <Dialog.Description className="mt-1 leading-relaxed text-muted">
            {description}
          </Dialog.Description>
        ) : null}
      </div>
      <Dialog.Close
        data-slot="dialog-close"
        aria-label="Close"
        className="appearance-none border-0 bg-transparent p-0 font-inherit text-inherit -mr-2 -mt-1 shrink-0 cursor-pointer rounded-control p-2 text-muted hover:bg-surface-2 hover:text-ink focus-visible:focus-ring focus-visible:outline-none"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-7">
          <path d="M4.4 4.4l7.2 7.2M11.6 4.4l-7.2 7.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </Dialog.Close>
    </div>
  );
}

export function DrawerBody({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="drawer-body"
      className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5", className)}
      {...rest}
    />
  );
}
