import { cn } from "../cn";

/* 경로 — 「지금 무엇을 보고 있나」. 마지막 조각은 링크가 아니다(현재 위치이므로). */
export interface Crumb {
  label: React.ReactNode;
  onSelect?: () => void;
  href?: string;
}

export function Breadcrumb({
  items,
  className,
  ...rest
}: { items: readonly Crumb[] } & React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      data-slot="breadcrumb"
      aria-label="Breadcrumb"
      className={cn("flex min-w-0 items-center gap-2 text-control text-muted", className)}
      {...rest}
    >
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex min-w-0 items-center gap-2">
            {i > 0 ? (
              <span aria-hidden="true" className="select-none text-disabled">
                /
              </span>
            ) : null}
            {last ? (
              <span aria-current="page" className="min-w-0 truncate font-semibold text-ink">
                {item.label}
              </span>
            ) : item.href ? (
              <a href={item.href} className="min-w-0 truncate hover:text-ink hover:underline">
                {item.label}
              </a>
            ) : (
              <button
                type="button"
                onClick={item.onSelect}
                className="appearance-none border-0 bg-transparent p-0 font-inherit text-inherit min-w-0 cursor-pointer truncate rounded-control hover:text-ink hover:underline focus-visible:focus-ring focus-visible:outline-none"
              >
                {item.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
