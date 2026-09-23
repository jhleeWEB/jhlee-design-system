import { ScrollArea as Radix } from "radix-ui";

import { cn } from "../cn";

/* 스크롤 영역 — 검사 패널처럼 **스크롤이 바깥으로 새면 안 되는** 자리에 쓴다.
 * 캔버스 위에서 휠이 패널을 지나 확대/축소로 넘어가는 것이 그 증상이고,
 * `overscroll-contain` 이 그것을 막는다. */
export function ScrollArea({
  className,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<typeof Radix.Root>) {
  return (
    <Radix.Root
      data-slot="scroll-area"
      type="hover"
      className={cn("relative min-h-0 overflow-hidden", className)}
      {...rest}
    >
      <Radix.Viewport className="size-full overscroll-contain [&>div]:!block">
        {children}
      </Radix.Viewport>
      <Radix.Scrollbar
        orientation="vertical"
        className="flex w-3 touch-none select-none p-px transition-colors hover:bg-surface-2"
      >
        <Radix.Thumb className="relative flex-1 rounded-full bg-line-strong" />
      </Radix.Scrollbar>
      <Radix.Scrollbar
        orientation="horizontal"
        className="flex h-3 touch-none select-none flex-col p-px transition-colors hover:bg-surface-2"
      >
        <Radix.Thumb className="relative flex-1 rounded-full bg-line-strong" />
      </Radix.Scrollbar>
      <Radix.Corner className="bg-surface-2" />
    </Radix.Root>
  );
}
