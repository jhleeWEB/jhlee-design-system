import { cn, cva, type VariantProps } from "../cn";

/* 인라인 경고 — 흐름 안에 남는다. 지나가는 것은 `Toast` 다.
 *
 * 원칙 2 를 지킨다: **색만으로 말하지 않는다.** 아이콘과 제목이 항상 함께 실리고,
 * 그래서 `tone` 마다 기본 아이콘을 여기서 고정한다 — 호출처가 잊으면 흑백에서 정보가 사라진다. */
const alertVariants = cva(
  "flex gap-4 rounded-control border border-l-3 p-5 text-body leading-relaxed",
  {
    variants: {
      tone: {
        info: "border-line border-l-accent bg-surface-2 text-ink-2",
        ok: "border-ok/35 border-l-ok bg-ok-soft text-ink-2",
        warn: "border-warn/35 border-l-warn bg-warn-soft text-ink-2",
        danger: "border-danger/35 border-l-danger bg-danger-soft text-ink-2",
      },
    },
    defaultVariants: { tone: "info" },
  },
);

const GLYPH: Record<NonNullable<VariantProps<typeof alertVariants>["tone"]>, string> = {
  info: "M8 7.2v4.4M8 4.6v.9",
  ok: "M4.6 8.3l2.3 2.3 4.5-4.9",
  warn: "M8 5v3.6M8 10.9v.9",
  danger: "M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8",
};

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof alertVariants> {
  /* `title` 을 Omit 하고 다시 선언한다 — DOM 의 `title` 은 툴팁 문자열이라 ReactNode 를 못 받는다. */
  title?: React.ReactNode;
  /** 오른쪽 끝에 붙는 조치 — 대개 버튼 하나. */
  action?: React.ReactNode;
}

export function Alert({ className, tone = "info", title, action, children, ...rest }: AlertProps) {
  return (
    <div
      data-slot="alert"
      role={tone === "danger" ? "alert" : "status"}
      className={cn(alertVariants({ tone }), className)}
      {...rest}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-px size-7 shrink-0">
        <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path
          d={GLYPH[tone ?? "info"]}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <div className="min-w-0 flex-1">
        {title ? <div className="font-semibold text-ink">{title}</div> : null}
        {children ? <div className={cn(title && "mt-1")}>{children}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
