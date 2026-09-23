import { forwardRef } from "react";
import { LuArrowLeft } from "react-icons/lu";

import { cn } from "../cn";
import { Button, type ButtonProps } from "../primitives/Button";

/** 뒤로가기의 동작은 라우터가 소유하고 모양·아이콘은 모든 페이지에서 공유한다. */
export const BackButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, "asChild">>(function BackButton(
  { children = "Back", className, type = "button", variant = "ghost", size = "sm", ...props },
  ref,
) {
  return (
    <Button ref={ref} type={type} variant={variant} size={size} className={cn("gap-2 [&_svg]:size-4", className)} {...props}>
      <LuArrowLeft size={16} strokeWidth={2} aria-hidden="true" focusable={false} />
      {children}
    </Button>
  );
});
