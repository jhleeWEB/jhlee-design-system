"use client";
import { useState } from "react";

import { cn } from "../cn";
import { Input, type InputProps } from "./Input";
import { numberInputStepperVariants } from "./NumberInput.variants";

/* 수치 입력 — Input(`type="number"`) 위에 범위 · 보폭 · 단위 · 증감 버튼을 얹는다.
 *
 * Input 위에 짓는 이유: 선행 0 정리(`0234` → `234`)와 «값이 0 이면 클릭이 전체 선택» 은 Input 의 문서화된 계약이다
 * (CLAUDE.md · documented-contracts.spec). 다시 구현하면 두 벌이 갈라진다. 그래서 입력 칸은 Input 그대로이고 여기는 값의 수명만 든다.
 *
 * 값은 두 층이다. **초안**(지금 칸에 적힌 글자)과 **확정 값**(`value` · `onValueChange`). 타이핑 중에는 범위 안의 수일 때만 확정한다 —
 * min 100 인 칸에 «150» 을 치는 동안 «1» · «15» 를 경계로 당기면 칠 수가 없다. 범위 밖이거나 빈 초안은 칸을 떠날 때(blur · Enter)
 * 경계로 당기거나(clamp) 마지막 확정 값으로 되돌린다. 그래서 `onValueChange` 는 언제나 min–max 안의 수만 받는다.
 * 키보드 ↑↓ 는 `step`, Shift 와 함께면 ×10 이다 — 네이티브 스피너는 Shift 를 모르고 24px 칸에서 잡을 수 없어 Input 이 숨겼다. */

/** `NumberInput` 의 props — Input 의 속성(ref 는 실제 `<input>` 에 닿는다)에서 글자용 값 · 단위 prop 을 수치용으로 바꿨다. */
export interface NumberInputProps extends Omit<
  InputProps,
  "type" | "value" | "defaultValue" | "onChange" | "suffix" | "numeric" | "min" | "max" | "step"
> {
  /**
   * 확정 값(제어). 주지 않으면 `defaultValue` 에서 시작해 스스로 든다.
   * @default undefined
   */
  value?: number | undefined;
  /**
   * 처음 확정 값(비제어). 둘 다 없으면 빈 칸이다.
   * @default undefined
   */
  defaultValue?: number | undefined;
  /**
   * 확정될 때마다 새 값을 받는다 — 언제나 `min`–`max` 안의 수다.
   * @default undefined
   */
  onValueChange?: ((value: number) => void) | undefined;
  /**
   * 검증 실패 — 파괴색 테두리와 `aria-invalid`(Input 의 같은 이름).
   * @default false
   */
  invalid?: boolean | null | undefined;
  /**
   * 아래 경계 — 칸을 떠날 때와 증감할 때 여기로 당긴다.
   * @default undefined
   */
  min?: number | undefined;
  /**
   * 위 경계 — 칸을 떠날 때와 증감할 때 여기로 당긴다.
   * @default undefined
   */
  max?: number | undefined;
  /**
   * 보폭 — ↑↓ 와 증감 버튼 한 번의 크기. Shift 와 함께면 ×10. 결과는 보폭의 소수 자릿수로 반올림한다(0.1 + 0.2 의 부동소수 꼬리를 지운다).
   * @default 1
   */
  step?: number;
  /**
   * 값 뒤의 단위 — "m", "m²", "%". 입력 안에 겹쳐 그린다(Input 의 `suffix`).
   * @default undefined
   */
  unit?: string | undefined;
  /**
   * 오른쪽에 −/+ 버튼을 둔다. 버튼은 탭 순서에 들지 않는다 — 키보드는 칸 안의 ↑↓ 가 같은 일을 한다.
   * @default true
   */
  stepper?: boolean;
  /**
   * − 버튼의 접근 가능한 이름.
   * @default "Decrease"
   */
  decrementLabel?: string;
  /**
   * + 버튼의 접근 가능한 이름.
   * @default "Increase"
   */
  incrementLabel?: string;
}

const decimals = (n: number): number => {
  if (!Number.isFinite(n)) return 0;
  const [, fraction = ""] = String(n).split(".");
  return fraction.length;
};

const format = (n: number | undefined): string => (n === undefined ? "" : String(n));

