import { forwardRef } from "react";

import { cn, cva, type VariantProps } from "../cn";

/* 입력 — 수치와 글자를 나눈다.
 *
 * `numeric` 이 별도 prop 인 이유는 base 의 원칙 3 때문이다: 수치는 mono + tabular-nums 여야
 * 슬라이더를 움직일 때 자릿수가 흔들리지 않는다. 호출처가 매번 클래스를 적게 두면 반드시 빠진다. */
const fieldVariants = cva(
  [
    "w-full min-w-0 border bg-surface-2 text-ink",
    "rounded-control transition-colors duration-100",
    "placeholder:text-disabled",
    "focus-visible:focus-ring focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-45",
    /* 숫자 입력의 스피너는 24px 높이에서 잡을 수 없는 크기가 된다 — 드래그와 키보드로 바꾼다. */
    "[&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none",
    "[&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none",
    "[-moz-appearance:textfield]",
  ],
  {
    variants: {
      size: {
        sm: "h-ctl-sm px-3 text-body",
        md: "h-ctl px-3 text-control",
        lg: "h-ctl-lg px-4 text-control",
      },
      invalid: {
        true: "border-danger focus-visible:outline-danger",
        false: "border-line-strong hover:border-ink-2",
      },
      numeric: { true: "tnum text-right", false: "" },
    },
    defaultVariants: { size: "md", invalid: false, numeric: false },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof fieldVariants> {
  /** 값 뒤에 붙는 단위 — "m", "m²", "%". 입력 안에 겹쳐 그리므로 값이 가려지지 않게 패딩을 준다. */
  suffix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, size, invalid, numeric, suffix, ...rest },
  ref,
) {
  /* 접미사가 있으면 **래퍼가 폭을 갖는다.** 래퍼를 `w-full` 로 두고 입력에만 폭 클래스를 주면
     접미사가 행 끝까지 밀려난다(절대 배치의 기준이 래퍼이기 때문). 그래서 `className` 은
     래퍼로 가고 입력은 그 안을 채운다. 접미사가 없는 래퍼는 레이아웃 상자를 만들지 않는다.
     두 경우 모두 같은 input을 유지해야 단위가 바뀔 때 포커스·선택 영역·비제어 값이 남는다. */
  return (
    <span data-slot="input-wrapper" className={suffix ? cn("relative inline-flex items-center", className) : "contents"}>
      <input
        ref={ref}
        data-slot="input"
        aria-invalid={invalid || undefined}
        className={cn(fieldVariants({ size, invalid, numeric }), !suffix && className)}
        {...rest}
        /* 오른쪽 패딩은 **접미사 길이에 따라** 잡는다. 고정값을 주면 "bays" 처럼 긴 단위가
           값 위에 겹친다(실측). `ch` 는 mono 글꼴에서 글자 하나 폭이므로 정확하다.
           `{...rest}` **뒤에** 와야 한다 — 앞에 두면 호출처의 `style` 이 통째로 덮어쓴다. */
        style={suffix ? { paddingRight: `calc(${suffix.length}ch + 10px)`, ...rest.style } : rest.style}
      />
      {suffix ? <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 font-mono text-micro text-muted"
      >
        {suffix}
      </span> : null}
    </span>
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> & { invalid?: boolean }
>(function Textarea({ className, invalid, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      aria-invalid={invalid || undefined}
      className={cn(
        fieldVariants({ size: "md", invalid: invalid ?? false }),
        "h-auto min-h-[56px] resize-y py-3 leading-relaxed",
        className,
      )}
      {...rest}
    />
  );
});
