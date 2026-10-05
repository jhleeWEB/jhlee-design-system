import type { ComponentPropsWithRef, ReactNode } from "react";

import { cn, type VariantProps } from "../cn";
import { readoutValueVariants, readoutVariants } from "./Readout.variants";

/* 수치 판독 — 실시간 지표 묶음(라벨 · 값 · 단위 · 판정). 2.x 의 레거시 `Hud` · `HudCell`(`./legacy`, 3.0.0 에서 삭제 #49)의 대체다(#59).
 *
 * 옛 Hud 는 `role="status"` 로 늘 낭독했다 — 슬라이더를 끄는 동안 값이 프레임마다 바뀌면 스크린리더가 말을 끝내지 못한다. 그래서 낭독은
 * `live` 로 켜는 선택이다. 의미는 이름–값 목록이라 `<dl>` 이고(DescriptionList 와 같은 뜻), 칸 하나가 `<div><dt/><dd/></div>` 묶음이다.
 * 위치(캔버스 위 절대 배치)는 앱이 정한다 — 옛 Hud 의 `position: absolute; top: 10px` 같은 배치 리터럴은 옮기지 않았다.
 * 이 파일에는 훅 · 핸들러가 없다 — 서버 컴포넌트에서도 렌더된다. */

type ReadoutSize = NonNullable<VariantProps<typeof readoutVariants>["size"]>;
type ReadoutVariant = NonNullable<VariantProps<typeof readoutVariants>["variant"]>;
type ReadoutTone = NonNullable<VariantProps<typeof readoutValueVariants>["tone"]>;
type ReadoutKind = NonNullable<VariantProps<typeof readoutValueVariants>["kind"]>;

/** `Readout` 의 props — `<dl>` 속성(ref 포함) + `size` · `variant` · `live`. */
export interface ReadoutProps extends ComponentPropsWithRef<"dl">, VariantProps<typeof readoutVariants> {
  /**
   * 값이 바뀌면 스크린리더가 읽는다(`aria-live="polite"`). 드래그처럼 값이 빠르게 바뀌는 자리에서는 끄고, 확정된 결과만 보이는 자리에서 켠다.
   * @default false
   */
  live?: boolean;
}

/**
 * 수치 묶음 — 칸(`ReadoutItem`)을 한 줄에 나란히 두고 좁으면 줄을 바꾼다. 칸 사이는 1px 선이다.
 * @slot readout
 */
export function Readout({ className, size, variant, live = false, ...rest }: ReadoutProps) {
  const resolvedSize = size ?? "md";
  const resolvedVariant = variant ?? "inline";
  return (
    <dl
      aria-live={live ? "polite" : undefined}
      className={cn(readoutVariants({ size: resolvedSize, variant: resolvedVariant }), className)}
      {...rest}
      data-slot="readout"
      // `satisfies` — 문자열 축이지 불리언이 아니다(boolean-string-data-attr 래칫이 식별자 하나짜리 값을 불리언으로 의심한다, Tabs 와 같다).
      data-size={resolvedSize satisfies ReadoutSize}
      data-variant={resolvedVariant satisfies ReadoutVariant}
    />
  );
}

/** `ReadoutItem` 의 props — `<div>` 속성(ref 포함, `children` 제외) + 라벨 · 값 · 단위 · 판정 · 종류. */
export interface ReadoutItemProps
  extends Omit<ComponentPropsWithRef<"div">, "children">, VariantProps<typeof readoutValueVariants> {
  /** 칸의 이름(`<dt>`) — mono 대문자 미세라벨. */
  label: ReactNode;
  /** 값(`<dd>`) — mono + tabular-nums. 숫자 서식(천 단위 쉼표 · 소수 자리)은 앱이 정한다. `kind="status"` 면 상태를 말하는 글자다. */
  value: ReactNode;
  /**
   * 값 뒤의 단위 — "m²", "%", "units". 값보다 작고 흐리다.
   * @default undefined
   */
  unit?: string | undefined;
  /**
   * 판정을 말하는 글자 — "Over limit" · "Within range". `tone` 이 색을 줄 때 함께 준다: 상태는 언제나 글자와 병기한다(원칙 2).
   * @default undefined
   */
  status?: ReactNode;
}

/**
 * 판독 한 칸 — 라벨 · 값 · 단위, 그리고 판정(`tone` + `status`). 판정색은 값과 `status` 글자에만 입힌다.
 * 값 자리에 수치가 아니라 상태 글자가 서는 칸은 `kind="status"` 다 — sans 본문 글자 + 톤 점으로 그려 수치 칸과 구분된다.
 * @slot readout-item
 */
export function ReadoutItem({
  className,
  label,
  value,
  unit,
  status,
  tone,
  kind,
  ...rest
}: ReadoutItemProps) {
  const resolvedTone = tone ?? "neutral";
  const resolvedKind = kind ?? "value";
  return (
    <div
      className={cn("flex min-w-0 flex-1 basis-28 flex-col gap-1 bg-card px-3 py-2", className)}
      {...rest}
      data-slot="readout-item"
      data-tone={resolvedTone satisfies ReadoutTone}
      data-kind={resolvedKind satisfies ReadoutKind}
    >
      <dt className="truncate font-mono text-micro font-medium tracking-caps text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className={readoutValueVariants({ tone: resolvedTone, kind: resolvedKind })}>
        {resolvedKind === "status" ? (
          /* 줄 칸을 옆 수치 칸의 값 줄(text-readout 28px · sm 은 text-title 24px)에 맞춘다 — 본문 글자(20px)를 그대로 두면 상태 글자가
             수치의 가운데가 아니라 위에 붙어 한 줄로 읽히지 않는다(#106). 점은 판정이 있을 때만 — neutral 은 판정이 아니다(Toast 의 neutral 과 같다). */
          <span className="flex min-h-7 min-w-0 items-center gap-2 group-data-[size=sm]/readout:min-h-6">
            {resolvedTone === "neutral" ? null : (
              <i
                data-slot="readout-dot"
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full bg-current"
              />
            )}
            <span className="min-w-0 truncate">{value}</span>
          </span>
        ) : (
          <span className="min-w-0 truncate">
            {value}
            {unit === undefined ? null : (
              <span className="ml-1 text-label font-normal text-muted-foreground">{unit}</span>
            )}
          </span>
        )}
        {status === undefined ? null : (
          <span data-slot="readout-status" className="font-sans text-label font-normal">
            {status}
          </span>
        )}
      </dd>
    </div>
  );
}
