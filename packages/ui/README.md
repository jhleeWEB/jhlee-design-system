# @jhleeweb/squircle-design-system

Squircle Design System 의 발행 패키지. 사용법·토큰·컴포넌트 계약은 저장소 루트 README 와 CLAUDE.md 를 본다.

- 진입: `import { … } from "@jhleeweb/squircle-design-system"` · `…/canvas-metrics` · `…/legacy`(3열 작업대 셸·컨트롤 — 루트 배럴의 같은 이름은 @deprecated, 다음 마이너에서 제거)
- CSS: `…/theme.css`(Tailwind v4 @theme + 캔버스/크롬 토큰 + 컴포넌트 규칙, `@source "./"` 자기 등록) · `…/tokens.css`(토큰만 — 옛 base 이름은 alias 로 남아 있다) · `…/shell.css`(레거시 셸) · `…/canvas.css`.
  값의 정본은 `tokens/*.json`(DTCG)이고 CSS 는 생성물이다
- peer: react ^19, react-dom ^19, tailwindcss ^4.3(선택)
