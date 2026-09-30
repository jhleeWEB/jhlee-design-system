# @jhleeweb/squircle-design-system

Squircle Design System 의 발행 패키지. 사용법·토큰·컴포넌트 계약은 저장소 루트 README 와 CLAUDE.md 를 본다.

- 진입: `import { … } from "@jhleeweb/squircle-design-system"` · `…/canvas-metrics` · `…/legacy`(3열 작업대 셸·컨트롤 — 루트 배럴의 같은 이름은 @deprecated, 다음 마이너에서 제거)
- CSS: `…/theme.css`(Tailwind v4 @theme + 캔버스/크롬 토큰 + 컴포넌트 규칙 + 곡률, `@source "./"` 자기 등록) · `…/tokens.css`(토큰만 — 옛 이름은 alias 로 남아 있다) · `…/corner.css`(곡률 규칙만 — theme.css 가 이미 싣는다) · `…/shell.css`(레거시 셸) · `…/canvas.css`.
- 검사: `…/testing` — 소비 레포의 `__arch__` 래칫이 부르는 순수 함수(`auditCorners` · `countByFile` · `profileCorner`). 모서리는 스쿼클 진행형 향상(#26)이라 원시 반경·`round` 없는 원형·임의값 `rounded-[…]` 를 잡는다.
  값의 정본은 `tokens/*.json`(DTCG)이고 CSS 는 생성물이다. 크롬 이름은 shadcn 어휘(`bg-background` `text-muted-foreground` `bg-primary` …, `tokens/README.md`)이고
  옛 이름(`text-ink` `bg-surface` `var(--chrome-line)` …)은 한 마이너 동안 alias 다 — 단 `accent`·`muted` 는 뜻이 바뀌었으니 `scripts/codemod-*.mjs` 를 한 번 돌린다
- peer: react ^19, react-dom ^19, tailwindcss ^4.3(선택)
