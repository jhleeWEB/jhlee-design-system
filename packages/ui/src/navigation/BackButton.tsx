import type { RefAttributes } from "react";
import { LuArrowLeft } from "react-icons/lu";

import { cn } from "../cn";
import { Button, type ButtonProps } from "../primitives/Button";

/**
 * `BackButton` 의 props — `Button` 과 같되 `asChild` 가 없고 기본 외형이 다르다(ghost · sm).
 * 축 prop 을 여기서 다시 적는 이유: 매니페스트는 prop 이 선언된 자리의 JSDoc 을 읽는다 — `ButtonProps` 의 기본값(outline · md)이 뒤로가기의
 * 기본값으로 문서에 실리면 틀린 문서다.
 */
export interface BackButtonProps
  extends
    Omit<ButtonProps, "asChild" | "variant" | "size" | "tone" | "loading">,
    RefAttributes<HTMLButtonElement> {
  /**
   * 외형 — `solid` — 채움 · `outline` — 외곽선 · `ghost` — 바탕 없음(뒤로가기의 기본) · `link` — 밑줄 글자
   * @default "ghost"
   */
  variant?: ButtonProps["variant"];
  /**
   * 크기 — `sm` — 작은 컨트롤 높이(기본) · `md` — 기본 컨트롤 높이 · `lg` — 큰 컨트롤 높이 · `icon-sm` — 작은 정사각 아이콘 · `icon` — 정사각 아이콘 · `icon-lg` — 큰 정사각 아이콘
   * @default "sm"
   */
  size?: ButtonProps["size"];
  /**
   * 톤 — `neutral`(기본) · `primary`(주된 동작) · `destructive`(파괴적 동작).
   * @default "neutral"
   */
  tone?: ButtonProps["tone"];
  /**
   * 진행 중 — 스피너를 라벨 앞에 더하고 누름을 막는다.
   * @default false
   */
  loading?: ButtonProps["loading"];
}

/** 뒤로가기의 동작은 라우터가 소유하고 모양·아이콘은 모든 페이지에서 공유한다. */
export function BackButton({
  children = "Back",
  className,
  type = "button",
  variant = "ghost",
  size = "sm",
  ...props
}: BackButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      className={cn("gap-2 [&_svg]:size-4", className)}
      {...props}
      /* 소비자의 data-slot 이 Button 의 것을 덮지 못하게 rest 뒤에 둔다(공통 계약 slot-locked). */
      data-slot="button"
    >
      {/* 크기(16px)는 위 `[&_svg]:size-4` 가, 선 굵기는 Lucide 기본(2)이 정한다 — 숫자 prop 을 두지 않는다(jsx-size-number 래칫). */}
      <LuArrowLeft aria-hidden="true" focusable={false} />
      {children}
    </Button>
  );
}
