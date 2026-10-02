"use client";
import { Checkbox as RadixCheckbox, RadioGroup as RadixRadio, Slot, Switch as RadixSwitch } from "radix-ui";

import { cn, type VariantProps } from "../cn";
import {
  checkboxVariants,
  radioGroupItemVariants,
  radioIndicatorVariants,
  switchThumbVariants,
  switchVariants,
  type ChoiceSize,
} from "./Choice.variants";

/* 체크박스 · 라디오 · 스위치 — 셋의 의미가 다르다.
 *   체크박스  여러 개를 독립적으로 켠다
 *   라디오    여럿 중 하나를 고른다
 *   스위치    **즉시 적용되는** 켬/끔. 폼을 제출해야 반영되는 것에는 쓰지 않는다
 * 이 구분을 흐리면 사용자가 「저장을 눌러야 하나」를 매번 다시 판단해야 한다.
 *
 * 셋 다 `size`(sm · md · lg, 기본 md)를 받는다 — 단과 근거는 Choice.variants.ts 머리 주석(#80). 라벨은 `Field`(`FieldLabel` 의 htmlFor)나
 * `aria-label` 이 준다 — 라벨을 누르면 컨트롤이 바뀐다. */

/** `<Checkbox>` 의 props — Radix `Checkbox.Root` 속성 전부(ref 포함) + `size`. 섞임(indeterminate)은 `checked="indeterminate"` 다. */
export interface CheckboxProps
  extends React.ComponentPropsWithRef<typeof RadixCheckbox.Root>, VariantProps<typeof checkboxVariants> {}

/**
 * 체크박스 — 여러 개를 독립적으로 켠다. 섞임(`checked="indeterminate"`)은 체크 대신 가로줄을 그린다.
 * @slot checkbox
 */
export function Checkbox({ className, size, asChild = false, children, ...rest }: CheckboxProps) {
  const resolved = size ?? "md";
  return (
    <RadixCheckbox.Root
      {...rest}
      asChild={asChild}
      data-slot="checkbox"
      // `satisfies` — 문자열 축이지 불리언이 아니다(boolean-string-data-attr 래칫, Tabs 와 같다).
      data-size={resolved satisfies ChoiceSize}
      className={cn(checkboxVariants({ size: resolved }), className)}
    >
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : null}
      {/* Indicator 는 켜짐과 섞임에서 그려지고 자기 `data-state` 를 단다 — 두 획 중 무엇을 보일지 그것으로 가른다(비제어 섞임은 React 가 모른다). */}
      <RadixCheckbox.Indicator className="group/check flex size-full items-center justify-center">
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-full">
          <path
            className="group-data-[state=indeterminate]/check:hidden"
            d="M3.4 8.3l3 3 6-6.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            className="hidden group-data-[state=indeterminate]/check:inline"
            d="M4.5 8h7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}

/** 라디오 묶음 — 여럿 중 하나를 고른다. Radix `RadioGroup.Root` 에 `data-slot` 만 더한다(배치는 소비자 `className`). */
export function RadioGroup({ className, ...rest }: React.ComponentPropsWithRef<typeof RadixRadio.Root>) {
  return <RadixRadio.Root {...rest} data-slot="radio-group" className={cn(className)} />;
}

/** `<RadioGroupItem>` 의 props — Radix `RadioGroup.Item` 속성 전부(ref 포함) + `size`. */
export interface RadioGroupItemProps
  extends React.ComponentPropsWithRef<typeof RadixRadio.Item>, VariantProps<typeof radioGroupItemVariants> {}

/**
 * 라디오 한 개 — `RadioGroup` 안에서만 쓴다. 한 묶음의 항목은 같은 `size` 로 둔다.
 * @slot radio
 */
export function RadioGroupItem({ className, size, asChild = false, children, ...rest }: RadioGroupItemProps) {
  const resolved = size ?? "md";
  return (
    <RadixRadio.Item
      {...rest}
      asChild={asChild}
      data-slot="radio"
      data-size={resolved satisfies ChoiceSize}
      className={cn(radioGroupItemVariants({ size: resolved }), className)}
    >
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : null}
      <RadixRadio.Indicator className={radioIndicatorVariants({ size: resolved })} />
    </RadixRadio.Item>
  );
}

/** `<Switch>` 의 props — Radix `Switch.Root` 속성 전부(ref 포함) + `size`. */
export interface SwitchProps
  extends React.ComponentPropsWithRef<typeof RadixSwitch.Root>, VariantProps<typeof switchVariants> {}

/**
 * 스위치 — **즉시 적용되는** 켬/끔. 폼을 제출해야 반영되는 것에는 체크박스를 쓴다.
 * @slot switch
 */
export function Switch({ className, size, asChild = false, children, ...rest }: SwitchProps) {
  const resolved = size ?? "md";
  return (
    <RadixSwitch.Root
      {...rest}
      asChild={asChild}
      data-slot="switch"
      data-size={resolved satisfies ChoiceSize}
      className={cn(switchVariants({ size: resolved }), className)}
    >
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : null}
      <RadixSwitch.Thumb className={switchThumbVariants({ size: resolved })} />
    </RadixSwitch.Root>
  );
}
