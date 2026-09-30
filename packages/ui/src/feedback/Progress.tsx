"use client";
import { Progress as RadixProgress } from "radix-ui";

import { cn, type VariantProps } from "../cn";
import { progressVariants } from "./Progress.variants";

/* 진행 — 값이 있을 때만 쓴다. 값이 없으면 `Spinner` 다.
 *
 * `tone` 이 판정색을 받는 이유: 이 제품에서 막대가 차오르는 것은 대개 «허용량 대비 소비» 이고
 * (FSI · 주차 · 어메니티 면제 상한) 그때 100% 를 넘는 것은 실패다. 색이 그 사실을 함께 말한다. */

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof RadixProgress.Root>,
    VariantProps<typeof progressVariants> {
  /** 0–100. `null` 이면 미판정(indeterminate)으로 그린다. */
  value?: number | null;
}

export function Progress({ className, value = null, tone, ...rest }: ProgressProps) {
  const pct = value === null ? null : Math.max(0, Math.min(100, value));
  return (
    <RadixProgress.Root
      data-slot="progress"
      value={pct}
      className={cn("relative h-3 w-full overflow-hidden rounded-chip bg-surface-3", className)}
      {...rest}
    >
      <RadixProgress.Indicator
        className={cn(
          progressVariants({ tone }),
          /* 미판정은 폭을 모르므로 훑고 지나가는 띠로 그린다. */
          pct === null && "w-2/5 animate-in-rise",
        )}
        style={pct === null ? undefined : { width: `${pct}%` }}
      />
    </RadixProgress.Root>
  );
}
