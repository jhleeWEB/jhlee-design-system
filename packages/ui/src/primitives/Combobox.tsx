"use client";
import { createContext, useCallback, useContext, useId, useMemo, useState } from "react";
import { Popover as RadixPopover } from "radix-ui";

import { cn, type VariantProps } from "../cn";
import {
  Command,
  CommandInput,
  CommandList,
  PlainCommandSurface,
  SlottedCommandItem,
  type CommandItemProps,
} from "../overlay/Command";
import { popoverContentVariants } from "../overlay/Popover.variants";
import { comboboxTriggerVariants } from "./Combobox.variants";

/* 콤보박스 — **검색해서** 값 하나를 고른다. 항목이 많아(시트 수십 장 · 레이어 · 사용자) 훑어보기보다 타이핑이 빠를 때 `Select` 대신 쓴다.
 *
 * 합성(#61): 트리거는 Select 트리거와 같은 사다리의 버튼(`role="combobox"`, Radix Popover 가 `aria-expanded` · `aria-controls` 를 단다)이고,
 * 누르면 Popover 면 위에 `Command`(검색 입력 + listbox)가 뜬다. 포커스는 검색 입력으로 옮겨가고 ↓/↑ · Enter 는 Command 의 것이다.
 * 고르면 값이 바뀌고 상자가 닫히며 포커스는 트리거로 돌아온다(Radix Popover). Escape 는 값을 바꾸지 않고 닫는다.
 *
 * `Field` 와 잇기: 트리거를 `FieldControl` 로 감싼다 — id(라벨의 htmlFor) · aria-describedby · aria-invalid · disabled 가 트리거 버튼에 꽂힌다(Select 와 같다).
 * 트리거에 보일 글자는 **호출처가 준다**(`children`) — 항목은 닫힌 상자 안에 있어 트리거가 라벨을 알 길이 없고, 값의 정본은 호출처의 상태다
 * (design-system-patterns «상태는 한 곳»). 값이 비면 `placeholder` 가 흐리게 선다.
 *
 * 부품마다 `data-slot` 을 `{...rest}` **뒤**에 둔다(slot-locked, D3 #44). */

interface ComboboxContextValue {
  readonly value: string;
  readonly select: (value: string) => void;
  readonly open: boolean;
  /** 상자의 id — 트리거의 `aria-controls` 와 상자의 `id` 가 같은 값을 쓴다(Radix 의 내부 id 를 DS 가 정적으로 못 박는다). */
  readonly contentId: string;
}

const ComboboxContext = createContext<ComboboxContextValue | null>(null);

function useCombobox(part: string): ComboboxContextValue {
  const context = useContext(ComboboxContext);
  if (!context) throw new Error(`${part} 은 <Combobox> 안에서만 쓴다`);
  return context;
}

/** `Combobox` 의 props — 값과 열림(둘 다 제어·비제어). 자기 DOM 은 없다. */
export interface ComboboxProps {
  /**
   * 제어 모드의 값 — `onValueChange` 와 함께 쓴다. 빈 문자열은 «고르지 않음» 이다.
   * @default undefined
   */
  value?: string;
  /**
   * 비제어 모드의 첫 값.
   * @default ""
   */
  defaultValue?: string;
  /**
   * 항목을 골랐을 때 — 고른 항목의 `value` 를 받는다. 이미 고른 항목을 다시 골라도 값은 그대로다(해제하지 않는다).
   * @default undefined
   */
  onValueChange?: (value: string) => void;
  /**
   * 제어 모드의 열림.
   * @default undefined
   */
  open?: boolean;
  /**
   * 비제어 모드의 첫 열림.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * 열림이 바뀔 때.
   * @default undefined
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * `ComboboxTrigger` 와 `ComboboxContent`.
   * @default undefined
   */
  children?: React.ReactNode;
}

/** 콤보박스의 루트 — 값과 열림을 들고 트리거 · 상자를 묶는다. 자기 DOM 은 없다(Radix `Popover.Root` 위). */
export function Combobox({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
}: ComboboxProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const value = valueProp ?? uncontrolledValue;
  const open = openProp ?? uncontrolledOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );
  const select = useCallback(
    (next: string) => {
      if (valueProp === undefined) setUncontrolledValue(next);
      onValueChange?.(next);
      setOpen(false);
    },
    [valueProp, onValueChange, setOpen],
  );
  const contentId = `${useId()}-content`;
  const context = useMemo<ComboboxContextValue>(
    () => ({ value, select, open, contentId }),
    [value, select, open, contentId],
  );
  return (
    <ComboboxContext.Provider value={context}>
      <RadixPopover.Root open={open} onOpenChange={setOpen}>
        {children}
      </RadixPopover.Root>
    </ComboboxContext.Provider>
  );
}

/** `ComboboxTrigger` 의 props — `<button>` 속성(ref 포함) + Select 트리거와 같은 `size` · `invalid` + `placeholder`. */
export interface ComboboxTriggerProps
  extends Omit<React.ComponentPropsWithRef<"button">, "value">, VariantProps<typeof comboboxTriggerVariants> {
  /**
   * 값이 비었을 때 흐리게 보이는 글자.
   * @default "Select…"
   */
  placeholder?: string;
}

