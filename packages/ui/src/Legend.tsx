import type { ComponentPropsWithRef, CSSProperties } from "react";

import { cn, type VariantProps } from "./cn";
import {
  legendSwatchColorClassName,
  legendSwatchTileClassName,
  legendSwatchVariants,
  legendVariants,
} from "./Legend.variants";

/* 범례 — 도면 위의 «이 무늬는 무엇인가» 표. 2.x 의 레거시 `Legend`(`./legacy`, 3.0.0 에서 삭제 #49)의 대체다(#59).
 *
 * **상자는 크롬, 스와치는 캔버스다**(사용자 결정, #80). 상자는 도면 위에 뜨는 패널이라 판독(Readout) · 툴 클러스터와 같은 크롬 면 —
 * `rounded-lg` · 테두리 · 카드 면 · `shadow-pop` 이고 다크를 따른다. 스와치는 도면의 무늬를 옮긴 것이라 캔버스 그대로(각진 · 캔버스 무채색)이고,
 * 다크에서도 먹색이 읽히도록 흰 캔버스 타일 위에 선다. 예전에는 상자까지 캔버스(흰 바탕 · radius 0 · 다크 없음)여서, 다크 작업대에서 크롬 패널들
 * 사이에 흰 사각 하나만 떠 있었다. 캔버스 컴포넌트 CanvasScale 옆(src/ 뿌리, 스토리 `Canvas/*`)에 그대로 둔다 — 도면 위에 놓이는 부품이다.
 *
 * 옛 Legend 는 `items: { color: string }` 로 **아무 색이나** 받아 인라인 style 로 칠했다 — 도메인 색(용도별 유채색)이 캔버스로 새는 길이었다.
 * 그래서 기본은 캔버스 토큰의 한 단(`swatch`)이고, 항목을 가르는 일은 무늬(`pattern`)가 맡는다.
 *
 * **도메인 색은 `color` 로 받는다**(사용자 결정 2026-10-05, #110 — 앞 문단의 «도메인 색 범례는 앱의 것» 을 풀었다). 실 종류 · 검출 층처럼 도면의 그림과
 * 맞춰야 하는 색은 **앱의 값**이고, 소비 레포는 프리셋이 인라인 색을 막아 CSS 변수 우회(`--swatch` + `bg-(--swatch)`)를 화면마다 지었다. `color` 는 그
 * 우회를 한 곳에 둔 것이다 — 값은 디자인 시스템의 토큰이 아니고(도메인을 모른다) 스와치 한 칸에만 닿는다. 타일 · 무늬 · 각진 모서리는 캔버스 그대로다.
 * 위치(도면 모서리의 절대 배치)도 앱이 정한다. 훅 · 핸들러가 없어 서버에서도 렌더된다. */

/** `Legend` 의 props — `<ul>` 속성(ref 포함) + `orientation`. */
export interface LegendProps extends ComponentPropsWithRef<"ul">, VariantProps<typeof legendVariants> {}

type LegendOrientation = NonNullable<VariantProps<typeof legendVariants>["orientation"]>;

/**
 * 범례 — `LegendItem` 의 목록. 상자는 도면 위에 뜨는 크롬 패널(`rounded-lg` · 테두리 · 카드 면 · `shadow-pop`, 다크를 따른다)이고
 * 스와치만 캔버스(흰 타일 위 각진 무채색)다. 스크린리더 이름은 기본 «Legend» 이고 `aria-label` 로 바꾼다.
 * @slot legend
 */
export function Legend({ className, orientation, ...rest }: LegendProps) {
  const resolved = orientation ?? "vertical";
  return (
    <ul
      aria-label="Legend"
      className={cn(legendVariants({ orientation: resolved }), className)}
      {...rest}
      data-slot="legend"
      // `satisfies` — 문자열 축이지 불리언이 아니다(boolean-string-data-attr 래칫, Tabs 와 같다).
      data-orientation={resolved satisfies LegendOrientation}
    />
  );
}

/** `LegendItem` 의 props — `<li>` 속성(ref 포함) + `swatch` · `pattern` · `color`. */
export interface LegendItemProps
  extends Omit<ComponentPropsWithRef<"li">, "color">, VariantProps<typeof legendSwatchVariants> {
  /**
   * 도메인 색(CSS 색 값) — 도면의 그림과 맞춰야 하는 **앱의 값**(실 종류 · 검출 층). 주면 `swatch` 대신 이 색으로 그리고 `pattern` 은 그대로다.
   * 색만으로 말하지 않는다 — 라벨(`children`)이 항목의 이름이다.
   * @default undefined
   */
  color?: string | undefined;
}

type LegendSwatch = NonNullable<VariantProps<typeof legendSwatchVariants>["swatch"]>;
type LegendPattern = NonNullable<VariantProps<typeof legendSwatchVariants>["pattern"]>;

/**
 * 범례 한 줄 — 스와치(장식, 스크린리더는 건너뛴다) + 라벨(`children`). 스와치는 흰 캔버스 타일 위에 캔버스 무채색 한 단(`swatch`)과
 * 무늬(`pattern`)로 그린다. 도면의 그림과 맞춰야 하는 도메인 색은 `color` 로 준다.
 * @slot legend-item
 */
export function LegendItem({ className, swatch, pattern, color, children, ...rest }: LegendItemProps) {
  const resolvedSwatch = swatch ?? "ink";
  const resolvedPattern = pattern ?? "fill";
  const custom = color !== undefined;
  return (
    <li
      className={cn("flex min-w-0 items-center gap-2", className)}
      {...rest}
      data-slot="legend-item"
      data-swatch={custom ? "color" : (resolvedSwatch satisfies LegendSwatch)}
      data-pattern={resolvedPattern satisfies LegendPattern}
    >
      <span aria-hidden="true" data-slot="legend-swatch-tile" className={legendSwatchTileClassName}>
        <span
          data-slot="legend-swatch"
          /* 도메인 색은 CSS 변수로 싣고 클래스가 읽는다 — 무늬는 currentColor 를 그대로 쓴다. `swatch: null` 은 cva 의 기본 단(ink)을 끈다. */
          className={cn(
            legendSwatchVariants({ swatch: custom ? null : resolvedSwatch, pattern: resolvedPattern }),
            custom && legendSwatchColorClassName,
          )}
          style={custom ? ({ "--legend-swatch": color } as CSSProperties) : undefined}
        />
      </span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}
