# @jhleeweb/squircle-design-system

Squircle Design System 의 발행 패키지. 사용법·토큰·컴포넌트 계약은 저장소 루트 README 와 CLAUDE.md 를 본다.

- 진입: `import { … } from "@jhleeweb/squircle-design-system"` · `…/canvas-metrics` · `…/testing` · `…/eslint` · `…/icons`(`./legacy` 는 3.0.0 에서 지웠다 — 아래 «2.x → 3.0»)
- 아이콘: `…/icons` — `import { IconOrbit, IconMove, icons } from "@jhleeweb/squircle-design-system/icons"`(#64). 24 뷰박스 · 획 2 · currentColor, 기본 16px(`--size-icon-md`), `title` 을 주면 `role="img"`(없으면 `aria-hidden`). 크롬 · 툴 클러스터(선택 · 오빗 · 팬 · 줌 · 이동/회전/축척 · 그리기 · 오프셋/돌출/단면 · 측정 · 카메라 뷰) · 글자 서식 70개 — lucide 에서 옮긴 글리프의 ISC 고지는 `dist/icons/LICENSE-lucide.txt`. `react-icons` 의존은 없다.
- 커서: `theme.css`/`tokens.css` 가 `--cursor-<이름>`(32px SVG · 핫스팟 · 키워드 폴백)을, `theme.css` 가 유틸리티 `cursor-cad-<이름>` 을 낸다 — `select` `orbit` `pan` `grabbing` `zoom-window` `crosshair` `draw` `measure` `section` `snap` `resize-*` … 27개(카탈로그 `Foundations/Cursors`).
- CSS: `…/theme.css`(Tailwind v4 @theme + 캔버스/크롬 토큰 + 컴포넌트 규칙, `@source "./"` 자기 등록) · `…/tokens.css`(토큰만) · `…/corner.css`(비어 있는 호환 파일 — 스쿼클 폐기, #36) · `…/canvas.css`.
- 검사: `…/testing` — 소비 레포의 `__arch__` 래칫이 부르는 순수 함수(`auditCorners` · `countByFile`). 모서리는 일반 `border-radius` 사다리(6/8/12/16px)라 원시 반경·`corner-shape` 선언·임의값 `rounded-[…]` 를 잡는다(스쿼클은 2026-09-30 폐기, #36).
  값의 정본은 `tokens/*.json`(DTCG)이고 CSS 는 생성물이다. 크롬 이름은 shadcn 어휘(`bg-background` `text-muted-foreground` `bg-primary` …, `tokens/README.md`)이고
  옛 이름(`text-ink` `bg-surface` `var(--chrome-line)` · `var(--ink)` …)은 3.0.0 에서 alias 째 지웠다 — 코드모드(`scripts/codemod-*.mjs`)를 한 번 돌리고 프리셋 린트 `--fix` 로 마무리한다
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

## 2.x → 3.0

3.0.0 은 legacy 를 지우고(#49) 새 부품 `Select` · `Field` · `Tabs`(#47)를 루트 이름에 들인 major 다. 소비 레포는 아래 순서로 옮긴다.

1. **옛 이름부터 옮긴다(2.x 에서, 버전을 올리기 전에).** 2.x 에서는 alias 가 살아 있어 픽셀이 그대로이므로 diff 가 이름 바꾸기뿐이다.
   - CSS 변수: `node scripts/codemod-css-vars.mjs <소스 디렉터리>` — `var(--chrome-line)` → `var(--chrome-border)` · `var(--radius-chip)` → `var(--radius-sm)` ·
     옛 base 이름 `var(--ink)` → `var(--palette-gray-900)`(값이 같은 원시) · `var(--gap)` → `var(--space-hairline)` · `var(--color-cool-500)` → `var(--palette-cool-500)` …
   - 유틸 클래스: `node scripts/codemod-classes.mjs <소스 디렉터리>` — `text-ink` → `text-foreground` · `bg-surface-2` → `bg-muted` · `text-accent` → `text-primary` ·
     `rounded-control` → `rounded-md` …(**한 번만** 돌린다 — 두 번째 실행은 새 `bg-accent`·`bg-muted` 를 다시 바꾼다)
   - tone: 프리셋 린트(`…/eslint` 의 `squircleDesignSystem`)의 `ds/legacy-tone --fix` — `tone="accent"` → `"primary"` · `ok` → `success` · `warn` → `warning` ·
     `danger` → `destructive` · `default`/`current` → `neutral`. `no-restricted-classes --fix` 가 남은 옛 유틸을 잡는다.
2. **버전을 3.0.0 으로 올리고 아래 이름을 바꾼다.**

| 지운 것(2.x) | 3.0 에서 |
|---|---|
| `…/legacy` 서브패스 · `…/shell.css` | 없다. 3열 작업대 셸 레이아웃은 앱이 소유한다(DS 의 `Card` · `Sidebar` · `Toolbar` · `ScrollArea` 로 조립) |
| `AppShell` · `TopBar` · `Panel` · `PanelGroup` · `ViewerPanel` | 앱의 레이아웃 + `Card`(`CardHeader` · `CardWell`) · `Sidebar` · `Toolbar` |
| `Hud` · `HudCell` · `KeyValue` · `Legend` · `StatusBadge` · `Verdict` | `DescriptionList` · `Badge` · `StatusDot` · 앱의 범례 |
| `Segmented` · `Toggle` · `Slider` · `Option` | `SegmentedControl` · `Switch`(+ `Field`) · 앱의 슬라이더(입력은 `Input type="number"`) |
| 루트 `Select`(options 배열) | `Select` · `SelectTrigger` · `SelectValue` · `SelectContent` · `SelectItem` …(Radix 합성, #47) |
| 루트 `Field`(라벨 + 값 + 경로 레이아웃) | `Field` · `FieldLabel` · `FieldControl` · `FieldDescription` · `FieldError`(id · aria 연결을 소유) |
| 루트 `Tabs`(options 배열, 탭 줄만) | `Tabs` · `TabsList`(`variant` segmented · underline) · `TabsTrigger` · `TabsContent` |
| `DesignSystemProvider` | 없다 — DS 컴포넌트는 Provider 없이 그려진다 |
| `normalizeTone` · `LegacyTone` · `LegacyToneOf` · `ToneInput` · 옛 tone 키 | 새 키만(`Tone` · `toneValues`). 옛 키는 타입 오류 — `ds/legacy-tone --fix` |
| 옛 CSS 변수 alias(`generated/legacy.css`: `--ink` · `--gap` · `--chrome-ink` · `--radius-chip` · `--color-{hue}-*` …) | 정의가 없다 — 1 의 코드모드 |
| 옛 유틸 이름(`text-ink` · `bg-surface` · `rounded-chip` · `rounded-control` …) | Tailwind 가 모르는 클래스(조용히 무시) — 1 의 코드모드 · 린트 `--fix` |

`Button` 은 이제 `data-slot="button"` 을 잠근다 — 소비자가 넘긴 `data-slot` 은 무시된다(DOM 손잡이는 DS 이름이다).
