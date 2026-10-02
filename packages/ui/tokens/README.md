# tokens/ — DTCG 정본과 조어 규칙

사람이 편집하는 유일한 곳이다. `build.mjs` 가 `src/generated/*` 와 `src/generated/legacy-classes.json`(옛 이름 코드모드 표, 원천은 `legacy-map.mjs`)을 만들고 `pnpm tokens:check` 가 최신성을 강제한다.
스키마(`schema.ts`)가 파일 모양과 파일 사이의 약속을 검사한다 — 정의 없는 alias · 다크에 빠진 크롬 토큰 · 다시 생긴 `legacy.json` 은 생성 전에 실패한다.

```
primitive/  color(--palette-*) · dimension(--size-* --space-* --spacing) · motion(--duration-* --ease-*) · typography(--font-stack-*)   ← 리터럴이 사는 유일한 층
semantic/   canvas.json(다크 없음) · chrome.light.json + chrome.dark.json(같은 키 집합) · layer.json(radius · shadow · z-index · corner 곡률) · tailwind.json(@theme inline --color-*)
component/  control · overlay · toast · tooltip · scroll · collapse                                                                        ← 치수·시간
legacy-map.mjs  옛 이름 → 새 이름 정적 표(JSON 정본 밖) — 린트 · 코드모드의 원천. 아래 «옛 이름»
```

## 조어 규칙(B5 — shadcn 어휘, #22)

크롬(`chrome.*`)의 이름은 shadcn/ui 의 것을 따른다 — LLM 의 사전 분포와 패키지가 일치해야 `bg-background` 가 처음부터 통한다.

