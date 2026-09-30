import { cn, type VariantProps } from "../cn";
import { skeletonVariants } from "./Skeleton.variants";

/* 스켈레톤 — 「곧 여기 무언가 온다」 를 자리로 말한다.
 *
 * 규칙 하나: **스켈레톤은 대체할 내용과 같은 높이여야 한다.** 다르면 값이 도착하는 순간 줄이
 * 뛰고, 그 점프가 스피너보다 더 거슬린다. 그래서 `lines` 와 `h` 를 둘 다 받는다.
 *
 * shimmer 는 `prefers-reduced-motion` 에서 꺼진다 — `theme.css` 가 `--animate-shimmer` 를
 * `none` 으로 바꾸므로 여기서 다시 분기하지 않는다. */

/** 스켈레톤 바 하나의 props — `div` 의 속성(`ref` 포함)을 그대로 받는다. */
export interface SkeletonProps extends React.ComponentProps<"div">, VariantProps<typeof skeletonVariants> {
  /**
   * 바의 높이(px 수 또는 CSS 길이). 대체할 내용의 line-height 에 맞춘다.
   * @default 12
   */
  h?: number | string | undefined;
  /**
   * 바의 폭(px 수 또는 CSS 길이). 글줄을 흉내 낼 때 마지막 줄만 짧게 하는 것이 자연스럽다.
   * 비우면 `bar` 는 부모 폭을 따르고 `circle` 은 `h` 와 같은 정원이 된다.
   * @default undefined
   */
  w?: number | string | undefined;
  /**
   * 모양.
   * - `bar` — 글줄·값 자리. 작은 반경(기본)
   * - `circle` — 아바타·상태 점 자리. 정원
   * @default "bar"
   */
  shape?: "bar" | "circle" | null | undefined;
}

/** 스켈레톤 바 — 곧 올 내용과 같은 높이의 자리. 스크린리더에는 숨긴다. */
export function Skeleton({ className, h = 12, w, shape, style, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        /* shimmer 면(배경 크기·그라디언트)은 아직 토큰 유틸이 없다 — 린트 기준선이 이 파일에 묶여 있어 cva 로 옮기지 않는다. */
        "animate-shimmer bg-[length:200%_100%]",
        "bg-[linear-gradient(90deg,var(--chrome-muted)_25%,var(--chrome-secondary)_50%,var(--chrome-muted)_75%)]",
        skeletonVariants({ shape }),
        className,
      )}
      style={{ height: h, width: w ?? (shape === "circle" ? h : undefined), ...style }}
      {...rest}
      /* 슬롯·축은 rest 뒤 — 소비자가 넘긴 data-slot 이 손잡이를 덮지 못하게 한다(공통 계약 slot-locked). */
      data-slot="skeleton"
      data-shape={shape ?? "bar"}
    />
  );
}

/** 글줄 뭉치의 props — `div` 의 속성(`ref` 포함)을 그대로 받는다. */
export interface SkeletonTextProps extends React.ComponentProps<"div"> {
  /**
   * 줄 수. 마지막 줄만 짧게(62%) 잘라 문단처럼 보이게 한다.
   * @default 3
   */
  lines?: number;
}

/** 글줄 뭉치 — `lines` 줄의 스켈레톤 바. 마지막 줄을 짧게 잘라 문단처럼 보이게 한다. */
export function SkeletonText({ lines = 3, className, ...rest }: SkeletonTextProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)} {...rest} data-slot="skeleton-text">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} h={10} w={i === lines - 1 ? "62%" : "100%"} />
      ))}
    </div>
  );
}
