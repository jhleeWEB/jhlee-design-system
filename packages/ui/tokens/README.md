# tokens/ — DTCG 정본과 조어 규칙

사람이 편집하는 유일한 곳이다. `build.mjs` 가 `src/generated/*` 와 `src/generated/legacy-classes.json` 을 만들고 `pnpm tokens:check` 가 최신성을 강제한다.
스키마(`schema.ts`)가 파일 모양과 파일 사이의 약속을 검사한다 — 정의 없는 alias · 다크에 빠진 크롬 토큰 · legacy 가 아닌 파일의 `$deprecated` 는 생성 전에 실패한다.

```
primitive/  color(--palette-*) · dimension(--size-* --space-* --spacing) · motion(--duration-* --ease-*) · typography(--font-stack-*)   ← 리터럴이 사는 유일한 층
semantic/   canvas.json(다크 없음) · chrome.light.json + chrome.dark.json(같은 키 집합) · layer.json(radius · shadow · z-index · corner 곡률) · tailwind.json(@theme inline --color-*)
component/  control · overlay · toast · tooltip · scroll · collapse                                                                        ← 치수·시간
legacy.json 옛 이름 → 새 이름 alias(전부 $deprecated). 세 출력의 원천 — 아래 «옛 이름»
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
| 반경 | `sm` `md` `lg` `xl` `full` = 6 / 8 / 12 / 16 / 9999 체감값 — md/lg/xl 은 스쿼클 엔진에서 × `corner.k`(1.5) | 칩 · 컨트롤 · 카드와 부유층 · 모달 |

**뜻이 갈리는 두 이름**: `primary`(azure 채움, «지금 고른 것 · 주된 동작»)와 `accent`(옅은 azure 면 — 선택된 행 · 배지 바탕). shadcn 과 같다. 옛 이름에서
`accent` 는 azure 채움이었고 `muted` 는 회색 **글자**였다 — 그래서 그 둘은 alias 로 살릴 수 없고 코드모드로만 옮긴다(아래).

**JSON 경로 → CSS → Tailwind** 는 기계적이다: `chrome.muted-foreground` → `--chrome-muted-foreground` → `text-muted-foreground`(`chrome-` 접두만 뗀다).
캔버스는 접두를 남긴다: `canvas.ink` → `--canvas-ink` → `text-canvas-ink`. 예외는 `--color-input`(chrome 토큰 없이 `border` 를 가리킨다) 하나다.

**판정색**은 `success · warning · destructive · info` 마다 `DEFAULT / hover / foreground / soft / line` 다섯 역할이 원시 사다리(moss · amber · rust · azure)에서
나온다 — 값과 대비 근거는 `primitive/color.json` 의 각 단에 있다.

## 옛 이름 — legacy.json 이 세 출력의 원천

| 출력 | 무엇 | 어디로 |
|---|---|---|
| ① CSS 변수 alias | `chrome.<옛>: {chrome.<새>}`(scope legacy) → `--chrome-ink: var(--chrome-foreground)` | `generated/legacy.css` 의 `:root` — 다크도 참조를 따라 갈린다 |
| ② 유틸 alias | `color.<옛>: {chrome.<새>}`(scope theme-inline) → `--color-ink: var(--chrome-foreground)` · `radius.<옛>: {radius.<새>}`(scope theme) | `generated/theme.tailwind.css` — `text-ink` `rounded-control` 이 한 마이너 동안 산다 |
| ③ 코드모드 표 | ①·② 의 alias 토큰 + 파일 머리 `renames` → `legacy-map.mjs` | `src/generated/legacy-classes.json`(`no-restricted-classes` 의 `{pattern, fix}`) · `scripts/codemod-classes.mjs` · `scripts/codemod-css-vars.mjs` |

`renames`(`chrome.accent → chrome.primary` · `chrome.muted → chrome.muted-foreground`)는 alias 토큰을 둘 수 없는 개명이다 — 옛 이름이 새 정본의 **다른**
토큰과 글자가 같다. 그 둘은 린트 표(③ 의 JSON)에 실리지 않는다: ESLint `--fix` 는 고친 뒤 다시 검사하기를 반복해 `bg-surface-2 → bg-muted → bg-muted-foreground`
로 두 번 고친다(실측). 대신 한 번만 도는 스크립트가 맡는다 — **소비 레포는 스크립트를 먼저 한 번 돌리고, 그 다음부터 린트가 남은 것을 잡는다.**
`legacy-map.spec` 이 «린트 표의 목적지는 다시 출발지가 되지 않는다» 를 검사한다.

옛 base 이름(`--ink` `--muted` `--line` `--bg` …)은 값이 크롬과 **다르다**(`--ink` #1a1a1a vs `--chrome-foreground` #191f28) — alias 가 픽셀을 바꾸면 회귀라서
같은 값의 `palette.gray.*` 를 가리킨다. `tokens.css` 의 `body` 가 아직 그것을 읽는다(`legacy-alias-use` 래칫 2건) — 크롬 값으로 옮기는 것은 시각 변경이라 별도 결정.

## 확장 필드 `$extensions.sds`

| 필드 | 어디 | 뜻 |
|---|---|---|
| `scope` | 파일 머리(그룹·토큰이 덮는다) | `root` `chrome` `theme` `theme-inline` `legacy` — 어느 생성물의 어느 블록으로 나가는가 |
| `reset` | 그룹 | `--<ns>-*: initial` 로 Tailwind 기본 사다리를 지운다 |
| `utility` | 그룹 | `{prefix, properties}` — 토큰마다 생성 `@utility`(`z-*` · `duration-*`) |
| `ts` | duration 토큰 | `generated/tokens.ts` 의 `MOTION` 키 |
| `reducedMotion` | duration·animation 토큰 | `@media (prefers-reduced-motion: reduce)` 의 값 |
| `renames` | legacy.json 파일 머리 | alias 없는 개명 `옛 경로 → 새 경로` |
| `supports` + `fallback` | root 토큰(짝) | 진행형 향상(#26) — `:root` 에는 `fallback`, `@supports (<query>) { :root }` 에는 `$value`. 토큰 모델의 해석값은 fallback(미지원 엔진의 값) |
| `corner` | theme 의 px dimension | `calc(N px * var(--corner-k, 1))` — 곡률 보정 계수를 곱한다(radius md/lg/xl) |
