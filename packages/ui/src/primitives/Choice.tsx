"use client";
import { forwardRef } from "react";
import { Checkbox as RadixCheckbox, RadioGroup as RadixRadio, Slot, Switch as RadixSwitch } from "radix-ui";

import { cn } from "../cn";

/* 체크박스 · 라디오 · 스위치 — 셋의 의미가 다르다.
 *   체크박스  여러 개를 독립적으로 켠다
 *   라디오    여럿 중 하나를 고른다
 *   스위치    **즉시 적용되는** 켬/끔. 폼을 제출해야 반영되는 것에는 쓰지 않는다
 * 이 구분을 흐리면 사용자가 「저장을 눌러야 하나」를 매번 다시 판단해야 한다. */

const box = [
  "peer flex shrink-0 items-center justify-center border transition-colors duration-fast",
  "rounded-sm border-border-strong bg-muted",
  "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
  "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
  "focus-visible:focus-ring focus-visible:outline-none",
  "disabled:pointer-events-none disabled:opacity-45",
].join(" ");

export const Checkbox = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof RadixCheckbox.Root>
>(function Checkbox({ className, asChild = false, children, ...rest }, ref) {
  return (
    <RadixCheckbox.Root
      ref={ref}
      asChild={asChild}
      data-slot="checkbox"
      className={cn(box, "size-7", className)}
      {...rest}
    >
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : null}
      <RadixCheckbox.Indicator className="flex items-center justify-center">
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-6">
          <path
            d="M3.4 8.3l3 3 6-6.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
});

export const RadioGroup = RadixRadio.Root;

export const RadioGroupItem = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof RadixRadio.Item>
>(function RadioGroupItem({ className, asChild = false, children, ...rest }, ref) {
  return (
    <RadixRadio.Item
      ref={ref}
      asChild={asChild}
      data-slot="radio"
      className={cn(box, "size-7 rounded-full", className)}
      {...rest}
    >
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : null}
      <RadixRadio.Indicator className="block size-3 rounded-full bg-current" />
    </RadixRadio.Item>
  );
});

/* 스위치. 손잡이는 `--radius-full`, 트랙은 그 절반 높이 — 사다리에 없는 값이라 여기서 계산한다. */
export const Switch = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof RadixSwitch.Root>>(
  function Switch({ className, asChild = false, children, ...rest }, ref) {
    return (
      <RadixSwitch.Root
        ref={ref}
        asChild={asChild}
        data-slot="switch"
        className={cn(
          "peer inline-flex h-9 w-16 shrink-0 items-center rounded-full border border-border-strong bg-border-strong p-px",
          "transition-colors duration-fast motion-reduce:transition-none",
          "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
          "focus-visible:focus-ring focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-45",
          className,
        )}
        {...rest}
      >
        {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : null}
        <RadixSwitch.Thumb
          className={cn(
            "block size-7 rounded-full bg-card shadow-chip",
            "transition-transform duration-fast motion-reduce:transition-none",
            "data-[state=checked]:translate-x-7",
          )}
        />
      </RadixSwitch.Root>
    );
  },
);
