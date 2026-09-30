"use client";
import {
  cloneElement,
  isValidElement,
  type ComponentPropsWithRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type SyntheticEvent,
} from "react";
import { Slot } from "radix-ui";

import { cn, type VariantProps } from "../cn";
import { normalizeTone, type ToneInput } from "../lib/tone";
import { buttonVariants, type ButtonTone } from "./Button.variants";
import { Spinner } from "../feedback/Spinner";

/* 버튼 — 크롬이다. 캔버스에는 버튼이 없다(도면 위 조작은 기즈모가 맡는다).
 *
 * `tone` 과 `variant` 를 가른 이유: 「위험한 동작」과 「주된 동작」은 **다른 축**이다.
 * 덱에서 실제로 필요했던 조합이 «위험하지만 보조인 버튼»(외곽선 빨강)과 «위험하고 주된
 * 버튼»(채움 빨강) 둘 다였는데, 한 축으로 합치면 그 중 하나를 표현할 수 없다. */

/** `<Button>` 의 props — `<button>` 속성 전부(ref 포함) + `variant` · `tone` · `size`. */
export interface ButtonProps
  extends ComponentPropsWithRef<"button">, Omit<VariantProps<typeof buttonVariants>, "tone"> {
  /**
   * 톤 — `neutral`(기본) · `primary`(주된 동작) · `destructive`(파괴적 동작).
   * @default "neutral"
   * @deprecated 옛 키 `accent` · `danger` 는 다음 마이너에서 제거 — `normalizeTone()` 이 한 마이너 동안 옮겨 준다(ds/legacy-tone --fix)
   */
  tone?: ToneInput<ButtonTone> | null | undefined;
  /**
   * 래퍼를 만들지 않고 자식 요소에 버튼 스타일을 입힌다 — 링크를 버튼으로 보이게 할 때.
   * @default false
   */
  asChild?: boolean;
  /**
   * 진행 중. 스피너로 라벨을 **대체하지 않는다** — 폭이 흔들리면 옆 버튼이 밀린다.
   * @default false
   */
  loading?: boolean | undefined;
}

const preventActivation = (event: SyntheticEvent) => {
  event.preventDefault();
  event.stopPropagation();
};
const guardKeyActivation =
  <T extends HTMLElement>(handler?: (event: KeyboardEvent<T>) => void) =>
  (event: KeyboardEvent<T>) => {
    if (event.key === "Enter" || event.key === " ") preventActivation(event);
    else handler?.(event);
  };
const guardedKeyboardProps = <T extends HTMLElement>(props: HTMLAttributes<T>) => ({
  onKeyDown: guardKeyActivation(props.onKeyDown),
  onKeyDownCapture: guardKeyActivation(props.onKeyDownCapture),
  onKeyUp: guardKeyActivation(props.onKeyUp),
  onKeyUpCapture: guardKeyActivation(props.onKeyUpCapture),
});
/* Slot은 자식 이벤트를 먼저 호출한다. 부모 핸들러만 막으면 자식의 저장·이동은 이미 실행된다.
 * 잠긴 동안만 양쪽의 활성화 핸들러를 막고 ref·class·비활성화 전 핸들러는 그대로 합성한다. */
const disabledSlotProps = {
  "aria-disabled": true,
  tabIndex: -1,
  onClick: preventActivation,
  onClickCapture: preventActivation,
  onAuxClick: preventActivation,
  onAuxClickCapture: preventActivation,
  onDoubleClickCapture: preventActivation,
  onPointerDownCapture: preventActivation,
  onPointerUpCapture: preventActivation,
  onMouseDownCapture: preventActivation,
  onMouseUpCapture: preventActivation,
} satisfies HTMLAttributes<HTMLElement>;

/**
 * 버튼 — 크롬의 동작. `variant`(외형)와 `tone`(판정색)은 다른 축이다.
 *
 * `data-slot` 은 `{...rest}` **앞**에 둔다(공통 계약의 slot-locked 예외) — Toast · Modal · Drawer 의 닫기 버튼과 동결된 legacy Select 가
 * `data-slot` 을 넘겨 자기 이름을 붙이고, legacy/shell.css 가 `[data-slot="select"]` 로 그 버튼을 그린다. 잠그면 그 셋이 이름을 잃는다.
 */
export function Button({
  ref,
  className,
  variant,
  tone,
  size,
  asChild,
  loading,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  const blocked = Boolean(disabled || loading);
  const child =
    asChild && blocked && isValidElement(children)
      ? cloneElement(
          children as ReactElement<
            HTMLAttributes<HTMLElement> & { disabled?: boolean | undefined; href?: string | undefined }
          >,
          {
            ...disabledSlotProps,
            ...guardedKeyboardProps(children.props as HTMLAttributes<HTMLElement>),
            disabled: children.type === "a" ? undefined : true,
            ...(children.type === "a"
              ? {
                  href: undefined,
                  role: (children.props as HTMLAttributes<HTMLElement>).role ?? "link",
                }
              : {}),
          },
        )
      : children;
  const resolvedTone = normalizeTone(tone);
  return (
    <Comp
      ref={ref}
      data-slot="button"
      data-variant={variant ?? "outline"}
      data-tone={resolvedTone ?? "neutral"}
      data-size={size ?? "md"}
      data-loading={loading ? "" : undefined}
      className={cn(buttonVariants({ variant, tone: resolvedTone, size }), className)}
      disabled={blocked}
      aria-busy={loading || undefined}
      {...rest}
      {...(asChild && blocked ? { ...disabledSlotProps, ...guardedKeyboardProps(rest) } : {})}
    >
      {loading ? <Spinner size="sm" /> : null}
      {/* `asChild` 일 때 Slot 은 **요소 하나**만 받는다. 스피너와 children 을 나란히 두면
          자식이 둘이 되어 "Slot failed to slot onto its children" 으로 죽는다 — Slottable 이
          «이쪽이 슬롯 대상» 이라고 표시해 주므로 로딩과 asChild 가 함께 설 수 있다. */}
      {asChild ? <Slot.Slottable>{child}</Slot.Slottable> : children}
    </Comp>
  );
}

/** 버튼 묶음 — 사이 경계를 하나로 접어 «한 덩어리» 로 읽히게 한다. */
export function ButtonGroup({ className, ...rest }: ComponentPropsWithRef<"div">) {
  return (
    <div
      role="group"
      {...rest}
      data-slot="button-group"
      className={cn(
        "inline-flex [&>*]:rounded-none",
        "[&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md",
        "[&>*+*]:-ml-px [&>*:focus-visible]:relative [&>*:focus-visible]:z-raised",
        className,
      )}
    />
  );
}
