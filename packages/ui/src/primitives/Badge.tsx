import { cn, type VariantProps } from "../cn";
import { badgeVariants, type BadgeTone } from "./Badge.variants";

/* 배지 — 상태를 **글자와 함께** 말한다.
 *
 * base 의 원칙 2 가 「상태는 항상 텍스트와 병기한다」인데, 색 점만 있는 배지는 그 원칙을
 * 어기는 가장 흔한 방법이다. 그래서 `children` 이 필수이고, 점만 필요한 자리에는 `StatusDot`
 * 을 따로 두되 그쪽은 `aria-label` 을 요구한다. */

/** `<Badge>` 의 props — `<span>` 속성 전부(ref 포함) + `tone` · `provisional` · `dot`. `children`(글자)은 필수다. */
export interface BadgeProps
  extends React.ComponentPropsWithRef<"span">, Omit<VariantProps<typeof badgeVariants>, "tone"> {
  /**
   * 톤 — `neutral`(기본) · `primary`(주된 것 · 지금 고른 것) · `success`(통과) · `warning`(주의) · `destructive`(실패).
   * @default "neutral"
   */
  tone?: BadgeTone | null | undefined;
  /**
   * 글자 앞에 톤 색의 점을 둔다 — 목록에서 훑어 읽을 때.
   * @default false
   */
  dot?: boolean;
  /** 상태를 말하는 글자 — 필수다(원칙 2: 상태는 텍스트와 병기한다). */
  children: React.ReactNode;
}

/** 배지 — 상태를 **글자와 함께** 말한다. 점만 필요한 좁은 자리는 `StatusDot`. */
export function Badge({ className, tone, provisional, dot, children, ...rest }: BadgeProps) {
  const resolvedTone = tone;
  return (
    <span
      {...rest}
      data-slot="badge"
      data-tone={resolvedTone ?? "neutral"}
      data-provisional={provisional ? "" : undefined}
      className={cn(badgeVariants({ tone: resolvedTone, provisional }), className)}
    >
      {dot ? <i aria-hidden="true" className="size-3 shrink-0 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

/** `<StatusDot>` 의 props — `<span>` 속성(ref 포함, `children` 제외) + `tone` · `label`. */
export interface StatusDotProps extends Omit<React.ComponentPropsWithRef<"span">, "children"> {
  /**
   * 톤 — Badge 와 같은 다섯: `neutral`(기본) · `primary`(주된 것) · `success`(통과) · `warning`(주의) · `destructive`(실패).
   * @default "neutral"
   */
  tone?: BadgeTone;
  /** 점의 이름 — `aria-label` 과 `title` 로 간다. 점만으로는 상태를 말할 수 없어 필수다. */
  label: string;
}

/* 점만. 표의 좁은 칸처럼 글자를 넣을 수 없는 자리에서만 쓰고, 반드시 이름을 붙인다. */
/** 상태 점 — 글자를 넣을 수 없는 좁은 자리에서만. 이름(`label`)이 필수다. */
export function StatusDot({ tone = "neutral", label, className, ...rest }: StatusDotProps) {
  const fill: Record<BadgeTone, string> = {
    neutral: "bg-muted-foreground",
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
  };
  // cn() 밖에서 고른다 — 안에서 `?? "neutral"` 을 쓰면 better-tailwindcss 가 그 문자열을 클래스로 읽는다.
  const resolvedTone = tone;
  const dot = fill[resolvedTone ?? "neutral"];
  return (
    <span
      {...rest}
      data-slot="status-dot"
      data-tone={resolvedTone ?? "neutral"}
      role="img"
      aria-label={label}
      title={label}
      className={cn("inline-block size-4 shrink-0 rounded-full", dot, className)}
    />
  );
}