/** 빈 글자 · 불완전한 수는 NaN — `Number("")` 는 0 이라 따로 거른다. */
const parse = (text: string): number => (text.trim() === "" ? Number.NaN : Number(text));

function Glyph({ plus }: { plus: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d={plus ? "M3.5 8h9M8 3.5v9" : "M3.5 8h9"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 수치 입력 — 범위(`min` · `max`) · 보폭(`step`, Shift ×10) · 단위(`unit`) · 증감 버튼(`stepper`). 값은 mono + tabular-nums 로 오른쪽 정렬이다.
 * 선행 0 정리와 «0 이면 클릭이 전체 선택» 은 Input(`type="number"`)의 계약을 그대로 물려받는다.
 * `className` 은 바깥 줄(`data-slot="number-input"`)로, 나머지 속성 · ref 는 입력 칸으로 간다.
 * @slot number-input
 */
export function NumberInput({
  className,
  size,
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  step = 1,
  unit,
  stepper = true,
  decrementLabel = "Decrease",
  incrementLabel = "Increase",
  disabled,
  readOnly,
  onKeyDown,
  onBlur,
  ...rest
}: NumberInputProps) {
  const [inner, setInner] = useState(defaultValue);
  const committed = value ?? inner;
  const [draft, setDraft] = useState(() => format(committed));
  // 밖에서 값이 바뀌면 초안을 따라 바꾼다 — 단, 초안이 이미 그 수를 말하고 있으면(방금 타이핑으로 확정한 값의 메아리) 글자를 건드리지 않는다.
  const [seen, setSeen] = useState(committed);
  if (seen !== committed) {
    setSeen(committed);
    if (parse(draft) !== committed) setDraft(format(committed));
  }

  const clamp = (n: number): number => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
  const commit = (n: number) => {
    if (value === undefined) setInner(n);
    setSeen(n);
    if (n !== committed) onValueChange?.(n);
  };
  const finalize = () => {
    const n = parse(draft);
    if (Number.isNaN(n)) {
      setDraft(format(committed));
      return;
    }
    const next = clamp(n);
    setDraft(format(next));
    commit(next);
  };
  const stepBy = (direction: 1 | -1, large: boolean) => {
    const typed = parse(draft);
    const base = Number.isNaN(typed) ? (committed ?? min ?? 0) : typed;
    const delta = step * (large ? 10 : 1) * direction;
    const precision = Math.max(decimals(step), decimals(base));
    const next = clamp(Number((base + delta).toFixed(precision)));
    setDraft(format(next));
    commit(next);
  };

  const locked = Boolean(disabled) || Boolean(readOnly);
  const atMin = min !== undefined && committed !== undefined && committed <= min;
  const atMax = max !== undefined && committed !== undefined && committed >= max;

  return (
    <div
      data-slot="number-input"
      data-size={size ?? "md"}
      className={cn("inline-flex w-full min-w-0 items-center gap-1", className)}
    >
      <Input
        inputMode="decimal"
        {...rest}
        type="number"
        numeric
        size={size}
        suffix={unit}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        readOnly={readOnly}
        className="min-w-0 flex-1"
        value={draft}
        onChange={(event) => {
          const text = event.currentTarget.value;
          setDraft(text);
          const n = parse(text);
          if (!Number.isNaN(n) && clamp(n) === n) commit(n);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || locked) return;
          if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            stepBy(event.key === "ArrowUp" ? 1 : -1, event.shiftKey);
          } else if (event.key === "Enter") {
            finalize();
          }
        }}
        onBlur={(event) => {
          finalize();
          onBlur?.(event);
        }}
      />
      {stepper ? (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-label={decrementLabel}
            data-slot="number-input-decrement"
            disabled={locked || atMin}
            className={numberInputStepperVariants({ size })}
            // 누를 때 칸의 포커스를 빼앗지 않는다 — 연달아 눌러도 초안이 칸 안에서 이어진다.
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => stepBy(-1, event.shiftKey)}
          >
            <Glyph plus={false} />
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label={incrementLabel}
            data-slot="number-input-increment"
            disabled={locked || atMax}
            className={numberInputStepperVariants({ size })}
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => stepBy(1, event.shiftKey)}
          >
            <Glyph plus />
          </button>
        </>
      ) : null}
    </div>
  );
}
