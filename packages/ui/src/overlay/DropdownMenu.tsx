"use client";
import { DropdownMenu as Radix, Slot } from "radix-ui";

import { cn } from "../cn";
import { normalizeTone, type ToneInput } from "../lib/tone";
import { dropdownMenuItemVariants } from "./DropdownMenu.variants";

/* 드롭다운 메뉴 — 목록에서 **하나를 실행**한다. 값을 고르는 것은 `Select` 다.
 * 그 구분이 흐려지면 「적용됨」 표시를 어디에 둘지가 매번 다시 문제가 된다.
 *
 * 부품마다 `data-slot` 을 `{...rest}` **뒤**에 둔다 — 소비자가 넘긴 data-slot 이 DS 의 손잡이를 덮지 못하게 한다(slot-locked, D3 #44).
 * Radix 를 그대로 재수출하던 Trigger · Group · RadioGroup 도 같은 이유로 얇게 감싼다(className 을 twMerge 로 합친다). */

/** 메뉴의 루트 — 열림 상태(`open` · `defaultOpen` · `onOpenChange`)만 든다. 자기 DOM 은 없다(Radix `DropdownMenu.Root`). */
export const DropdownMenu = Radix.Root;

/** 하위 메뉴의 루트 — `DropdownMenuSubTrigger` 와 `DropdownMenuSubContent` 를 묶는다. 자기 DOM 은 없다(Radix `DropdownMenu.Sub`). */
export const DropdownMenuSub = Radix.Sub;

const surface = [
  "z-popover min-w-menu overflow-hidden rounded-lg border border-border bg-card p-2",
  "text-body text-foreground shadow-pop animate-in-pop focus-visible:outline-none",
].join(" ");

/**
 * 메뉴를 여는 버튼. `asChild` 로 DS `Button` 을 트리거로 쓴다.
 * @slot menu-trigger
 */
export function DropdownMenuTrigger({
  className,
  ...rest
}: React.ComponentPropsWithRef<typeof Radix.Trigger>) {
  return <Radix.Trigger className={cn(className)} {...rest} data-slot="menu-trigger" />;
}

/**
 * 메뉴 상자. 포털의 마운트 수명은 DS가 소유하므로 Content만 forceMount하는 조합은 공개하지 않는다.
 * @slot menu
 */
export function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...rest
}: Omit<React.ComponentPropsWithRef<typeof Radix.Content>, "forceMount">) {
  return (
    <Radix.Portal>
      <Radix.Content sideOffset={sideOffset} className={cn(surface, className)} {...rest} data-slot="menu" />
    </Radix.Portal>
  );
}

/**
 * 항목 묶음 — 시각 구분 없이 의미만 묶는다(구분선은 `DropdownMenuSeparator`).
 * @slot menu-group
 */
export function DropdownMenuGroup({ className, ...rest }: React.ComponentPropsWithRef<typeof Radix.Group>) {
  return <Radix.Group className={cn(className)} {...rest} data-slot="menu-group" />;
}

/**
 * 라디오 항목 묶음 — `value` · `onValueChange` 로 하나를 고른 상태를 든다.
 * @slot menu-radio-group
 */
export function DropdownMenuRadioGroup({
  className,
  ...rest
}: React.ComponentPropsWithRef<typeof Radix.RadioGroup>) {
  return <Radix.RadioGroup className={cn(className)} {...rest} data-slot="menu-radio-group" />;
}

/** `DropdownMenuItem` 의 props. */
export interface DropdownMenuItemProps extends React.ComponentPropsWithRef<typeof Radix.Item> {
  /**
   * 톤. 옛 키 `default` · `danger` 는 한 마이너 동안 옮겨 준다.
   * - `neutral` — 일반 동작(기본)
   * - `destructive` — 되돌릴 수 없는 동작(삭제). 글자와 강조 면이 붉다
   * @default "neutral"
   */
  tone?: ToneInput<"neutral" | "destructive">;
  /**
   * 오른쪽에 흐리게 붙는 단축키 표기 — "⌘S". 표기일 뿐 키를 묶지 않는다.
   * @default undefined
   */
  shortcut?: string;
}

/**
 * 실행 항목 — 누르면 동작하고 메뉴가 닫힌다.
 * @slot menu-item
 */
