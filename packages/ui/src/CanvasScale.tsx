import type { ComponentPropsWithRef } from "react";

import { cn } from "./cn";

export interface CanvasScaleProps extends Omit<ComponentPropsWithRef<"svg">, "children"> {
  readonly lengthPx?: number;
  readonly label?: string;
}

/** SVG 도면 안과 HTML 위 오버레이에서 같은 모양을 쓰며 위치와 현재 축척은 소비자가 정한다. */
export function CanvasScale({ lengthPx = 0, label = "", className, ...props }: CanvasScaleProps) {
  return (
    <svg
      width={120}
      height={20}
      role="img"
      aria-label="Canvas scale"
      data-slot="canvas-scale"
      className={cn("ds-canvas-scale", className)}
      {...props}
    >
      <rect width={Number.isFinite(lengthPx) ? Math.max(0, lengthPx) : 0} height={4} />
      <text x={0} y={16}>
        {label}
      </text>
    </svg>
  );
}
