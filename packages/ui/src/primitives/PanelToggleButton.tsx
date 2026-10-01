"use client";
import { LuMaximize2, LuMinimize2 } from "react-icons/lu";

import { cn } from "../cn";
import { ICON } from "../lib/icons";
import { SlottedButton, type ButtonProps } from "./Button";

/** `<PanelToggleButton>` 의 props — 아이콘 버튼이라 `variant` · `size` · `children` 은 고정이다. */
export interface PanelToggleButtonProps extends Omit<
  ButtonProps,
  "children" | "onClick" | "size" | "variant" | "asChild"
> {
  /** 패널이 지금 열려 있는가. 아이콘과 접근성 이름이 이 값으로 정해진다. */
  open: boolean;
  /** 눌렀을 때 다음 상태(`!open`)로 불린다 — 제어 컴포넌트다. */
  onOpenChange: (open: boolean) => void;
  /** 아이콘만 보여도 어느 패널을 여닫는지 툴팁과 접근성 이름에 남긴다. */
  label: string;
  /**
   * 여닫는 패널의 `id` — `aria-controls` 로 간다.
   * @default undefined
   */
  controls?: string;
}

/**
 * 패널 토글을 `slot` 이름으로 그린다 — 내부용, 배럴에는 없다.
 *
 * Card 의 머리 접기 버튼이 같은 모양을 `data-slot="card-collapse"` 로 쓴다. 공개 컴포넌트는 `data-slot` 을 잠가야 하므로(공통 계약
 * slot-locked) 소비자 prop 으로는 이름을 바꿀 수 없고, 그래서 이름을 인자로 받는 렌더 함수를 둔다.
 */
export function renderPanelToggle(
  { ref, open, onOpenChange, label, controls, className, ...rest }: PanelToggleButtonProps,
  slot: string,
) {
  const action = `${open ? "Collapse" : "Show"} the ${label}`;
  const Icon = open ? LuMinimize2 : LuMaximize2;
  return (
    <SlottedButton
      {...rest}
      ref={ref}
      slot={slot}
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn("shrink-0 [&_svg]:size-4", className)}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={action}
      title={action}
      onClick={() => onOpenChange(!open)}
    >
      <Icon {...ICON} />
    </SlottedButton>
  );
}

/** 패널 여닫기 아이콘 버튼 — 열려 있으면 «접기», 닫혀 있으면 «보이기» 아이콘과 이름을 단다. */
export function PanelToggleButton(props: PanelToggleButtonProps) {
  return renderPanelToggle(props, "panel-toggle-button");
}
