"use client";
import { cn } from "../cn";

/* 세그먼트 컨트롤 — 배타적 뷰 전환(Plan ↔ Model).
 *
 * 참고 화면 실측: 옅은 파란 트랙(#e6eff8) 위에 **흰 pill** 이 얹히고 활성 글자만 파랗다.
 * 활성 칸을 액센트로 통째로 칠하지 않는 이유가 있다 — 이 컨트롤은 상단바에 상시 떠 있고,
 * 채워진 파란 칸은 그 옆의 주 동작 버튼(같은 파랑 채움)과 무게가 같아져 «무엇이 동작이고
 * 무엇이 현재 상태인가» 가 흐려진다. 트랙+pill 은 상태를, 채움은 동작을 말한다.
 *
 * `controls.tsx`의 기존 Segmented도 DS를 선택한 앱에서는 이 구현을 쓴다. */
export interface SegmentedOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  label,
  size = "md",
  className,
  disabled = false,
}: {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 스크린리더가 읽는 이 컨트롤의 이름 — "View mode" 처럼. */
  label: string;
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
}) {
  const enabled = options.filter((option) => !option.disabled);
  const tabStop = disabled ? undefined : (enabled.find((option) => option.value === value) ?? enabled[0]);
  return (
    <div
      data-slot="segmented"
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      onKeyDown={(event) => {
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
      className={cn("inline-flex shrink-0 items-center rounded-md bg-primary-track p-0.5", className)}
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
              "font-inherit appearance-none border-0 bg-transparent",
              /* 동심원 — 안쪽 반경 = 바깥(rounded-md) − 패딩(p-0.5) = 8 − 2 = 6px(#26). 스쿼클 폐기(#36) 뒤에도 값이 옛 rounded-sm 과 같아 그대로 둔다 —
                 바깥 토큰이 바뀌면 안쪽이 따라가는 것이 임의값 6px 보다 낫다. */
              "cursor-pointer rounded-[calc(var(--radius-md)-var(--spacing)*0.5)] px-3 font-medium transition-colors duration-fast",
              "focus-visible:focus-ring focus-visible:outline-none",
              "disabled:pointer-events-none disabled:opacity-45",
              size === "sm" ? "h-6 text-label" : "h-7 text-control",
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
