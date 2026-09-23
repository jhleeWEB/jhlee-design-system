import { forwardRef } from "react";
import { LuMaximize2, LuMinimize2 } from "react-icons/lu";
import { cn } from "../cn";
import { Button, type ButtonProps } from "./Button";

export interface PanelToggleButtonProps extends Omit<ButtonProps, "children" | "onClick" | "size" | "variant" | "asChild"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 아이콘만 보여도 어느 패널을 여닫는지 툴팁과 접근성 이름에 남긴다. */
  label: string;
  controls?: string;
}

export const PanelToggleButton = forwardRef<HTMLButtonElement, PanelToggleButtonProps>(function PanelToggleButton(
  { open, onOpenChange, label, controls, className, ...rest }, ref,
) {
  const action = `${open ? "Collapse" : "Show"} the ${label}`;
  const Icon = open ? LuMinimize2 : LuMaximize2;
  return <Button {...rest} ref={ref} type="button" variant="ghost" size="icon-sm"
    className={cn("shrink-0 [&_svg]:size-4", className)}
    aria-expanded={open} aria-controls={controls} aria-label={action} title={action}
    onClick={() => onOpenChange(!open)}>
    <Icon size={16} strokeWidth={2} aria-hidden="true" focusable={false} />
  </Button>;
});
