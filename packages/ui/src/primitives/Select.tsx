"use client";
import { Select as Radix } from "radix-ui";

import { cn, type VariantProps } from "../cn";
import { selectTriggerVariants } from "./Select.variants";

/* 선택 — 목록에서 **값 하나를 고른다.** 실행은 `DropdownMenu` 다(그 구분은 DropdownMenu 머리 주석).
 *
 * 2.x 의 레거시 `Select`(`./legacy`, 3.0.0 에서 삭제 #49)는 `options` 배열을 받는 한 덩어리였고, DS 모드에서는 DropdownMenu 의 라디오 항목으로
 * 흉내를 냈다 — 그래서 listbox/option 의미·타이핑 검색·선택 항목으로 스크롤이 없었다. 여기서는 Radix Select 의 부품을 그대로
 * 합성한다(#47). 설탕(`options` prop)은 두지 않는다 — 항목마다 비활성·묶음·머리글이 붙는 순간 배열 모양이 다시 자란다.
 *
 * 부품마다 `data-slot` 을 `{...rest}` **뒤**에 둔다 — 소비자가 넘긴 data-slot 이 DS 의 손잡이를 덮지 못하게 한다(slot-locked, D3 #44). */

/** 선택의 루트 — 값(`value` · `defaultValue` · `onValueChange`)과 열림(`open` · `onOpenChange`)을 든다. 자기 DOM 은 없다(Radix `Select.Root`). */
export const Select = Radix.Root;

/** `SelectTrigger` 의 props — Radix `Select.Trigger` 속성(ref 포함, `asChild` 제외) + `size` · `invalid`. */
export interface SelectTriggerProps
  extends
    Omit<React.ComponentPropsWithRef<typeof Radix.Trigger>, "asChild">,
    VariantProps<typeof selectTriggerVariants> {}

/**
 * 목록을 여는 버튼 — Input 과 같은 높이 사다리(`size`)와 검증 실패(`invalid`)를 갖는다. 안에 `SelectValue` 를 두고, 펼침 화살표는 DS 가 붙인다.
 * 장식(값 · 화살표)을 트리거가 소유하므로 `asChild` 는 받지 않는다.
 * @slot select-trigger
 */
export function SelectTrigger({ className, size, invalid, children, ...rest }: SelectTriggerProps) {
  return (
    <Radix.Trigger
      aria-invalid={invalid || undefined}
      className={cn(selectTriggerVariants({ size, invalid }), className)}
      {...rest}
      data-slot="select-trigger"
      data-size={size ?? "md"}
      data-invalid={invalid ? "" : undefined}
    >
      {children}
      <Radix.Icon asChild>
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
          <path
            d="m4 6 4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Radix.Icon>
    </Radix.Trigger>
  );
}

/**
 * 트리거 안에 고른 항목의 글자를 보인다. 아무것도 고르지 않았으면 `placeholder` 를 흐리게 보인다. 넘치면 말줄임한다.
 * `className` 은 바깥 상자로 간다 — Radix `Select.Value` 는 받은 className · style 을 버린다(실측, react-select 2.3). ref 와 나머지 속성은 값 요소에 닿는다.
 * @slot select-value
 */
export function SelectValue({ className, ...rest }: React.ComponentPropsWithRef<typeof Radix.Value>) {
  return (
    <span className={cn("min-w-0 flex-1 truncate", className)} data-slot="select-value">
      {/* 안쪽에도 손잡이를 박는다 — 소비자가 넘긴 data-slot 이 rest 로 여기 와도 DS 이름을 덮지 못한다(slot-locked). */}
      <Radix.Value {...rest} data-slot="select-value-text" />
    </span>
  );
}

/** `SelectContent` 의 props — Radix `Select.Content` 속성(ref 포함, `forceMount` 제외). */
export type SelectContentProps = Omit<React.ComponentPropsWithRef<typeof Radix.Content>, "forceMount">;

