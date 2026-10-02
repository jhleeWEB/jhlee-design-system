"use client";
import { useState } from "react";

import { cn, type VariantProps } from "../cn";
import { inputVariants } from "./Input.variants";

/* 입력 — 수치와 글자를 나눈다.
 *
 * `numeric` 이 별도 prop 인 이유는 base 의 원칙 3 때문이다: 수치는 mono + tabular-nums 여야
 * 슬라이더를 움직일 때 자릿수가 흔들리지 않는다. 호출처가 매번 클래스를 적게 두면 반드시 빠진다. */

/** `<Input>` 의 props — `<input>` 속성 전부(ref 포함, 네이티브 `size` 제외) + `size` · `invalid` · `numeric` · `suffix`. */
export interface InputProps
  extends Omit<React.ComponentPropsWithRef<"input">, "size">, VariantProps<typeof inputVariants> {
  /**
   * 값 뒤에 붙는 단위 — "m", "m²", "%". 입력 안에 겹쳐 그리므로 값이 가려지지 않게 패딩을 준다.
   * 주면 `className` 은 입력이 아니라 래퍼(`data-slot="input-wrapper"`)로 간다.
   * @default undefined
   */
  suffix?: string | undefined;
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

/** 입력 — 글자와 수치. `numeric` 이면 mono + tabular-nums, `type="number"` 면 선행 0 정리와 0 전체선택을 한다. */
export function Input({
  ref,
  className,
  size,
  invalid,
  numeric,
  suffix,
  type,
  value,
  defaultValue,
  onChange,
  onInput,
  onFocus,
  onClick,
  onBlur,
  ...rest
}: InputProps) {
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
    <span
      data-slot="input-wrapper"
      className={suffix ? cn("relative inline-flex items-center", className) : "contents"}
    >
      <input
        aria-invalid={invalid || undefined}
        {...rest}
        ref={ref}
        data-slot="input"
        data-size={size ?? "md"}
        data-invalid={invalid ? "" : undefined}
        data-numeric={numeric ? "" : undefined}
        className={cn(inputVariants({ size, invalid, numeric }), !suffix && className)}
        type={type}
        value={
          controlledZero && incompleteNumber
            ? ""
            : type === "number" && typeof value === "string"
              ? stripLeadingZeros(value)
              : value
        }
        defaultValue={
          type === "number" && typeof defaultValue === "string"
            ? stripLeadingZeros(defaultValue)
            : defaultValue
        }
        onFocus={
          type === "number"
            ? (event) => {
                onFocus?.(event);
                if (!event.defaultPrevented) selectZeroForReplacement(event.currentTarget);
              }
            : onFocus
        }
        onClick={
          type === "number"
            ? (event) => {
                onClick?.(event);
                // 마우스 기본 동작이 포커스 때의 선택을 다시 접을 수 있어 클릭 완료 후에도 적용한다.
                if (!event.defaultPrevented) selectZeroForReplacement(event.currentTarget);
              }
            : onClick
        }
        onBlur={
          type === "number"
            ? (event) => {
                setIncompleteNumber(false);
                onBlur?.(event);
              }
            : onBlur
        }
        onChange={
          type === "number"
            ? (event) => {
                updateNumberInput(event.currentTarget);
                onChange?.(event);
              }
            : onChange
        }
        onInput={
          type === "number"
            ? (event) => {
                updateNumberInput(event.currentTarget);
                onInput?.(event);
              }
            : onInput
        }
        /* 오른쪽 패딩은 **접미사 길이에 따라** 잡는다. 고정값을 주면 "bays" 처럼 긴 단위가
           값 위에 겹친다(실측). `ch` 는 mono 글꼴에서 글자 하나 폭이므로 정확하다.
           `{...rest}` **뒤에** 와야 한다 — 앞에 두면 호출처의 `style` 이 통째로 덮어쓴다. */
        style={suffix ? { paddingRight: `calc(${suffix.length}ch + 10px)`, ...rest.style } : rest.style}
      />
      {suffix ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 font-mono text-micro text-muted-foreground"
        >
          {suffix}
        </span>
      ) : null}
    </span>
  );
}

/** `<Textarea>` 의 props — `<textarea>` 속성 전부(ref 포함) + `invalid`. */
export interface TextareaProps extends React.ComponentPropsWithRef<"textarea"> {
  /**
   * 검증 실패 — 파괴색 테두리와 `aria-invalid`.
   * @default false
   */
  invalid?: boolean;
}

/** 여러 줄 입력 — Input 의 `md` 모양에 높이만 풀었다(세로 크기 조절). */
export function Textarea({ className, invalid, ...rest }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      {...rest}
      data-slot="textarea"
      data-invalid={invalid ? "" : undefined}
      className={cn(
        inputVariants({ size: "md", invalid: invalid ?? false }),
        "h-auto min-h-(--size-textarea) resize-y py-3",
        className,
      )}
    />
  );
}
