import type { ReactNode } from "react";

/* `ThemeContrast` 스토리의 몸통 — 같은 자식을 라이트·다크 서브트리에 나란히 두 번 그린다.
 * 서브트리 `data-theme` 가 먹는 것은 theme.css 의 다크·라이트 선택자가 `[data-theme=…]` 를 포함하기 때문이다(#6).
 * 캔버스 토큰은 어느 쪽에서도 바뀌지 않아야 한다 — 그것이 방향 C 의 유일한 구조적 약속이고, 이 두 칸이 그 증거다. */
export function ThemePair({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-0 font-sans text-body">
      {(["light", "dark"] as const).map(theme => (
        <section key={theme} data-theme={theme} data-testid={`theme-${theme}`} className="flex flex-col gap-3 bg-background p-6 text-foreground">
          <span className="font-mono text-micro uppercase tracking-caps text-muted-foreground">{theme}</span>
          <div className="flex flex-wrap items-start gap-3">{children}</div>
        </section>
      ))}
    </div>
  );
}