| 자리 | 규칙 | 예 |
|---|---|---|
| 면 | `<role>` | `background` `card` `muted` `secondary` `popover` `primary` `accent` `success` |
| 그 면 위의 글자 | `<role>-foreground` | `primary-foreground` `accent-foreground` `destructive-foreground` `tooltip-foreground` |
| 옅은 면(배지 · 알림 바탕) | `<role>-soft` | `success-soft` `warning-soft` `destructive-soft` `info-soft` |
| 테두리(면 위 3:1) | `<role>-line` | `success-line` `destructive-line` |
| hover 채움 | `<role>-hover` | `primary-hover` `success-hover` |
| 사다리(한 단 약한 것) | `-2` `-3` | `foreground-2` · 면은 `muted`(한 단) `secondary`(두 단) |
| 글자 사다리 | `foreground` → `foreground-2` → `muted-foreground` → `foreground-disabled` | 본문 · 보조 · 라벨 · 비활성 |
| 테두리 사다리 | `border` → `border-strong` | 구획선 · 컨트롤 외곽 |
| 반경 | `xs` `sm` `md` `lg` `xl` `full` = 4 / 6 / 8 / 12 / 16 / 9999 px 고정(원호 — 스쿼클은 #36 에서 폐기) | 작은 표시 · 칩 · 컨트롤 · 면 · 모달 — 아래 «역할 → 토큰» |

**뜻이 갈리는 두 이름**: `primary`(브랜드 시그널 Klein 채움, «지금 고른 것 · 주된 동작»)와 `accent`(옅은 Klein 면 — 선택된 행 · 배지 바탕). shadcn 과 같다. 옛 이름에서
`accent` 는 azure 채움이었고 `muted` 는 회색 **글자**였다 — 그래서 그 둘은 2.x 에서도 alias 로 살릴 수 없었고 코드모드로만 옮긴다(아래).

**JSON 경로 → CSS → Tailwind** 는 기계적이다: `chrome.muted-foreground` → `--chrome-muted-foreground` → `text-muted-foreground`(`chrome-` 접두만 뗀다).
캔버스는 접두를 남긴다: `canvas.ink` → `--canvas-ink` → `text-canvas-ink`. 예외는 `--color-input`(chrome 토큰 없이 `border` 를 가리킨다) 하나다.

**판정색**은 `success · warning · destructive · info` 마다 `DEFAULT / hover / foreground / soft / line` 다섯 역할이 원시 사다리(moss · amber · rust · azure)에서
나온다 — 값과 대비 근거는 `primitive/color.json` 의 각 단에 있다.

## 브랜드 팔레트(#83)

사용자 결정(2026-10-02): **Cool graphite 중립 + Klein blue 시그널** — 흑백 계열 브랜드에 시그널 하나.

| 층 | 원시 사다리 | 쓰임 |
|---|---|---|
| 중립(Cool graphite) | `palette.cool` 0 – 950(ink ≈ cool.950 `#0f131a`) | 면 · 글자 · 테두리 — 푸른 기 도는 흑연 회색이라 도면 · CAD 의 차가운 톤과 맞는다 |
| 시그널(Klein blue) | `palette.klein` — 500 `#1f3bdb`(라이트) · 300 `#6e86ff`(다크) | `primary` · `info` · `ring` · `selection-*` · `accent`(옅은 면) · `primary-track` · `{primary,info}-line` — **화면에서 유일한 비판정 유채색** |
| 판정 | `moss` · `amber` · `rust` | `success` · `warning` · `destructive` — 시그널과 섞지 않는다 |

시그널이 Klein 으로 정해지며 옛 액센트 `palette.azure`(#0869e1)는 크롬이 참조하지 않는다 — 공개 CSS 변수라 지우지 않는다. `info` 는 원래 primary 와
같은 사다리를 공유했으므로(«안내» 는 판정이 아니다) 함께 Klein 으로 옮겼다. 단마다의 대비는 `primitive/color.json` 의 `$description` 이 정본이다.

## 역할 → 토큰(#80)

컴포넌트마다 글자 크기 · 굵기 · 모서리가 갈려 «일관적이지 않다» 는 피드백(2026-10-02)에서 정했다. 새 컴포넌트는 글자 · 상자마다 **어느 역할인가**를
먼저 묻고 그 역할의 클래스를 그대로 쓴다. 견본은 Storybook `Foundations/Roles`(라이트 · 다크, VRT), 짧은 판은 CLAUDE.md «핵심 원칙» 이다.

**글자** — 굵기는 `font-normal`(400) · `font-medium`(500) · `font-semibold`(600) 셋만 쓴다(`font-bold` 는 사다리에 남아 있지만 컴포넌트는 쓰지 않는다,
`forbidden-patterns.spec` 의 `font-bold` 래칫).

| 역할 | 크기 | 굵기 | 쓰는 곳 |
|---|---|---|---|
| 컨트롤 글자 | `text-control` | `font-medium` | Button · ToggleGroupItem · SegmentedControl 칸 · TabsTrigger · PaginationLink · Breadcrumb 크럼 · CollapsibleTrigger |
| 입력 값 | `text-control` | normal | Input · Textarea · NumberInput · Select · Combobox · DatePicker 트리거의 값 |
| 목록 · 메뉴 항목 | `text-body` | normal | Dropdown · Context · Select · Command · Combobox 항목 · SidebarItem |
| 면 제목 | `text-body` | `font-semibold` | CardHeader · Toast · Alert · AccordionTrigger · MediaCard · Calendar 달 이름 · Popover/HoverCard 머리 |
| 대화 · 화면 제목 | `text-title` | `font-semibold` | Modal · Drawer · AlertDialog · TopBar · EmptyState |
| 필드 라벨 | `text-body` | `font-medium` | FieldLabel — 도움말 · 오류(`text-body`)와 같은 크기이고 굵기 · 색이 가른다. 11px(`text-label`)로 두었더니 아래 13px 도움말보다 작아 위계가 뒤집혔다(#80 검토) |
| 보조 문장 | `text-body` | normal | 설명 · 도움말 — Modal/Drawer/Toast 설명 · FieldDescription · FieldError · EmptyState 설명 |
| 메타 · 구획 라벨 | `text-micro` | `font-medium` · `font-mono` · `uppercase` · `tracking-caps` | Eyebrow · SectionLabel · 표 머리(Th · DataTable · Calendar 요일) · 메뉴 묶음 머리글 · Readout 라벨 |

- **크기 축은 높이와 여백만 바꾼다.** Button · Input · Select · DatePicker · Pagination 의 `sm` 도 `text-control` 이다(예전 Input · Select · DatePicker ·
  Pagination 의 sm 은 `text-body`, ToggleGroup · SegmentedControl 의 sm 은 `text-label` 로 갈려 있었다). 예외 하나 — **트랙 안의 22px 칸**
  (ToggleGroup `segmented` · SegmentedControl 의 sm)은 `text-label` 이다: 13.5px 글자가 22px 칸을 꽉 채워 위아래 여백이 1.5px 로 줄었다(실측).
  굵기는 그대로 medium 이다.
- 표 밖의 글자(Badge · Tooltip 의 `text-label`, Kbd · 단축키 · 단위 · 슬라이더 눈금의 mono `text-micro`, Readout 값의 `text-readout`, Stepper 의
  상태 · 설명, DisplayHeading 의 `text-display`)는 자기 자리의 값을 유지한다 — 역할이 하나뿐이라 갈릴 짝이 없다.
- `<button>` 은 UA 의 `font` 단축이 굵기를 400 으로 되돌린다(preflight 없음, theme.css `font-inherit` 주석). 부모의 글자를 받아야 하는 맨 버튼은
  `font-inherit` 를, 스스로 서는 버튼은 역할의 굵기를 직접 적는다.

**모서리** — 사다리 `rounded-xs/sm/md/lg/xl/full` 만 고르고, 안쪽 반경은 동심원 `calc(var(--radius-바깥) - 패딩)` 만 임의값으로 쓴다(corner.spec).

| 역할 | 토큰 | 쓰는 곳 |
|---|---|---|
| 작은 표시(16px 이하 상자) | `rounded-xs` 4px | Checkbox(sm 14 · md 16 · lg 20px) |
| 칩 · 배지 · Kbd · 스켈레톤 | `rounded-sm` 6px | Badge · Kbd · Skeleton(bar) |
| 컨트롤 · 메뉴 항목 | `rounded-md` 8px | Button · Input · Select · Combobox · DatePicker · NumberInput · ToggleGroup · 세그먼트 트랙(Tabs · ToggleGroup · SegmentedControl) · Pagination · Calendar 날 · Sidebar 항목 · 메뉴 항목 · Collapsible · Breadcrumb 링크(포커스 링) |
| 면(흐름 안 · 떠 있는 패널) | `rounded-lg` 12px | Card · Alert · Toast · Popover · HoverCard · 메뉴 상자 · Select 목록 · Command · Tooltip · Toolbar(onCanvas) · Legend · Readout · Accordion 항목 · AppShell(inset) 칸 |
| 화면을 가리는 것 | `rounded-xl` 16px | Modal · Drawer(아래쪽) · AlertDialog · CommandDialog |
| 원형 · pill | `rounded-full` | Radio · Switch · Slider · Progress · StatusDot · Badge 점 · Avatar · Stepper 표시 원 |
| 동심원(트랙 안의 칸) | `rounded-[calc(var(--radius-md)-var(--spacing))]` 4px | Tabs · ToggleGroup · SegmentedControl 칸(트랙 `rounded-md` − 여백 `p-1`) · MediaCard 선택 링(`lg − hairline`) |

**선택 컨트롤 크기** — Checkbox · RadioGroupItem · Switch 의 `size`(기본 md): 체크박스 · 라디오 sm 14 · md 16 · lg 20px, 스위치 sm 28×16 · md 36×20 ·
lg 44×24px(손잡이 = 트랙 높이 − 4px). 단과 근거는 `src/primitives/Choice.variants.ts` 머리 주석.

**캔버스와 크롬이 한 부품에 섞일 때** — Legend 는 상자가 크롬(떠 있는 패널 `rounded-lg` · 테두리 · 카드 면 · `shadow-pop`, 다크를 따른다)이고 스와치만
캔버스(각진 · 캔버스 무채색)다. 스와치는 흰 캔버스 타일(`bg-canvas`) 위에 서서 다크에서도 먹색이 읽힌다.

## 옛 이름 — 3.0.0 에서 alias 를 지웠고, 이행 표는 `legacy-map.mjs` 에 남는다

2.x 까지는 `legacy.json` 이 세 출력의 원천이었다: ① CSS 변수 alias(`generated/legacy.css` — `--chrome-ink: var(--chrome-foreground)` · `--ink` …) ② 유틸 alias
(`theme.tailwind.css` 의 `--color-ink` · `--radius-chip` — `text-ink` `rounded-control` 이 살았다) ③ 코드모드 표. 3.0.0 에서 ①·② 와 `legacy.json` 을 지웠고(#49,
`schema.ts` 는 `legacy.json` 이 다시 생기면 실패한다), ③ 은 마지막 정본에서 뽑은 **정적 표** `legacy-map.mjs` 가 든다 — 소비 레포가 2.x 에서 올라오는 길이라서다.

| 표 | 무엇 | 어디로 |
|---|---|---|
| `cssVars` | `--chrome-<옛>` → `--chrome-<새>` · `--radius-<옛>` → `--radius-<새>` · renames 둘 | `scripts/codemod-css-vars.mjs` |
| `baseVars` | 옛 base 이름 → **값이 같은** 새 이름(`--ink` → `--palette-gray-900` · `--gap` → `--space-hairline` · `--color-cool-500` → `--palette-cool-500`) | `scripts/codemod-css-vars.mjs` |
| `colors` · `radius` | 옛 유틸 이름(`text-ink` → `text-foreground` · `rounded-chip` → `rounded-sm`) | `src/generated/legacy-classes.json`(`no-restricted-classes` 의 `{pattern, fix}`) · `scripts/codemod-classes.mjs` |

`renames`(`chrome.accent → chrome.primary` · `chrome.muted → chrome.muted-foreground`)는 옛 이름이 새 정본의 **다른** 토큰과 글자가 같은 개명이다.
그 둘은 린트 표에 실리지 않는다: ESLint `--fix` 는 고친 뒤 다시 검사하기를 반복해 `bg-surface-2 → bg-muted → bg-muted-foreground` 로 두 번 고친다(실측).
대신 한 번만 도는 스크립트가 맡는다 — **소비 레포는 스크립트를 먼저 한 번 돌리고, 그 다음부터 린트가 남은 것을 잡는다.**
`legacy-map.spec` 이 «린트 표의 목적지는 다시 출발지가 되지 않는다 · 목적지는 오늘의 정본에 있다 · 커밋된 린트 표가 정적 표와 같다» 를 검사한다.

옛 base 이름(`--ink` `--muted` `--line` `--bg` …)은 값이 크롬과 **다르다**(`--ink` #1a1a1a vs `--chrome-foreground` #191f28) — 그래서 코드모드는 크롬이 아니라
같은 값의 `palette.gray.*` 로 옮긴다(픽셀 보존). 크롬으로 옮길지는 소비 레포가 따로 판단한다.

## 확장 필드 `$extensions.sds`

| 필드 | 어디 | 뜻 |
|---|---|---|
| `scope` | 파일 머리(그룹·토큰이 덮는다) | `root` `chrome` `theme` `theme-inline` — 어느 생성물의 어느 블록으로 나가는가 |
| `reset` | 그룹 | `--<ns>-*: initial` 로 Tailwind 기본 사다리를 지운다 |
| `utility` | 그룹 | `{prefix, properties}` — 토큰마다 생성 `@utility`(`z-*` · `duration-*`) |
| `ts` | duration 토큰 | `generated/tokens.ts` 의 `MOTION` 키 |
| `reducedMotion` | duration·animation 토큰 | `@media (prefers-reduced-motion: reduce)` 의 값 |
