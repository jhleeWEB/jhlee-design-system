import { cn } from "../cn";

/* 스켈레톤 — 「곧 여기 무언가 온다」 를 자리로 말한다.
 *
 * 규칙 하나: **스켈레톤은 대체할 내용과 같은 높이여야 한다.** 다르면 값이 도착하는 순간 줄이
 * 뛰고, 그 점프가 스피너보다 더 거슬린다. 그래서 `lines` 와 `h` 를 둘 다 받는다.
 *
 * shimmer 는 `prefers-reduced-motion` 에서 꺼진다 — `theme.css` 가 `--animate-shimmer` 를
 * `none` 으로 바꾸므로 여기서 다시 분기하지 않는다. */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 바의 높이. 대체할 내용의 line-height 에 맞춘다. */
  h?: number | string;
  /** 바의 폭. 글줄을 흉내 낼 때 마지막 줄만 짧게 하는 것이 자연스럽다. */
  w?: number | string;
  /** 모서리를 둥글게 — 아바타 자리에는 `full`. */
  shape?: "bar" | "circle";
}

export function Skeleton({ className, h = 12, w, shape = "bar", style, ...rest }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "animate-shimmer bg-[length:200%_100%]",
        "bg-[linear-gradient(90deg,var(--chrome-muted)_25%,var(--chrome-secondary)_50%,var(--chrome-muted)_75%)]",
        shape === "circle" ? "rounded-full" : "rounded-sm",
        className,
      )}
      style={{ height: h, width: w ?? (shape === "circle" ? h : undefined), ...style }}
      {...rest}
    />
  );
}

/* 글줄 뭉치. 마지막 줄을 짧게 잘라 문단처럼 보이게 한다. */
export function SkeletonText({
  lines = 3,
  className,
  ...rest
}: { lines?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="skeleton-text" className={cn("flex flex-col gap-3", className)} {...rest}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} h={10} w={i === lines - 1 ? "62%" : "100%"} />
      ))}
    </div>
  );
}
