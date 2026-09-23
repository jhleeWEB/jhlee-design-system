import { forwardRef, type ButtonHTMLAttributes } from "react";
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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, tone, size, asChild, loading, disabled, children, ...rest },
  ref,
) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      ref={ref}
      data-slot="button"
      data-loading={loading || undefined}
      className={cn(buttonVariants({ variant, tone, size }), className)}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : null}
      {/* `asChild` 일 때 Slot 은 **요소 하나**만 받는다. 스피너와 children 을 나란히 두면
          자식이 둘이 되어 "Slot failed to slot onto its children" 으로 죽는다 — Slottable 이
          «이쪽이 슬롯 대상» 이라고 표시해 주므로 로딩과 asChild 가 함께 설 수 있다. */}
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
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