export function DropdownMenuItem({
  className,
  tone,
  shortcut,
  children,
  asChild = false,
  ...rest
}: DropdownMenuItemProps) {
  return (
    <Radix.Item
      asChild={asChild}
      className={cn(dropdownMenuItemVariants({ tone: normalizeTone(tone) }), className)}
      {...rest}
      data-slot="menu-item"
      // cva 축은 해석된 값(옛 키를 옮긴 뒤 · 기본값 포함)으로 찍는다 — 스토리 격자·소비자 선택자가 같은 이름을 읽는다.
      data-tone={normalizeTone(tone) ?? "neutral"}
    >
      {asChild ? (
        <Slot.Slottable child={children}>
          {(content) => <span className="min-w-0 flex-1 truncate">{content}</span>}
        </Slot.Slottable>
      ) : (
        <span className="min-w-0 flex-1 truncate">{children}</span>
      )}
      {shortcut ? <kbd className="font-mono text-micro text-foreground-disabled">{shortcut}</kbd> : null}
    </Radix.Item>
  );
}

/**
 * 켜고 끄는 항목 — `checked` · `onCheckedChange`. 켜지면 왼쪽에 체크 표시가 선다.
 * @slot menu-checkbox-item
 */
export function DropdownMenuCheckboxItem({
  className,
  children,
  asChild = false,
  ...rest
}: React.ComponentPropsWithRef<typeof Radix.CheckboxItem>) {
  return (
    <Radix.CheckboxItem
      asChild={asChild}
      className={cn(dropdownMenuItemVariants(), "pl-8", className)}
      {...rest}
      data-slot="menu-checkbox-item"
    >
      <Radix.ItemIndicator className="absolute left-3">
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-6 text-primary">
          <path
            d="M3.6 8.4l3 3 5.8-6.3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Radix.ItemIndicator>
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
    </Radix.CheckboxItem>
  );
}

/**
 * 라디오 항목 — `DropdownMenuRadioGroup` 안에서 하나만 고른다. 고르면 왼쪽에 점이 선다.
 * @slot menu-radio-item
 */
export function DropdownMenuRadioItem({
  className,
  children,
  asChild = false,
  ...rest
}: React.ComponentPropsWithRef<typeof Radix.RadioItem>) {
  return (
    <Radix.RadioItem
      asChild={asChild}
      className={cn(dropdownMenuItemVariants(), "pl-8", className)}
      {...rest}
      data-slot="menu-radio-item"
    >
      <Radix.ItemIndicator className="absolute left-4">
        <span className="block size-3 rounded-full bg-primary" />
      </Radix.ItemIndicator>
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
    </Radix.RadioItem>
  );
}

/**
 * 묶음의 머리글 — mono 대문자 미세라벨. 누를 수 없다.
 * @slot menu-label
 */
export function DropdownMenuLabel({ className, ...rest }: React.ComponentPropsWithRef<typeof Radix.Label>) {
  return (
    <Radix.Label
      className={cn(
        "px-3 py-2 font-mono text-micro tracking-caps text-muted-foreground uppercase",
        className,
      )}
      {...rest}
      data-slot="menu-label"
    />
  );
}

/**
 * 묶음 사이 구분선 — 메뉴 상자의 안쪽 여백까지 가로지른다.
 * @slot menu-separator
 */
export function DropdownMenuSeparator({
  className,
  ...rest
}: React.ComponentPropsWithRef<typeof Radix.Separator>) {
  return (
    <Radix.Separator
      className={cn("-mx-2 my-2 h-px bg-border", className)}
      {...rest}
      data-slot="menu-separator"
    />
  );
}

/**
 * 하위 메뉴를 여는 항목 — 오른쪽에 펼침 화살표가 붙는다.
 * @slot menu-sub-trigger
 */
export function DropdownMenuSubTrigger({
  className,
  children,
  asChild = false,
  ...rest
}: React.ComponentPropsWithRef<typeof Radix.SubTrigger>) {
  return (
    <Radix.SubTrigger
      asChild={asChild}
      className={cn(dropdownMenuItemVariants(), "data-[state=open]:bg-muted", className)}
      {...rest}
      data-slot="menu-sub-trigger"
    >
      {asChild ? (
        <Slot.Slottable child={children}>
          {(content) => <span className="min-w-0 flex-1 truncate">{content}</span>}
        </Slot.Slottable>
      ) : (
        <span className="min-w-0 flex-1 truncate">{children}</span>
      )}
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-6">
        <path
          d="M6 4l4 4-4 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Radix.SubTrigger>
  );
}

/**
 * 하위 메뉴 상자 — 메뉴 상자와 같은 면.
 * @slot menu-sub-content
 */
export function DropdownMenuSubContent({
  className,
  ...rest
}: Omit<React.ComponentPropsWithRef<typeof Radix.SubContent>, "forceMount">) {
  return (
    <Radix.Portal>
      <Radix.SubContent className={cn(surface, className)} {...rest} data-slot="menu-sub-content" />
    </Radix.Portal>
  );
}
