"use client";
import { Separator as RadixSeparator } from "radix-ui";

import { cn } from "../cn";

/* 단축키 표기. 도면 툴은 단축키가 본체라 메뉴·툴팁 어디서나 같은 모양이어야 한다. */
export function Kbd({ className, ...rest }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex min-w-7 items-center justify-center rounded-sm border border-border-strong",
        "bg-muted px-2 font-mono text-micro leading-5 text-muted-foreground",
        className,
      )}
      {...rest}
    />
  );
}

export function Separator({
  className,
  orientation = "horizontal",
  ...rest
}: React.ComponentPropsWithoutRef<typeof RadixSeparator.Root>) {
  return (
    <RadixSeparator.Root
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...rest}
    />
  );
}

/* 미세 라벨 — 구획의 이름. 대문자 + 자간은 **이 크기에서만** 읽기를 돕는다(base 주석 참조). */
export function SectionLabel({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="section-label"
      className={cn(
        "font-mono text-micro tracking-caps text-muted-foreground uppercase select-none",
        className,
      )}
      {...rest}
    />
  );
}
