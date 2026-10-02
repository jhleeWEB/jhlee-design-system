import { cn, type VariantProps } from "../cn";
import { emptyStateTitleVariants, emptyStateVariants } from "./EmptyState.variants";

/* 빈 상태 — 「여기 아무것도 없다」 가 아니라 **「무엇을 하면 채워지는가」** 를 말한다.
 * 그래서 `action` 이 선택이 아니라 사실상 필수다. 빈 화면에 설명만 남기지 않는다. */

/** 빈 상태의 props — `div` 의 속성(`ref` 포함)을 그대로 받고 `title` 만 ReactNode 로 다시 선언한다. */
export interface EmptyStateProps
  extends Omit<React.ComponentProps<"div">, "title">, VariantProps<typeof emptyStateVariants> {
  /** 무엇이 비었는가 — 한 줄. DOM 의 `title`(툴팁 문자열)과 이름이 겹치므로 Omit 하고 다시 선언한다. */
  title: React.ReactNode;
  /**
   * 무엇을 하면 채워지는가 — 한두 문장.
   * @default undefined
   */
  description?: React.ReactNode;
  /**
   * 제목 위의 흐린 아이콘. 안의 svg 크기는 여기서 맞춘다(32px).
   * @default undefined
   */
  icon?: React.ReactNode;
  /**
   * 빈자리를 채우는 조치 — 대개 버튼 하나. 사실상 필수다.
   * @default undefined
   */
  action?: React.ReactNode;
  /**
   * 크기.
   * - `default` — 화면·카드의 넓은 빈자리(기본)
   * - `compact` — 패널 안의 좁은 자리. 여백과 제목을 줄인다
   * @default "default"
   */
  size?: "default" | "compact" | null | undefined;
}

/** 빈 상태 — 비어 있다는 사실보다 채우는 방법을 말한다. */
export function EmptyState({ className, title, description, icon, action, size, ...rest }: EmptyStateProps) {
  return (
    <div
      className={cn(emptyStateVariants({ size }), className)}
      {...rest}
      /* 슬롯·축은 rest 뒤 — 소비자가 넘긴 data-slot 이 손잡이를 덮지 못하게 한다(공통 계약 slot-locked). */
      data-slot="empty-state"
      data-size={size ?? "default"}
    >
      {/* 32px — 예전 `size-16`(64px)은 2px 격자 시절 값이 두 배로 남아 획(24 뷰박스의 2)이 5px 넘게 굵어졌다(#80). */}
      {icon ? <div className="text-foreground-disabled [&_svg]:size-8">{icon}</div> : null}
      <div className={emptyStateTitleVariants({ size })}>{title}</div>
      {description ? <p className="m-0 max-w-[46ch] text-body text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
