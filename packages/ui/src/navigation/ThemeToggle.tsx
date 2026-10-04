"use client";

import { cn } from "../cn";
import { IconMoon, IconSun } from "../icons/icons";
import { SlottedButton, type ButtonProps } from "../primitives/Button";
import { useTheme } from "./useTheme";

/** `<ThemeToggle>` 의 props — 아이콘 버튼이라 `variant` · `size` · `children` 은 고정이다. */
export interface ThemeToggleProps extends Omit<
  ButtonProps,
  "children" | "onClick" | "size" | "variant" | "asChild"
> {
  /**
   * 저장 키 — 주면 고른 테마가 localStorage 에 남는다(`useTheme` 의 `storageKey`).
   * @default undefined
   */
  storageKey?: string;
}

/**
 * 라이트/다크 전환 아이콘 버튼 — 상단바 오른쪽 끝에 둔다. 아이콘과 이름은 **누르면 갈 테마**를 말한다(라이트에서는 달 · «Switch to dark theme»).
 * `html[data-theme]` 을 쓰므로 뒤집히는 것은 크롬뿐이다. OS 설정으로 되돌리는 세 번째 선택이 필요하면 `useTheme` 과 `SegmentedControl` 로 짓는다.
 * @slot theme-toggle
 */
export function ThemeToggle({ storageKey, className, ...rest }: ThemeToggleProps) {
  /* exactOptionalPropertyTypes — undefined 를 그대로 넘기지 않는다. */
  const { resolved, setTheme } = useTheme(storageKey === undefined ? undefined : { storageKey });
  const next = resolved === "dark" ? "light" : "dark";
  const action = `Switch to ${next} theme`;
  const Icon = next === "dark" ? IconMoon : IconSun;
  return (
    <SlottedButton
      {...rest}
      slot="theme-toggle"
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn("shrink-0 [&_svg]:size-4", className)}
      aria-label={action}
      title={action}
      onClick={() => setTheme(next)}
    >
      <Icon />
    </SlottedButton>
  );
}
