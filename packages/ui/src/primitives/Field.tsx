"use client";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState } from "react";
import { Label as RadixLabel, Slot } from "radix-ui";

import { cn, type VariantProps } from "../cn";
import { fieldVariants } from "./Field.variants";

/* 필드 — 라벨 · 컨트롤 · 설명 · 오류를 **id 로 잇는 일**을 소유한다.
 *
 * 레거시 `Field`(src/legacy/shell.tsx)는 라벨과 값 표시를 나란히 그리는 레이아웃일 뿐이라 라벨이 컨트롤과 이어지지 않았다 —
 * 스크린리더는 입력의 이름을 몰랐고 호출처마다 `aria-label` 을 따로 적었다. 여기서는 루트가 id 를 만들고(useId) 부품이 그 id 를
 * 나눠 쓴다: `FieldLabel` 의 htmlFor · `FieldControl` 의 id · aria-describedby · aria-invalid(#47).
 *
 * aria-describedby 는 **지금 그려진** 설명·오류만 가리킨다 — 없는 id 를 가리키면 axe 가 잡고(aria-valid-attr-value) 스크린리더는 빈 설명을 읽는다.
 * 그래서 설명·오류는 마운트될 때 루트에 자기 존재를 알린다. */

interface FieldContextValue {
  readonly controlId: string;
  readonly descriptionId: string;
  readonly errorId: string;
  readonly invalid: boolean;
  readonly disabled: boolean;
  readonly hasDescription: boolean;
  readonly hasError: boolean;
  readonly register: (part: "description" | "error") => () => void;
}

const FieldContext = createContext<FieldContextValue | null>(null);

function useFieldContext(part: string): FieldContextValue {
  const context = useContext(FieldContext);
  if (!context) throw new Error(`${part} 은 <Field> 안에서만 쓴다`);
  return context;
}

/** `Field` 의 props — `<div>` 속성(ref 포함) + `orientation` · `invalid` · `disabled`. */
export interface FieldProps extends React.ComponentPropsWithRef<"div">, VariantProps<typeof fieldVariants> {
  /**
   * 검증 실패 — 컨트롤에 `aria-invalid` 를 꽂는다. 주지 않아도 `FieldError` 에 내용이 있으면 실패로 본다.
   * @default false
   */
  invalid?: boolean;
  /**
   * 필드 전체를 비활성으로 — 컨트롤에 `disabled` 를 꽂고 라벨을 흐리게 한다.
   * @default false
   */
  disabled?: boolean;
}

/**
 * 필드의 루트 — 라벨 · 컨트롤 · 설명 · 오류가 쓸 id 를 만들어 나눠 준다. 배치는 `orientation`(위아래 · 한 줄)만 고른다.
 * @slot field
 */
