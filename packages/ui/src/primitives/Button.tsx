import { cloneElement, forwardRef, isValidElement, type ButtonHTMLAttributes, type HTMLAttributes, type KeyboardEvent, type ReactElement, type SyntheticEvent } from "react";
import { Slot } from "radix-ui";

import { cn, cva, type VariantProps } from "../cn";
import { Spinner } from "../feedback/Spinner";

/* 버튼 — 크롬이다. 캔버스에는 버튼이 없다(도면 위 조작은 기즈모가 맡는다).
 *
 * `tone` 과 `variant` 를 가른 이유: 「위험한 동작」과 「주된 동작」은 **다른 축**이다.
 * 덱에서 실제로 필요했던 조합이 «위험하지만 보조인 버튼»(외곽선 빨강)과 «위험하고 주된
 * 버튼»(채움 빨강) 둘 다였는데, 한 축으로 합치면 그 중 하나를 표현할 수 없다. */
export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-3 whitespace-nowrap",
    "font-sans text-control leading-none",
    /* preflight 가 없으므로 `border` 만으로는 UA 테두리 스타일이 남는다 — solid 를 명시한다. */
    "cursor-pointer appearance-none rounded-control border border-solid transition-colors duration-100",
    "focus-visible:focus-ring focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-45",
    "aria-disabled:pointer-events-none aria-disabled:opacity-45",
    /* 아이콘만 든 버튼이 정사각이 되도록. 텍스트가 있으면 패딩이 이긴다. */
    "[&_svg]:size-7 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        solid: "",
        outline: "bg-surface",
        ghost: "border-transparent bg-transparent",
        link: "h-auto border-transparent bg-transparent p-0 underline-offset-2 hover:underline",
      },
      tone: {
        neutral: "",
        accent: "",
        danger: "",
      },
      size: {
        sm: "h-ctl-sm px-3",
        md: "h-ctl px-4",
        lg: "h-ctl-lg px-6",
        /* 아이콘 전용 — 가로 패딩을 빼고 정사각으로 만든다. */
        "icon-sm": "h-ctl-sm w-ctl-sm p-0",
        icon: "h-ctl w-ctl p-0",
        "icon-lg": "h-ctl-lg w-ctl-lg p-0",
      },
    },
    compoundVariants: [
      /* `link` 는 **상자가 없다.** `size` 가 주는 높이·가로 패딩을 여기서 되돌린다 —
         compoundVariants 가 variants 뒤에 이어 붙으므로 이 한 줄이 이긴다.
         이게 없으면 `variant="link" size="sm"` 이 30px 높이와 12px 패딩을 달고 나와
         글자처럼 보여야 할 것이 칩이 된다(#1202 의 적대적 검토가 잡았다). */
      { variant: "link", class: "h-auto px-0 py-0" },
      { variant: "solid", tone: "neutral", class: "border-line-strong bg-surface-2 text-ink hover:bg-surface-3" },
      { variant: "solid", tone: "accent", class: "border-accent bg-accent text-accent-ink hover:border-accent-hover hover:bg-accent-hover" },
      { variant: "solid", tone: "danger", class: "border-danger bg-danger text-white hover:brightness-110" },
      { variant: "outline", tone: "neutral", class: "border-line-strong text-ink hover:bg-surface-2" },
      { variant: "outline", tone: "accent", class: "border-accent text-accent hover:bg-accent-soft" },
      { variant: "outline", tone: "danger", class: "border-danger text-danger hover:bg-danger-soft" },
      { variant: "ghost", tone: "neutral", class: "text-muted hover:bg-surface-2 hover:text-ink" },
      { variant: "ghost", tone: "accent", class: "text-accent hover:bg-accent-soft" },
      { variant: "ghost", tone: "danger", class: "text-danger hover:bg-danger-soft" },
      { variant: "link", tone: "neutral", class: "text-ink" },
      { variant: "link", tone: "accent", class: "text-accent" },
      { variant: "link", tone: "danger", class: "text-danger" },
    ],
    defaultVariants: { variant: "outline", tone: "neutral", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** 래퍼를 만들지 않고 자식 요소에 버튼 스타일을 입힌다 — 링크를 버튼으로 보이게 할 때. */
  asChild?: boolean;
  /** 진행 중. 스피너로 라벨을 **대체하지 않는다** — 폭이 흔들리면 옆 버튼이 밀린다. */
  loading?: boolean | undefined;
}

const preventActivation = (event: SyntheticEvent) => {
  event.preventDefault();
  event.stopPropagation();
};
const guardKeyActivation = <T extends HTMLElement>(handler?: (event: KeyboardEvent<T>) => void) => (event: KeyboardEvent<T>) => {
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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, tone, size, asChild, loading, disabled, children, ...rest },
  ref,
) {
  const Comp = asChild ? Slot.Root : "button";
  const blocked = Boolean(disabled || loading);
  const child = asChild && blocked && isValidElement(children)
    ? cloneElement(children as ReactElement<HTMLAttributes<HTMLElement> & { disabled?: boolean | undefined; href?: string | undefined }>, {
      ...disabledSlotProps,
      ...guardedKeyboardProps(children.props as HTMLAttributes<HTMLElement>),
      disabled: children.type === "a" ? undefined : true,
      ...(children.type === "a" ? {
        href: undefined,
        role: (children.props as HTMLAttributes<HTMLElement>).role ?? "link",
      } : {}),
    })
    : children;
  return (
    <Comp
      ref={ref}
      data-slot="button"
      data-loading={loading || undefined}
      className={cn(buttonVariants({ variant, tone, size }), className)}
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
});

/* 버튼 묶음 — 사이 경계를 하나로 접어 «한 덩어리» 로 읽히게 한다. */
export function ButtonGroup({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      className={cn(
        "inline-flex [&>*]:rounded-none",
        "[&>*:first-child]:rounded-l-control [&>*:last-child]:rounded-r-control",
        "[&>*+*]:-ml-px [&>*:focus-visible]:relative [&>*:focus-visible]:z-1",
        className,
      )}
      {...rest}
    />
  );
}
