import { cn, type VariantProps } from "../cn";
import { IconAlertTriangle, IconCircleCheck, IconCircleX, IconInfo } from "../icons/icons";
import { alertVariants, type AlertTone } from "./Alert.variants";

/* 인라인 경고 — 흐름 안에 남는다. 지나가는 것은 `Toast` 다.
 *
 * 원칙 2 를 지킨다: **색만으로 말하지 않는다.** 아이콘과 제목이 항상 함께 실리고,
 * 그래서 `tone` 마다 기본 아이콘을 여기서 고정한다 — 호출처가 잊으면 흑백에서 정보가 사라진다. */

/* 톤마다 아이콘 하나 — Toast 와 같은 글리프다(#78). 예전에는 16 뷰박스에 손으로 그린 원 + 획을 28px(`size-7`)로 키웠고 색은 회색 본문을
   물려받았다 — 이제 크롬 아이콘 16px · 톤 글자색이다. neutral 도 아이콘을 둔다(Info) — 토스트와 달리 흐름 안의 상자라 아이콘이 «안내문» 임을 말한다(#105). */
const TONE_ICON: Record<AlertTone, typeof IconInfo> = {
  neutral: IconInfo,
  info: IconInfo,
  success: IconCircleCheck,
  warning: IconAlertTriangle,
  destructive: IconCircleX,
};

/** 인라인 경고의 props — `div` 의 속성(`ref` 포함)을 그대로 받고 `title` 만 ReactNode 로 다시 선언한다. */
export interface AlertProps
  extends Omit<React.ComponentProps<"div">, "title">, Omit<VariantProps<typeof alertVariants>, "tone"> {
  /**
   * 톤 — 판정색 한 벌과 기본 아이콘을 함께 고른다. `destructive` 만 `role="alert"`(끼어들어 읽힌다), 나머지는 `role="status"`.
   * - `neutral` — 판정 없는 상주 안내문(출처 · 설명). 무채색 — 카드 면 · 기본 테두리
   * - `info` — 안내. 판정이 아니라 알아 둘 것(기본)
   * - `success` — 통과·완료
   * - `warning` — 주의. 진행은 되지만 확인이 필요하다
   * - `destructive` — 실패·위반. 고치기 전에는 진행할 수 없다
   * @default "info"
   */
  tone?: AlertTone | null | undefined;
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
  const resolved = tone ?? "info";
  const Icon = TONE_ICON[resolved];
  return (
    <div
      role={resolved === "destructive" ? "alert" : "status"}
      className={cn(alertVariants({ tone: resolved }), className)}
      {...rest}
      /* 슬롯·축은 rest 뒤 — 소비자가 넘긴 data-slot 이 손잡이를 덮지 못하게 한다(공통 계약 slot-locked). */
      data-slot="alert"
      data-tone={tone ?? "info"}
    >
      {/* 첫 줄 높이(20px)의 칸 가운데에 16px 아이콘 — 여러 줄 제목에서도 첫 줄에 붙는다(Toast 와 같다). */}
      <span className="flex h-5 shrink-0 items-center">
        <Icon data-slot="alert-icon" className="size-4" />
      </span>
      {/* 출처·식별자의 긴 한 단어도 경고의 최소 폭을 늘리지 않게 한다. */}
      <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">
        {title ? <div className="font-semibold">{title}</div> : null}
        {children ? <div className={cn(title && "mt-1")}>{children}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
