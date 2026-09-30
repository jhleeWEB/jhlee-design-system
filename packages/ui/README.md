# @jhleeweb/squircle-design-system

Squircle Design System 의 발행 패키지. 사용법·토큰·컴포넌트 계약은 저장소 루트 README 와 CLAUDE.md 를 본다.

- 진입: `import { … } from "@jhleeweb/squircle-design-system"` · `…/canvas-metrics` · `…/legacy`(3열 작업대 셸·컨트롤 — 루트 배럴의 같은 이름은 @deprecated, 다음 마이너에서 제거)
- CSS: `…/theme.css`(Tailwind v4 @theme + 캔버스/크롬 토큰 + 컴포넌트 규칙, `@source "./"` 자기 등록) · `…/tokens.css`(토큰만 — 옛 이름은 alias 로 남아 있다) · `…/corner.css`(비어 있는 호환 파일 — 스쿼클 폐기, #36) · `…/shell.css`(레거시 셸) · `…/canvas.css`.
- 검사: `…/testing` — 소비 레포의 `__arch__` 래칫이 부르는 순수 함수(`auditCorners` · `countByFile`). 모서리는 일반 `border-radius` 사다리(6/8/12/16px)라 원시 반경·`corner-shape` 선언·임의값 `rounded-[…]` 를 잡는다(스쿼클은 2026-09-30 폐기, #36).
  값의 정본은 `tokens/*.json`(DTCG)이고 CSS 는 생성물이다. 크롬 이름은 shadcn 어휘(`bg-background` `text-muted-foreground` `bg-primary` …, `tokens/README.md`)이고
  옛 이름(`text-ink` `bg-surface` `var(--chrome-line)` …)은 한 마이너 동안 alias 다 — 단 `accent`·`muted` 는 뜻이 바뀌었으니 `scripts/codemod-*.mjs` 를 한 번 돌린다
- 린트 프리셋: `…/eslint` — `squircleDesignSystem({ entryPoint })` 를 소비 레포 flat config 에 펼친다(raw `<button>` · 토큰 밖 클래스 · 옛 이름(--fix) · hex/임의값/격자 밖 간격 · 인라인 색 · 옛 tone(--fix)). optional peer `eslint ^10` · `eslint-plugin-better-tailwindcss`.
- peer: react ^19, react-dom ^19, tailwindcss ^4.3(선택)

## AGENTS

소비 레포의 에이전트가 이 패키지를 «지어내지 않고» 쓰게 하는 산출물(#31). 정본 순서는 `llms.txt` → `dist/components.manifest.json` → `docs/components/*.md` → `dist/**/*.d.ts` 다.

```bash
npx sds-agent sync            # 소비 레포 루트에서 — AGENTS.md 에 관리 블록(<!-- sds:begin --> … <!-- sds:end -->) upsert + .claude/skills/squircle-ds/ 복사. 멱등
npx sds-agent sync --cwd ../other-repo
```

- `llms.txt` — 사용 규칙 · «shadcn 과 다른 점» · 컴포넌트/훅/유틸리티/토큰 색인(llmstxt.org 형식). 에이전트가 처음 여는 파일.
- `dist/components.manifest.json` — export 전수의 기계 판독 정본: `kind`(component · compound · hook) · `client`("use client") · `props[]{type, required, default, values[]{value, doc}}` · `parts` · `deprecated` · cva 축/기본값 · 토큰 이름. `jq '.components[]|select(.name=="Button")'`.
- `docs/components/*.md` — 루트 컴포넌트마다 한 장(부품은 하위 절).
- `agent/AGENTS.block.md` — «디자인 시스템 계약(에이전트)» 절. sync 가 소비 레포 AGENTS.md 에 심는다(규칙은 항상 로드되는 곳에).
- `agent/skills/squircle-ds/SKILL.md` — 절차 Analyze(매니페스트에서 찾기) → Compose(부품 조립, 토큰 유틸만) → Audit(프리셋 린트 + tsc + 다크).

세 생성물은 소스의 JSDoc 에서 나온다(`scripts/build-manifest.ts` · `build-docs.ts`) — 설명을 고치려면 JSDoc 을 고치고 `pnpm manifest:build` 로 다시 만든다.
