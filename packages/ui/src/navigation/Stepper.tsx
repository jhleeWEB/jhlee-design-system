import type { ReactNode } from "react";
import { IconCheck, IconX } from "../icons/icons";

import { cn, type VariantProps } from "../cn";
import { stepConnectorVariants, stepIndicatorVariants, stepperVariants } from "./Stepper.variants";

/* 단계 진행 — 여러 단계짜리 작업의 «어디까지 왔나»(#62).
 *
 * 순서가 뜻이므로 `<ol>` 이다 — 스크린리더가 «list, 4 items · 2 of 4» 로 위치를 먼저 말한다. 지금 단계에 `aria-current="step"` 이 선다.
 * 상태(끝남 · 지금 · 대기 · 오류)는 원의 색과 아이콘에만 두지 않고 **글자로 함께** 적는다(원칙 2) — 색을 못 보는 사람도, 흑백 인쇄도 같은 것을 읽는다.
 * 표시 전용이라 단계를 눌러 옮기는 동작은 없다(훅 · 핸들러가 없어 서버 컴포넌트로 그릴 수 있다). 단계 이동은 부르는 쪽의 버튼이 맡는다. */

/** 단계의 상태 — `complete`(끝남) · `current`(지금) · `upcoming`(대기) · `error`(실패). */
export type StepStatus = NonNullable<VariantProps<typeof stepIndicatorVariants>["status"]>;

type StepperOrientation = NonNullable<VariantProps<typeof stepperVariants>["orientation"]>;

/** 상태마다 보이는 글자 — 화면 문자열은 영어다. */
const STATUS_TEXT: Record<StepStatus, string> = {
  complete: "Complete",
  current: "Current",
  upcoming: "Upcoming",
  error: "Error",
};

/** 단계 하나. 상태를 적지 않으면 `current` 와의 앞뒤로 정한다. */
export interface StepperStep {
  /** 단계의 이름. */
  label: ReactNode;
  /**
   * 이름 아래의 짧은 설명.
   * @default undefined
   */
  description?: ReactNode;
  /**
   * 상태를 직접 정한다 — 주로 `error`(검증 실패한 단계). 주지 않으면 `current` 앞은 `complete`, 같으면 `current`, 뒤는 `upcoming` 이다.
   * - `complete` — 끝난 단계
   * - `current` — 지금 단계
   * - `upcoming` — 아직 오지 않은 단계
   * - `error` — 실패한 단계
   * @default undefined
   */
  status?: StepStatus | undefined;
}

/** `Stepper` 의 props — `<ol>` 속성(ref 포함) + `steps` · `current` · `orientation`. */
export interface StepperProps
  extends Omit<React.ComponentPropsWithRef<"ol">, "children">, VariantProps<typeof stepperVariants> {
  /** 단계들 — 순서대로. */
  steps: readonly StepperStep[];
  /**
   * 지금 단계의 번호(0 부터) — `aria-current="step"` 이 여기 선다. 단계 수 이상이면 모든 단계가 끝난 것이다.
   * @default 0
   */
  current?: number;
}

/**
 * 단계 진행 — 순서 있는 목록(`ol`)에 단계마다 원(번호 · 체크 · X) · 이름 · 상태 글자 · 설명을 두고 사이를 선으로 잇는다.
 * 방향은 `orientation`(가로 · 세로).
 * @slot stepper
 */
export function Stepper({ steps, current = 0, orientation, className, ...rest }: StepperProps) {
  const resolved: StepperOrientation = orientation ?? "horizontal";
  return (
    <ol
      className={cn(stepperVariants({ orientation: resolved }), className)}
      {...rest}
      data-slot="stepper"
      data-orientation={resolved satisfies StepperOrientation}
    >
      {steps.map((step, i) => {
        const derived: StepStatus = i < current ? "complete" : i === current ? "current" : "upcoming";
        const status: StepStatus = step.status ?? derived;
        const last = i === steps.length - 1;
        return (
          <li
            key={i}
            aria-current={i === current ? "step" : undefined}
            className="relative flex min-w-0"
            data-slot="stepper-item"
            data-status={status satisfies StepStatus}
          >
            {/* 원과 (가로면) 다음 단계로 가는 선이 한 줄이다 — 이름 · 설명은 그 아래(가로) 또는 옆(세로)에 서서 칸 폭 안에서 줄을 바꾼다. */}
            <span aria-hidden="true" className="flex items-center gap-2">
              <span className={stepIndicatorVariants({ status })}>
                {status === "complete" ? <IconCheck /> : status === "error" ? <IconX /> : i + 1}
              </span>
              {last || resolved === "vertical" ? null : (
                <span
                  className={stepConnectorVariants({
                    orientation: resolved,
                    complete: status === "complete",
                  })}
                />
              )}
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span
                className={cn(
                  "text-control font-medium text-foreground",
                  status === "upcoming" && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
              <span
                className={cn("text-label text-muted-foreground", status === "error" && "text-destructive")}
              >
                {STATUS_TEXT[status]}
              </span>
              {step.description ? (
                <span className="text-label text-muted-foreground">{step.description}</span>
              ) : null}
            </span>
            {last || resolved === "horizontal" ? null : (
              <span
                aria-hidden="true"
                className={stepConnectorVariants({ orientation: resolved, complete: status === "complete" })}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
