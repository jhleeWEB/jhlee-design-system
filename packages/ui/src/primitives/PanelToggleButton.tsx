import { forwardRef } from "react";
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
  return <Button {...rest} ref={ref} type="button" variant="ghost" size="icon-sm"
    className={cn("shrink-0 [&_svg]:size-4", className)}
    aria-expanded={open} aria-controls={controls} aria-label={action} title={action}
    onClick={() => onOpenChange(!open)}>
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={open ? "m4 4 6 6M10 4v6H4m16 16-6-6M14 20v-6h6" : "m10 10-6-6M4 10V4h6m4 10 6 6M20 14v6h-6"} />
    </svg>
  </Button>;
});
