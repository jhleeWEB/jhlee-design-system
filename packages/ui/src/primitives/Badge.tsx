import { cn, cva, type VariantProps } from "../cn";

/* 배지 — 상태를 **글자와 함께** 말한다.
 *
 * base 의 원칙 2 가 「상태는 항상 텍스트와 병기한다」인데, 색 점만 있는 배지는 그 원칙을
 * 어기는 가장 흔한 방법이다. 그래서 `children` 이 필수이고, 점만 필요한 자리에는 `StatusDot`
 * 을 따로 두되 그쪽은 `aria-label` 을 요구한다. */
export const badgeVariants = cva(
  "inline-flex items-center gap-2 whitespace-nowrap rounded-chip border px-3 py-px text-label leading-normal",
  {
    variants: {
      tone: {
        neutral: "border-line-strong bg-surface-2 text-ink-2",
        accent: "border-accent/40 bg-accent-soft text-accent",
        ok: "border-ok/40 bg-ok-soft text-ok",
        warn: "border-warn/40 bg-warn-soft text-warn",
        danger: "border-danger/40 bg-danger-soft text-danger",
      },
      /* TBV(검증 대기)처럼 «아직 확정이 아니다» 를 말하는 자리. 점선이 그 뜻을 맡는다. */
      provisional: { true: "border-dashed", false: "" },
    },
    defaultVariants: { tone: "neutral", provisional: false },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  children: React.ReactNode;
}

export function Badge({ className, tone, provisional, dot, children, ...rest }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ tone, provisional }), className)} {...rest}>
      {dot ? <i aria-hidden="true" className="size-3 shrink-0 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

/* 점만. 표의 좁은 칸처럼 글자를 넣을 수 없는 자리에서만 쓰고, 반드시 이름을 붙인다. */
export function StatusDot({
  tone = "neutral",
  label,
  className,
}: {
  tone?: "neutral" | "ok" | "warn" | "danger" | "accent";
  label: string;
  className?: string;
}) {
  const fill = {
    neutral: "bg-muted",
    accent: "bg-accent",
    ok: "bg-ok",
    warn: "bg-warn",
    danger: "bg-danger",
  }[tone];
  return (
    <span
      data-slot="status-dot"
      role="img"
      aria-label={label}
      title={label}
      className={cn("inline-block size-4 shrink-0 rounded-full", fill, className)}
    />
  );
}
