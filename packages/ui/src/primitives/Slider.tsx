"use client";
import { useState, type ReactNode } from "react";
import { Slider as Radix } from "radix-ui";

import { cn, type VariantProps } from "../cn";
import { sliderThumbClassName, sliderTrackVariants, sliderVariants } from "./Slider.variants";

/* 슬라이더 — 연속 범위에서 값 하나(또는 범위의 두 끝)를 고른다.
 *
 * 2.x 의 레거시 `Slider`(`./legacy`, 3.0.0 에서 삭제 #49)는 네이티브 `<input type="range">` 에 `accent-color` 만 입혔고, 드래그 중 미리보기와
 * 확정(`onCommit`)을 가르려고 window 의 pointerup 을 직접 들었다. 범위(두 손잡이)는 없었다. 여기서는 Radix Slider 를 쓴다 — 손잡이마다
 * `role="slider"` · 화살표/PageUp/Home/End · `onValueCommit`(놓을 때 한 번)이 Radix 의 것이다(#59).
 *
 * 수치 표시(`showValue`)와 눈금 라벨(`marks`)은 Radix 루트 **밖**에 둔다 — Radix 는 루트의 폭으로 포인터 위치를 값으로 바꾸므로,
 * 값 글자가 루트 안에 있으면 트랙 끝과 포인터 계산이 어긋난다. 그래서 바깥 래퍼(`data-slot="slider"`)가 `className` 을 받고,
 * 나머지 속성 · ref 는 조작부(Radix 루트, `data-slot="slider-control"`)로 간다 — Input 의 접미사 래퍼와 같은 나눔이다. */

/** 눈금 하나 — 트랙 아래 그 값의 자리에 작은 선과 라벨을 그린다. */
export interface SliderMark {
  /** 눈금이 서는 값 — `min`~`max` 밖이면 그리지 않는다. */
  value: number;
  /** 눈금 아래 라벨. 없으면 선만 그린다. */
  label?: ReactNode;
}

/** `Slider` 의 props — Radix `Slider.Root` 속성(ref 포함, `asChild` · `orientation` 제외) + `size` · `marks` · `showValue` · `formatValue`. */
export interface SliderProps
  extends
    Omit<React.ComponentPropsWithRef<typeof Radix.Root>, "asChild" | "orientation" | "children">,
    VariantProps<typeof sliderVariants> {
  /**
   * 트랙 아래 눈금과 라벨 — 라벨은 mono + tabular-nums 다. 스크린리더는 손잡이의 값으로 읽으므로 눈금은 장식이다.
   * @default undefined
   */
  marks?: readonly SliderMark[] | undefined;
  /**
   * 트랙 오른쪽에 지금 값을 mono + tabular-nums 로 적는다. 범위면 «아래 – 위» 다. 폭은 `min`·`max` 의 표기 길이로 고정해 값이 바뀌어도 트랙이 흔들리지 않는다.
   * @default false
   */
  showValue?: boolean;
  /**
   * 값 → 글자. `showValue` 의 표시와 손잡이의 `aria-valuetext` 에 함께 쓴다(단위를 붙이는 자리 — `(v) => \`${v} m\``).
   * @default String
   */
  formatValue?: ((value: number) => string) | undefined;
}

type SliderSize = NonNullable<VariantProps<typeof sliderVariants>["size"]>;

const clampPercent = (value: number, min: number, max: number) =>
  max === min ? 0 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

/* Radix 와 같은 보정 — 손잡이 중심은 «반지름 ~ 폭−반지름» 을 움직인다. 눈금을 같은 구간에 놓는다(Slider.variants 머리 주석). */
const markOffset = (percent: number) =>
  `calc(var(--slider-thumb) / 2 + (100% - var(--slider-thumb)) * ${percent / 100})`;

/**
 * 슬라이더 — 값 하나(`[50]`) 또는 범위(`[20, 80]`)를 고른다. 값은 언제나 배열이다(Radix 계약). 드래그 중에는 `onValueChange`,
 * 놓거나 키보드 조작이 끝나면 `onValueCommit` 이 한 번 온다 — 무거운 재계산은 commit 에 건다.
 * 스크린리더 이름은 `aria-label`(또는 `aria-labelledby`)로 주고, 손잡이에 옮겨 단다 — 범위면 «이름 minimum» · «이름 maximum» 이 된다.
 * @slot slider
 */
