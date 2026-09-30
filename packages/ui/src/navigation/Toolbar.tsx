import type { ComponentProps } from "react";

import { cn } from "../cn";

/** `Toolbar` 의 props — `<div>` 속성에 캔버스 위 부유 여부를 더한다. */
export interface ToolbarProps extends ComponentProps<"div"> {
  /**
   * 캔버스 위에 떠 있는 클러스터로 그린다 — 반투명 바탕(`on-canvas`)·둥근 모서리·그림자. 끄면 크롬 한 줄(아래 테두리)이다.
   * @default false
   */
  onCanvas?: boolean;
}

/**
 * 툴바 — 캔버스 위 또는 그 바로 위의 한 줄. `onCanvas` 면 떠 있는 클러스터가 된다.
 * 캔버스 위에 뜨는 경우 배경이 비쳐야 도면이 가려지지 않으므로 `on-canvas` 유틸리티를 쓴다.
 */
export function Toolbar({ className, onCanvas, ...rest }: ToolbarProps) {
  return (
    <div
      role="toolbar"
      className={cn(
        "flex min-w-0 items-center gap-3",
        onCanvas
          ? "rounded-lg border border-border p-2 shadow-pop on-canvas"
          : "border-b border-border bg-card px-4 py-3",
        className,
      )}
      {...rest}
      data-slot="toolbar"
      data-on-canvas={onCanvas ? "" : undefined}
    />
  );
}

/** 툴바 안의 시각적 구분. `role="separator"` 를 주면 스크린리더가 툴바 항목 수를 잘못 센다. */
export function ToolbarDivider({ className, ...rest }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cn("mx-1 h-8 w-px shrink-0 bg-border", className)}
      {...rest}
      data-slot="toolbar-divider"
    />
  );
}

/** 뒤따르는 항목을 툴바의 오른쪽 끝으로 민다(`margin-left: auto`). */
export function ToolbarSpacer({ className, ...rest }: ComponentProps<"span">) {
  return (
    <span aria-hidden="true" className={cn("ml-auto", className)} {...rest} data-slot="toolbar-spacer" />
  );
}
