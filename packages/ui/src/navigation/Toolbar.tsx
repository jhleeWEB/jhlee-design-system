import { cn } from "../cn";

/* 툴바 — 캔버스 위 또는 그 바로 위의 한 줄. `onCanvas` 면 떠 있는 클러스터가 된다.
 * 캔버스 위에 뜨는 경우 배경이 비쳐야 도면이 가려지지 않으므로 `on-canvas` 유틸리티를 쓴다. */
export function Toolbar({
  className,
  onCanvas,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { onCanvas?: boolean }) {
  return (
    <div
      role="toolbar"
      data-slot="toolbar"
      className={cn(
        "flex min-w-0 items-center gap-3",
        onCanvas
          ? "rounded-lg border border-border p-2 shadow-pop on-canvas"
          : "border-b border-border bg-card px-4 py-3",
        className,
      )}
      {...rest}
    />
  );
}

/* 툴바 안의 시각적 구분. `role="separator"` 를 주면 스크린리더가 툴바 항목 수를 잘못 센다. */
export function ToolbarDivider({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("mx-1 h-8 w-px shrink-0 bg-border", className)} />;
}

export function ToolbarSpacer() {
  return <span aria-hidden="true" className="ml-auto" />;
}