export function Slider({
  ref,
  className,
  size,
  marks,
  showValue = false,
  formatValue = String,
  min = 0,
  max = 100,
  value,
  defaultValue,
  onValueChange,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...rest
}: SliderProps) {
  const resolvedSize = size ?? "md";
  /* 비제어여도 값을 여기서 든다 — 손잡이 수와 `showValue` 의 표기가 드래그 중의 값을 따라가야 한다. Radix 에는 늘 제어 값으로 넘긴다.
     값이 없으면 min 하나(Radix 의 기본과 같다). */
  const [inner, setInner] = useState<number[]>(() => defaultValue ?? [min]);
  const values = value ?? inner;
  const thumbLabel = (index: number): string | undefined => {
    if (!ariaLabel) return undefined;
    if (values.length === 1) return ariaLabel;
    if (values.length === 2) return `${ariaLabel} ${index === 0 ? "minimum" : "maximum"}`;
    return `${ariaLabel} ${index + 1} of ${values.length}`;
  };
  const shown = values.map(formatValue).join(" – ");
  // 표시 폭 — 가장 긴 표기(min·max)를 기준으로 ch 단위로 고정한다. mono 글꼴이라 ch 가 글자 하나의 폭이다.
  const valueChars =
    Math.max(formatValue(min).length, formatValue(max).length) * values.length + (values.length - 1) * 3;

  return (
    <div
      data-slot="slider"
      // `satisfies` — 문자열 축이지 불리언이 아니다(boolean-string-data-attr 래칫, Tabs 와 같다).
      data-size={resolvedSize satisfies SliderSize}
      className={cn("flex w-full min-w-0 items-center gap-3", className)}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <Radix.Root
          min={min}
          max={max}
          value={values}
          onValueChange={(next) => {
            if (value === undefined) setInner(next);
            onValueChange?.(next);
          }}
          className={sliderVariants({ size: resolvedSize })}
          {...rest}
          ref={ref}
          data-slot="slider-control"
        >
          <Radix.Track className={sliderTrackVariants({ size: resolvedSize })} data-slot="slider-track">
            <Radix.Range className="absolute h-full bg-primary" data-slot="slider-range" />
          </Radix.Track>
          {values.map((v, index) => (
            <Radix.Thumb
              // 손잡이의 자리 = 배열의 자리 — Radix 도 index 로 손잡이를 고른다.
              key={index}
              className={sliderThumbClassName}
              data-slot="slider-thumb"
              {...(thumbLabel(index) ? { "aria-label": thumbLabel(index) } : {})}
              {...(ariaLabelledBy ? { "aria-labelledby": ariaLabelledBy } : {})}
              {...(formatValue === String ? {} : { "aria-valuetext": formatValue(v) })}
            />
          ))}
        </Radix.Root>
        {marks && marks.length > 0 ? (
          <div
            aria-hidden="true"
            data-slot="slider-marks"
            className={cn(sliderVariants({ size: resolvedSize }), "h-5 items-start")}
          >
            {marks
              .filter((mark) => mark.value >= min && mark.value <= max)
              .map((mark) => (
                <span
                  key={mark.value}
                  className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-px font-mono text-micro text-muted-foreground tabular-nums"
                  style={{ left: markOffset(clampPercent(mark.value, min, max)) }}
                >
                  <span className="h-1 w-px bg-border-strong" />
                  {mark.label}
                </span>
              ))}
          </div>
        ) : null}
      </div>
      {showValue ? (
        <span
          // 손잡이가 같은 값을 aria-valuenow · aria-valuetext 로 읽히므로 보이는 표기는 한 번 더 읽히지 않게 숨긴다.
          aria-hidden="true"
          data-slot="slider-value"
          className="shrink-0 text-right tnum text-label text-foreground"
          style={{ minWidth: `${valueChars}ch` }}
        >
          {shown}
        </span>
      ) : null}
    </div>
  );
}
