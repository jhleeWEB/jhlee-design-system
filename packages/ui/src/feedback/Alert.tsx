import { cn, type VariantProps } from "../cn";
import { normalizeTone, type ToneInput } from "../lib/tone";
import { alertVariants, type AlertTone } from "./Alert.variants";

/* 인라인 경고 — 흐름 안에 남는다. 지나가는 것은 `Toast` 다.
 *
 * 원칙 2 를 지킨다: **색만으로 말하지 않는다.** 아이콘과 제목이 항상 함께 실리고,
 * 그래서 `tone` 마다 기본 아이콘을 여기서 고정한다 — 호출처가 잊으면 흑백에서 정보가 사라진다. */

const GLYPH: Record<AlertTone, string> = {
  info: "M8 7.2v4.4M8 4.6v.9",
  success: "M4.6 8.3l2.3 2.3 4.5-4.9",
  warning: "M8 5v3.6M8 10.9v.9",
  destructive: "M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8",
};

/** 인라인 경고의 props — `div` 의 속성(`ref` 포함)을 그대로 받고 `title` 만 ReactNode 로 다시 선언한다. */
export interface AlertProps
  extends Omit<React.ComponentProps<"div">, "title">, Omit<VariantProps<typeof alertVariants>, "tone"> {
  /**
   * 톤 — 판정색 한 벌과 기본 아이콘을 함께 고른다. `destructive` 만 `role="alert"`(끼어들어 읽힌다), 나머지는 `role="status"`.
   * - `info` — 안내. 판정이 아니라 알아 둘 것(기본)
   * - `success` — 통과·완료
   * - `warning` — 주의. 진행은 되지만 확인이 필요하다
   * - `destructive` — 실패·위반. 고치기 전에는 진행할 수 없다
   * @default "info"
   * @deprecated 옛 키 `ok` · `warn` · `danger` 는 다음 마이너에서 제거 — `normalizeTone()` 이 한 마이너 동안 옮겨 준다(ds/legacy-tone --fix)
   */
  tone?: ToneInput<AlertTone> | null | undefined;
  /**
   * 굵은 첫 줄 — 무슨 일인지 한 문장. 없으면 본문만 그린다.
   * `title` 을 Omit 하고 다시 선언한다 — DOM 의 `title` 은 툴팁 문자열이라 ReactNode 를 못 받는다.
   * @default undefined
   */
  title?: React.ReactNode;
  /**
   * 오른쪽 끝에 붙는 조치 — 대개 버튼 하나.
   * @default undefined
   */
  action?: React.ReactNode;
}

/** 인라인 경고 — 흐름 안에 남는 알림. 아이콘·제목·색이 함께 말한다(색만으로 말하지 않는다). */
export function Alert({ className, tone, title, action, children, ...rest }: AlertProps) {
  const resolved = normalizeTone(tone) ?? "info";
  return (
    <div
      role={resolved === "destructive" ? "alert" : "status"}
      className={cn(alertVariants({ tone: resolved }), className)}
      {...rest}
      /* 슬롯·축은 rest 뒤 — 소비자가 넘긴 data-slot 이 손잡이를 덮지 못하게 한다(공통 계약 slot-locked). */
      data-slot="alert"
      data-tone={normalizeTone(tone) ?? "info"}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-px size-7 shrink-0">
        <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d={GLYPH[resolved]} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {/* 출처·식별자의 긴 한 단어도 경고의 최소 폭을 늘리지 않게 한다. */}
      <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">
        {title ? <div className="font-semibold text-foreground">{title}</div> : null}
        {children ? <div className={cn(title && "mt-1")}>{children}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
