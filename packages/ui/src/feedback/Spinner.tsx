import { cn, type VariantProps } from "../cn";
import { spinnerVariants } from "./Spinner.variants";

/* 스피너 — «돌고 있다» 만 말한다. 얼마나 남았는지는 `Progress` 가 맡는다.
 *
 * SVG 한 장으로 그린다. CSS 테두리 트릭(`border-t-transparent` + `animate-spin`)은 반올림 때문에
 * 작은 크기에서 링이 찌그러지는데, 이 제품의 기본 크기는 12–16px 라 그게 그대로 보인다. */

export interface SpinnerProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {
  /** 스크린리더에 읽히는 문구. 버튼 안처럼 이미 `aria-busy` 가 있는 자리에서는 비운다. */
  label?: string;
}

export function Spinner({ className, size, tone, label, ...rest }: SpinnerProps) {
  return (
    <svg
      data-slot="spinner"
      className={cn(spinnerVariants({ size, tone }), className)}
      viewBox="0 0 16 16"
      fill="none"
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <path
        d="M8 1.5A6.5 6.5 0 0 1 14.5 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
