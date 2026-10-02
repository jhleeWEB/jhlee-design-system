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

/** 툴바 안의 시각적 구분(높이 20px). `role="separator"` 를 주면 스크린리더가 툴바 항목 수를 잘못 센다. */
export function ToolbarDivider({ className, ...rest }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      /* 20px — 30 · 36px 컨트롤 사이에서 위아래가 비는 높이. 예전 `h-8`(32px)은 2px 격자 시절 값이 두 배로 남아 컨트롤만큼 길었고,
         Pages/Workbench 는 `h-5` 로 덮어 쓰고 있었다(#80). */
      className={cn("mx-1 h-5 w-px shrink-0 bg-border", className)}
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
