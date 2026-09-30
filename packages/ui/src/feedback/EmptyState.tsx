import { cn } from "../cn";

/* 빈 상태 — 「여기 아무것도 없다」 가 아니라 **「무엇을 하면 채워지는가」** 를 말한다.
 * 그래서 `action` 이 선택이 아니라 사실상 필수다. 빈 화면에 설명만 남기지 않는다. */
export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /* DOM 의 `title`(툴팁 문자열)과 이름이 겹치므로 Omit 하고 다시 선언한다. */
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  /** 패널 안의 좁은 자리에서는 `compact`. */
  size?: "compact" | "default";
}

export function EmptyState({
  className,
  title,
  description,
  icon,
  action,
  size = "default",
  ...rest
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        size === "compact" ? "gap-3 p-6" : "gap-4 p-12",
        className,
      )}
      {...rest}
    >
      {icon ? <div className="text-foreground-disabled [&_svg]:size-16">{icon}</div> : null}
      <div className={cn("font-semibold text-foreground", size === "compact" ? "text-body" : "text-title")}>
        {title}
      </div>
      {description ? (
        <p className="leading-relaxed max-w-[46ch] text-body text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
