"use client";
import { ContextMenu as Radix, Slot } from "radix-ui";

import { cn } from "../cn";
import { contextMenuContentVariants, contextMenuItemVariants } from "./ContextMenu.variants";

/* 우클릭 메뉴 — 영역을 우클릭(터치는 길게 누르기)하면 **그 자리에서** 실행 목록을 연다. 캔버스의 선택 객체 · 표의 행처럼
 * 버튼을 따로 둘 자리가 없는 대상에 붙인다. 같은 동작은 반드시 다른 길(툴바 · DropdownMenu · 단축키)에도 있어야 한다 —
 * 우클릭은 발견되지 않는 입력이다.
 *
 * 면과 항목은 DropdownMenu 와 같다(`ContextMenu.variants.ts` 가 같은 cva 객체를 다시 내보낸다). 부품도 DropdownMenu 와 한 벌로 이름 붙인다 —
 * Item 의 `tone` · `shortcut`, CheckboxItem · RadioItem 의 표시, Label · Separator · Sub 까지 같은 모양이다.
 *
 * 부품마다 `data-slot` 을 `{...rest}` **뒤**에 둔다(slot-locked, D3 #44). */

/** 우클릭 메뉴의 루트 — 열림 알림(`onOpenChange`)과 모달성(`modal`)만 든다. 자기 DOM 은 없다(Radix `ContextMenu.Root`). 열림은 트리거의 우클릭이 정한다(`open` prop 이 없다). */
export const ContextMenu = Radix.Root;

/** 하위 메뉴의 루트 — `ContextMenuSubTrigger` 와 `ContextMenuSubContent` 를 묶는다. 자기 DOM 은 없다(Radix `ContextMenu.Sub`). */
export const ContextMenuSub = Radix.Sub;

/**
 * 우클릭을 받는 영역 — 기본은 `<span>` 이다. 블록 영역(캔버스 · 카드 · 표 행)이면 `asChild` 로 그 요소를 쓴다.
 * `disabled` 면 브라우저의 기본 메뉴가 뜬다.
 * @slot context-menu-trigger
 */
export function ContextMenuTrigger({
  className,
  ...rest
}: React.ComponentPropsWithRef<typeof Radix.Trigger>) {
  return <Radix.Trigger className={cn(className)} {...rest} data-slot="context-menu-trigger" />;
}

/**
 * 메뉴 상자 — 포인터 자리에 뜬다. 포털의 마운트 수명은 DS 가 소유하므로 Content 만 forceMount 하는 조합은 공개하지 않는다.
 * @slot context-menu
 */
export function ContextMenuContent({
  className,
  ...rest
}: Omit<React.ComponentPropsWithRef<typeof Radix.Content>, "forceMount">) {
  return (
    <Radix.Portal>
      <Radix.Content
        className={cn(contextMenuContentVariants(), className)}
        {...rest}
        data-slot="context-menu"
      />
    </Radix.Portal>
  );
}

/**
 * 항목 묶음 — 시각 구분 없이 의미만 묶는다(구분선은 `ContextMenuSeparator`).
 * @slot context-menu-group
 */
export function ContextMenuGroup({ className, ...rest }: React.ComponentPropsWithRef<typeof Radix.Group>) {
  return <Radix.Group className={cn(className)} {...rest} data-slot="context-menu-group" />;
}

/**
 * 라디오 항목 묶음 — `value` · `onValueChange` 로 하나를 고른 상태를 든다.
 * @slot context-menu-radio-group
 */
export function ContextMenuRadioGroup({
  className,
  ...rest
}: React.ComponentPropsWithRef<typeof Radix.RadioGroup>) {
  return <Radix.RadioGroup className={cn(className)} {...rest} data-slot="context-menu-radio-group" />;
}

/** `ContextMenuItem` 의 props. */
export interface ContextMenuItemProps extends React.ComponentPropsWithRef<typeof Radix.Item> {
  /**
   * 톤.
   * - `neutral` — 일반 동작(기본)
   * - `destructive` — 되돌릴 수 없는 동작(삭제). 글자와 강조 면이 붉다
   * @default "neutral"
   */
  tone?: "neutral" | "destructive";
  /**
   * 오른쪽에 흐리게 붙는 단축키 표기 — "⌘S". 표기일 뿐 키를 묶지 않는다.
   * @default undefined
   */
  shortcut?: string;
}

/**
 * 실행 항목 — 누르면 동작하고 메뉴가 닫힌다.
 * @slot context-menu-item
 */
