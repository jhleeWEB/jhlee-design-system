# CLAUDE.md — squircle-design-system

**Squircle Design System** — 도면 캔버스와 UI 크롬을 가른 토큰(방향 C), 그 위의 Radix 기반 컨트롤 · 오버레이 · 피드백 · 내비게이션 · 데이터 층
(3열 작업대 셸 `./legacy` 는 3.0.0 에서 지웠다, #49). 패키지 `@jhleeweb/squircle-design-system` 으로 GitHub Packages(npm.pkg.github.com)에 비공개 발행한다.
`aaro-lab/apartment-configurator` 의 `packages/ui` 를 2026-09-29 에 이력째 분리했다(원 저장소 이슈 #1432).

작업 규약(절차·브랜치·릴리스·커밋·언어)은 [`AGENTS.md`](AGENTS.md) 가 정본이고 아래 import 로 이 파일에 실린다.

@AGENTS.md

---

# 도메인 지침

## 저장소 구조

```
packages/ui/                 발행 패키지. src/ 가 정본, dist/ 는 tsdown 산출물(커밋하지 않는다)
  tokens/                    **DTCG JSON 정본** — 사람이 토큰을 편집하는 유일한 곳(#15 · #18). `primitive/{color,dimension,typography,motion}`(리터럴이 사는 유일한 층 —
                             `--palette-{cool,azure,mono,gray,moss,amber,rust}` · 치수·간격·시간 4단·굵기·자간·글꼴 스택) · `semantic/{canvas,chrome.light,chrome.dark,layer,tailwind}`
                             (값은 전부 참조; 판정 3색은 톤마다 DEFAULT/hover/ink/soft/line, `layer` 는 z-index 층) · `component/{control,collapse,toast,scroll,tooltip,overlay}` ·
                             옛 이름 alias 파일 `legacy.json` 은 3.0.0 에서 지웠다(#49 — 다시 생기면 schema 가 실패한다).
                             파일 머리(또는 그룹)의 `$extensions.sds.scope` 가 생성물의 어느 블록으로 나가는지 정한다(root · chrome · theme · theme-inline);
                             그룹의 `sds.utility` 는 생성 `@utility`(z-* · duration-*), `sds.reset` 은 `--<ns>-*: initial`, 토큰의 `sds.ts` 는 MOTION 키다.
                             `schema.ts`(zod)가 모양과 파일 사이 약속(alias 존재 · chrome 은 light/dark 둘 다 · canvas 는 light 만, `canvas.dark.json` 은 존재가 곧 실패 ·
                             `legacy.json` 도 존재가 곧 실패)을 검사하고, `build.mjs` 가 Style Dictionary 4 + 우리 포맷 3
                             (`formats/{css-vars,tailwind-theme,ts-consts}.mjs`)으로 생성물을 쓴다. 다크는 source 가 아니라 options 로 읽어 두 다크 블록에 같은 본문을 찍는다
  src/generated/             **생성물 — 손으로 고치지 않는다.** `tokens.css`(:root · 크롬 라이트/다크 · reduced-motion) ·
                             `theme.tailwind.css`(@theme · @theme inline · 생성 @utility) · `tokens.ts`(MOTION) · `ladders.ts`(LADDERS). 커밋하며 `pnpm tokens:check` 가
                             최신성을 강제한다(CI unit job · verify). **연결돼 있다**(B3, #18) — 아래 `tokens.css`·`theme.css` 가 @import 로, `cn.ts` 가 import 로 소비한다.
                             tsdown 이 dist/generated/ 로 복사한다(상대 @import 가 tarball 안에서 살아야 한다). 래칫·ESLint jsdoc 대상이 아니다
  src/tokens/motion.ts       `generated/tokens.ts` 의 `MOTION` 재수출 껍데기(@deprecated) — Toast·ScrollArea·Tooltip 은 생성물을 직접 import 한다(B1 #15 → B3 #18)
  tokens/README.md           조어 규칙(면 <role> · 글자 <role>-foreground · 옅은 면 <role>-soft · 사다리 -2/-3)과 옛 이름 이행 표의 계약(B5 #22 → #49)
  tokens/legacy-map.mjs      옛 이름 → 새 이름 **정적 표**(alias 를 지운 3.0.0 뒤 소비 레포의 이행 경로, #49) — `src/generated/legacy-classes.json`(린트용, 사슬 없음)과
                             `scripts/codemod-*.mjs`(한 번에, accent·muted · 옛 base 이름 `--ink`→`--palette-gray-900` 포함)의 공통 원천
  src/generated/legacy-classes.json 생성물 — 루트 eslint.config.js 와 소비자 프리셋(src/eslint)의 `no-restricted-classes` 가 `{pattern, fix}` 로 읽는다 = **`eslint --fix` 가 곧 코드모드**.
                             프리셋이 import 해 배포물에 실어야 해서 src/generated/ 에 있다(#31)
  src/eslint/                **소비자 린트 프리셋** `@jhleeweb/squircle-design-system/eslint`(#31) — `squircleDesignSystem({ entryPoint })` 가 flat config 조각을 낸다:
                             `no-restricted-syntax`(raw button input select textarea dialog table — #33 에서 react/forbid-elements 대체) · `better-tailwindcss/no-unknown-classes`(entryPoint = 소비자 진입 CSS) ·
                             `no-restricted-classes`(옛 이름 개명 + hex·색 함수·단위·격자 밖 간격 — `restrictedClassPatterns()`, 루트 eslint.config.js 와 한 벌) ·
                             `no-restricted-syntax`(style={{color|background|border}}, `styleIgnores`) · `ds/legacy-tone`(정본 `rules/legacy-tone.ts`, packages/eslint-rules 는 재수출).
                             `spacing.ts` 가 간격 어휘의 한 벌. 상대 import 는 `.ts` 확장자(루트 config 가 Node 24 로 빌드 없이 읽는다). peer 셋은 optional
  src/agent/cli.ts           bin `sds-agent`(#31) — `sds-agent sync [--cwd]` 가 소비 레포 AGENTS.md 에 관리 블록(`<!-- sds:begin --> … <!-- sds:end -->`)을 upsert 하고
                             `.claude/skills/squircle-ds/` 를 복사한다(멱등, 블록 밖 불변). 원문은 `agent/AGENTS.block.md` · `agent/skills/squircle-ds/SKILL.md`(files 에 실린다)
  scripts/build-manifest.ts  `dist/components.manifest.json` 생성기(#31) — TS 컴파일러 API 로 index.ts export 전수를 순회: kind(component·compound·hook)·client·props(type/required/
                             default/values{value,doc})·parts·deprecated, cva 축/기본값(AST), 토큰 이름. `default` 는 `@default` → 같은 파일 cva defaultVariants, `values[].doc` 은
                             «`값` — 설명» 줄. react-docgen-typescript 는 쓰지 않는다. 게이트 `__tests__/package/manifest.spec.ts`(전수 포함 · client 일치 불변식 + KNOWN_GAPS 래칫)
  scripts/build-docs.ts      같은 매니페스트에서 `llms.txt`(llmstxt.org · «shadcn 과 다른 점» 은 docs/design-tokens.md 복사)와 `docs/components/*.md` 를 만든다. **둘은 커밋하는
                             생성물**이고 `pnpm manifest:check` 가 최신성을 강제한다(CI unit job · verify). `pnpm build` 가 tsdown 뒤에 둘을 이어 돌린다
  src/icons/                 **아이콘 서브패스 `./icons`**(#64) — `glyphs.ts` 가 글리프 정본(24 뷰박스 · 획 2 · round · currentColor, `lucide` 필드가 있으면 lucide 경로를
                             글자 그대로 — 고지 `LICENSE-lucide.txt` 가 dist/icons/ 로 실린다), `createIcon.tsx` 가 팩토리(기본 16px = `lib/icons` 의 ICON = `--size-icon-md` ·
                             장식이면 aria-hidden · `title` 이면 role="img"), `icons.ts` 가 `Icon<Pascal>` 목록과 `icons` 맵(패키지 안은 이 파일을 import), `index.ts` 가 서브패스 진입.
                             순수 모듈(지시문 없음). `react-icons` 의존은 없다 — 옮긴 자리는 같은 경로라 VRT 0 diff. 카탈로그 `Foundations/Icons`(stories/Icons.stories.tsx)
  src/cursors/cursors.ts     3D 모델링 커서 정본(#64) — 32px SVG 조각(글리프 재사용) · 핫스팟 · 키워드 폴백. `tokens/build.mjs` 가 `formats/cursors.mjs` 로
                             `generated/cursors.css`(:root `--cursor-*`, tokens.css 가 @import)와 `generated/cursors.tailwind.css`(`@utility cursor-cad-*`, theme.css 가 @import)를
                             쓴다(`tokens:check` 대상). 유틸리티의 `cad-` 는 Tailwind 내장 `cursor-move` 류와 합쳐져 덮는 것을 피한다. JS 배포물에는 없다. 카탈로그 `Foundations/Cursors`
  src/lib/tone.ts            톤 어휘 한 벌(`toneValues` · `Tone`). 옛 키 shim `normalizeTone()` 은 3.0.0 에서 지웠다 — 옛 키는 타입 오류, 이행은 `ds/legacy-tone --fix`(#49)
  src/tokens.css             `generated/tokens.css` 재수출 + 원칙을 강제하는 요소 규칙(box-sizing · body · 컨트롤 radius 0 · .num). 값은 없다
  src/theme.css              tokens.css + `generated/theme.tailwind.css` 재수출, @source "./" 자기 등록, 컴포넌트 CSS(@import), keyframes,
                             손 @utility(tnum · focus-ring · on-canvas · h-ctl* · w-rail · gap-shell · *-dialog-fluid · max-w-popover-fluid), `.ds-*` 컴포넌트 규칙. 값은 없다 —
                             방향 C(캔버스/크롬)의 «왜» 는 머리 주석
  src/{primitives,overlay,feedback,navigation,data}/   DS 컴포넌트(Tailwind 유틸 + cva + Radix)
  src/**/Name.variants.ts    컴포넌트의 cva 한 벌 — `"use client"` 없음(서버에서 호출 가능). 컴포넌트가 import 하고 층 배럴이 `*Variants` 를 export
  src/**/*.stories.tsx       컴포넌트 옆 스토리 — 3스토리 계약(Default · Variants · ThemeContrast, `stories-contract.spec` 이 검사, 본보기 Button)
  src/**/Name.spec.tsx       컴포넌트 옆 spec — 공통 계약(`describeComponentContract(stories, {slot, axes})`, 스토리 `Default` 가 유일한 픽스처)과 그 컴포넌트의
                             동작 테스트. 훅 옆 `useX.spec.ts` 도 같다. tsconfig.test.json · ESLint tests 프로필이 `src/**/*.spec.{ts,tsx}` 로 잡는다(빌드 tsconfig 밖)
  src/__tests__/             vitest + jsdom 동작·계약 테스트(vitest `unit` 프로젝트). `render-all.spec`(불변식: 배럴의 공개 컴포넌트마다 옆 spec 이나 부품 픽스처 중
                             정확히 하나가 계약을 돈다 + 스토리 `component` 가 아닌 부품의 최소 props 픽스처, 실패 0 — #48) · `documented-contracts.spec`(CLAUDE.md 의 약속을 user-event 로: Input 선행 0 ·
                             0 전체선택 · PanelToggleButton 아이콘) · `stories-contract.spec`(3스토리 + a11y `KNOWN_A11Y_FAILURES` 래칫) · `axe.ts`(axe-core 15줄
                             헬퍼, jsdom 이라 color-contrast·region 은 끈다). `setup.ts` 가 jest-dom 매처를 붙인다. `tokens/`(배포 CSS 의 postcss 토큰 모델 +
                             사다리·cn 동작 · 참조 무결성·미참조 원시 · MOTION↔CSS 대조 · 정본 스키마 · **WCAG 대비 래칫** `contrast.spec`+`contrast-pairs.ts`, #15 · #18 · C2)과
                             `package/`(exports · "use client" 집합 · 공개 API 목록)는 `arch` 프로젝트(node)가 돈다(#11)
  src/__arch__/              금지 패턴 래칫(`forbidden-patterns.spec` — 파일별 횟수 기준선, 늘면 실패·줄면 낮춰야 통과) + 소스 그래프. `arch` 프로젝트(#11).
                             `component-contract.tsx` 는 공통 계약의 검사기(`describeComponentContract(storiesModule, {slot, axes})` · `runContract`) — slot 존재·못 덮음 ·
                             className twMerge · ref DOM 도달 · rest 전달 · 축마다 data-* · axe 0. 폴더별 spec(Phase D)이 스토리를 넘겨 부른다(C3)
  .storybook/                Storybook 10.6 — 정본 카탈로그(포트 6006). addon-themes 가 `html[data-theme]` 을 토글하고 폰트는 @fontsource self-host
  stories/                   페이지 스토리 — `Pages/Workbench`(제품 화면 복제, 영구 — `workbench/Workbench.tsx`) · `Radius` · ThemePair · Matrix. 옛 apps/ds-gallery 의
                             컴포넌트 명세 `Pages/Gallery` 는 Phase D 가 컴포넌트 스토리로 나눈 뒤 지웠다(#48)
  vrt/                       Playwright 시각 회귀 — storybook-static/index.json 의 `vrt` 태그 스토리 × 라이트/다크, `maxDiffPixels: 0`(C1). 기준선은 도커로만(scripts/vrt-update.sh).
  tsconfig.json              엄격 프로필 한 벌(src 전량, 스펙·스토리 제외) — tsdown dts 가 읽는다. app-profile(느슨한 2차 검사)은 하는 일이 없어 지웠다(#11)
  tsconfig.test.json         스펙·__arch__ 를 같은 엄격도로 검사. `exclude` 가 래칫(줄어들기만 한다, 오늘 비어 있다)
  tsconfig.stories.json      stories·.storybook·vrt 의 엄격 검사. 빌드 tsconfig 밖에 두어 d.ts 로 새지 않게 한다
  tsdown.config.ts           unbundle ESM + d.ts + CSS 복사. banner 로 "use client" 를 붙이지 않는다 — 파일 첫 줄에 직접 둔다
packages/typescript-config/  tsconfig 프리셋(@buildos/typescript-config, 발행 안 함)
scripts/vrt-update.sh        VRT 기준선 갱신 — CI 와 같은 playwright:v1.63.0-noble 이미지 안에서만(macOS PNG 는 기준선이 아니다). `VRT_CHECK=1` 이면 갱신 없이
                             같은 컨테이너에서 0 diff 만 검사한다(시각이 바뀌면 안 되는 PR 의 머지 전 확인)
stylelint.config.js          손 CSS 의 리터럴 금지(색·반경·글자·모션은 var(--…)만 · 간격·치수 px 금지 · hex 금지 · kebab-case). generated/·canvas.css·corner.css 예외,
                             기준선 없음 — `--max-warnings 0`(유일한 warning 기준선이던 legacy/shell.css 는 3.0.0 에서 지웠다, #49)
prettier.config.js           Prettier 3 + prettier-plugin-tailwindcss(printWidth 110 · theme.css 기준 클래스 정렬 · cn/cva). 첫 적용은 포맷 전용 커밋(.git-blame-ignore-revs)
scripts/codemod-classes.mjs  옛 유틸 이름 → 새 이름을 **한 번에**(#22). 소비 레포는 이것을 먼저 한 번 돌리고 그 다음부터 린트가 잡는다 — accent·muted 는 린트 표에 없다
scripts/codemod-css-vars.mjs `var(--chrome-<옛>)`·`var(--radius-<옛>)`·옛 base 이름(`var(--ink)` …) → 새 이름을 한 번에(#22 · #49). 둘 다 두 번 돌리면 새 accent·muted 가 다시 바뀐다 — 한 번만
packages/eslint-rules/       로컬 ESLint 규칙 ds/*(@buildos/eslint-rules, 발행 안 함) + RuleTester 스펙. JS + JSDoc(checkJs)
docs/architecture/design-system-patterns.md   React 합성·접근성 계약(원 저장소 #1246)
docs/design-tokens.md        llms 용 «shadcn 과 다른 점» 초안 — 같은 이름은 설명 없이, 다른 이름만 표로(#22)
docs/plan/                   분리·표준화 계획(2026-09-29). 단계별 진행은 이 레포 이슈로 관리한다
```

## 핵심 원칙

- **캔버스인가 크롬인가.** 새 컴포넌트를 만들 때 묻는 질문은 언제나 이것 하나다. 도면 요소·치수선·범례 스와치는 캔버스(흰 바탕 고정·radius 0·무채색·다크 없음),
  그 밖은 전부 크롬(듀얼 테마·작은 radius·부유 레이어에만 그림자).
- **유채색은 판정에만**(base 원칙 2) — `primary` azure `#0869e1` 은 «지금 고른 것·주된 동작», 판정색 `success`·`warning`·`destructive`·`info` 는 «통과했는가». 상태는 항상 텍스트와 병기한다.
- **수치는 mono + tabular-nums**(원칙 3).
- **토큰 밖 값을 쓰지 않는다.** 색·간격·반경·글자·시간·층위는 생성물 사다리만 — 크롬 색은 **shadcn 어휘**(`bg-background` `bg-card` `bg-muted` `bg-secondary` `text-foreground`
  `text-muted-foreground` `border-border` `bg-primary` `text-primary-foreground` `bg-accent` `ring-ring` `bg-destructive-soft` …, B5 #22), 캔버스는 `canvas-*`, 그 밖은 역할 이름
  (`rounded-sm/md/lg/xl` = 6/8/12/16, `text-body`, `shadow-pop`, `h-ctl`, `font-semibold`, `z-toast`, `duration-fast` …). 간격은 4px 스텝 `0 1 2 3 4 5 6 8 10 12 16 20 24` 만(간격 계열,
  ESLint). 리터럴(hex·px·ms)이 필요하면 `tokens/` JSON 에 토큰을 더한다. 조어 규칙은 [`packages/ui/tokens/README.md`](packages/ui/tokens/README.md), shadcn 과 다른 점은
  [`docs/design-tokens.md`](docs/design-tokens.md). 옛 이름(`text-ink`·`bg-surface`·`--chrome-line`·`--ink`·`--gap`)은 3.0.0 에서 alias 째 지웠다(#49) — 린트 `--fix` · 코드모드가 옮긴다.
  `tone` prop 도 같은 어휘다: `neutral | primary | success | warning | destructive | info`(옛 키는 3.0.0 에서 타입 오류 — ESLint `ds/legacy-tone --fix`).
- **모서리는 일반 `border-radius` 원호 사다리다** — `rounded-sm/md/lg/xl` = 6/8/12/16px 고정, 원형·pill 은 `rounded-full` 로만, 동심원은
  `calc(바깥 토큰 − 패딩)` 만. 스쿼클(`corner-shape`, #26)은 **2026-09-30 사용자 결정으로 폐기했다**(#36) — Chromium 에서 초타원의 안쪽 윤곽 간격 때문에
  1px 테두리가 모서리에서 두꺼워 보였다. `corner-shape` 를 다시 쓰지 않는다(`corner.spec` 이 막는다). `src/corner.css` 는 호환용 빈 파일이다.
- **클라이언트 경계.** 훅·핸들러·컨텍스트·Radix 를 쓰는 파일은 첫 줄에 `"use client"`. 배럴(index.ts)·cn·canvas-metrics·순수 표시 컴포넌트에는 없다.
- **JS 에서 CSS 를 import 하지 않는다.** 컴포넌트 CSS 는 theme.css 가 `@import` 한다.

## 소비자 계약

버전은 3.x 다(shadcn 어휘 개명 #25 가 1.0.0 을, 스쿼클 폐기 #37 이 2.0.0 을, 부품 Select·Field·Tabs(#47) + legacy 제거(#49)가 3.0.0 을 냈다).
3.0.0 이 지운 것: `./legacy` · `./shell.css` 서브패스(3열 셸·컨트롤·`DesignSystemProvider`), 루트 배럴의 @deprecated 별칭(새 `Select`·`Field`·`Tabs` 가 그 이름을 이었다),
옛 이름 alias(`generated/legacy.css` · @theme 의 옛 유틸 이름), `normalizeTone` · 옛 tone 키, Button 의 열린 `data-slot`. 이행 순서는 `packages/ui/README.md` «2.x → 3.0».
소비 레포는 정확 버전을 고정하고(`"@buildos/ui": "npm:@jhleeweb/squircle-design-system@3.x.y"` 같은 별칭 허용) 갱신은 PR 로 한다.

```css
@import "tailwindcss/theme.css" layer(theme);
@import "@jhleeweb/squircle-design-system/theme.css";   /* @source "./" 자기 등록 — 소비자 @source 불필요 */
@import "tailwindcss/utilities.css" source(none);        /* 레이어 없이 — tokens.css 의 button{border-radius:0} 이 레이어 안 규칙을 이기기 때문 */
@source "./";
```

```
@jhleeweb:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}    ← 소비 레포의 .npmrc(fail-fast)
```

## 빌드·검증

```bash
pnpm install           # pnpm 10, Node 24
pnpm storybook         # 카탈로그 (6006) — Pages/Workbench 와 컴포넌트 스토리(ThemeContrast)로 캔버스/크롬 경계와 다크를 눈으로 확인
pnpm storybook:build   # storybook-static (--test) — VRT 와 CI storybook job 의 입력
pnpm typecheck         # 엄격 프로필(src) + test 프로필(스펙·__arch__) + stories 프로필
pnpm lint              # ESLint 10 — 기준선(eslint-suppressions.json) 밖 신규 위반만 실패
pnpm lint:css          # stylelint — 손 CSS 의 리터럴. 기준선 없음(--max-warnings 0)
pnpm format:check      # Prettier --check (CI). 고치기는 pnpm format
pnpm test              # vitest unit(jsdom) + arch(node: 래칫·토큰·패키지 계약) 프로젝트 + 커버리지 문턱(coverage-v8, 실측 floor−2) + packages/eslint-rules 의 RuleTester
pnpm build             # tsdown → packages/ui/dist
pnpm tokens:build      # tokens/*.json → src/generated/* (Style Dictionary). 정본을 고치면 돌리고 생성물을 함께 커밋한다
pnpm tokens:check      # 생성물이 정본과 같은가 — 다르면 exit 1 (CI tokens job · verify)
pnpm manifest:build    # index.ts export + JSDoc → dist/components.manifest.json · llms.txt · docs/components/*.md (#31). JSDoc 을 고치면 돌리고 문서를 함께 커밋한다
pnpm manifest:check    # 커밋된 llms.txt · docs/components 가 매니페스트와 같은가 — 다르면 exit 1 (CI tokens job · verify)
pnpm verify            # typecheck + lint + lint:css + format:check + tokens:check + manifest:check + test + build — PR 전 한 번
bash scripts/smoke-next.sh   # Next App Router 스모크(tarball → 최소 앱 next build). 야간 workflow smoke-next.yml 이 돌린다(비필수)
pnpm --filter @jhleeweb/squircle-design-system test:tokens    # arch 프로젝트의 토큰 스펙만(CI tokens job) — 대비 래칫 contrast.spec 포함
pnpm --filter @jhleeweb/squircle-design-system test:stories   # vitest storybook 프로젝트 — Chromium 에서 play + axe(a11y test 'error', C2)
pnpm --filter @jhleeweb/squircle-design-system vrt            # 시각 회귀(storybook:build 뒤). 스냅샷 갱신은 vrt:update(도커)만
VRT_CHECK=1 sh scripts/vrt-update.sh                           # 도커 컨테이너에서 갱신 없이 0 diff 검사 — 시각이 바뀌면 안 되는 PR 의 머지 전 확인
cd packages/ui && pnpm exec publint --strict && pnpm pack --pack-destination /tmp/pack && pnpm exec attw /tmp/pack/*.tgz --profile esm-only --entrypoints . canvas-metrics testing eslint icons   # 패키지 계약(attw 는 pnpm tarball 로 — npm pack 은 publishConfig.exports 치환을 못 받는다)
```

**래칫 스펙.** `src/__arch__/forbidden-patterns.spec.ts` 는 토큰 밖 리터럴(tsx 대괄호 px/ms · Tailwind 기본 사다리 · CSS px/hex/ms · JS ms)·
`forwardRef`·비-cva 삼항·불리언 data 속성·도메인 어휘를 **파일별 횟수 기준선**으로 붙든다. 실제 횟수가 기준선과 같아야 통과한다 —
늘면 새 위반이고, 줄이면 같은 PR 에서 기준선을 낮춘다(0 이면 줄을 지운다). `legacy-alias-use`(옛 이름 `var(--ink)` 등의 사용, 목록은 tokens/legacy-map.mjs 의 정적 표에서 읽는다 — 3.0.0 뒤 정의가 없는 이름이라 0 을 지키는 경비)도
같은 래칫이다(#18 · #49). 토큰 쪽도 같은 모양이다: `references.spec` 의 `KNOWN_INLINE_LITERALS`(`@theme inline` 의 리터럴 — #18 에서 0)와 미참조 원시 스냅샷(17 → 3.0.0 에서 옛 base alias 가 사라져 22 — 더해진 gray 다섯은 코드모드 목적지라 남긴다 → #55 에서 라이트 글자 AA 로 시맨틱이 새 단 550 · 650 으로 옮겨 27, 옛 500 들도 같은 이유로 남긴다),
`rsc-directives.spec` 의 `"use client"` 파일 목록, `public-api.spec` 의 배럴 export 목록, `manifest.spec` 의 `KNOWN_GAPS`(optional prop 의 `@default` 빈자리 ·
유니언 값의 설명 빈자리 — JSDoc 을 채우면 같은 PR 에서 줄인다. 첫 실측 139 · 109 → Phase D 뒤 32 · 4 → legacy 를 지운 #49 에서 0 — 이제 새 빈자리는 곧 실패). Phase C 의 래칫 셋(C2·C3, 전부
«없는 실패는 새 위반, 목록에 있는데 통과하면 지워라»): `contrast.spec` 의 `KNOWN_FAILURES`(WCAG 2.x 미달 쌍, 첫 실측 7 — light 5 · dark 2 → #55 에서 글자 쌍 다섯을 값으로 고쳐 2.
남은 둘은 `border-strong/card`(1.4.11 비텍스트 3:1, 라이트 · 다크) — 3:1 로 올리면 입력 · 체크박스 외곽이 세 배 진해지는 디자인 결정이라 따로 묻는다) · `stories-contract.spec` 의 `KNOWN_A11Y_FAILURES`(axe 규칙을 스토리 단위 `parameters.a11y.config.rules` 로 끈 스토리 — 메타에서 끄는 것은
금지. 첫 실측 7 → Phase D 의 새 스토리들이 올려 2026-10-01 재실측 61 → #47 의 Select · Field · Tabs 아홉을 더해 70. #55 에서 4 — 토큰 값 · Sidebar 배지 opacity · 단축키 색으로 color-contrast 가, ThemePair 가 테마를 자식 함수로 넘겨 landmark-unique 가 모두 빠졌다. 남은 넷은 열린 Select · Radius Components 의 aria-hidden-focus(Radix 포커스 가드)와 Workbench 의 aria-progressbar-name) ·
`vitest.config.ts` 의 coverage thresholds(첫 실측 floor−2 — statements 84 · branches 78 · functions 82 · lines 89).
`render-all.spec` 의 `KNOWN_CONTRACT_FAILURES`(첫 실측 81 컴포넌트)와 `stories-contract.spec` 의 `STORIES_MISSING` 은 Phase D 가 0 으로 비워 지웠다(#48) —
이제 «배럴 컴포넌트마다 옆 stories · 옆 spec(또는 부품 픽스처)» 는 예외 없는 불변식이다. 마지막 예외였던 Button 의 slot-locked 는 #49 에서 잠갔다 —
DS 안에서 다른 이름이 필요한 자리(토스트 · 대화상자 닫기 · 패널 토글)는 내부 `SlottedButton`(배럴 밖)으로 이름을 넘긴다.
토큰은 **JSON 정본만** 고치고 `pnpm tokens:build` 를 돌려 생성물을 함께 커밋한다 — `tokens:check` 가 생성물의 최신성을, VRT 가 픽셀을 지킨다.
새 토큰은 값·출처·대비 근거를 `$description` 에 적는다.

**린트 기준선.** 루트 `eslint.config.js`(플러그인 + 로컬 규칙 `ds/*`, `packages/eslint-rules/`)의 모든 규칙은 error 이고,
첫 실행의 위반은 `eslint-suppressions.json`(ESLint bulk suppressions)이 덮는다 — 계획의 «warn + 기준선» 은 suppressions 가
error 만 덮기 때문에 이 모양이 됐다. **기준선을 늘리는 PR 은 받지 않는다**(`--suppress-all` 재실행 금지). 위반을 고쳐 줄이면
같은 PR 에서 `pnpm exec eslint . --prune-suppressions` 로 기준선을 낮춘다.
기준선의 실측(2026-10-01, D8 #49 의 프루닝 뒤 — 죽은 항목 0; 첫 실측 2026-09-30 은 49 파일 350 건 · 규칙 14개, #48 뒤 26 파일 83 건): 24 파일 75 건, 규칙 10개 —
`better-tailwindcss/no-restricted-classes` 25 · `better-tailwindcss/no-unknown-classes` 20 · `ds/no-literal-style-value` 12 ·
`@typescript-eslint/no-unnecessary-type-assertion` 8 · `jsx-a11y/label-has-associated-control` 3 · `@typescript-eslint/no-floating-promises` 2 · `react-hooks/refs` 2 ·
`ds/no-forward-ref` 1 · `jsdoc/require-jsdoc` 1 · `jsx-a11y/interactive-supports-focus` 1. 7 파일은 `src/__tests__/` 의 옛 스펙이고(legacy 전용 스펙 둘은 #49 에서 지웠다)
Workbench(`stories/workbench/Workbench.tsx`)가 32 건이다.
**그 밖의 모든 규칙은 기준선 없이 통과한다** — `ds/legacy-tone` · `ds/no-magic-ms` · `ds/no-boolean-string-data-attr`, `jsdoc/require-description`·`check-tag-names`,
`import-x/no-cycle`·`no-self-import`·`no-duplicates`, `no-restricted-imports`(배럴·테스트 import 금지), 위 둘을 뺀 `jsx-a11y/*`, 위 하나를 뺀 `react-hooks/*`,
위 둘을 뺀 `@typescript-eslint/*`(recommendedTypeChecked), `js.recommended` 전부.
이 규칙들은 새 위반이 곧 실패이므로 승격할 것이 없다. **stylelint** 는 기준선이 없다 — 손 CSS 의 위반은 0 이고(C4 에서 theme.css 의 6건을 같은 값의 토큰으로 옮겼다)
마지막 warning 기준선(`legacy/shell.css` 122건)은 3.0.0 에서 파일째 지웠다(`--max-warnings 0`, #49). **Prettier** 는 CI 가 `--check` 만 한다 — 첫 적용 커밋은 `.git-blame-ignore-revs` 에 있다.
Prettier 의 tailwind 플러그인은 클래스를 **정렬**한다 — 정렬이 뜻을 바꾸는 곳을 실측으로 막았다(한때 `src/legacy/` 도 템플릿 리터럴 앞 공백 때문에 포맷에서 뺐다 — 3.0.0 에서 지웠다): `cn.ts` 는 twMerge 의 «font-size 가 앞의 leading-* 을 지운다» 를 비웠다(v4 의 text-* 는 `--tw-leading` 을 읽어 leading 이 순서와 무관하게 이기는데,
정렬이 leading 을 앞으로 보내자 twMerge 가 지워 VRT 가 −3px·−11px 를 잡았다). 새 클래스 문자열에 같은 유틸의 충돌 쌍(`p-0 p-8`)을 두지 않는다 — 정렬이 승자를 바꾼다.

**발행**은 `main` 머지 시 자동이다(AGENTS.md «릴리스»). 로컬에서 발행하려면 `~/.npmrc` 에
`//npm.pkg.github.com/:_authToken=<classic PAT: read:packages + write:packages>` 를 두고
`pnpm --filter @jhleeweb/squircle-design-system publish --no-git-checks`.

## 공유 패키지 — 워크스페이스는 소스, 소비자는 dist

`packages/ui/package.json` 의 `exports` 는 `src/*.ts` 를 가리키고(Storybook 이 HMR 로 소스를 본다),
`publishConfig.exports` 가 `dist/*` 를 가리킨다 — pnpm 이 발행 시 바꿔 끼운다. `"./*"` 와일드카드는 없다: 서브패스는 명시된 것뿐이다.
