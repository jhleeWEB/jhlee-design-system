import { forwardRef, useState } from "react";

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

// Number 변환은 소수부의 0·지수·빈 입력까지 바꾸므로 정수부의 중복 0만 지운다.
const stripLeadingZeros = (value: string) => value.replace(/^([+-]?)0+(?=\d)/, "$1");

function normalizeNumberInput(input: HTMLInputElement) {
  const normalized = stripLeadingZeros(input.value);
  // React는 "01"과 숫자 1을 같은 값으로 보고 DOM을 유지하므로 표시 문자열도 함께 정리한다.
  // number 입력은 선택 범위 API를 지원하지 않는다. 바뀐 문자열에만 값을 대입한다.
  if (input.value !== normalized) input.value = normalized;
}

function selectZeroForReplacement(input: HTMLInputElement) {
  // 기본 0 앞에 커서를 놓으면 새 숫자 뒤에 0이 남는다. 값은 유지하고 다음 입력이 0을 대체하게 한다.
  if (!input.readOnly && !input.disabled && input.value === "0") input.select();
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, size, invalid, numeric, suffix, type, value, defaultValue, onChange, onInput, onFocus, onClick, onBlur, ...rest },
  ref,
) {
  const [incompleteNumber, setIncompleteNumber] = useState(false);
  const controlledZero = type === "number" && (value === 0 || value === "0");
  // 외부에서 다른 값을 적용하면 이전 편집의 보류 상태가 나중의 0에 다시 적용되지 않게 한다.
  if (incompleteNumber && !controlledZero) setIncompleteNumber(false);
  const updateNumberInput = (input: HTMLInputElement) => {
    normalizeNumberInput(input);
    // "."·"-"는 브라우저 내부에만 남고 value는 빈 문자열이다. React가 0을 재대입하면 다음 자릿수의 의미가 바뀐다.
    setIncompleteNumber(value != null && input.value === "" && input.validity.badInput);
  };

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
        type={type}
        value={controlledZero && incompleteNumber ? "" : type === "number" && typeof value === "string" ? stripLeadingZeros(value) : value}
        defaultValue={type === "number" && typeof defaultValue === "string" ? stripLeadingZeros(defaultValue) : defaultValue}
        onFocus={type === "number" ? event => {
          onFocus?.(event);
          if (!event.defaultPrevented) selectZeroForReplacement(event.currentTarget);
        } : onFocus}
        onClick={type === "number" ? event => {
          onClick?.(event);
          // 마우스 기본 동작이 포커스 때의 선택을 다시 접을 수 있어 클릭 완료 후에도 적용한다.
          if (!event.defaultPrevented) selectZeroForReplacement(event.currentTarget);
        } : onClick}
        onBlur={type === "number" ? event => {
          setIncompleteNumber(false);
          onBlur?.(event);
        } : onBlur}
        onChange={type === "number" ? event => {
          updateNumberInput(event.currentTarget);
          onChange?.(event);
        } : onChange}
        onInput={type === "number" ? event => {
          updateNumberInput(event.currentTarget);
          onInput?.(event);
        } : onInput}
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