export function ContextMenuItem({
  className,
  tone,
  shortcut,
  children,
  asChild = false,
  ...rest
}: ContextMenuItemProps) {
  return (
    <Radix.Item
      asChild={asChild}
      className={cn(contextMenuItemVariants({ tone }), className)}
      {...rest}
      data-slot="context-menu-item"
      // cva 축은 해석된 값(기본값 포함)으로 찍는다 — 스토리 격자·소비자 선택자가 같은 이름을 읽는다.
      data-tone={tone ?? "neutral"}
    >
      {asChild ? (
        <Slot.Slottable child={children}>
          {(content) => <span className="min-w-0 flex-1 truncate">{content}</span>}
        </Slot.Slottable>
      ) : (
        <span className="min-w-0 flex-1 truncate">{children}</span>
      )}
      {/* 단축키는 비활성이 아니라 보조 정보다 — foreground-disabled(2.43:1)는 읽히지 않아 muted 로 둔다(#55). */}
      {shortcut ? <kbd className="font-mono text-micro text-muted-foreground">{shortcut}</kbd> : null}
    </Radix.Item>
  );
}

/**
 * 켜고 끄는 항목 — `checked` · `onCheckedChange`. 켜지면 왼쪽에 체크 표시가 선다.
 * @slot context-menu-checkbox-item
 */
export function ContextMenuCheckboxItem({
  className,
  children,
  asChild = false,
  ...rest
}: React.ComponentPropsWithRef<typeof Radix.CheckboxItem>) {
  return (
    <Radix.CheckboxItem
      asChild={asChild}
      /* 체크 색은 항목 수준에서 건다 — 항목 바탕의 `[&_svg]:text-muted-foreground` 가 svg 자신의 text-primary 를 특이도로 이겨
         체크만 회색이었다(라디오 점 · Select · Combobox 는 주색). 크기(16px)는 항목 바탕의 `[&_svg]:size-4` 가 정한다(#80). */
      className={cn(contextMenuItemVariants(), "pl-8 [&_svg[data-check]]:text-primary", className)}
      {...rest}
      data-slot="context-menu-checkbox-item"
    >
      <Radix.ItemIndicator className="absolute left-3">
        <svg viewBox="0 0 16 16" aria-hidden="true" data-check="">
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
 * 라디오 항목 — `ContextMenuRadioGroup` 안에서 하나만 고른다. 고르면 왼쪽에 점이 선다.
 * @slot context-menu-radio-item
 */
export function ContextMenuRadioItem({
  className,
  children,
  asChild = false,
  ...rest
}: React.ComponentPropsWithRef<typeof Radix.RadioItem>) {
  return (
    <Radix.RadioItem
      asChild={asChild}
      className={cn(contextMenuItemVariants(), "pl-8", className)}
      {...rest}
      data-slot="context-menu-radio-item"
    >
      <Radix.ItemIndicator className="absolute left-4">
        {/* 8px — 체크(left-3 + 16px)와 같은 중심(20px)에 선다. 예전 `size-3`(12px)은 2px 격자 시절 값이 두 배로 남아 중심이 2px 어긋났다(#80). */}
        <span className="block size-2 rounded-full bg-primary" />
      </Radix.ItemIndicator>
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
    </Radix.RadioItem>
  );
}

/**
 * 묶음의 머리글 — mono 대문자 미세라벨. 누를 수 없다.
 * @slot context-menu-label
 */
export function ContextMenuLabel({ className, ...rest }: React.ComponentPropsWithRef<typeof Radix.Label>) {
  return (
    <Radix.Label
      className={cn(
        "px-3 py-2 font-mono text-micro font-medium tracking-caps text-muted-foreground uppercase",
        className,
      )}
      {...rest}
      data-slot="context-menu-label"
    />
  );
}

/**
 * 묶음 사이 구분선 — 메뉴 상자의 안쪽 여백까지 가로지른다.
 * @slot context-menu-separator
 */
export function ContextMenuSeparator({
  className,
  ...rest
}: React.ComponentPropsWithRef<typeof Radix.Separator>) {
  return (
    <Radix.Separator
      className={cn("-mx-2 my-2 h-px bg-border", className)}
      {...rest}
      data-slot="context-menu-separator"
    />
  );
}

/**
 * 하위 메뉴를 여는 항목 — 오른쪽에 펼침 화살표가 붙는다.
 * @slot context-menu-sub-trigger
 */
export function ContextMenuSubTrigger({
  className,
  children,
  asChild = false,
  ...rest
}: React.ComponentPropsWithRef<typeof Radix.SubTrigger>) {
  return (
    <Radix.SubTrigger
      asChild={asChild}
      className={cn(contextMenuItemVariants(), "data-[state=open]:bg-muted", className)}
      {...rest}
      data-slot="context-menu-sub-trigger"
    >
      {asChild ? (
        <Slot.Slottable child={children}>
          {(content) => <span className="min-w-0 flex-1 truncate">{content}</span>}
        </Slot.Slottable>
      ) : (
        <span className="min-w-0 flex-1 truncate">{children}</span>
      )}
      <svg viewBox="0 0 16 16" aria-hidden="true">
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
 * @slot context-menu-sub-content
 */
export function ContextMenuSubContent({
  className,
  ...rest
}: Omit<React.ComponentPropsWithRef<typeof Radix.SubContent>, "forceMount">) {
  return (
    <Radix.Portal>
      <Radix.SubContent
        className={cn(contextMenuContentVariants(), className)}
        {...rest}
        data-slot="context-menu-sub-content"
      />
    </Radix.Portal>
  );
}
