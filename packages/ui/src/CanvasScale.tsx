import type { ComponentPropsWithRef } from "react";

import { cn } from "./cn";

/** `<CanvasScale>` 의 props — `<svg>` 속성(ref 포함, `children` 제외) + 막대 길이 · 라벨. */
export interface CanvasScaleProps extends Omit<ComponentPropsWithRef<"svg">, "children"> {
  /**
   * 막대 길이(화면 px) — `niceScale()` 의 `px`. 음수·NaN·무한대는 0 으로 그린다.
   * @default 0
   */
  readonly lengthPx?: number;
  /**
   * 막대 아래 라벨 — `niceScale()` 의 `lengthM` 을 소비자가 단위와 함께 적는다("10 m").
   * @default ""
   */
  readonly label?: string;
}

/* 축척 상자의 기하 — 캔버스 요소라 화면 px 로 고정한다(canvas.css). 폭 120 은 `niceScale()` 의 기본 목표 폭과 같다: 막대가 상자를
 * 넘지 않는 가장 긴 1·2·5 길이가 그 안에 들어온다. 높이 20 은 막대 4 + 라벨 기준선(y 16)까지. */
const BOX = { width: 120, height: 20 } as const;
const BAR = { height: 4 } as const;

/** SVG 도면 안과 HTML 위 오버레이에서 같은 모양을 쓰며 위치와 현재 축척은 소비자가 정한다. */
export function CanvasScale({ lengthPx = 0, label = "", className, ...props }: CanvasScaleProps) {
  return (
    <svg
      {...BOX}
      role="img"
      aria-label="Canvas scale"
      {...props}
      data-slot="canvas-scale"
      className={cn("ds-canvas-scale", className)}
    >
      <rect {...BAR} width={Number.isFinite(lengthPx) ? Math.max(0, lengthPx) : 0} />
      <text x={0} y={16}>
        {label}
      </text>
    </svg>
  );
}
