import { cn, type VariantProps } from "../cn";
import { normalizeTone, type ToneInput } from "../lib/tone";
import { spinnerVariants, type SpinnerTone } from "./Spinner.variants";

/* 스피너 — «돌고 있다» 만 말한다. 얼마나 남았는지는 `Progress` 가 맡는다.
 *
 * SVG 한 장으로 그린다. CSS 테두리 트릭(`border-t-transparent` + `animate-spin`)은 반올림 때문에
 * 작은 크기에서 링이 찌그러지는데, 이 제품의 기본 크기는 12–16px 라 그게 그대로 보인다. */

/** 스피너의 props — `svg` 의 속성(`ref` 포함)을 그대로 받는다. */
export interface SpinnerProps
  extends React.ComponentProps<"svg">, Omit<VariantProps<typeof spinnerVariants>, "tone"> {
  /**
   * 크기.
   * - `sm` — 버튼·입력 안처럼 좁은 자리
   * - `md` — 본문 줄 옆(기본)
   * - `lg` — 패널·빈자리의 가운데
   * @default "md"
   */
  size?: "sm" | "md" | "lg" | null | undefined;
  /**
   * 톤 — 링의 색.
   * - `neutral` — 글자색을 따른다(기본)
   * - `muted` — 보조 자리의 흐린 회색(스피너 전용 값)
   * - `primary` — 주된 동작의 진행
   * @default "neutral"
   * @deprecated 옛 키 `current` · `accent` 는 다음 마이너에서 제거 — `normalizeTone()` 이 한 마이너 동안 옮겨 준다(ds/legacy-tone --fix)
   */
  tone?: ToneInput<SpinnerTone> | null | undefined;
  /**
   * 스크린리더에 읽히는 문구(`role="status"`). 비우면 장식으로 숨긴다 — 버튼 안처럼 이미 `aria-busy` 가 있는 자리에서는 비운다.
   * @default undefined
   */
  label?: string;
}

/** 스피너 — «돌고 있다» 만 말한다. 얼마나 남았는지는 `Progress` 가 맡는다. */
export function Spinner({ className, size, tone, label, ...rest }: SpinnerProps) {
  return (
    <svg
      className={cn(spinnerVariants({ size, tone: normalizeTone(tone) }), className)}
      viewBox="0 0 16 16"
      fill="none"
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
      /* 슬롯·축은 rest 뒤 — 소비자가 넘긴 data-slot 이 손잡이를 덮지 못하게 한다(공통 계약 slot-locked). */
      data-slot="spinner"
      data-size={size ?? "md"}
      data-tone={normalizeTone(tone) ?? "neutral"}
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <path d="M8 1.5A6.5 6.5 0 0 1 14.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
