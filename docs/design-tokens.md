# 디자인 토큰 — shadcn 어휘와 이 시스템이 다른 점

llms.txt 초안(계획 §2.5-a·d, #22). Phase C 의 `scripts/build-docs.ts` 가 manifest 에서 문서를 만들 때 이 절을 «shadcn 과 다른 점» 으로 싣는다.
LLM 의 사전 분포는 shadcn/ui 다 — 그와 **같은 이름**은 설명 없이 통하고, **다른 이름**만 여기 적는다. 정본은 `packages/ui/tokens/*.json`(DTCG)이고
조어 규칙은 [`packages/ui/tokens/README.md`](../packages/ui/tokens/README.md) 다.

## 같은 것(설명 없이 쓴다)

`bg-background` `bg-card` `bg-muted` `bg-secondary` `bg-popover` `bg-accent` `text-foreground` `text-muted-foreground` `text-primary-foreground`
`text-accent-foreground` `border-border` `border-input` `bg-primary` `hover:bg-primary-hover`(확장) `ring-ring` `bg-destructive` `text-destructive-foreground`
`rounded-sm/md/lg/xl`(6/8/12/16 — shadcn 의 `--radius` 계산식이 아니라 **고정값**, 여기에 `rounded-xs` 4px 를 더했다) — 전부 shadcn 과 같은 뜻이다. `tone` prop 도 같은 어휘다:
`neutral | primary | success | warning | destructive | info`.

## 다른 것

| 자리 | shadcn | 이 시스템 | 왜 |
|---|---|---|---|
| 캔버스(도면이 사는 면) | 없음 | `bg-canvas` `text-canvas-ink` `text-canvas-ink-2` `text-canvas-muted` `border-canvas-line` `border-canvas-line-strong` `bg-canvas-surface` `bg-canvas-grid` | 도면은 인쇄되고 색각 이상에서도 읽혀야 한다 — 흰 바탕 고정 · radius 0 · 무채색 · **다크 없음**. 크롬(`--chrome-*`)과 다른 면이다. 새 컴포넌트마다 «캔버스인가 크롬인가» 를 먼저 묻는다 |
| 글자 사다리 | `text-sm` `text-base`(크기) | `text-micro`(10) `text-label`(11) `text-body`(13) `text-control`(13.5) `text-title`(15) `text-readout`(22) `text-display`(26) — **역할 이름** | 이 제품의 본문은 13px 다. Tailwind 기본 사다리는 `--text-*: initial` 로 지웠으므로 `text-sm` 은 **CSS 없이 조용히 무시된다** — 린트(`no-unknown-classes`)가 잡는다 |
| 굵기·자간 | `font-bold` `tracking-wide` | `font-normal/medium/semibold/bold`(400/500/600/700) · `tracking-tight` `tracking-caps` 만 — 컴포넌트는 **400 · 500 · 600 셋만** 쓰고 역할이 굵기를 정한다(컨트롤 글자 · 필드 라벨 · 메타 라벨 medium, 제목 semibold, 나머지 normal, #80) | 그 밖(`font-light` `tracking-wide`)은 initial 리셋으로 사라졌다 |
| 반경 | `rounded-sm/md/lg/xl/full`(원호) | 같은 이름 + `rounded-xs`(4/6/8/12/16/9999px 고정, 원호) — **역할이 단을 정한다**: 작은 표시(16px 이하 · 체크박스) `xs` · 칩 `sm` · 컨트롤 · 메뉴 항목 `md` · 면(카드 · 알림 · 토스트 · 팝오버 · 메뉴 · 툴팁 · 범례) `lg` · 화면을 가리는 것 `xl` | 값만 이 제품의 밀도다. 임의값은 동심원 `rounded-[calc(var(--radius-…)-…)]` 만, 원형은 `rounded-full` 로만. `corner-shape`(스쿼클)는 쓰지 않는다 — 2026-09-30 폐기(#36). 역할 표는 `packages/ui/tokens/README.md` «역할 → 토큰»(#80) |
| 그림자 | `shadow-sm/md/lg` | `shadow-chip` `shadow-card` `shadow-pop` `shadow-modal` — 부유 층위의 이름 | 3·4단은 inset 헤어라인을 그림자 안에 넣는다(부유 레이어가 테두리를 따로 그리지 않게). 기본 사다리는 지웠다 |
| 컨트롤 높이 | `h-9` `h-10` | `h-ctl-sm`(30) `h-ctl`(36) `h-ctl-lg`(44) · 정사각은 `w-ctl*` | 세 단만 있다 — 다른 높이는 컨트롤이 아니다 |
| 판정색 | `destructive` 하나 | `success` `warning` `destructive` `info` 각각 `DEFAULT / -hover / -foreground / -soft / -line` 다섯 역할 | 이 제품의 색은 «판정» 이다(원칙 2: 유채색은 판정에만). `-soft` 는 배지·알림의 옅은 면, `-line` 은 면 위 3:1 테두리, `-foreground` 는 solid 위의 글자(amber 와 다크는 흰색이 4.5:1 을 못 넘어 어두운 글자다) |
| 액센트 두 가지 | `primary`(채움) · `accent`(옅은 면) | 같다 — 덧붙여 `primary-hover` `primary-track`(슬라이더·진행 바닥) | 옛 이름 `accent`(azure) 는 shadcn 의 `primary` 였다 — B5(#22)에서 개명 |
| 글자 사다리(크롬) | `foreground` `muted-foreground` | + `foreground-2`(한 단 약한 글자) `foreground-disabled` | 라벨·설명·비활성이 각각 다른 회색이다 |
| 테두리 | `border` `input` | + `border-strong`(컨트롤 외곽) | 입력·버튼 외곽은 한 단 짙다 |
| 툴팁 | 없음(popover 재사용) | `bg-tooltip` `text-tooltip-foreground` — 면을 뒤집는다 | 툴팁만 «일시적이고 내 것이 아니다» 를 어두운 면으로 말한다 |
| 선택 | 없음 | `bg-selection-fill` `border-selection-stroke` | 캔버스 위 선택 상자 |
| 간격 | 8px 격자 관행 | 4px 기반 + 허용 스텝 `0 1 2 3 4 5 6 8 10 12 16 20 24`(간격 계열 p/m/gap/space/inset 만) | 실측 디자인(12·30/36/44)과 shadcn 자체(`h-9 px-3 gap-1.5`)가 8 의 배수가 아니다. 반스텝·7·9·11·임의 px 는 린트가 막는다 |
| 오버레이 치수 | 임의 값 | `max-w-dialog-sm/md/lg/xl`(380/560/880/1180) `max-w-drawer-sm/md/lg`(280/400/620) `min-w-menu`(168) `min-w-popover-min` `max-w-popover-max` + 유동 `w-dialog-fluid` `h-dialog-fluid` `max-h-dialog-fluid` `max-w-popover-fluid` | «유동 폭 + 상한» 이 `w-[min(560px,calc(100vw-24px))]` 를 대신한다 |
| 층위·시간 | `z-50` `duration-200` | `z-raised/sticky/scrim/modal/popover/toast/tooltip`(1/10/40/41/50/60/70) · `duration-instant/fast/base/slow`(0/100/150/200) | 겹침 순서와 박자를 이름이 정한다 |
| CSS 변수 | `var(--primary)` | `var(--chrome-primary)` · `var(--canvas-ink)` — 면 접두가 있다 | 접두가 곧 «어느 면인가» 이고 다크가 갈리는 집합(chrome)을 이름이 말한다. Tailwind 유틸에서는 접두를 뗀다(`bg-primary`) |
| 기반 라이브러리 | Base UI(2026-07 부터 기본) | **Radix**(`radix-ui`) | 부품 구조가 다를 수 있다 — 부품 이름은 `components.manifest.json`(Phase C)이 정본 |

## 옛 이름(3.0.0 에서 지웠다)

B5(#22) 이전 이름(`text-ink` `bg-surface` `border-line` `rounded-control` … · `var(--chrome-ink)` `var(--chrome-line)` · `var(--ink)` `var(--gap)` …)은 2.x 까지
alias 로 살았고 3.0.0 에서 지웠다(#49) — 이제 Tailwind 가 모르는 클래스(조용히 무시) · 정의 없는 변수다. 옮기는 길은 남아 있다:
`scripts/codemod-css-vars.mjs` · `scripts/codemod-classes.mjs` 를 **한 번** 돌리고(옛 `accent`(azure)·`muted`(회색 글자)는 새 이름과 글자가 같아 스크립트만 옮긴다),
그 다음 ESLint `no-restricted-classes --fix`(프리셋) 가 남은 것을 잡는다. 표는 `packages/ui/tokens/legacy-map.mjs`.
