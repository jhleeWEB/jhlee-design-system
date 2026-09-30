## 디자인 시스템 계약(에이전트) — {{name}} v{{version}}

`npx sds-agent sync` 가 관리하는 블록이다 — 손으로 고치지 않는다(다음 sync 가 덮는다). 절차는 `.claude/skills/squircle-ds/SKILL.md`(Analyze → Compose → Audit), 색인은 `node_modules/{{name}}/llms.txt`, 기계 판독 정본은 `node_modules/{{name}}/dist/components.manifest.json`.

- **정본 순서.** `llms.txt` → `components.manifest.json` → `docs/components/*.md` → `dist/**/*.d.ts`. 매니페스트에 없는 컴포넌트·부품·prop 은 **지어내지 않는다** — «DS 확장 필요» 로 보고하고 멈춘다.
- **import 는 루트 배럴 하나** `{{name}}`. `./legacy`(3열 작업대 셸·컨트롤: AppShell · Panel · Select · Tabs …)는 @deprecated — 새 화면에 쓰지 않는다.
- **className 은 토큰 유틸만.** 색은 shadcn 이름(`bg-background` `bg-card` `bg-muted` `text-foreground` `text-muted-foreground` `border-border` `bg-primary` `text-primary-foreground` `bg-accent` `ring-ring` `bg-destructive-soft` …), 그 밖은 역할 이름(`text-body` `rounded-md` `shadow-pop` `h-ctl` `z-popover` `duration-fast`). Tailwind 기본 사다리(`text-sm` `bg-gray-100` `rounded` `shadow-md` `z-50` `duration-200`)는 `initial` 로 지워져 **CSS 없이 조용히 무시된다**. hex · `[12px]` · `style={{ color | background | border }}` 금지. 값이 필요하면 토큰을 더하는 것은 DS 의 일이다.
- **간격은 4px 스텝 화이트리스트** `0 1 2 3 4 5 6 8 10 12 16 20 24`(px = 4 × step) — 간격 계열(p/m/gap/space/inset)에만. 반스텝(`gap-1.5`)·7·9·11·임의 px 는 밖이다.
- **shadcn 과 다른 점**(같은 이름은 설명 없이 쓴다): 글자 사다리는 역할 이름 `text-micro/label/body/control/title/readout/display`(본문 13px); 컨트롤 높이 `h-ctl-sm/ctl/ctl-lg`(30/36/44); 그림자 `shadow-chip/card/pop/modal`; 판정색 `success/warning/destructive/info` 각각 `DEFAULT/-hover/-foreground/-soft/-line`; `primary` 는 «지금 고른 것·주된 동작»(옛 `accent`); 캔버스 `canvas-*`(도면 면: 흰 바탕 고정·radius 0·무채색·다크 없음); 층 `z-raised/sticky/scrim/modal/popover/toast/tooltip`; 시간 `duration-instant/fast/base/slow`; CSS 변수는 면 접두 `var(--chrome-*)` `var(--canvas-*)`; 기반은 Base UI 가 아니라 **Radix**. 전체 표는 `llms.txt` «shadcn 과 다른 점».
- **캔버스인가 크롬인가.** 새 컴포넌트마다 먼저 묻는다. 도면 요소·치수선·범례 스와치는 캔버스, 그 밖은 크롬(듀얼 테마·작은 radius·부유 레이어에만 그림자). 다크는 `html[data-theme="dark"]` 로 크롬에만.
- **유채색은 판정에만.** 상태는 항상 텍스트와 병기한다. 수치는 `font-mono tabular-nums`(`.num`).
- **부품 먼저, 래퍼는 설탕.** 부품은 평탄 이름(`ModalContent` `DropdownMenuItem` `TabsContent`)이고 `data-slot` 으로 자기 이름을 DOM 에 남긴다. `Modal.Content` 같은 정적 속성 컴파운드는 없다. 설탕(`ConfirmDialog` `DataTable`)은 부품으로 안 될 때만.
- **`tone` 은 한 어휘** `neutral | primary | success | warning | destructive | info`. 옛 키(`accent` `ok` `warn` `danger`)·옛 유틸(`text-ink` `bg-surface` `rounded-control`)은 한 마이너 동안만 동작 — 린트 `--fix` 가 바꾼다.
- **클라이언트 경계(Next App Router).** 매니페스트 `client: true` 컴포넌트는 서버 컴포넌트 트리에서 렌더하지 않는다 — `"use client"` 파일에서 조립한다. 서버에서 className 만 필요하면 `*Variants`(지시문 없음)를 호출한다: `buttonVariants({ variant: "solid" })`.
- **폴더 규칙(DS 안).** `Name.tsx · Name.variants.ts · Name.stories.tsx · Name.spec.tsx · index.ts`. 훅·핸들러·컨텍스트·Radix 를 쓰는 파일은 첫 줄 `"use client"`, `*.variants.ts`·배럴에는 없다. 공개 심볼은 `/** */` JSDoc(optional prop `@default`, 유니언은 값마다 «`값` — 설명» 한 줄, 컴포넌트는 `@example` 하나). 스토리는 `Default · Variants · ThemeContrast` 셋.
- **검증.** 소비 레포: `eslint.config.js` 에 `squircleDesignSystem({ entryPoint })`(`{{name}}/eslint`)를 펼치고 `eslint` + `tsc --noEmit` 위반 0, `data-theme="dark"` 에서 `canvas-*` 불변. DS 레포: `pnpm verify`(typecheck · lint · tokens:check · manifest:check · test · build), `test:stories`, `vrt`(스냅샷 갱신은 `vrt:update` 도커만).
- **커밋·버전.** Conventional Commits(영문 type + 한글 설명). `fix` patch · `feat` minor · `feat!:`/`BREAKING CHANGE:` major — 0.x 특례 없음. 한글 설명만으로는 major 가 오르지 않는다.