/**
 * 목록 상자 — DropdownMenu 와 같은 면(카드 바탕 · `shadow-pop`)이다. 포털의 수명은 DS 가 소유하므로 `forceMount` 는 공개하지 않는다.
 * 기본 배치는 트리거 아래(`position="popper"`)이고 폭은 트리거보다 좁아지지 않는다. 목록이 길면 뷰포트 안에서 스크롤한다.
 * @slot select-content
 */
export function SelectContent({
  className,
  children,
  position = "popper",
  sideOffset = 4,
  ...rest
}: SelectContentProps) {
  return (
    <Radix.Portal>
      <Radix.Content
        position={position}
        // item-aligned 는 Radix 가 트리거 위에 겹쳐 놓으므로 간격이 없다 — popper 일 때만 띄운다.
        {...(position === "popper" ? { sideOffset } : {})}
        className={cn(
          "relative z-popover min-w-menu overflow-hidden rounded-lg border border-border bg-card",
          "animate-in-pop text-body text-foreground shadow-pop",
          "data-[side]:max-h-(--radix-select-content-available-height) data-[side]:min-w-(--radix-select-trigger-width)",
          className,
        )}
        {...rest}
        data-slot="select-content"
      >
        <Radix.ScrollUpButton className="flex h-ctl-sm items-center justify-center text-muted-foreground">
          <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
            <path
              d="m4 10 4-4 4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Radix.ScrollUpButton>
        <Radix.Viewport className="p-2">{children}</Radix.Viewport>
        <Radix.ScrollDownButton className="flex h-ctl-sm items-center justify-center text-muted-foreground">
          <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
            <path
              d="m4 6 4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Radix.ScrollDownButton>
      </Radix.Content>
    </Radix.Portal>
  );
}

/**
 * 고를 수 있는 항목 — `value` 가 루트의 값이 된다. 고른 항목은 왼쪽에 체크 표시가 선다. 글자(`children`)가 트리거에 그대로 옮겨 적힌다.
 * @slot select-item
 */
export function SelectItem({
  className,
  children,
  ...rest
}: Omit<React.ComponentPropsWithRef<typeof Radix.Item>, "asChild">) {
  return (
    <Radix.Item
      className={cn(
        "relative flex cursor-default items-center gap-3 rounded-md py-2 pr-3 pl-8 select-none",
        "outline-none data-highlighted:bg-muted data-highlighted:text-foreground",
        "data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
        className,
      )}
      {...rest}
      data-slot="select-item"
    >
      <Radix.ItemIndicator className="absolute left-3 flex items-center">
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 text-primary">
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
      <Radix.ItemText>{children}</Radix.ItemText>
    </Radix.Item>
  );
}

/**
 * 항목 묶음 — 시각 구분 없이 의미만 묶는다. 머리글은 `SelectLabel`, 구분선은 `SelectSeparator`.
 * @slot select-group
 */
export function SelectGroup({ className, ...rest }: React.ComponentPropsWithRef<typeof Radix.Group>) {
  return <Radix.Group className={cn(className)} {...rest} data-slot="select-group" />;
}

/**
 * 묶음의 머리글 — mono 대문자 미세라벨(DropdownMenuLabel 과 같은 모양). 고를 수 없다.
 * @slot select-label
 */
export function SelectLabel({ className, ...rest }: React.ComponentPropsWithRef<typeof Radix.Label>) {
  return (
    <Radix.Label
      className={cn(
        "px-3 py-2 font-mono text-micro tracking-caps text-muted-foreground uppercase",
        className,
      )}
      {...rest}
      data-slot="select-label"
    />
  );
}

/**
 * 묶음 사이 구분선 — 목록 상자의 안쪽 여백까지 가로지른다.
 * @slot select-separator
 */
export function SelectSeparator({ className, ...rest }: React.ComponentPropsWithRef<typeof Radix.Separator>) {
  return (
    <Radix.Separator
      className={cn("-mx-2 my-2 h-px bg-border", className)}
      {...rest}
      data-slot="select-separator"
    />
  );
}
