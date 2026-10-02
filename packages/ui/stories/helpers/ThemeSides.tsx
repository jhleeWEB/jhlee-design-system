import type { ReactNode } from "react";

/** 테마 이름 — `ThemeSides` 가 칸마다 넘긴다. */
export type ThemeSide = "light" | "dark";

/* 오버레이의 `ThemeContrast` 몸통 — `ThemePair` 와 같은 두 칸이지만 자식을 **테마를 받는 함수**로 받는다.
 * 오버레이 내용은 포털로 `document.body` 에 나가 칸의 `data-theme` 서브트리를 벗어난다. 그래서 칸이 테마 이름을 넘기고,
 * 스토리가 그 이름을 내용(Content)에 `data-theme` 으로 직접 단다 — tokens.css 의 `[data-theme=…]` 블록이 그 요소에서 크롬 값을 다시 선언한다.
 * 칸의 마크업은 ThemePair 와 같게 둔다(나란히 놓인 두 계열 스토리가 같은 모양으로 읽히게). */
export function ThemeSides({ children }: { children: (theme: ThemeSide) => ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-0 font-sans text-body">
      {(["light", "dark"] as const).map((theme) => (
        <section
          key={theme}
          data-theme={theme}
          data-testid={`theme-${theme}`}
          className="flex flex-col gap-3 bg-background p-6 text-foreground"
        >
          <span className="font-mono text-micro font-medium tracking-caps text-muted-foreground uppercase">
            {theme}
          </span>
          <div className="flex flex-wrap items-start gap-3">{children(theme)}</div>
        </section>
      ))}
    </div>
  );
}