export function Field({ className, orientation, invalid = false, disabled = false, ...rest }: FieldProps) {
  const base = useId();
  const [parts, setParts] = useState({ description: 0, error: 0 });
  const register = useCallback((part: "description" | "error") => {
    setParts((prev) => ({ ...prev, [part]: prev[part] + 1 }));
    return () => setParts((prev) => ({ ...prev, [part]: prev[part] - 1 }));
  }, []);
  const hasError = parts.error > 0;
  const value = useMemo<FieldContextValue>(
    () => ({
      controlId: `${base}-control`,
      descriptionId: `${base}-description`,
      errorId: `${base}-error`,
      invalid: invalid || hasError,
      disabled,
      hasDescription: parts.description > 0,
      hasError,
      register,
    }),
    [base, invalid, disabled, parts.description, hasError, register],
  );
  return (
    <FieldContext.Provider value={value}>
      <div
        className={cn(fieldVariants({ orientation }), className)}
        {...rest}
        data-slot="field"
        data-orientation={orientation ?? "vertical"}
        data-invalid={value.invalid ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
      />
    </FieldContext.Provider>
  );
}

/**
 * 컨트롤의 이름 — `htmlFor` 가 `FieldControl` 의 id 를 가리키므로 누르면 컨트롤로 간다. 필드가 비활성이면 흐려진다.
 * @slot field-label
 */
export function FieldLabel({ className, ...rest }: React.ComponentPropsWithRef<typeof RadixLabel.Root>) {
  const field = useFieldContext("FieldLabel");
  return (
    <RadixLabel.Root
      htmlFor={field.controlId}
      className={cn(
        "text-label font-medium text-foreground select-none",
        field.disabled && "pointer-events-none opacity-45",
        className,
      )}
      {...rest}
      data-slot="field-label"
    />
  );
}

/** `FieldControl` 의 props — 자식 컨트롤 하나(`Input` · `Textarea` · `SelectTrigger` · `Checkbox` …)와 그 위에 얹을 속성. */
export interface FieldControlProps extends React.ComponentPropsWithRef<typeof Slot.Root> {
  /**
   * 필드의 설명·오류 **밖의** 설명 id — 필드가 만든 id 뒤에 이어 붙는다.
   * 자식에 직접 `aria-describedby` 를 적으면 이 연결 전체를 덮으니 여기로 넘긴다.
   * @default undefined
   */
  "aria-describedby"?: string | undefined;
}

/**
 * 컨트롤 자리 — 자식 컨트롤 하나에 id · `aria-describedby`(그려진 설명 · 오류) · `aria-invalid` · `disabled` 를 꽂는다.
 * 자기 DOM 은 없다(Radix `Slot`) — `data-slot` 은 자식의 것(`input` · `select-trigger` · `checkbox` …)이 남는다.
 * 자식에 `id` 를 따로 적지 않는다 — 라벨의 `htmlFor` 와 어긋난다.
 */
export function FieldControl({ "aria-describedby": describedBy, ...rest }: FieldControlProps) {
  const field = useFieldContext("FieldControl");
  const ids = [
    field.hasDescription ? field.descriptionId : undefined,
    field.hasError ? field.errorId : undefined,
    describedBy,
  ].filter(Boolean);
  // `disabled` 는 HTMLAttributes 에 없어 Slot 의 타입이 받지 않는다 — 자식(button · input · textarea)은 받으므로 한 덩어리로 넘긴다.
  const wired = {
    id: field.controlId,
    "aria-describedby": ids.length > 0 ? ids.join(" ") : undefined,
    "aria-invalid": field.invalid || undefined,
    disabled: field.disabled || undefined,
  } as React.HTMLAttributes<HTMLElement>;
  return <Slot.Root {...wired} {...rest} />;
}

/**
 * 컨트롤 아래의 도움말 — 컨트롤의 `aria-describedby` 에 실린다. 흐린 라벨 글자.
 * @slot field-description
 */
export function FieldDescription({ className, ...rest }: React.ComponentPropsWithRef<"p">) {
  const field = useFieldContext("FieldDescription");
  const { register } = field;
  useEffect(() => register("description"), [register]);
  return (
    <p
      id={field.descriptionId}
      className={cn("text-label text-muted-foreground", className)}
      {...rest}
      data-slot="field-description"
    />
  );
}

/**
 * 검증 오류 문장 — 내용이 있을 때만 그려지고, 그려지면 필드를 실패(`aria-invalid`)로 만들며 `aria-describedby` 에 실린다.
 * 파괴색 글자다 — 색만으로 말하지 않도록 문장이 곧 신호다(원칙 2).
 * @slot field-error
 */
export function FieldError({ className, children, ...rest }: React.ComponentPropsWithRef<"p">) {
  const field = useFieldContext("FieldError");
  const { register } = field;
  const shown = children !== undefined && children !== null && children !== false && children !== "";
  useEffect(() => (shown ? register("error") : undefined), [register, shown]);
  if (!shown) return null;
  return (
    <p
      id={field.errorId}
      className={cn("text-label text-destructive", className)}
      {...rest}
      data-slot="field-error"
    >
      {children}
    </p>
  );
}
