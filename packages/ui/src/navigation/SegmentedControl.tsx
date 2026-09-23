import { cn } from "../cn";

/* 세그먼트 컨트롤 — 배타적 뷰 전환(Plan ↔ Model).
 *
 * 참고 화면 실측: 옅은 파란 트랙(#e6eff8) 위에 **흰 pill** 이 얹히고 활성 글자만 파랗다.
 * 활성 칸을 액센트로 통째로 칠하지 않는 이유가 있다 — 이 컨트롤은 상단바에 상시 떠 있고,
 * 채워진 파란 칸은 그 옆의 주 동작 버튼(같은 파랑 채움)과 무게가 같아져 «무엇이 동작이고
 * 무엇이 현재 상태인가» 가 흐려진다. 트랙+pill 은 상태를, 채움은 동작을 말한다.
 *
 * `controls.tsx` 의 옛 `Segmented` 는 그대로 둔다 — 기존 세 앱이 쓰고 있다. */
export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  className,
}: {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 스크린리더가 읽는 이 컨트롤의 이름 — "View mode" 처럼. */
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      data-slot="segmented"
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center rounded-control bg-accent-track p-0.5",
        className,
      )}
    >
      {options.map(option => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "appearance-none border-0 bg-transparent font-inherit",
              "cursor-pointer rounded-[6px] px-3 font-medium transition-colors duration-100",
              "focus-visible:focus-ring focus-visible:outline-none",
              "disabled:pointer-events-none disabled:opacity-45",
              size === "sm" ? "h-6 text-label" : "h-7 text-control",
              active
                ? "bg-surface text-accent shadow-chip"
                : "text-muted hover:text-ink-2",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
