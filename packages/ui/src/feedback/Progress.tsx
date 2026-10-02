"use client";
import { Progress as RadixProgress } from "radix-ui";

import { cn, type VariantProps } from "../cn";
import { progressVariants, type ProgressTone } from "./Progress.variants";

/* 진행 — 값이 있을 때만 쓴다. 값이 없으면 `Spinner` 다.
 *
 * `tone` 이 판정색을 받는 이유: 이 제품에서 막대가 차오르는 것은 대개 «허용량 대비 소비» 이고
 * (FSI · 주차 · 어메니티 면제 상한) 그때 100% 를 넘는 것은 실패다. 색이 그 사실을 함께 말한다. */

/** 진행 막대의 props — Radix `Progress.Root` 의 속성(`ref` 포함)을 그대로 받는다. */
export interface ProgressProps
  extends
    React.ComponentProps<typeof RadixProgress.Root>,
    Omit<VariantProps<typeof progressVariants>, "tone"> {
  /**
   * 톤 — 막대의 색. 허용량 대비 소비일 때 판정을 함께 말한다.
   * - `primary` — 지금 진행 중인 주된 작업(기본)
   * - `success` — 허용량 안에서 끝났다
   * - `warning` — 상한에 가깝다
   * - `destructive` — 상한을 넘었다(100% 초과)
   * - `neutral` — 판정 없는 단순 채움
   * @default "primary"
   */
  tone?: ProgressTone | null | undefined;
  /**
   * 0–100(밖의 값은 잘라 그린다). `null` 이면 미판정(indeterminate)으로 그린다.
   * @default null
   */
  value?: number | null;
}

/** 진행 막대 — 값이 있을 때만 쓴다. 값이 없으면 `Spinner` 다. */
export function Progress({ className, value = null, tone, ...rest }: ProgressProps) {
  const pct = value === null ? null : Math.max(0, Math.min(100, value));
  return (
    <RadixProgress.Root
      value={pct}
      /* 6px pill — Slider md 트랙(h-1.5 · rounded-full)과 같은 두께 · 모양이다. 예전 `h-3`(12px) · `rounded-sm` 은 2px 격자 시절 값이
         두 배로 남은 것이다(#80). */
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...rest}
      /* 슬롯·축은 rest 뒤 — 소비자가 넘긴 data-slot 이 손잡이를 덮지 못하게 한다(공통 계약 slot-locked). */
      data-slot="progress"
      data-tone={tone ?? "primary"}
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
