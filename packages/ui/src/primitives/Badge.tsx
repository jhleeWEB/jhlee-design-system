import { cn, type VariantProps } from "../cn";
import { normalizeTone, type ToneInput } from "../lib/tone";
import { badgeVariants, type BadgeTone } from "./Badge.variants";

/* 배지 — 상태를 **글자와 함께** 말한다.
 *
 * base 의 원칙 2 가 「상태는 항상 텍스트와 병기한다」인데, 색 점만 있는 배지는 그 원칙을
 * 어기는 가장 흔한 방법이다. 그래서 `children` 이 필수이고, 점만 필요한 자리에는 `StatusDot`
 * 을 따로 두되 그쪽은 `aria-label` 을 요구한다. */

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    Omit<VariantProps<typeof badgeVariants>, "tone"> {
  /**
   * 톤 — `neutral`(기본) · `primary` · `success` · `warning` · `destructive`.
   * @deprecated 옛 키 `accent` · `ok` · `warn` · `danger` 는 다음 마이너에서 제거 — `normalizeTone()` 이 한 마이너 동안 옮겨 준다(ds/legacy-tone --fix)
   */
  tone?: ToneInput<BadgeTone> | null | undefined;
  dot?: boolean;
  children: React.ReactNode;
}

export function Badge({ className, tone, provisional, dot, children, ...rest }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ tone: normalizeTone(tone), provisional }), className)} {...rest}>
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
  /** 톤 — Badge 와 같은 다섯. 옛 키(accent · ok · warn · danger)는 한 마이너 동안 옮겨 준다. */
  tone?: ToneInput<BadgeTone>;
  label: string;
  className?: string;
}) {
  const fill: Record<BadgeTone, string> = {
    neutral: "bg-muted-foreground",
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
  };
  // cn() 밖에서 고른다 — 안에서 `?? "neutral"` 을 쓰면 better-tailwindcss 가 그 문자열을 클래스로 읽는다.
  const dot = fill[normalizeTone(tone) ?? "neutral"];
  return (
    <span
      data-slot="status-dot"
      role="img"
      aria-label={label}
      title={label}
      className={cn("inline-block size-4 shrink-0 rounded-full", dot, className)}
    />
  );
}
