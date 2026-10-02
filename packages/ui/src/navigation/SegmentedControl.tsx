"use client";
import type { HTMLAttributes, ReactNode, RefAttributes } from "react";

import { cn } from "../cn";
import { segmentedControlItemVariants, segmentedControlVariants } from "./SegmentedControl.variants";

/* 세그먼트 컨트롤 — 배타적 뷰 전환(Plan ↔ Model).
 *
 * 참고 화면 실측: 옅은 파란 트랙(#e6eff8) 위에 **흰 pill** 이 얹히고 활성 글자만 파랗다.
 * 활성 칸을 액센트로 통째로 칠하지 않는 이유가 있다 — 이 컨트롤은 상단바에 상시 떠 있고,
 * 채워진 파란 칸은 그 옆의 주 동작 버튼(같은 파랑 채움)과 무게가 같아져 «무엇이 동작이고
 * 무엇이 현재 상태인가» 가 흐려진다. 트랙+pill 은 상태를, 채움은 동작을 말한다.
 *
 * `controls.tsx`의 기존 Segmented도 DS를 선택한 앱에서는 이 구현을 쓴다. */

/** 세그먼트 한 칸. */
export interface SegmentedOption<T extends string | number> {
  /** 칸이 고르는 값 — `onChange` 로 돌아온다. */
  value: T;
  /** 칸에 보일 이름. */
  label: ReactNode;
  /**
   * 이 칸만 고를 수 없게 한다 — 키보드 이동에서도 건너뛴다.
   * @default false
   */
  disabled?: boolean;
}

/** `SegmentedControl` 의 props — `<div>` 속성(ref 는 radiogroup 뿌리에 닿는다)에 값·선택지를 더한다. */
export interface SegmentedControlProps<T extends string | number>
  extends
    Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "role">,
    RefAttributes<HTMLDivElement> {
  /** 고를 수 있는 값들 — 왼쪽부터 이 순서로 놓인다. */
  options: readonly SegmentedOption<T>[];
  /** 지금 고른 값(제어). */
  value: T;
  /** 칸을 누르거나 화살표·Home·End 로 옮겼을 때 새 값을 받는다. */
  onChange: (value: T) => void;
  /** 스크린리더가 읽는 이 컨트롤의 이름 — "View mode" 처럼. */
  label: string;
  /**
   * 크기 — 트랙 높이(칸 + 여백 4px × 2, #80).
   * - `sm` — 30px(작은 컨트롤 높이) · 칸 22px · 라벨 글자
   * - `md` — 36px(기본 컨트롤 높이) · 칸 28px · 컨트롤 글자
   * @default "md"
   */
  size?: "sm" | "md";
  /**
   * 컨트롤 전체를 고를 수 없게 한다 — 탭 순서에서도 빠진다.
   * @default false
   */
  disabled?: boolean;
}

/** 배타적 뷰 전환 — 트랙 위의 흰 pill 이 지금 고른 값이다(radiogroup · roving tabindex). */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  label,
  size,
  className,
  disabled = false,
  onKeyDown,
  ...rest
}: SegmentedControlProps<T>) {
  const enabled = options.filter((option) => !option.disabled);
  const tabStop = disabled ? undefined : (enabled.find((option) => option.value === value) ?? enabled[0]);
  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      {...rest}
      data-slot="segmented"
      data-size={size ?? "md"}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          disabled ||
          event.defaultPrevented ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        )
          return;
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
        const target =
          event.target instanceof Element ? event.target.closest<HTMLButtonElement>('[role="radio"]') : null;
        if (!target || target.disabled) return;
        const buttons = Array.from(
          event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'),
        );
        // 외부 제어 값의 반영이 늦어도 연속 키 입력은 실제 포커스에서 계속 이동해야 한다.
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (index < 0 || enabled.length === 0) return;
        const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
        const next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? enabled.length - 1
              : (index + delta + enabled.length) % enabled.length;
        const option = enabled[next];
        if (!option) return;
        event.preventDefault();
        onChange(option.value);
        buttons[next]?.focus();
      }}
      className={cn(segmentedControlVariants(), className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            data-slot="segmented-option"
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled || option.disabled}
            tabIndex={option === tabStop ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              segmentedControlItemVariants({ size }),
              /* 동심원 — 안쪽 반경 = 바깥(rounded-md) − 패딩(p-1) = 8 − 4 = 4px(#80, 예전 p-0.5 에서는 6px). 바깥 토큰이 바뀌면 안쪽이 따라간다. */
              "rounded-[calc(var(--radius-md)-var(--spacing))]",
              active ? "bg-card text-primary shadow-chip" : "text-muted-foreground hover:text-foreground-2",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
