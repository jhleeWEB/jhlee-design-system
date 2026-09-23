import { DropdownMenu as Radix } from "radix-ui";

import { cn } from "../cn";

/* 드롭다운 메뉴 — 목록에서 **하나를 실행**한다. 값을 고르는 것은 `Select` 다.
 * 그 구분이 흐려지면 「적용됨」 표시를 어디에 둘지가 매번 다시 문제가 된다. */
export const DropdownMenu = Radix.Root;
export const DropdownMenuTrigger = Radix.Trigger;
export const DropdownMenuGroup = Radix.Group;
export const DropdownMenuSub = Radix.Sub;
export const DropdownMenuRadioGroup = Radix.RadioGroup;

const surface = [
  "z-50 min-w-[168px] overflow-hidden rounded-float border border-line bg-surface p-2",
  "text-body text-ink shadow-pop animate-in-pop focus-visible:outline-none",
].join(" ");

const item = [
  "relative flex cursor-default select-none items-center gap-3 rounded-control px-3 py-2",
  "outline-none data-highlighted:bg-surface-2 data-highlighted:text-ink",
  "data-disabled:pointer-events-none data-disabled:text-disabled",
  "[&_svg]:size-7 [&_svg]:shrink-0 [&_svg]:text-muted",
].join(" ");

export function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...rest
}: React.ComponentPropsWithoutRef<typeof Radix.Content>) {
  return (
    <Radix.Portal>
      <Radix.Content data-slot="menu" sideOffset={sideOffset} className={cn(surface, className)} {...rest} />
    </Radix.Portal>
  );
}

export function DropdownMenuItem({
  className,
  tone,
  shortcut,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<typeof Radix.Item> & {
  tone?: "default" | "danger";
  shortcut?: string;
}) {
  return (
    <Radix.Item
      className={cn(item, tone === "danger" && "text-danger data-highlighted:bg-danger-soft data-highlighted:text-danger", className)}
      {...rest}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {shortcut ? <kbd className="font-mono text-micro text-disabled">{shortcut}</kbd> : null}
    </Radix.Item>
  );
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<typeof Radix.CheckboxItem>) {
  return (
    <Radix.CheckboxItem className={cn(item, "pl-8", className)} {...rest}>
      <Radix.ItemIndicator className="absolute left-3">
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-6 text-accent">
          <path d="M3.6 8.4l3 3 5.8-6.3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Radix.ItemIndicator>
      {children}
    </Radix.CheckboxItem>
  );
}

export function DropdownMenuRadioItem({
  className,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<typeof Radix.RadioItem>) {
  return (
    <Radix.RadioItem className={cn(item, "pl-8", className)} {...rest}>
      <Radix.ItemIndicator className="absolute left-4">
        <span className="block size-3 rounded-full bg-accent" />
      </Radix.ItemIndicator>
      {children}
    </Radix.RadioItem>
  );
}

export function DropdownMenuLabel({ className, ...rest }: React.ComponentPropsWithoutRef<typeof Radix.Label>) {
  return (
    <Radix.Label
      className={cn("px-3 py-2 font-mono text-micro uppercase tracking-caps text-muted", className)}
      {...rest}
    />
  );
}

export function DropdownMenuSeparator({ className, ...rest }: React.ComponentPropsWithoutRef<typeof Radix.Separator>) {
  return <Radix.Separator className={cn("-mx-2 my-2 h-px bg-line", className)} {...rest} />;
}

export function DropdownMenuSubTrigger({ className, children, ...rest }: React.ComponentPropsWithoutRef<typeof Radix.SubTrigger>) {
  return (
    <Radix.SubTrigger className={cn(item, "data-[state=open]:bg-surface-2", className)} {...rest}>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-6">
        <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Radix.SubTrigger>
  );
}

export function DropdownMenuSubContent({ className, ...rest }: React.ComponentPropsWithoutRef<typeof Radix.SubContent>) {
  return (
    <Radix.Portal>
      <Radix.SubContent className={cn(surface, className)} {...rest} />
    </Radix.Portal>
  );
}
