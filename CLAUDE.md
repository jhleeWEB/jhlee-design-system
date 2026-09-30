# CLAUDE.md — squircle-design-system

**Squircle Design System** — 도면 캔버스와 UI 크롬을 가른 토큰(방향 C), Radix 기반 오버레이·피드백 층, 3열 작업대 셸,
그 위의 컨트롤. 패키지 `@jhleeweb/squircle-design-system` 으로 GitHub Packages(npm.pkg.github.com)에 비공개 발행한다.
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
                             `legacy.json`(옛 base 이름 `--ink`·`--gap`·`--size-gap`·`--color-{hue}-*` → 새 정본 alias, 전부 `$deprecated`, 값은 옛 것과 같다, 제거는 major).
                             파일 머리(또는 그룹)의 `$extensions.sds.scope` 가 생성물의 어느 블록으로 나가는지 정한다(root · chrome · theme · theme-inline · legacy);
                             그룹의 `sds.utility` 는 생성 `@utility`(z-* · duration-*), `sds.reset` 은 `--<ns>-*: initial`, 토큰의 `sds.ts` 는 MOTION 키다.
                             `schema.ts`(zod)가 모양과 파일 사이 약속(alias 존재 · chrome 은 light/dark 둘 다 · canvas 는 light 만, `canvas.dark.json` 은 존재가 곧 실패 ·
                             legacy 는 $deprecated 만이고 새 정본은 옛 이름을 참조하지 않는다)을 검사하고, `build.mjs` 가 Style Dictionary 4 + 우리 포맷 3
                             (`formats/{css-vars,tailwind-theme,ts-consts}.mjs`)으로 생성물을 쓴다. 다크는 source 가 아니라 options 로 읽어 두 다크 블록에 같은 본문을 찍는다
  src/generated/             **생성물 — 손으로 고치지 않는다.** `tokens.css`(:root · 크롬 라이트/다크 · reduced-motion) · `legacy.css`(옛 이름 alias) ·
                             `theme.tailwind.css`(@theme · @theme inline · 생성 @utility) · `tokens.ts`(MOTION) · `ladders.ts`(LADDERS). 커밋하며 `pnpm tokens:check` 가
                             최신성을 강제한다(CI unit job · verify). **연결돼 있다**(B3, #18) — 아래 `tokens.css`·`theme.css` 가 @import 로, `cn.ts` 가 import 로 소비한다.
                             tsdown 이 dist/generated/ 로 복사한다(상대 @import 가 tarball 안에서 살아야 한다). 래칫·ESLint jsdoc 대상이 아니다
  src/tokens/motion.ts       `generated/tokens.ts` 의 `MOTION` 재수출 껍데기(@deprecated) — Toast·ScrollArea·Tooltip 은 생성물을 직접 import 한다(B1 #15 → B3 #18)
  tokens/README.md           조어 규칙(면 <role> · 글자 <role>-foreground · 옅은 면 <role>-soft · 사다리 -2/-3)과 legacy.json 이 세 출력의 원천이라는 계약(B5 #22)
  tokens/legacy-map.mjs      옛 이름 → 새 이름 표 — `eslint/legacy-classes.json`(린트용, 사슬 없음)과 `scripts/codemod-*.mjs`(한 번에, accent·muted 포함)의 공통 계산
  eslint/legacy-classes.json 생성물 — 루트 eslint.config.js 의 `no-restricted-classes` 가 `{pattern, fix}` 로 읽는다 = **`eslint --fix` 가 곧 코드모드**
  src/lib/tone.ts            톤 어휘 한 벌(`toneValues` · `Tone`) + `normalizeTone()` — 옛 키(accent·ok·warn·danger·default·current) 한 마이너 호환(#22)
  src/tokens.css             `generated/{tokens,legacy}.css` 재수출 + 원칙을 강제하는 요소 규칙(box-sizing · body · 컨트롤 radius 0 · .num). 값은 없다
  src/theme.css              tokens.css + `generated/theme.tailwind.css` 재수출, @source "./" 자기 등록, 컴포넌트 CSS(@import), keyframes,
                             손 @utility(tnum · focus-ring · on-canvas · h-ctl* · w-rail · gap-shell · *-dialog-fluid · max-w-popover-fluid), `.ds-*` 컴포넌트 규칙. 값은 없다 —
                             방향 C(캔버스/크롬)의 «왜» 는 머리 주석
  src/{primitives,overlay,feedback,navigation,data}/   DS 컴포넌트(Tailwind 유틸 + cva + Radix)
  src/**/Name.variants.ts    컴포넌트의 cva 한 벌 — `"use client"` 없음(서버에서 호출 가능). 컴포넌트가 import 하고 층 배럴이 `*Variants` 를 export
  src/legacy/                `./legacy` 서브패스 — 3열 작업대 셸·컨트롤·DesignSystemProvider·shell.css(#10). 격리·동결: ESLint ignores,
                             래칫 제외. 루트 배럴은 같은 이름을 지정자별 @deprecated 로 한 마이너 재export 하고 다음 마이너에 `feat!:` 로 지운다
  src/**/*.stories.tsx       컴포넌트 옆 스토리 — 3스토리 계약(Default · Variants · ThemeContrast, `stories-contract.spec` 이 검사, 본보기 Button)
  src/__tests__/             vitest + jsdom 동작·계약 테스트(vitest `unit` 프로젝트, 15 스펙). `tokens/`(배포 CSS 다섯 파일의 postcss 토큰 모델 + 사다리·cn 동작 ·
                             참조 무결성·미참조 원시 · MOTION↔CSS 대조 · 정본 스키마, #15 · #18)과
                             `package/`(exports · "use client" 집합 · 공개 API 목록)는 `arch` 프로젝트(node)가 돈다(#11)
  src/__arch__/              금지 패턴 래칫(`forbidden-patterns.spec` — 파일별 횟수 기준선, 늘면 실패·줄면 낮춰야 통과) + 소스 그래프. `arch` 프로젝트(#11)
  .storybook/                Storybook 10.6 — 정본 카탈로그(포트 6006). addon-themes 가 `html[data-theme]` 을 토글하고 폰트는 @fontsource self-host
  stories/                   페이지 스토리 — `Pages/Gallery`(옛 apps/ds-gallery 통째, Light·Dark) · `Pages/Workbench`(제품 화면 복제) · ThemePair · Matrix
  vrt/                       Playwright 시각 회귀 — storybook-static/index.json 의 `vrt` 태그 스토리 × 라이트/다크. 기준선은 도커로만(scripts/vrt-update.sh).
                             `corners.spec.ts`(#26)는 별도 프로젝트(DPR 2) — CSSOM 스윕·픽셀 프로파일은 CI chromium, 3엔진 darwin 골든은 `VRT_ENGINES=1` 로컬 절차
  tsconfig.json              엄격 프로필 한 벌(src 전량, 스펙·스토리 제외) — tsdown dts 가 읽는다. app-profile(느슨한 2차 검사)은 하는 일이 없어 지웠다(#11)
  tsconfig.test.json         스펙·__arch__ 를 같은 엄격도로 검사. `exclude` 가 래칫(줄어들기만 한다, 오늘 비어 있다)
  tsconfig.stories.json      stories·.storybook·vrt 의 엄격 검사. 빌드 tsconfig 밖에 두어 d.ts 로 새지 않게 한다
  tsdown.config.ts           unbundle ESM + d.ts + CSS 복사. banner 로 "use client" 를 붙이지 않는다 — 파일 첫 줄에 직접 둔다
packages/typescript-config/  tsconfig 프리셋(@buildos/typescript-config, 발행 안 함)
scripts/vrt-update.sh        VRT 기준선 갱신 — CI 와 같은 playwright:v1.63.0-noble 이미지 안에서만(macOS PNG 는 기준선이 아니다)
scripts/codemod-classes.mjs  옛 유틸 이름 → 새 이름을 **한 번에**(#22). 소비 레포는 이것을 먼저 한 번 돌리고 그 다음부터 린트가 잡는다 — accent·muted 는 린트 표에 없다
scripts/codemod-css-vars.mjs `var(--chrome-<옛>)`·`var(--radius-<옛>)` → 새 이름을 한 번에(#22). 둘 다 두 번 돌리면 새 accent·muted 가 다시 바뀐다 — 한 번만
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
  [`docs/design-tokens.md`](docs/design-tokens.md). 옛 이름(`text-ink`·`bg-surface`·`--chrome-line`·`--ink`·`--gap`)은 legacy alias 다 — 새 코드는 쓰지 않는다(린트가 `--fix` 로 바꾼다).
  `tone` prop 도 같은 어휘다: `neutral | primary | success | warning | destructive | info`(옛 키는 한 마이너 동안 `normalizeTone()` 이 옮긴다, ESLint `ds/legacy-tone --fix`).
- **모든 크롬 모서리는 연속 곡률(스쿼클)이다**(#26). CSS `corner-shape` 진행형 향상 — 지원 엔진(Chromium 139+)은 `squircle` + 보정 반경(`--corner-k` 1.5 ·
  md/lg/xl 만, sm 6px 고정), 미지원 엔진(2026-09: Safari 정식·Firefox 정식)은 원호로 떨어지며 **그것이 허용된 폴백이다**(런타임 폴백 없음). 값은 토큰
  (`corner.shape`·`corner.k`), 규칙은 `src/corner.css`(레이어 밖). 원형·pill 은 `rounded-full` 로만 적어 원호 유지, 동심원은 `calc(바깥 토큰 − 패딩)` 만,
  킬 스위치는 `html[data-corner="round"]`. `docs/architecture/design-system-patterns.md` «곡률» 절이 정본이다.
- **클라이언트 경계.** 훅·핸들러·컨텍스트·Radix 를 쓰는 파일은 첫 줄에 `"use client"`. 배럴(index.ts)·cn·canvas-metrics·순수 표시 컴포넌트에는 없다.
- **JS 에서 CSS 를 import 하지 않는다.** 컴포넌트 CSS 는 theme.css 가 `@import` 한다.

## 소비자 계약

버전은 1.x 부터다(shadcn 어휘 개명 #25 가 major 를 냈다). 소비 레포는 정확 버전을 고정하고(`"@buildos/ui": "npm:@jhleeweb/squircle-design-system@1.x.y"` 같은 별칭 허용) 갱신은 PR 로 한다.

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
pnpm storybook         # 카탈로그 (6006) — Pages/Workbench · Pages/Gallery 로 캔버스/크롬 경계와 다크를 눈으로 확인
pnpm storybook:build   # storybook-static (--test) — VRT 와 CI storybook job 의 입력
pnpm typecheck         # 엄격 프로필(src) + test 프로필(스펙·__arch__) + stories 프로필
pnpm lint              # ESLint 10 — 기준선(eslint-suppressions.json) 밖 신규 위반만 실패
pnpm test              # vitest unit(jsdom) + arch(node: 래칫·토큰·패키지 계약) 프로젝트 + packages/eslint-rules 의 RuleTester
pnpm build             # tsdown → packages/ui/dist
pnpm tokens:build      # tokens/*.json → src/generated/* (Style Dictionary). 정본을 고치면 돌리고 생성물을 함께 커밋한다
pnpm tokens:check      # 생성물이 정본과 같은가 — 다르면 exit 1 (CI unit job · verify)
pnpm verify            # typecheck + lint + tokens:check + test + build — PR 전 한 번
pnpm --filter @jhleeweb/squircle-design-system test:stories   # vitest storybook 프로젝트 — Chromium 에서 play + axe(Phase A 는 'todo')
pnpm --filter @jhleeweb/squircle-design-system vrt            # 시각 회귀(storybook:build 뒤). 스냅샷 갱신은 vrt:update(도커)만
VRT_ENGINES=1 pnpm --filter @jhleeweb/squircle-design-system vrt --project corners-chromium --project corners-webkit --project corners-firefox   # 모서리 3엔진 골든(로컬 macOS, playwright install webkit firefox 뒤)
cd packages/ui && pnpm exec publint --strict && pnpm pack --pack-destination /tmp/pack && pnpm exec attw /tmp/pack/*.tgz --profile esm-only --entrypoints . canvas-metrics legacy testing   # 패키지 계약(attw 는 pnpm tarball 로 — npm pack 은 publishConfig.exports 치환을 못 받는다)
```

**래칫 스펙.** `src/__arch__/forbidden-patterns.spec.ts` 는 토큰 밖 리터럴(tsx 대괄호 px/ms · Tailwind 기본 사다리 · CSS px/hex/ms · JS ms)·
`forwardRef`·비-cva 삼항·불리언 data 속성·도메인 어휘를 **파일별 횟수 기준선**으로 붙든다. 실제 횟수가 기준선과 같아야 통과한다 —
늘면 새 위반이고, 줄이면 같은 PR 에서 기준선을 낮춘다(0 이면 줄을 지운다). `legacy-alias-use`(옛 이름 `var(--ink)` 등의 사용, 목록은 legacy.json 에서 읽는다)도
같은 래칫이다(#18). 토큰 쪽도 같은 모양이다: `references.spec` 의 `KNOWN_INLINE_LITERALS`(`@theme inline` 의 리터럴 — #18 에서 0)와 미참조 원시 17개 스냅샷,
`rsc-directives.spec` 의 `"use client"` 파일 목록, `public-api.spec` 의 배럴 export 목록.
토큰은 **JSON 정본만** 고치고 `pnpm tokens:build` 를 돌려 생성물을 함께 커밋한다 — `tokens:check` 가 생성물의 최신성을, VRT 가 픽셀을 지킨다.
새 토큰은 값·출처·대비 근거를 `$description` 에 적는다.

**린트 기준선.** 루트 `eslint.config.js`(플러그인 + 로컬 규칙 `ds/*`, `packages/eslint-rules/`)의 모든 규칙은 error 이고,
첫 실행의 위반은 `eslint-suppressions.json`(ESLint bulk suppressions)이 덮는다 — 계획의 «warn + 기준선» 은 suppressions 가
error 만 덮기 때문에 이 모양이 됐다. **기준선을 늘리는 PR 은 받지 않는다**(`--suppress-all` 재실행 금지). 위반을 고쳐 줄이면
같은 PR 에서 `pnpm exec eslint . --prune-suppressions` 로 기준선을 낮춘다. `src/legacy/` 는
기준선이 아니라 ignores 다(#10) — 동결된 코드는 래칫에 태우지 않는다.

**발행**은 `main` 머지 시 자동이다(AGENTS.md «릴리스»). 로컬에서 발행하려면 `~/.npmrc` 에
`//npm.pkg.github.com/:_authToken=<classic PAT: read:packages + write:packages>` 를 두고
`pnpm --filter @jhleeweb/squircle-design-system publish --no-git-checks`.

## 공유 패키지 — 워크스페이스는 소스, 소비자는 dist

`packages/ui/package.json` 의 `exports` 는 `src/*.ts` 를 가리키고(Storybook 이 HMR 로 소스를 본다),
`publishConfig.exports` 가 `dist/*` 를 가리킨다 — pnpm 이 발행 시 바꿔 끼운다. `"./*"` 와일드카드는 없다: 서브패스는 명시된 것뿐이다.