/**
 * 상자를 여는 버튼(`role="combobox"`) — 고른 값의 글자(`children`)를 보이고, 값이 비면 `placeholder` 를 흐리게 보인다. 펼침 화살표는 DS 가 붙인다.
 * 이름은 `FieldLabel`(FieldControl 로 감쌀 때) 또는 `aria-label` 이 준다.
 * @slot combobox-trigger
 */
export function ComboboxTrigger({
  className,
  size,
  invalid,
  placeholder = "Select…",
  children,
  ...rest
}: ComboboxTriggerProps) {
  const combobox = useCombobox("ComboboxTrigger");
  const empty = combobox.value === "";
  return (
    <RadixPopover.Trigger asChild>
      <button
        type="button"
        aria-invalid={invalid || undefined}
        className={cn(comboboxTriggerVariants({ size, invalid }), className)}
        {...rest}
        role="combobox"
        aria-expanded={combobox.open}
        aria-controls={combobox.contentId}
        data-slot="combobox-trigger"
        data-size={size ?? "md"}
        data-invalid={invalid ? "" : undefined}
        data-placeholder={empty ? "" : undefined}
      >
        <span className="min-w-0 flex-1 truncate">{empty ? placeholder : (children ?? combobox.value)}</span>
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
          <path
            d="m5 6 3-3 3 3M5 10l3 3 3-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </RadixPopover.Trigger>
  );
}

/** `ComboboxContent` 의 props — Radix `Popover.Content` 속성(ref 포함, `forceMount` 제외) + 검색 입력의 글자. */
export interface ComboboxContentProps extends Omit<
  React.ComponentPropsWithRef<typeof RadixPopover.Content>,
  "forceMount"
> {
  /**
   * 검색 입력 · 목록 · 상자의 접근성 이름 — 화면에는 보이지 않는다. 화면 문자열이라 영어로 적는다.
   * @default "Options"
   */
  label?: string;
  /**
   * 검색 입력의 자리표시.
   * @default "Search…"
   */
  searchPlaceholder?: string;
}

/**
 * 검색 상자 — Popover 면 위에 검색 입력과 목록을 그린다. 폭은 트리거 폭에 붙되 팝오버 상하한 안이다. 처음 강조는 고른 값의 항목이다.
 * 자식은 `ComboboxItem` 과 `CommandGroup` · `CommandEmpty` · `CommandSeparator` 다.
 * @slot combobox-content
 */
export function ComboboxContent({
  className,
  label = "Options",
  searchPlaceholder = "Search…",
  sideOffset = 4,
  align = "start",
  children,
  ...rest
}: ComboboxContentProps) {
  const combobox = useCombobox("ComboboxContent");
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        aria-label={label}
        sideOffset={sideOffset}
        align={align}
        className={cn(
          popoverContentVariants({ onCanvas: false }),
          "w-(--radix-popover-trigger-width) max-w-popover-fluid min-w-popover-min p-0",
          className,
        )}
        {...rest}
        id={combobox.contentId}
        data-slot="combobox-content"
      >
        <PlainCommandSurface>
          <Command label={label} {...(combobox.value === "" ? {} : { defaultValue: combobox.value })}>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>{children}</CommandList>
          </Command>
        </PlainCommandSurface>
      </RadixPopover.Content>
    </RadixPopover.Portal>
  );
}

/** `ComboboxItem` 의 props — `CommandItem` 의 props 에서 `value` 가 필수다(고르면 루트의 값이 된다). */
export interface ComboboxItemProps extends Omit<CommandItemProps, "value"> {
  /** 고르면 루트의 값이 되는 문자열. 검색은 이 값과 글자(`children` 이 문자열일 때) · `keywords` 를 함께 본다. */
  value: string;
}

/**
 * 고를 수 있는 항목 — 고른 항목은 왼쪽에 체크 표시가 선다(Select 항목과 같은 자리). 고르면 값이 바뀌고 상자가 닫힌다.
 * @slot combobox-item
 */
export function ComboboxItem({ className, value, keywords, onSelect, children, ...rest }: ComboboxItemProps) {
  const combobox = useCombobox("ComboboxItem");
  const checked = combobox.value === value;
  const words = typeof children === "string" ? [...(keywords ?? []), children] : (keywords ?? []);
  return (
    <SlottedCommandItem
      // 메뉴 항목 바탕의 `[&_svg]:size-7 · text-muted-foreground` 를 이 자리에서만 고친다 — 체크는 Select 항목과 같은 16px · primary 다.
      className={cn("pl-8 [&_svg]:size-4 [&_svg[data-check]]:text-primary", className)}
      value={value}
      keywords={words}
      onSelect={(next) => {
        onSelect?.(next);
        combobox.select(next);
      }}
      {...rest}
      data-checked={checked ? "" : undefined}
      slot="combobox-item"
    >
      {checked ? (
        <svg viewBox="0 0 16 16" aria-hidden="true" data-check="" className="absolute left-3">
          <path
            d="M3.6 8.4l3 3 5.8-6.3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
      {children}
    </SlottedCommandItem>
  );
}
