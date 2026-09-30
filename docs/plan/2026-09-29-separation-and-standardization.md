# 디자인 시스템 독립 레포 분리 · GitHub Packages 비공개 배포 · 표준화 계획

## Context

`packages/ui`(`@buildos/ui` 0.1.0)는 이 모노레포 안에서만 쓰이는 워크스페이스 전용 패키지다. 사용자 요청은
세 가지다.

1. 디자인 시스템을 **그대로** 독립 레포로 옮기고 GitHub Packages(npm.pkg.github.com)에 **비공개** 배포해
   이 저장소(와 앞으로 다른 레포)가 레지스트리 패키지로 소비한다.
2. 여백·패딩·글자 크기·상황별 토스트 색·인풋 치수 등을 **표준 토큰 패턴**으로 정의·소비하고, 컴포넌트를
   유지보수·확장에 유리한 표준 패턴으로 짜며, DS 레포가 **자체 검증**(다른 앱 없이 자기 CI 로 품질 증명)을 갖춘다.
3. **모든 모서리**가 Apple 식 연속 곡률(스쿼클, G2 연속, 제품 전반 일관)을 따른다.
4. **AI 친화 디자인 시스템** — 사용자가 준 «[MASTER] AI-Friendly Design System Rules» 문서의 요구: 블랙박스(컴파일된
   패키지 + d.ts + JSDoc)/화이트박스(합성 블록 조립) 전달 모델, 컴파운드 컴포넌트 필수, 모든 prop 에 `@default`·값별 설명 JSDoc,
   토큰 가드레일 린트, Storybook 정본 카탈로그(컴포넌트마다 최소 3스토리), CI(린트·tsc·VRT 라이트/다크·axe 대비), main 머지 시
   자동 배포, 에이전트 실행 루프(Analyze → Compose → Audit). 기존 계획과 겹치는 것은 합치고 충돌하는 세부(8px 격자 vs 실측 12px
   카드 간격, shadcn `accent` 의미 충돌, 잘못된 레지스트리 URL)는 근거를 들어 고쳐 넣는다(§2.5).

대원칙: **이식과 표준화를 한 PR 에 섞지 않는다.** 먼저 그대로 옮겨 오늘의 검사(타입 검사 · 스펙 15개 104 `it`)가
새 레포에서 같은 결과를 내고, 표준화는 새 레포 안에서 단계적으로 한다. 새로 켜는 모든 검사는 오늘 값을
기준선(래칫)으로 첫날부터 초록이고 기준선은 줄어들기만 한다.

### 현재 상태(실측 2026-09-29)

- **패키지 표면**: `src` 66파일 7,494줄(비테스트 TS/TSX 44 · CSS 6파일 1,033줄 · 테스트 15스펙 104 `it`). 다른
  `@buildos/*`·앱 코드 import 0건. 외부 연결은 devDependency `@buildos/typescript-config`(`base.json` 8줄)뿐.
- **발행 불가 요인**(`packages/ui/package.json`): `private: true`, `files: ["src"]` 인데 `exports.types` 는
  `dist/*.d.ts`(gitignore), `react` 가 peer 아닌 `dependencies`, `publishConfig`·`repository`·`sideEffects` 없음,
  `"./*"` 와일드카드가 types→`dist/*.d.ts` / default→`src/*.ts` 라 `.tsx` 서브패스는 타입 통과·번들 실패.
- **소비자**: manifest 5곳 `workspace:*`(`apps/india-residential-configurator` 49파일 · `packages/module1` 7 ·
  `apps/parking-studio` 3 · `apps/module5` 1 · `apps/ds-gallery` 1). 지정자 5형태만: `@buildos/ui`(56+`vi.mock` 3),
  `@buildos/ui/canvas-metrics`(6), `@buildos/ui/shell.css`(5), `@buildos/ui/theme.css`(CSS 4+스펙 1), `@buildos/ui/tokens.css`(1).
- **조용히 깨지는 지점**: 네 앱 `src/ds.css` 의 `@source "../../../packages/ui/src"`(india `:25`). 틀려도 에러 없이
  민짜로 렌더된다.
- **조직·레지스트리**: 원격 `aaro-lab/apartment-configurator`. GitHub Packages 는 **스코프 = 레포 소유자(소문자)** 강제
  → `@buildos/ui` 로는 발행 불가. 사용자가 지정한 새 레포는 **개인 계정** `jhleeWEB/squircle-design-system`(2026-09-29 생성, 비공개, 빈 상태,
  이 계정 ADMIN) → 패키지 이름 `@jhleeweb/squircle-design-system`(스코프 소문자). 개인 계정 패키지의 권한은 그 레포 권한을 상속하므로 조직 동료는
  이 레포의 collaborator 여야 읽을 수 있고, «Manage Actions access» 는 같은 소유자의 레포만 추가할 수 있어 `aaro-lab/*` 의 CI 는 GITHUB_TOKEN 이 아니라
  PAT 로 읽는다(Phase 0 에서 실측). 현재 `gh` 토큰에 `read:packages`/`write:packages` 없음.
  인증은 **classic PAT 만** 지원. 조직 선례 `aaro-lab/platform`(changesets + `release.yml`, `packages: write`,
  `NODE_AUTH_TOKEN=GITHUB_TOKEN`). 이 저장소에 `.npmrc`·`.github/workflows` 없음, `vercel.json` 은
  `pnpm install --frozen-lockfile`(2026-09-01 이후 blocked 는 별개). 같은 이름 `@buildos/ui` 가
  `aaro-lab/buildos-configurator`(stage)에도 다른 내용으로 있다(범위 밖, README 에 «별개 포크» 로만 적는다).
- **토큰**: CSS 커스텀 프로퍼티 약 181개, 이름 체계 4벌 공존(base 무접두 `--ink`/원시 `--color-{hue}-{step}`/
  면 접두 `--canvas-*`·`--chrome-*`/Tailwind 별칭 `--color-{role}`), 다크 28개가 **두 블록에 복붙**, font-weight·
  line-height·z-index·duration 토큰 없음, tone 어휘 컴포넌트마다 7가지+, 리터럴 hotspot(shell.css px 143건 ·
  tsx arbitrary 27건 · JS ms 상수 4건).
- **검증**: vitest 동작 테스트만(스냅샷·axe·시각 0건), lint 도구 0건, CI 없음, 루트 `pnpm test` 는 `--filter=./apps/*`
  라 ui 스펙은 사람이 돌릴 때만 실행. 제품 앱 `src/__arch__/forbidden-patterns.spec.ts` 의 래칫 선례가 있다.
- **모서리**: (Part 3 에 실측 기록)

### 목표 상태

- 새 비공개 레포가 `packages/ui`·`packages/typescript-config`·`apps/ds-gallery`·`docs/architecture/design-system-patterns.md`
  를 **같은 상대 경로**로 갖고 이력(25+ 커밋)을 보존한다.
- `@jhleeweb/squircle-design-system` 가 GitHub Packages 에 비공개 발행되고, CI 가 매 PR 에서 정적·토큰·단위/a11y·시각·패키지 계약을
  검사하며, main 머지 → changesets Version PR → 자동 publish 로 돈다.
- 이 저장소는 별칭 `"@buildos/ui": "npm:@jhleeweb/squircle-design-system@x.y.z"` 로 소비해 소스 `.ts/.tsx` 0파일 변경으로 전환하고,
  검증 창 뒤 `packages/ui`·`apps/ds-gallery` 를 삭제한다.
- 토큰은 DTCG JSON 정본 → 생성물(CSS 변수·Tailwind `@theme`·TS 상수), 유틸 어휘는 shadcn 표준 이름(+우리 확장), 컴포넌트는 열 줄 규칙
  (cva·부품 먼저·JSDoc 계약), 모서리는 토큰 하나로 스쿼클을 받는다.
- Storybook 이 정본 카탈로그(컴포넌트마다 `Default`·`Variants`·`ThemeContrast`), 패키지가 `components.manifest.json`·`llms.txt`·린트 프리셋·에이전트 블록/스킬을
  싣고, 소비 레포의 에이전트는 Analyze(manifest) → Compose(부품) → Audit(린트) 루프로 일한다.

설계 원문(이 세션의 세 워크플로 종합, 실행 시 새 레포 `docs/` 로 옮긴다):
`/private/tmp/claude-501/-Users-jaylee-Coding-apartment-configurator/7b5b403e-8be0-4fb6-b729-988c82049cc8/scratchpad/wf1-synthesis.md`(분리·배포 36KB),
`wf2-synthesis.md`(토큰·패턴·검증 44KB), `wf3-synthesis.md`(모서리).

---

## 사용자 결정 사항

사용자에게 묻는 것(다른 답이면 작업이 달라지는 것)과 추천대로 진행하는 것을 가른다.

### 결정됨(사용자 답 2026-09-29)

| # | 질문 | 결정 | 근거 |
|---|---|---|---|
| Q1 | 새 레포 위치·이름 | **`jhleeWEB/squircle-design-system`**(사용자 지정, 개인 계정, 이미 생성됨) | 조직 `aaro-lab` 이 아니라 개인 계정이므로 스코프는 `@jhleeweb`, 패키지 권한 = 레포 권한(협업자 초대), Actions 교차 접근은 PAT. 조직으로 옮길 때 별칭 지정자·`.npmrc` 두 줄만 바뀌게 설계한다 |
| Q2 | 패키지 이름과 소비자 지정자 | 레지스트리 `@jhleeweb/squircle-design-system`(레포 이름과 동일) + 이 저장소 manifest 별칭 `"@buildos/ui": "npm:@jhleeweb/squircle-design-system@…"` | 스코프=소유자는 공식 규칙. 별칭은 소스 0파일·되돌리기 manifest 5개. 전면 개명(import 76+CSS 5+vi.mock 3+문서 6)은 별도 chore PR 로 언제든 가능. 더 짧은 이름(`@jhleeweb/ui`)을 원하면 첫 발행 전 `name` 한 줄 |
| Q3 | 토큰·tone·반경 어휘를 shadcn 표준 이름으로 개명하는가 | **개명**(`bg-surface`→`bg-card`, `text-ink`→`text-foreground`, `bg-accent`→`bg-primary`, `ok/warn/danger`→`success/warning/destructive`, `rounded-control`→`rounded-md` …; `canvas-*`·`text-body` 류 역할명·`shadow-*`·`h-ctl*` 는 유지). 값은 불변, 한 PR 원자 코드모드(린트 자동 수정), 한 마이너 별칭 | LLM 사전 분포가 shadcn. 유지하면 `--color-*: initial` 때문에 LLM 이 쓴 `bg-background` 가 CSS 없이 조용히 무시되고, alias 병행은 `accent`·`muted` 가 이름은 같고 뜻이 반대라 불가. 비용은 UI 256+69건, 앱 57+138+tone 93건이지만 값이 안 바뀌어 VRT 0px 로 검증된다 |
| Q4 | 릴리스 방식 | **semantic-release**(main push → Conventional Commits 로 버전·태그·Release·publish, 봇 PR 없음, PR 제목 린트 필수) | 사용자 문서의 «main 머지 시 자동» 을 그대로 지킨다. 조직 선례는 changesets 이지만 이 조직 실측(`allow_auto_merge=false`, Actions PR 생성 꺼짐)과 2026-06-11 GitHub 변경(봇 PR 의 CI 는 사람 승인 필요) 때문에 Version PR 경로는 승인 대기 또는 CI 전 즉시 머지로 고장난다. 릴리스 노트의 사람 검토가 더 중요하면 changesets(Actions PR 생성 허용 + 봇 PR CI 승인 클릭 감수) |
| Q5 | 모서리 — 데모 브라우저와 폴백 | 데모는 프레젠터 노트북 **Chrome/Edge ≥139** 로 고정(체크리스트에 버전 확인), 미지원 엔진은 **원호 강등** 만(런타임 폴백 없음), `squircle`(K=2)·보정 계수 1.5 로 시작해 카탈로그에서 1.84·n=5 와 비교 | Safari 27 정식·Firefox 정식은 `corner-shape` 미지원 → 고객 Mac Safari 로 데모하면 이 작업의 데모 가치가 0(그 경우 데모 뒤로 미룬다). clip-path/mask/Houdini 폴백은 그림자·헤어라인·포커스 링을 잘라 WCAG 2.4.7 위반. 1.84 는 30px 컨트롤을 pill 에 가깝게 만든다 |

### 추천대로 진행(이의 있으면 말해 달라)

| 항목 | 결정 |
|---|---|
| 배포 형태 | **빌드 산출물**(tsdown `unbundle` ESM + d.ts + CSS 복사 + manifest). 사용자 문서의 «컴파일돼 node_modules 에 설치되는 블랙박스» 와 publint·attw·size-limit·RSC 검사가 전부 dist 를 전제. 소스 배포도 Vite 8.2.2·Vitest 4.1.11 실측상 동작하므로 빌드가 문제를 내면 폴백 가능 |
| 토큰 정본 | DTCG JSON + Style Dictionary 4.x(커스텀 포맷 3개) — Phase B. 181개·2모드·2면·다크 복붙·cn.ts 사다리·JS ms 상수 동기화는 생성으로만 구조적으로 사라진다. Phase A 는 CSS 정본 + postcss 토큰 모델로 시작하므로 테스트는 어느 쪽이든 산다 |
| 카탈로그 | **Storybook 10.6** 정본(사용자 문서 5항). Chromatic 은 배제, VRT 는 Playwright × `storybook-static`. `apps/ds-gallery` 는 Phase A 에 `Pages/Gallery`·`Pages/Workbench` 스토리로 통째 이식 후 삭제 |
| 컴포넌트 매니페스트 정본 | 자체 TS 컴파일러 API 생성기(`dist/components.manifest.json`, 패키지에 실림, `manifest.spec` 게이트). Storybook `componentsManifest`/addon-mcp 는 preview 단계·dev 서버 전용이라 Phase D 의 선택 |
| 간격 규칙 | 사용자 문서의 8px 격자 대신 **4px 기반 + 허용 스텝 화이트리스트**(실측 12px 카드 간격·6px 칩·30/36/44 컨트롤과 shadcn 자체 `h-9 px-3 gap-1.5` 가 8 의 배수가 아니다) |
| Next.js 호환 | 0 비용 선행만(파일별 `"use client"`, `*.variants.ts` 분리, JS→CSS import 제거, tsdown unbundle). Next 스모크는 비필수 야간 job, 실제 Next 소비자가 생기면 필수 |
| `.npmrc` 인증 줄 | 소비자(이 저장소)는 커밋 `.npmrc` 에 `//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}`(변수 없으면 install 즉시 실패 = fail-fast). DS 레포는 스코프 매핑만 |
| `read:packages` 토큰 주체 | 개인 classic PAT 로 시작(로컬 각자, Vercel 은 owner 한 사람, 발급자·만료일 README 기록). 소비 레포 둘 이상이면 머신 유저 |
| 새 레포 브랜치 | `main` 단일 + PR 필수·squash. 라이브러리는 발행 버전이 곧 승격이라 develop/main 이중이 하는 일이 없고 changesets Version PR 은 기본 브랜치에 열린다. AGENTS.md 사본에 «라이브러리 레포 예외» |
| 릴리스 | changesets(조직 선례). GITHUB_TOKEN 이 연 Version PR 에는 CI 가 안 돌므로 필수 체크를 걸지 않는다 |
| 소비자 버전 고정 | 정확 버전 `npm:@jhleeweb/squircle-design-system@0.1.0` + arch 스펙으로 manifest 5개 값 일치 강제(앱·module1 이 한 벌로 풀려야 Provider 컨텍스트가 안 끊긴다) |
| `packages/ui`·`apps/ds-gallery` 삭제 | 검증 창(최대 2주) 뒤 별도 PR-2. 창 동안 되돌리기는 revert 1건 |
| git 이력 | `git filter-repo` 로 네 경로 보존(blame·상대경로·`extends` 유지) |
| Tailwind `@source` 책임 | DS `theme.css` 에 `@source "./"` 자기 등록(tailwindcss 4.3.3 `lib.js` 에서 선언 파일 디렉터리 기준 등록 확인) + PR-1 은 소비자 줄 병행 후 PR-2 에서 제거 |
| `packages/module1` 의 ui 의존 | PR-1 dependencies(별칭) 유지, PR-2 에서 peer + dev |
| `design-system-patterns.md` | 새 레포로 이동 + 여기엔 5줄 포인터 스텁(aaro-wiki 서베이가 이 저장소를 긁는다) |
| `@buildos/typescript-config` | 새 레포에 이름 그대로 workspace 복사(발행 안 함) |
| 리터럴 금지 도구 | vitest 래칫 + ESLint **10** 부트스트랩을 Phase A 에(warn + baseline), stylelint 16 은 Phase C, 0 된 규칙부터 error |
| tone 어휘 | Q3 에 따라 `neutral/primary/success/warning/destructive/info`(개명 시) — 한 마이너 `normalizeTone()` shim + 린트 자동 수정 |
| 시각 회귀 | Playwright × `storybook-static`(스토리 수준, 라이트/다크), 스냅샷 git 커밋(linux-chromium 한 벌, 도커로만 갱신), `maxDiffPixels` A 50 → C 0 |
| 레거시 셸·컨트롤 | `@jhleeweb/squircle-design-system/legacy` 서브패스로 격리·동결, 루트 배럴 한 버전 `@deprecated`. v1.0 부터 배럴의 `Select`·`Tabs`·`Field`·`Tooltip` 은 컴파운드 부품 Root(shell `Field` → `legacy` 의 `HudField`) |
| forwardRef → ref prop | 컴포넌트별 PR(래칫 0 까지) |
| base 30개 옛 이름 | alias 로 유지·래칫으로 감소, 제거는 major 에서 일괄 |
| 대비 게이트 | WCAG 2.x AA(4.5/3.0) + `KNOWN_FAILURES` 래칫, APCA 는 정보 열 |
| 포맷터 | Prettier 3 + `prettier-plugin-tailwindcss`(클래스 순서 고정 = 스냅샷 안정), 포맷 전용 PR + `.git-blame-ignore-revs` |
| 아이콘 | react-icons/lu 유지 + `lib/icons.ts` 단일 출처(16px, strokeWidth 2) |
| 커버리지 문턱 | 첫 실행 실측 floor-2 고정 후 올리기만 |
| Switch 등 크기 드리프트 | shell.css 되덮기 값 36×22×18 을 후보로, 갤러리 브라우저·시각 스냅샷 확인 뒤 확정 |
| 모서리 chip(6px) 단 | 보정 계수 적용 안 함(6px 유지) — 차이는 서브픽셀, 9–11px 은 20px 배지를 알약으로 만든다 |
| 모서리 3엔진 스냅샷 위치 | 로컬 macOS 릴리스 전 절차(darwin 골든 커밋), CI 는 정적 불변식 + Chromium CSSOM 스윕만(골든이 OS 폰트에 민감) |
| india 뷰어 위 2px·parking-studio `.swatch` | 범례 스와치는 캔버스(0), HUD·오버레이 컨트롤은 chip — 요소별 «캔버스인가 크롬인가» 로 가른다 |
| floorplan 패키지 CSS 모서리 | 전역 규칙에 즉시 걸리는 50% 원형 4건(+`viewer.css:12`)에만 `corner-shape: round`, 나머지 21건+ 는 별도 이슈 |

---

## Part 1 — 레포 분리 · GitHub Packages 비공개 배포

### 1.1 목표 레포 구성 (이 저장소와 같은 상대 경로)

```
squircle-design-system/
├── .releaserc.json                   # semantic-release: branches main · conventionalcommits · npm + github (git 플러그인 없음)
├── .github/actions/setup/action.yml  # pnpm/action-setup@v4 + setup-node@v4(node 24, cache pnpm) + frozen install (registry-url 은 주지 않는다 — 프로젝트 .npmrc 가 스코프 매핑)
├── .github/workflows/ci.yml          # PR·main: static · unit · tokens · visual · package (Part 2 D-6)
├── .github/workflows/release.yml     # main push: changesets Version PR → publish
├── .github/ISSUE_TEMPLATE/ pull_request_template.md   # 원 레포 복사
├── .npmrc                            # @jhleeweb:registry=https://npm.pkg.github.com  (인증 줄 없음)
├── .nvmrc  .gitignore  AGENTS.md  CLAUDE.md  README.md
├── package.json  pnpm-workspace.yaml  turbo.json
├── docs/architecture/design-system-patterns.md   # 이동(#1246 계약) + Part 2 문서 추가
├── packages/typescript-config/       # base.json + package.json 그대로
├── packages/ui/                      # 통째로 — src 66파일·tsconfig·vitest.config 무변경(이식 PR)
│   ├── package.json                  # ★ 1.2
│   └── src/theme.css                 # ★ `@source "./"` 한 줄 추가(이식 PR 의 유일한 소스 변경)
└── apps/ds-gallery/                  # 이식 PR 은 그대로(`@buildos/ui` → `@jhleeweb/squircle-design-system` 4곳). Phase A 에서 packages/ui/stories/gallery/ 로 이식 후 삭제(§2.5-e)
```

### 1.2 `packages/ui/package.json` (빌드 산출물 배포. `./legacy`·`./eslint`·manifest·`bin` 은 Phase A~D 에서 차례로 생긴다)

```jsonc
{
  "name": "@jhleeweb/squircle-design-system",                        // 스코프 = 레포 소유자 — publish 의 전제
  "version": "0.1.0",                            // semantic-release 채택 시 "0.0.0-managed"
  "description": "AARO 디자인 시스템 — 도면 캔버스와 UI 크롬을 가른 토큰(방향 C), Radix 기반 오버레이·피드백 층, 3열 작업대 셸, 그리고 그 위의 컨트롤.",
  "license": "UNLICENSED",
  "type": "module",
  "repository": { "type": "git", "url": "https://github.com/jhleeWEB/squircle-design-system.git", "directory": "packages/ui" },
  "publishConfig": { "registry": "https://npm.pkg.github.com", "access": "restricted" },
  "sideEffects": ["**/*.css"],                   // 소비자가 theme.css 를 side-effect import 한다 — false 면 webpack 프로덕션에서 제거될 수 있다
  "files": ["dist", "llms.txt", "docs", "agent", "README.md", "CHANGELOG.md"],
  "bin": { "sds-agent": "./dist/agent/cli.js" },
  "exports": {                                   // 조건 순서 types → import → default. "./*" 와일드카드는 닫는다(실소비 서브패스는 canvas-metrics 뿐)
    ".":                { "types": "./dist/index.d.ts",          "import": "./dist/index.js",          "default": "./dist/index.js" },
    "./canvas-metrics": { "types": "./dist/canvas-metrics.d.ts", "import": "./dist/canvas-metrics.js", "default": "./dist/canvas-metrics.js" },
    "./legacy":         { "types": "./dist/legacy/index.d.ts",   "import": "./dist/legacy/index.js",   "default": "./dist/legacy/index.js" },
    "./eslint":         { "types": "./dist/eslint/index.d.ts",   "import": "./dist/eslint/index.js",   "default": "./dist/eslint/index.js" },
    "./theme.css": "./dist/theme.css", "./tokens.css": "./dist/tokens.css", "./shell.css": "./dist/shell.css", "./canvas.css": "./dist/canvas.css",
    "./components.manifest.json": "./dist/components.manifest.json", "./llms.txt": "./llms.txt", "./package.json": "./package.json"
  },
  "scripts": {
    "build": "tsdown && pnpm run build:manifest",   // tsdown.config: entry [index, legacy/index, canvas-metrics, eslint/index, agent/cli], format esm, unbundle true, dts true, platform neutral, copy CSS 4종. banner 로 "use client" 를 붙이지 않는다
    "build:manifest": "tsx scripts/build-manifest.ts && tsx scripts/build-docs.ts",
    "prepack": "pnpm run build",
    "typecheck": "tsc -p tsconfig.json && tsc -p tsconfig.test.json && tsc -p tsconfig.stories.json",
    "test": "vitest run --project=unit", "test:stories": "vitest run --project=storybook",
    "storybook": "storybook dev -p 6006", "storybook:build": "storybook build --test -o storybook-static",
    "vrt": "playwright test -c vrt/playwright.config.ts", "vrt:update": "scripts/vrt-update.sh",
    "lint": "eslint . --max-warnings 0", "lint:css": "stylelint \"src/**/*.css\"",
    "tokens:build": "node tokens/build.mjs", "tokens:check": "node tokens/build.mjs --check"
  },
  "dependencies": { "class-variance-authority": "^0.7.1", "clsx": "^2.1.1", "radix-ui": "^1.6.7", "react-icons": "^5.7.0", "tailwind-merge": "^3.7.0" },
  "peerDependencies": { "react": "^19.0.0", "react-dom": "^19.0.0", "tailwindcss": "^4.3.0", "@types/react": "^19" },
  "peerDependenciesMeta": { "tailwindcss": { "optional": true }, "@types/react": { "optional": true } },
  "devDependencies": { "@buildos/typescript-config": "workspace:*", "@testing-library/dom": "^10.4.0", "@testing-library/react": "^16.3.0",
    "@types/node": "^22", "@types/react": "^19.2.0", "@types/react-dom": "^19.2.0", "jsdom": "^26.1.0", "react": "^19.2.0", "react-dom": "^19.2.0",
    "tailwindcss": "^4.3.3", "tsdown": "^0.23", "typescript": "^5", "vitest": "^4",          // vitest 5 는 addon-vitest peer(^3||^4) 때문에 금지
    "storybook": "^10.6", "@storybook/react-vite": "^10.6", "@storybook/addon-docs": "^10.6", "@storybook/addon-a11y": "^10.6",
    "@storybook/addon-vitest": "^10.6", "@storybook/addon-themes": "^10.6", "@vitest/browser-playwright": "^4", "@playwright/test": "1.63.0" }
}
```

이식 PR 시점에 바로 하는 것: `"./*"` 닫기 + `./canvas-metrics` 명시(실소비자 6곳), `react` 를 peer 로, `@testing-library/dom` 명시(지금은 autoInstallPeers 에 기댐),
`"use client"` 24파일 첫 줄(§2.5-g), `toast.css`·`card-motion.css` 를 `theme.css` 로 합쳐 JS→CSS import 0.

`theme.css` 머리:
```css
@import "./tokens.css";
@import "./canvas.css";
/* 이 파일을 import 한 소비자의 Tailwind 가 이 패키지 안의 클래스를 굽도록 자기 자신을 등록한다.
   @source 는 선언 파일의 디렉터리 기준(tailwindcss 4.3.3 lib.js 실측). 소비자는 @import 한 줄로 끝난다. */
@source "./";
```

### 1.3 루트 파일 · Actions · 규약

- 루트 `package.json`: `packageManager pnpm@10.11.0`, `engines node>=24`, scripts `build`·`typecheck`·`test`·`verify`·
  `storybook`(`pnpm --filter @jhleeweb/squircle-design-system storybook`, 6006)·`release`(Q4: semantic-release 면 `pnpm exec semantic-release`, changesets 면 `changeset publish`),
  devDependencies `semantic-release`, `conventional-changelog-conventionalcommits`, `@semantic-release/{commit-analyzer,release-notes-generator,npm,github}`.
- `release.yml` — **semantic-release(Q4 확정)**: `on: push main`, `permissions: contents write · issues write · pull-requests write · packages write · id-token write`,
  checkout(fetch-depth 0) → pnpm → setup-node(**`registry-url` 을 주지 않는다** — 프로젝트 `.npmrc` 와 충돌) → `pnpm install --frozen-lockfile && pnpm build && pnpm test:package`
  → `pnpm exec semantic-release`(env `GITHUB_TOKEN`·`NPM_TOKEN` 둘 다 `secrets.GITHUB_TOKEN`; 발행 레포의 GITHUB_TOKEN 은 패키지 admin 자동).
  `.releaserc.json`: `branches: ["main"]`, `commit-analyzer`·`release-notes-generator`(preset `conventionalcommits`), `@semantic-release/npm`, `@semantic-release/github`.
  `@semantic-release/git` 은 쓰지 않는다(ruleset 이 push 를 막음 — 태그·Release 만, 저장소 `version` 은 `0.0.0-managed`). PR 에서 `--dry-run` 코멘트.
  파괴적 변경은 `feat!:` 또는 본문 `BREAKING CHANGE:`(한국어 본문만으로는 major 가 오르지 않는다; 반대로 `!` 는 0.x 에서도 major 다 — 실측 v0.2.0 → v1.0.0) — AGENTS.md 사본에 추가. `pr-title` job 이 PR 제목 Conventional 검사(= squash 제목 = 버전 입력).
  (대안으로 남겨 두는 changesets — `aaro-lab/platform` 선례 — 는 `changesets/action@v2` + Actions PR 생성 허용 + 봇 PR CI 승인 클릭이 필요하다.)
- `ci.yml`: §2.5-f 의 6 job(static·unit·tokens·storybook·vrt·package) + pr-title. 이식 PR 시점에는 `static`(typecheck)·`unit`(vitest)·`package`(pack 계약: tarball 에
  `dist/index.js`·`dist/index.d.ts`·CSS 4개, `__tests__`·stories 없음)만 켜고 나머지는 Phase A 에서 붙인다.
- ruleset: `aaro-harness` 체크아웃의 `policy/scripts/apply-ruleset.mjs --repo jhleeWEB/squircle-design-system`(`AGENTS.md:122` 의
  `scripts/apply-ruleset.mjs` 는 이 저장소에 **없다** — 별도 docs 이슈). `gh repo edit … --default-branch main
  --enable-squash-merge --enable-merge-commit=false --enable-rebase-merge=false --delete-branch-on-merge`.

### 1.4 단계

**Phase 0 — 전제(사용자 실행, 코드 변경 없음)**
1. Q1~Q5 는 확정됐다(«결정됨» 표). 이 저장소에 이슈 «디자인 시스템을 독립 레포로 분리하고 `@jhleeweb/squircle-design-system` 레지스트리 패키지로 소비한다».
2. 토큰: `gh auth refresh -h github.com -s read:packages,write:packages` 뒤
   `NODE_AUTH_TOKEN=$(gh auth token) npm whoami --registry=https://npm.pkg.github.com` 실측. 401 이면 classic PAT
   (read:packages + write:packages, 조직 SSO 승인). `~/.npmrc` 의 기존 `npm.pkg.github.com` 줄(platform 용 추정) 충돌 확인.
3. 개인 계정이라 조직 패키지 정책은 없다. 조직 동료가 패키지를 읽어야 하면 이 레포에 collaborator(read)로 초대한다 — 패키지 권한은 레포 권한을 상속한다.
   «Manage Actions access» 에 `aaro-lab/apartment-configurator` 를 추가할 수 있는지 실측(문서상 같은 소유자 레포만) — 안 되면 이 저장소 CI 는 PAT.
4. 레포는 이미 있다(비공개·빈 상태·ADMIN). 첫 push 뒤 `gh repo edit jhleeWEB/squircle-design-system --default-branch main --enable-squash-merge
   --enable-merge-commit=false --enable-rebase-merge=false --delete-branch-on-merge` → aaro-harness 체크아웃의 `node policy/scripts/apply-ruleset.mjs
   --repo jhleeWEB/squircle-design-system --dry-run` 뒤 실제 적용(개인 레포에도 admin 이면 된다; 스크립트가 조직을 전제하면 `gh api` 로 같은 규칙을 직접) →
   필수 체크(static·unit·tokens·storybook·vrt·package·pr-title)는 job 이 생기는 Phase A 에 등록 → **정정(#10)**: ruleset 불가(무료 플랜) — CI 필수 체크 대신 규약. semantic-release 라 Actions PR 생성 허용은 불필요.
- 완료 조건: `npm whoami` 가 계정명 반환 · 레포 존재 · ~~ruleset 적용~~(무료 개인 플랜 비공개 레포는 ruleset 불가 — 규약으로 대신, #10) · Actions PR 생성 허용.

**Phase 1 — 이식·첫 배포(새 레포)**
1. 이력 보존(별도 클론, 원 저장소 무변경):
   ```bash
   brew install git-filter-repo
   git clone --no-local https://github.com/aaro-lab/apartment-configurator.git sds-split && cd sds-split
   git filter-repo --path packages/ui --path packages/typescript-config --path apps/ds-gallery --path docs/architecture/design-system-patterns.md
   git branch -m develop main && git remote add origin https://github.com/jhleeWEB/squircle-design-system.git && git push -u origin main
   ```
   스냅샷 기준 develop tip `1edca9e2`.
2. 골격(1.3) 추가 → `pnpm install` → `pnpm -r build:types && pnpm -r typecheck && pnpm -r test` 가 원 레포와 같은 104 `it`
   통과(실패 = 이식 누락).
3. manifest 교정(1.2) + `theme.css` 자기 등록 + 갤러리 4곳 개명 + `src/index.ts:16-23`·`theme.css:25-28` 사용법 주석 갱신.
   `pnpm --filter @jhleeweb/squircle-design-system pack` → tarball 내용 검사 → 이식 시점에는 아직 `apps/ds-gallery`(5186)로 눈 확인(Phase A 뒤에는 `pnpm storybook` 6006).
4. CI·release 워크플로 PR → main squash. 첫 발행 `pnpm --filter @jhleeweb/squircle-design-system publish --no-git-checks`(로컬 PAT). 이후 changesets.
   `gh api /user/packages/npm/squircle-design-system --jq '.visibility,.repository.full_name'` → private · jhleeWEB/squircle-design-system.
   «Manage Actions access» 는 같은 소유자(jhleeWEB)의 레포만 받으므로 `aaro-lab/apartment-configurator` 의 장래 CI 는 classic PAT(secret `GH_PACKAGES_TOKEN`)로 읽는다.
- 완료 조건: 새 레포 CI 초록 · `@jhleeweb/squircle-design-system@0.1.0` 이 private 로 레포에 연결 · tarball 에 `dist/*.d.ts`+JS+CSS, `__tests__` 없음 ·
  갤러리 화면 동일.

**Phase 2 — 이 저장소 소비 전환 PR-1 (`build/consume-aaro-lab-ui`, base develop)**
1. 루트 `.npmrc`(신규):
   ```
   # GitHub Packages — @jhleeweb 스코프만 npm.pkg.github.com 에서 받는다(@buildos/ui 는 @jhleeweb/squircle-design-system 의 별칭).
   # NODE_AUTH_TOKEN 이 없으면 pnpm 이 여기서 즉시 실패한다 — 401 로 늦게 죽는 것보다 낫다. CLAUDE.md 「빌드·검증」 참조.
   @jhleeweb:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
   ```
2. manifest 5곳 `"@buildos/ui": "workspace:*"` → `"npm:@jhleeweb/squircle-design-system@0.1.0"`. 별칭이라 `node_modules/@buildos/ui` 이름이 유지되어
   import 76·`vi.mock` 3·`worker-imports.spec.ts:9`·`reachability.spec.ts:174`·CSS `@import` 전부 무변경.
3. `src/ds.css` 4곳: `@source "../../../packages/ui/src"` → `@source "../node_modules/@buildos/ui/dist"`(자기 등록과 중복, 무해; PR-2 제거).
   india 의 `../../../packages/module1/src/ui` 줄 유지. 주석 3번 갱신.
4. `pnpm install` → lockfile 재생성(importers 의 `link:../../packages/ui` 5건 → `npm:@jhleeweb/squircle-design-system@0.1.0`).
5. Vite/Vitest 설정 무변경으로 시작. 실측 실패 시 `optimizeDeps.exclude: ["@buildos/ui"]` + `include: ["@buildos/ui > radix-ui", …]`,
   Vitest `server.deps.inline: ["@buildos/ui"]`.
6. `packages/ui/package.json` description 에 «동결 — 정본은 jhleeWEB/squircle-design-system» 표기(창 동안 죽은 사본 수정 방지).
7. 검증(§검증 3~8) → `gh pr create --base develop … Closes #N` → `gh pr merge --squash --delete-branch`.
- 완료 조건: 소스 `.ts/.tsx` 변경 0 · `pnpm typecheck && pnpm test && pnpm build` 통과 · 빌드 CSS 에 `.rounded-control`·`--radius-control` ·
  `pnpm dev`(5179) 에서 Modal·Toast·Card 스타일 렌더 · 프레시 클론 `--frozen-lockfile` 성공.

**Phase 3 — 인증 배치 · 검증 창 · PR-2**
- 3a(코드 변경 없음): Vercel env `NODE_AUTH_TOKEN`(Production·Preview, classic PAT read:packages, 만료 1년+알림); 개발자 셸
  `export NODE_AUTH_TOKEN=…`(워크트리 상속); 장래 CI 는 secret `GH_PACKAGES_TOKEN`(classic PAT) 을 `NODE_AUTH_TOKEN` 으로(개인 계정 패키지라 GITHUB_TOKEN 불가).
- 3b 검증 창(≤2주): 프레시 클론 빌드 성공 + DS patch(0.1.1) 한 번 발행 → `pnpm -r update @buildos/ui@npm:@jhleeweb/squircle-design-system@0.1.1` 로
  manifest 5 + lockfile 만 바뀌는 PR 1회.
- 3c PR-2 `chore/remove-ui-workspace`: `git rm -r packages/ui apps/ds-gallery`; 루트 `package.json:26 dev:ds-gallery`·
  `.claude/launch.json:39-43` 삭제; `design-system-patterns.md` → 5줄 스텁; ds.css 3곳 `@source` 제거; `packages/module1/package.json`
  ui·react 를 peer+dev 로; 문서(`CLAUDE.md` 「저장소 구조」 12개→11개 + «ui 는 외부 `@jhleeweb/squircle-design-system` 별칭», 「공유 패키지」 절 예외 문단
  (별칭·정확 버전·`NODE_AUTH_TOKEN`·link 루프·turbo 밖), 「빌드·검증」 토큰 전제; `AGENTS.md` ui 명령; `README.md` §14;
  `docs/architecture/react-app-structure.md:193,292`; `docs/module5/VISUALIZATION-AI-HANDOFF.md:140,167`; `apps/module5/src/tokens.css:9`);
  arch 스펙(`apps/india-residential-configurator/src/__arch__/`: `@buildos/ui` 지정자 집합 크기 1, 루트 `pnpm.overrides` 없음).
- 완료 조건: `grep -rn 'packages/ui\|ds-gallery' CLAUDE.md README.md docs .claude/launch.json package.json` 0건 ·
  `turbo run build:types --dry-run` 에 ui 없음 · module1 이 peer 로 앱과 한 벌.

**Phase 4 — 개발 루프 · 버전 운영**
- 개발 루프(권장, 커밋 금지): DS 레포를 `~/Coding/squircle-design-system` 에 두고 이 저장소 루트 `package.json` 에 임시
  `"pnpm": {"overrides": {"@jhleeweb/squircle-design-system": "link:../squircle-design-system/packages/ui"}}` → `pnpm install`(별칭 키가 실명/별칭 어느 쪽에 먹는지
  `pnpm why` 로 첫 연동 때 실측). 앱 `vite.config.ts` 의 `server.fs.allow` 에 영구적으로
  `[searchForWorkspaceRoot(process.cwd()), ...(process.env.DS_LINK ? [process.env.DS_LINK] : [])]`(india 는 신설) →
  `DS_LINK=$HOME/Coding/squircle-design-system pnpm dev`. DS 쪽 `tsdown --watch`. 끝나면 override 삭제 + `pnpm install`, `git diff package.json pnpm-lock.yaml` 빈 것 확인.
  대안: `pnpm pack` 후 `file:` override(발행 산출물 그대로 검증, HMR 없음). 비권장: `pnpm link --global`, yalc.
- 버전: 0.x 는 `0.MINOR` breaking(changeset 첫 줄 `BREAKING:`), 그 외 patch. changeset 본문 한국어, 커밋 `chore(release): 버전 올림`.
  갱신 자동화는 `.github/dependabot.yml`(`registries.github-npm`, Dependabot secret) 시도 → pnpm `npm:` 별칭을 못 다루면
  `bump-ui.yml`(schedule + `pnpm -r update …@latest` + create-pull-request, 제목 `build(ui): @jhleeweb/squircle-design-system 를 x.y.z 로 올린다`).
  잘못 올린 버전은 삭제 대신 patch 추가. 가시성 private 유지(public 은 비가역).
- 완료 조건: link 루프 HMR 확인 · patch 한 사이클(Version PR → publish → 태그 → 갱신 PR) 완주 · 자동 갱신 첫 PR.

---

## Part 2 — 새 레포에서의 표준화(토큰 · 컴포넌트 패턴 · 자체 검증 · AI 친화)

### 2.1 실태 요약

§Context 「현재 상태」 의 토큰·검증 실측이 이 Part 의 출발점이다. 절 순서: 2.2 토큰 → 2.3 컴포넌트 패턴 → 2.4 자체 검증 → 2.5 AI 친화 계약 → 2.6 도입 순서.

### 2.2 토큰 아키텍처

**정본과 파일**(Phase B 후반; Phase A/B-0 는 손 CSS 정본 + postcss 토큰 모델):
```
packages/ui/tokens/                       ← DTCG JSON, 사람이 편집하는 유일한 곳
  primitive/ color.json dimension.json typography.json motion.json
  semantic/  canvas.json                   ← 모드 파일 없음 = 다크 없음(구조가 곧 계약, build 가 canvas.dark.json 을 거부)
             chrome.light.json chrome.dark.json   ← 생성기가 dark 를 한 번 읽어 @media 블록과 [data-theme=dark] 블록에 같은 본문
             layer.json                    ← z-index · radius · shadow · corner
  component/ control.json overlay.json toast.json collapse.json
  legacy.json                              ← base 30개 + 옛 이름 → 새 이름 alias($deprecated)
  schema.ts build.mjs formats/{css-vars,tailwind-theme,ts-consts}.mjs
packages/ui/src/generated/ tokens.css theme.tailwind.css legacy.css tokens.ts ladders.ts   ← 커밋, `tokens:check` 로 최신성 강제
```
Style Dictionary `usesDtcg: true`, `outputReferences: true`(`--chrome-surface: var(--palette-cool-0)` 로 참조 사슬 보존, `@theme inline`
이 `var(--chrome-*)` 를 가리켜 테마 전환이 먹는다), dark 는 source 가 아니라 options 로 로드(같은 키 이중 정의 충돌 회피).

**계층**: primitive(리터럴 유일 층, `--palette-*` 로 개명해 Tailwind `--color-*` 충돌 해소, 미참조 18개 «죽은 원시» 검사) →
semantic(면 접두 = 모드 집합, 값은 전부 참조; canvas 9개 hex → 회색 참조 복원, 다크 raw hex → 새 원시 사다리) →
component(치수·시간, CSS 변수와 TS 상수 둘 다 출력).

**이름 규칙**(JSON 경로 → CSS → Tailwind 기계적 대응, 예외 2개는 rename+alias: `--chrome-bg`→`chrome.page`, `--chrome-tooltip-bg`→`chrome.tooltip`):

| 층 | JSON | CSS | Tailwind |
|---|---|---|---|
| primitive 색 | `palette.azure.500` | `--palette-azure-500` | 없음 |
| 간격 | `space.base` | `--spacing`(4px) | `p-4` `gap-3` |
| canvas | `canvas.ink-2` | `--canvas-ink-2` | `text-canvas-ink-2` |
| chrome | `chrome.muted`(옛 surface-2) | `--chrome-muted` | `bg-muted`(`chrome-` 접두만 뗀다; 이름은 §2.5-d 의 shadcn 표) |
| 상태 | `chrome.destructive.soft` | `--chrome-destructive-soft` | `bg-destructive-soft` |
| 반경/그림자/글자 | `radius.md` `shadow.pop` `text.body` | `--radius-md`(6/8/12/16 = sm/md/lg/xl) … | `rounded-md` `shadow-pop` `text-body` |
| 굵기/자간 | `font.weight.semibold` `tracking.caps` | `--font-weight-semibold` | `font-semibold`(initial 리셋 뒤 우리 것만) |
| 층위 | `layer.toast` | `--layer-toast` | `z-toast`(@utility 생성) |
| 모션 | `duration.fast` `collapse.duration` | `--duration-fast` | `duration-fast`(@utility 생성) |
| 컴포넌트 치수 | `control.height.md` `overlay.width.md` | `--control-height-md` `--container-dialog-md` | `h-ctl` `w-dialog-md`/`max-w-dialog-md` |

**상태색(«상황별 토스트 색» 정본)**: tone `neutral | accent | ok | warn | danger`, 톤마다 다섯 역할 `DEFAULT / hover / ink(on-color) / soft / line`.
원시에 `rust`(danger)·`moss`(ok)·`amber`(warn) 사다리 4~5단 추가, 다크는 원시 참조. 컴포넌트는 `lib/tone.ts` 의
`statusRecipe: Record<Tone, {solid, soft, outline, text, edge}>` 조합만 고른다(Toast=`edge`+`border-line`, Alert=`soft`+`edge`,
Badge=`soft`, Button solid=`solid`, Td=`text`). 테두리 `/35`·`/40` 불투명도 혼용은 `{tone}-line` 으로 통일.

**스케일**: 간격 `--spacing 4px` 유지 + 역할 `space.hairline 1 / card-gap 12 / panel-inset 12 / card-inset 16`;
크기 `size.icon 12/16/20 · control 30/36/44 · rail 64 · strip 36 · scrollbar 6 · switch {w,h,thumb}`;
오버레이 `overlay.width 380/560/880/1180 → --container-dialog-*`, `drawer.width 280/400/620`, `menu.min-width 168`, `popover 180/360`;
타입 7단 유지 + 굵기 400/500/600/700 + 자간 tight/caps + `@theme` 에 `--font-weight-*: initial`·`--tracking-*: initial`;
모션 `duration 0/100/150/200`, `toast enter/exit/grace/default 220/180/240/4200`, `collapse = duration.slow`, `scrollbar 500/200`, `tooltip 350`;
층위 `layer raised/sticky/scrim/modal/popover/toast/tooltip 1/10/40/41/50/60/70`.

**혼용 규칙 7개(문서 + 래칫)**: ① tsx 는 유틸리티만(이름 = 토큰 이름, 대괄호 arbitrary 에 px/ms/hex 금지) ② `.ds-*` CSS 는 `var(--…)` 만
(0·1px 예외) ③ `@theme` 정적 = radius·shadow·text·spacing·font-weight·tracking·container, 네임스페이스마다 `initial` 리셋(테스트)
④ `@theme inline` = 모드 갈리는 값, 반드시 `var(--chrome-*|--canvas-*)`, 리터럴 금지(테스트) ⑤ @utility 는 생성(손 추가 금지 래칫)
⑥ cn.ts 사다리는 생성물 `ladders.ts` ⑦ `var(--palette-*)` 는 semantic JSON 안에서만.

**alias 이행(소비자 이름은 마지막까지 불변)**: B-0 손 CSS 해석 맵 스냅샷 → B-2 JSON+생성기 미연결(생성물 해석 맵 == 스냅샷) →
B-3 연결(`src/tokens.css` 가 generated 재수출, theme.css 는 keyframes·`.ds-*` 만) → `legacy.json`→`generated/legacy.css`
(`--ink: var(--chrome-ink)`, `--ok-pale: var(--chrome-ok-soft)`, `--gap`, `--size-gap` …) + `legacy-alias-use` 래칫 → 제거는 major.

### 2.3 컴포넌트 패턴 — 열 줄 규칙(1~8 아래, 9 컴파운드·10 JSDoc 은 §2.5-b/c)

1. 변형은 `cva` 한 벌, `<name>Variants`·`<Name>Props` export(삼항·배열 join·객체맵 금지).
2. props 축은 다섯: `variant`(외형) · `tone`(공용 `Tone`) · `size`(sm/md/lg) · `elevation`(raised/flat/flush) · `side|orientation`.
3. ref 는 prop(React 19, `ComponentPropsWithRef<"button">`), `forwardRef` 신규 금지·래칫 0.
4. 상태는 `data-*`: `data-slot`(rest **뒤**에 펼쳐 못 덮음) · `data-variant/tone/size`(해석된 기본값 포함) · 불리언은 존재 여부(`"true"/"false"` 금지).
5. 리터럴 금지: tsx 는 토큰 유틸리티, JS 시간 상수는 `tokens/motion.ts`.
6. Radix 합성: Root/Trigger/Close 재export, Content 가 Portal 수명 소유, 미지원 prop Omit, 장식은 `asChild`+`Slot.Slottable`,
   소비자 핸들러 먼저 → `defaultPrevented` 존중(단 `disabled/loading/dismissible=false` 는 해제 불가).
7. 도메인 어휘 격리(필지·FSI·TBV·verdict 는 앱), 화면 문구는 `labels` prop(영어 기본값 불변).
8. 폴더 하나 = 컴포넌트 하나(`Name.tsx · Name.variants.ts · Name.stories.tsx · Name.spec.tsx · index.ts`), `describeComponentContract(storiesModule)` 공통 계약(스토리가 유일한 픽스처).
9. 부품 먼저, 래퍼는 설탕(§2.5-b). 10. JSDoc 계약(§2.5-c).

공용 헬퍼 `src/lib/`(`@internal`, `stripInternal`): `tone.ts`(TONES·statusRecipe) · `data-attrs.ts` · `slot.tsx`(Slottable 복붙 3곳 제거) ·
`icons.ts`(16px, strokeWidth 2, 인라인 SVG 6곳 교체) · `labels.ts`. 공개 API 는 `index.ts` 하나(층 배럴은 이름 나열),
`__arch__/public-api.spec.ts` 인라인 스냅샷. 레거시(`shell.tsx`·`controls.tsx`·`shell.css`·`design-system.tsx`) → `src/legacy/` + `./legacy` 서브패스.
확인된 버그 2건(CardGrid `style` 이 `{...rest}` 앞 `MediaCard.tsx:188`, DrawerHeader 가 children 버림 `Drawer.tsx:86-107`)은 Phase A 에서 고친다.

정렬 목록 우선순위: P0 = 와일드카드 닫기·tsconfig 엄격 1벌·래칫 이식·버그 2건·`lib/tone.ts`+statusRecipe(10파일 + 앱 `tone="info"` 7곳);
P1 = 시간 상수 이동·비cva 7파일→cva·전 `*Variants/*Props` export·forwardRef 13곳·data-* 정책·접기 트리거 4벌→`CollapseToggle`(data-slot 정책과 같은 PR)·
Slottable 헬퍼·아이콘 단일 출처·오버레이 폭/시간 리터럴→토큰·`labels`·크기 드리프트 교정; P2 = 도메인 격리·legacy 서브패스·폴더 재배치·갤러리 자동 수집·문서.

### 2.4 자체 검증 — 여섯 층

| 층 | 증명 | 도구 | CI job |
|---|---|---|---|
| 1 정적 | 타입·패턴·리터럴 금지·JSDoc·포맷 | tsc 엄격 1벌(+`tsconfig.test.json`·`tsconfig.stories.json`, `app-profile` 삭제) · vitest 래칫 · ESLint **10**(jsdoc·better-tailwindcss·react·storybook + 로컬 규칙 10, bulk suppressions/baseline) · stylelint 16 · Prettier 3 | `static` |
| 2 토큰 | 참조 무결성·다크 동일·대비·사다리·생성물 최신·스키마 | vitest(node) + postcss 토큰 모델(`fromCss`/`fromDtcg`) · zod · SD `--check` | `tokens` |
| 3 단위·a11y | 동작 계약·ARIA·공통 계약·컴파운드 계약·스토리 계약·커버리지 | vitest 4 jsdom(`unit` 프로젝트) · RTL · user-event · `composeStories` · axe-core(`color-contrast` 는 4층에 위임) · coverage-v8 | `unit` |
| 4 브라우저·시각 | play·**실측 대비 4.5:1**·라이트/다크 픽셀·캔버스 불변 | `@storybook/addon-vitest`(Chromium, `storybook` 프로젝트) + addon-a11y `test: 'error'`(C) · Playwright × `storybook-static`(도커, git 스냅샷) | `storybook` · `vrt` |
| 5 패키지 | exports·타입 해석·크기·RSC 지시문·매니페스트·소비 가능 | publint `--strict` · attw `--pack . --profile esm-only` · `exports.spec` · size-limit · `rsc-directives.spec` · `manifest.spec` · `scripts/smoke-consumer.sh`(pack → 워크스페이스 밖 Vite+Tailwind 앱 build → CSS 에 `.rounded-md`·JS 에 `Button` grep) | `package` |
| 6 CI | 여섯 job + `pr-title` 을 PR 필수 체크 — ruleset 불가(무료 플랜) — CI 필수 체크 대신 규약(AGENTS.md: 전부 초록일 때만 머지), `release` 는 main push | GitHub Actions | — |

**래칫 스펙**(`src/__arch__/forbidden-patterns.spec.ts`, 제품 앱 선례 이식; 실제 횟수 === 기준선, 늘면 위반·줄면 같은 PR 에서 낮춤;
`generated/`·`__tests__/`·`legacy/` 제외; 기준선은 첫 실행 실측):

| 패턴 id | 판정 | 추정 기준선 |
|---|---|---|
| `tsx-arbitrary-literal` | `\[[^\]]*\d+(\.\d+)?(px\|rem\|ms\|s)\b[^\]]*\]` | 27 |
| `tsx-tailwind-default-scale` | `(duration\|z\|leading\|font\|tracking)-\d+`, `rounded-\[` | duration 12 · z-50 7 |
| `css-px-literal` / `css-hex-literal` / `css-ms-literal` | 주석·정의 블록 제외 | shell.css 143 · theme 18 · toast 4 |
| `js-ms-literal` | `setTimeout/delayDuration/duration=` 숫자 | 4 |
| `forward-ref` | `\bforwardRef\b` | 13 |
| `non-cva-variant-ternary` | `(size\|tone\|variant\|elevation)\s*===\s*"…"\s*\?` | 12 |
| `boolean-string-data-attr` | `data-[a-z-]+=\{[a-zA-Z.]+\}` | 3 |
| `domain-vocabulary` | `parcel\|FSI\|TBV\|verdict\|To be verified\|필지\|법규` | 9 |
| `palette-direct-use` / `legacy-alias-use` / `manual-utility` / `radius-without-corner`(Part 3) | Phase B 이후 | — |

**토큰 스펙**: `ladders.spec`(기존 5 불변식 + animate/ease·h-ctl/w-ctl/w-rail/gap-shell classGroups 가 `@utility` 와 일치 + `initial` 리셋) ·
`references.spec`(모든 `var(--x)` 정의 존재, alias 순환 없음·깊이 ≤3, `@theme inline` 은 `--chrome-*|--canvas-*` 만 참조) ·
`dark-parity.spec`(두 다크 블록 이름·값 `toEqual`, 생성 도입 뒤 삭제) · `contrast.spec`(WCAG 상대 휘도 자체 구현 20줄, 쌍 목록
`ink|ink-2|muted × page|surface|surface-2`, `{tone}-ink/{tone}`, `{tone}/{tone}-soft`, `accent/surface 3.0` …, `KNOWN_FAILURES` 래칫 —
오늘 미달 추산 6쌍: warn/warn-soft ≈3.45, warn/surface ≈3.79, ok/ok-soft ≈4.25, muted/bg ≈4.33, danger/danger-soft ≈4.43, dark #fff/danger ≈3.03) ·
`motion.spec`(`toastExitMs 180 < toastQueueGraceMs 240`, `collapse == duration.slow`) · `schema.spec` + `tokens:check`.

**단위·a11y**: vitest projects `unit`(jsdom)·`arch`(node)·`storybook`(browser, §2.5-e). `describeComponentContract(storiesModule, {slot, axes})` 가
`composeStories` 로 `Default` 를 렌더해 6검사(`data-slot` 존재·못 덮음 / `className` twMerge / `ref` DOM 도달 / rest 전달 / 축마다 `data-*` / axe 0,
`color-contrast` 는 브라우저 층) — Phase C 는 `render-all.spec` 이 `index.ts` export 전부에 적용, Phase D 에 폴더별 spec 으로. CLAUDE.md 계약 보강:
Input 선행 0(user-event "0234"), 0 전체선택(`select` spy), PanelToggleButton 아이콘 단언; 6px 스크롤바·200ms·36px strip·Toast 220/180 은 브라우저 층 computed style.

**시각**: 결정론화(Google Fonts → `.storybook/fonts/` self-host; `usePanelLayout` 은 스토리에서 `storageKey` 없음; 모션 컴포넌트는 `reducedMotion`;
`Pages/Gallery` 에 토큰 스와치 절 `#tokens`). `vrt/playwright.config.ts`: `animations: "disabled"`, `caret: "hide"`, `maxDiffPixels` A 50 → C 0,
`snapshotPathTemplate` 플랫폼 접미 없음, `webServer: npx http-server storybook-static`. `vrt/stories.vrt.spec.ts`: `index.json` 순회 × [light, dark]
+ «다크에서 `--canvas-bg` == rgb(255,255,255)» + CSS-only 계약(6px 스크롤바·36px strip·Toast 220/180·reduced-motion 0ms). 갱신은 `scripts/vrt-update.sh`
(`mcr.microsoft.com/playwright:v1.63.0-noble`) 만 — macOS 폰트 래스터라이즈가 달라 로컬 PNG 는 쓰지 않는다.

**ESLint/stylelint(Phase C)**: typescript-eslint strictTypeChecked · react-hooks · jsx-a11y · import-x(`no-cycle`) · jsdoc + 로컬 플러그인
`ds/no-literal-style-value`(className/cva/cn 문자열 안 `[16px]`·hex·`duration-100`·`z-50`) · `ds/no-magic-ms` · `ds/no-forward-ref` ·
`ds/no-boolean-string-data-attr`. 첫 실행 `eslint . --suppress-all` 로 `eslint-suppressions.json`, CI `--max-warnings 0`. stylelint
`declaration-property-value-allowed-list`(색·반경·글자·transition 은 `var(--…)`)·`disallowed-list`(`\d+px`)·`color-no-hex`·`custom-property-pattern`,
`generated/*.css`·`canvas.css` 예외, shell.css(legacy) warning + `--max-warnings N`.

### 2.5 AI 친화 계약(사용자 «[MASTER]» 문서의 흡수)

원칙 하나: **AI 친화의 실체는 LLM 의 사전 분포(shadcn 어휘·평탄 부품 이름)와 패키지가 일치하고, 어긋나는 부분은 기계가 읽는
문서(d.ts JSDoc · `components.manifest.json` · `llms.txt` · Storybook)와 린트가 즉시 알려 주는 것**이다. 도구 실측(2026-09-29 npm latest):
storybook 10.6.0 · eslint 10.11 · tsdown 0.23 · semantic-release 25 · eslint-plugin-jsdoc 65 · eslint-plugin-better-tailwindcss 4.7 ·
vitest 5.0.2(단 `@storybook/addon-vitest` peer 가 `^3||^4` → **vitest 4 고정**). 저장소 실측: `"use client"` 0곳 · `@default` 0건 ·
`*.stories.*` 0개 · `eslint.config.*` 0개 · 공개 심볼 144개 중 `/**` 23개.

**a. 전달 모델 — 블랙박스/화이트박스.** 패키지에 실리는 것: `dist/**/*.js`(tsdown `unbundle: true`, 모듈 구조 보존) · `dist/**/*.d.ts`(JSDoc 포함, 에이전트
Analyze 1차) · `dist/components.manifest.json`(TS 컴파일러 API 생성기 — «지어낸 prop 차단의 정본») · CSS 4종(Style Dictionary 산출물을 tsdown `copy` 로
원본 그대로) · `llms.txt`(manifest 에서 생성, 사용 규칙 + 컴포넌트/토큰 색인) · `docs/*.md` · `dist/eslint/index.js`(소비자 린트 프리셋 `@jhleeweb/squircle-design-system/eslint`) ·
`agent/AGENTS.block.md` + `agent/skills/squircle-ds/SKILL.md` + bin `sds-agent sync`(소비 레포 AGENTS.md 관리 블록 upsert + 스킬 복사).
화이트박스(소비 레포 기능 디렉터리)는 부품 조립만 하고, «인라인 CSS 덮어쓰기 금지» 는 문서가 아니라 프리셋이 고정한다: `react/forbid-elements`(button
input select textarea dialog table) · `better-tailwindcss/no-unknown-classes`(토큰 밖 클래스 — LLM 의 `text-sm`·`bg-gray-100` 즉시 오류) ·
`no-restricted-classes`(격자·hex·arbitrary) · `no-restricted-syntax`(`style={{color|background|border}}`, 캔버스·3D 디렉터리 제외).

**b. 컴파운드 컴포넌트 — 열 줄 규칙의 9번.** «부품 먼저, 래퍼는 설탕.» 부품은 **평탄 이름**(`SelectTrigger`, `TabsContent`)으로 export 하고
`data-slot="select-trigger"` 로 자기 이름을 DOM 에 남긴다. 편의 래퍼(`SelectField`, `ConfirmDialog`)는 부품만으로 조립된 순수 함수. 정적 속성 컴파운드
(`Select.Trigger`, `Object.assign`)·`"use client"` 파일의 `export *` 금지(Next 서버 컴포넌트에서 `undefined`; 심볼 단위라 트리셰이킹·docgen·manifest 가
잡힌다; 우리 Modal/Drawer/Popover/DropdownMenu 가 이미 이 방식). 사용자 문서 예시의 `SelectError` 는 shadcn 에 없다 → `Field/FieldError` 계열.

| 컴포넌트 | 부품(평탄 이름) | 설탕(옛 flat) |
|---|---|---|
| Select | `Select SelectTrigger SelectValue SelectContent SelectGroup SelectLabel SelectItem SelectSeparator`(Radix Select) | `SelectField<T>` — String() 왕복 내장. 옛 `Select`(controls.tsx, 29회/10파일) → `./legacy` |
| Field | `Field(data-invalid) FieldLabel FieldDescription FieldError FieldGroup` | shell `Field`(46회/5파일) → `./legacy` 의 `HudField` |
| Tabs | `Tabs TabsList TabsTrigger TabsContent`(Radix) | shell `Tabs<T>` → `./legacy` |
| Sidebar | `SidebarProvider Sidebar SidebarHeader/Content/Group/GroupLabel/Menu/MenuItem/MenuButton(isActive,tooltip)/MenuBadge/Footer/Trigger/Rail useSidebar`(shadcn 이름) | `SidebarItem` 유지 |
| Toolbar | `Toolbar(variant=bar|floating) ToolbarButton ToolbarSeparator ToolbarToggleGroup ToolbarToggleItem ToolbarSpacer`(Radix Toolbar, 로빙 포커스) | `ToolbarDivider` → 별칭 @deprecated |
| Breadcrumb | `Breadcrumb BreadcrumbList BreadcrumbItem BreadcrumbLink(asChild) BreadcrumbPage BreadcrumbSeparator BreadcrumbEllipsis` | `BreadcrumbTrail({items})` |
| DescriptionList | `DescriptionList DescriptionItem DescriptionTerm DescriptionDetails(numeric, provisional)` | `DescriptionList({rows})` 한 마이너, shell `KeyValue`(22회) → `./legacy` |
| MediaCard | `MediaCard MediaCardMedia(ratio,width) MediaCardOverlay/Header/Eyebrow/Title/Description/Meta/Actions` | 현 props 한 마이너 |
| Tooltip · AlertDialog | `Tooltip TooltipTrigger TooltipContent(side,shortcut)` · `AlertDialog …Trigger/Content/Header/Title/Description/Footer/Cancel/Action` | `TooltipHint`(8회) · `ConfirmDialog` 유지 |
| Table · Toast | `Table TableHeader/Body/Footer/Row/Head/Cell/Caption` · `Toast ToastTitle/Description/Action/Close/Viewport` | `DataTable({columns})` **유지**(TanStack 관행), `Thead/Tbody/Tr/Th/Td` @deprecated · `useToast().toast()` **유지**(sonner 관행) |

deprecated 경로: 옛 flat API 는 한 마이너 동안 `@deprecated` JSDoc + dev `console.warn` 1회 + `./legacy`, 다음 파괴적 변경(`feat!:`, semantic-release 는 0.x 특례 없이 major → 2.0.0)에서 배럴 제거.
v1.0 부터 배럴의 `Select`·`Tabs`·`Field`·`Tooltip` 은 부품 Root 를 뜻한다. 계약 테스트 `compound.contract.spec.tsx`: 설탕이 렌더한 `data-slot` 집합 ⊆ 부품 조립.

**c. JSDoc 계약 — 열 줄 규칙의 10번.** 공개 심볼은 `/** */`(`/* */` 는 d.ts 에서 사라져 계약이 아니다). optional prop 은 `@default`, 리터럴 유니언은 값마다
한 줄, 컴포넌트는 `@example` 하나. 열거는 `Name.variants.ts` 의 `*Values as const` 런타임 배열 한 곳(Variants 스토리 격자·린트·manifest 의 공통 원천),
설명은 JSDoc 한 곳 — Props 는 `VariantProps` 를 `Omit` 한 뒤 JSDoc 달린 명시 prop 으로 재선언:
```ts
// Button.variants.ts — "use client" 없음(서버에서 호출 가능)
export const buttonVariantValues = ["solid", "outline", "ghost", "link"] as const;
export type ButtonVariant = (typeof buttonVariantValues)[number];
export const buttonVariants = cva(base, { variants: { variant: { solid: "…", outline: "…", ghost: "…", link: "…" } satisfies Record<ButtonVariant, string> }, … });
// Button.tsx
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, Omit<VariantProps<typeof buttonVariants>, "variant" | "tone" | "size"> {
  /** 시각 무게.
   * - `solid` — 채움. 화면에 하나뿐인 주된 동작   - `outline` — 외곽선. 기본값
   * - `ghost` — 상자 없음. 툴바·행 안의 보조 동작  - `link` — 글자만
   * @default "outline" */
  variant?: ButtonVariant;
  /** 진행 중. 스피너가 라벨을 대체하지 않는다 — 폭이 흔들리면 옆 버튼이 밀린다. @default false */
  loading?: boolean | undefined;
}
```
린트(ESLint **10** + jsdoc 65): `jsdoc/require-jsdoc(publicOnly, contexts: export 선언·TSInterfaceDeclaration·TSPropertySignature·TSTypeAliasDeclaration)` ·
`require-description` · `informative-docs` · `check-tag-names(definedTags: default example deprecated since slot)` + 로컬 규칙 **10개**(기존 4 + `aaro/optional-prop-default` ·
`union-prop-values-documented` · `no-static-compound` · `no-export-star-in-client` · `legacy-tone` · `legacy-api`). «implicit any 0» 은 ESLint 가 아니라 tsc strict 의 몫(이미 충족).
매니페스트: `scripts/build-manifest.ts`(`ts.createProgram` + checker, `getJSDocTags`)가 `index.ts` export 를 순회 → `{tokens, components[]{name, kind, importPath, client,
description, example, props[]{name,type,required,default,values[]{value,doc}}, parts, sugar, deprecated}}`. react-docgen-typescript 는 `@default` 처리 미확인·cva/재export
실패 보고라 정본 생성기로 쓰지 않는다(Storybook 컨트롤용으로만). 게이트 `manifest.spec`: export 전수 포함 · optional `default` 비어 있지 않음 · 유니언 `values[].doc` ·
`client` 가 실제 `"use client"` 와 일치 — 초기 `KNOWN_GAPS` 래칫 → Phase D 끝 0. `scripts/build-docs.ts` 가 같은 manifest 에서 `llms.txt`·`docs/*.md` 를 만든다.

**d. 토큰 어휘 — shadcn 표준 이름으로 개명(Q3), 값은 불변(VRT 0px 가 코드모드의 검증).** 근거: 유지(C)는 `--color-*: initial` 때문에 LLM 이 쓴 `bg-background` 가
CSS 없이 **조용히 무시**되고, alias 병행(B)은 `accent`(우리 azure = shadcn `primary`)·`muted`(우리 회색 글자 = shadcn `muted-foreground`)가 이름은 같고 뜻이 반대라
원리상 불가. 비용: UI 유틸 256건/27파일 + `var(--chrome-*)` 69건, 소비처 유틸 57건 + var 138건/17파일 + `tone=` 93건.

| 옛(chrome) | 새 | 옛 | 새 |
|---|---|---|---|
| `chrome`(계획의 `bg-page`, 만들지 않음) | `background` | `ink` / `ink-2` / `disabled` | `foreground` / `foreground-2` / `foreground-disabled` |
| `surface` / `surface-2` / `surface-3` | `card` / `muted` / `secondary` | `muted`(글자) | `muted-foreground` |
| `overlay` | `popover` | `line` / `line-strong` | `border`(+`input`) / `border-strong` |
| `accent`(azure) / `-hover` / `-ink` / `-track` | `primary` / `-hover` / `-foreground` / `-track` | `accent-soft` | `accent`(+`accent-foreground`) |
| `focus` | `ring` | `ok`/`warn`/`danger`(+`-soft`) | `success`/`warning`/`destructive`(+`-soft`, `-foreground`) + 신설 `info` |
| `rounded-chip/control/card/float/modal` | `rounded-sm/md/lg/lg/xl`(6/8/12/12/16 고정, cn.ts radius override 삭제) | `canvas-*` · `text-*` 역할명 · `shadow-*` · `h-ctl*` | **그대로**(llms.txt «shadcn 과 다른 점») |

조어: 면 `<role>`, 글자 `<role>-foreground`, 옅은 면 `<role>-soft`, 사다리 `-2/-3`. tone prop 도 `neutral|primary|success|warning|destructive|info` 로 통일
(한 마이너 `normalizeTone()` shim + `aaro/legacy-tone --fix`; 도메인 판정 매핑은 `rule-row.ts:23`·`judge.ts:15` 두 곳). 마이그레이션은 **한 PR 원자**: `legacy.json` 이
세 출력의 원천 — ① `dist/theme.legacy.css` CSS 변수 별칭(`--chrome-accent: var(--primary)`, 소비처 var 138건 무중단) ② `@theme` 유틸 별칭은 이름이 안 겹치는
것만(`accent`·`muted` 는 코드모드로만) ③ `eslint/legacy-classes.json` → `no-restricted-classes {pattern, fix}` = **린트 자동 수정이 곧 코드모드**(긴 이름 우선).
다크 선택자는 `:root[data-theme="dark"], [data-theme="dark"]` 로 넓혀 서브트리 다크(ThemeContrast 나란히 렌더)를 허용.
간격은 사용자 문서의 8px 격자 대신 **4px 기반 + 허용 스텝 화이트리스트 `0 1 2 3 4 5 6 8 10 12 16 20 24`**(실측 디자인 12·30/36/44·6/12 와 shadcn 자체 `h-9 px-3 gap-1.5` 가
8 의 배수가 아니고, `packages/ui` 에서 12px 가 최다 34건·짝수만 허용 시 위반 51%). 규칙은 간격 계열(`p/m/gap/space/inset`)에만, 반스텝·arbitrary px·raw 색 금지,
초기 위반(반스텝 UI 3·앱 12, arbitrary UI 42·앱 40)은 `.eslint-baseline.json` 래칫, 레이아웃형 arbitrary 는 `@utility w-modal-fluid` 로 흡수. hex 규칙 범위는 크롬
`className`/`style` 만(`theme.css`·`tokens.css`·`apps/**/scene/**`·module1 도면·3D 색 제외).

**e. Storybook 카탈로그(10.6, 정본).** Chromatic 은 계속 배제(무료 5,000장/월은 약 100스토리×라이트/다크에서 20~25빌드 소진, 비공개 무료 미확인). 폴더 규칙은
`Name.tsx · Name.variants.ts · Name.stories.tsx · Name.spec.tsx · index.ts`(`Name.gallery.tsx` 폐기). 배치 `packages/ui/.storybook/{main.ts, preview.tsx, storybook.css,
vitest.setup.ts, fonts/}`, `packages/ui/stories/{gallery/*, Gallery.stories.tsx, Workbench.stories.tsx, decorators/ThemePair.tsx, helpers/Matrix.tsx}`, `packages/ui/vrt/`,
`tsconfig.stories.json`(빌드 tsconfig `exclude` 에 stories·.storybook·vrt — 안 하면 stories 가 d.ts 로 emit 돼 패키지에 실린다).
**3스토리 계약**(export 이름 고정): `Default`(단일 개념, manifest 포함) · `Variants`(`<Matrix>` 가 `*Values` 배열로 전 조합, `tags: ['!manifest']`) · `ThemeContrast`
(`<ThemePair>` 가 같은 args 를 `data-theme="light"/"dark"` 서브트리에 두 번 렌더). 오버레이는 `Open` 스토리(`args.open: true`). 비결정성 제거: `usePanelLayout` 은
`storageKey` 없음, 모션 컴포넌트는 `reducedMotion`, 폰트 self-host(Google Fonts 링크 제거).
```ts
// .storybook/main.ts
framework: "@storybook/react-vite", stories: ["../src/**/*.stories.tsx", "../stories/**/*.stories.tsx"],
addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest", "@storybook/addon-themes"],
viteFinal: cfg => ({ ...cfg, plugins: [...cfg.plugins, react(), tailwindcss()] }), typescript: { reactDocgen: "react-docgen-typescript" }
// preview.tsx: withThemeByDataAttribute({ themes: {light:"light", dark:"dark"}, defaultTheme:"light" })  ← parentSelector html·data-theme 기본값 = theme.css 규약
// parameters.a11y.test: A 'todo' → C 'error';  tags: ["autodocs", "vrt"];  vitest projects: unit(jsdom) + storybook(browser playwright chromium, storybookTest)
```
갤러리 이관: Phase A 에 `apps/ds-gallery/src/main.tsx`(912줄, `<Spec>` 17개)를 `stories/gallery/` 로 통째 옮겨 `Pages/Gallery`(Light/Dark)·`Pages/Workbench` 스토리로 만들고
앱은 삭제(단일 HTML 데모는 `storybook build` zip 으로 갈음). `stories-contract.spec`: 배럴 공개 컴포넌트마다 stories 존재(`STORIES_MISSING` 래칫) · 3 export · `Variants` 가
`*Values` 마다 `[data-<axis>="<v>"]` 렌더. Phase D 에서 Spec 17 → 컴포넌트 stories 31 분할(소비처 많은 순), 0 이면 `Pages/Gallery` 삭제(`Pages/Workbench` 영구).

**f. 검증 갱신.** `describeComponentContract(storiesModule)` 는 `composeStories` 로 `Default` 를 렌더(스토리 = 유일한 픽스처, jsdom 계약·브라우저 play/axe·픽셀 세 층이
같은 입력). addon-vitest 가 Chromium 에서 play + addon-a11y(**대비 4.5:1 실측**, jsdom 으로 불가능했던 것) 실행, 알려진 실패는 스토리 단위 `a11y.config.rules` 로만 허용 +
`KNOWN_A11Y_FAILURES` 래칫. VRT = Playwright 가 `storybook-static/index.json` 을 순회해 `tags` 에 `vrt` 인 스토리를 `iframe.html?id=…&globals=theme:{light|dark}` 로
열어 `toHaveScreenshot`(도커 `mcr.microsoft.com/playwright:v1.63.0-noble`, 플랫폼 접미 없음, git 커밋 약 170~200 PNG, `maxDiffPixels` A 50 → C **0**).
RSC 검사 `rsc-directives.spec`(Phase A 필수): 훅·핸들러·Radix 사용 파일 집합 == `"use client"` 파일 집합(현재 24: 훅·핸들러 17 + Radix 래퍼 7) · `pnpm build` 후 dist 첫 줄
지시문 잔존 · 지시문 파일 `export *` 없음 · `*.variants.js` 지시문 없음. Next 스모크(`npm pack` → 최소 App Router 앱 `next build`)는 비필수 야간 job.

| # | CI job | 명령 | 필수 |
|---|---|---|---|
| 1 | static | tsc(build·test·stories 프로필) · eslint(jsdoc·better-tailwindcss·react·storybook·aaro 10) · stylelint · prettier | 예 |
| 2 | unit | `vitest run --project=unit`(jsdom 계약 + 스토리 계약 + compound.contract) | 예 |
| 3 | tokens | 참조 무결성 · 다크 동일 · WCAG 래칫 · theme.css↔cn.ts 동치 · 생성물 최신 | 예 |
| 4 | storybook | `storybook build --test` → artifact → `vitest run --project=storybook`(play + axe) | 예 |
| 5 | vrt | 도커 컨테이너에서 artifact 로 `playwright test`, 실패 시 diff report | 예(기준선 커밋 뒤) |
| 6 | package | publint · attw · exports.spec · size-limit · rsc-directives · manifest.spec · 소비자 스모크 | 예 |
| — | pr-title | PR 제목 Conventional 검사(= squash 제목 = 버전 입력) | 예 |
| — | release · smoke-next | main push 릴리스 · 야간 Next 스모크 | — / 아니오 |

**g. 배포 갱신.** Next App Router 호환 0 비용 선행(Phase A): tsdown `{ entry: [index, legacy/index, canvas-metrics, eslint/index, agent/cli], format: "esm", unbundle: true,
dts: true, platform: "neutral", copy: [CSS 4종] }` — **`banner` 로 지시문을 붙이지 않는다**(번들 모드는 지시문을 조용히 떼고 banner 는 패키지 전체를 클라이언트로 만든다);
`"use client"` 첫 줄 24파일; cva 를 `Name.variants.ts` 로 분리(`cardVariants` 가 클라이언트 파일에서 export 되어 서버 호출 불가한 첫 사례); `toast.css`·`card-motion.css` 를
`theme.css` 로 합쳐 JS→CSS import 0; 소비자 가이드 `@source "../node_modules/@jhleeweb/squircle-design-system/dist"`. 자동 버전 올림은 Q4(semantic-release 권고 — 이 조직 실측
`allow_auto_merge=false`·Actions PR 생성 꺼짐·2026-06-11 GitHub 변경(봇 PR 의 CI 는 사람 승인 필요) 때문에 changesets Version PR 경로는 승인 대기·즉시 머지 중
하나로 고장난다; 단일 패키지, 최근 커밋 300/300 Conventional, 한글 설명은 파서에 문제없음). 사용자 문서의 `npm publish --registry=https://github.com` 은 오류 →
`https://npm.pkg.github.com`.

**h. 에이전트 실행 루프.** 규칙은 항상 로드되는 AGENTS.md 에, 절차는 스킬에(Vercel 실측: AGENTS.md 100% vs 스킬 53~79%). 패키지 안 AGENTS.md 는 소비 레포가
자동으로 읽지 않으므로 `sds-agent sync` 가 관리 블록을 upsert 한다(Next.js `node_modules/next/dist/docs` 방식). 새 레포 AGENTS.md «디자인 시스템 계약(에이전트)» 절:
토큰 유틸만(shadcn 이름 + 우리 확장, raw 값 금지) · 간격 허용 스텝 · shadcn 과 다른 점(`text-body` 13px 등 역할명, `h-ctl*`, `canvas-*`) · 폴더 규칙 · 부품 먼저 ·
JSDoc 계약 · `*.variants.ts`·`"use client"` · 3스토리 · 검증 명령(`test`·`test:stories`·`vrt`·`build` 후 rsc/manifest spec, 스냅샷 갱신은 `vrt:update` 만) ·
커밋 규약 + `feat!:`/`BREAKING CHANGE:`. 소비 레포 `.claude/skills/squircle-ds/SKILL.md`: **Analyze**(`llms.txt` → `components.manifest.json` 에서 대상 찾기
`jq '.components[]|select(.name=="Select")'`, 없는 부품·prop 은 지어내지 않고 «DS 확장 필요» 로 보고) → **Compose**(부품 조립, 설탕은 부족할 때만, className 은
토큰 유틸만) → **Audit**(`eslint`(프리셋) + `tsc --noEmit` 위반 0, `data-theme="dark"` 에서 canvas-* 불변 확인). 이 저장소는 `CLAUDE.md → @AGENTS.md` 라 블록이 자동 적용.

**i. Phase 삽입 위치.**

| Phase | 추가 | 게이트 |
|---|---|---|
| A | 개명·publishConfig·exports 명시·`files: dist`·tsdown unbundle · `"use client"` 24 + `*.variants.ts` + CSS import 제거 + `rsc-directives.spec` · ESLint 10 부트스트랩(warn + baseline, 로컬 규칙 골격) · 릴리스(Q4)·pr-title·~~ruleset 필수 체크~~(ruleset 불가(무료 플랜) — CI 필수 체크 대신 규약) · Storybook 골격 + vitest projects + `tsconfig.stories.json` · ds-gallery → `Pages/Gallery`·`Workbench` 이식 + 앱 삭제 · `stories-contract.spec`(`STORIES_MISSING` = 전 컴포넌트) · VRT 크롤러 + 워크플로 6 job + 기준선 · `./legacy` 신설 | publint·attw·rsc 통과, VRT 기준선 커밋, `a11y: 'todo'` |
| B | DTCG semantic 을 shadcn 이름으로 + `legacy.json` → 3 출력 · **원자 코드모드 PR**(eslint --fix UI 256+앱 57 · css-vars 69+138 · cn.ts 동치 테스트 · tone shim) · 간격 화이트리스트·hex·arbitrary 규칙 + baseline · 서브트리 다크·폰트 self-host·ThemePair/Matrix | 코드모드 PR 은 VRT **0px** |
| C | `@jhleeweb/squircle-design-system/eslint` 프리셋 배포 + forbid-elements 래칫 + no-unknown-classes · `build-manifest`·`manifest.spec`(KNOWN_GAPS)·`llms.txt`·docs 생성 · `agent/` 블록·스킬 + `sds-agent sync` · `a11y: 'error'` + `KNOWN_A11Y_FAILURES` · VRT `maxDiffPixels: 0` · Next 스모크(비필수) | 린트 error 승격, `--max-warnings=0` |
| D | 부품 1차(Select/Field/Tabs/Tooltip/AlertDialog/Table) + `compound.contract` · 2차(Sidebar/Toolbar/Breadcrumb/DescriptionList/Toast/MediaCard) + 설탕 @deprecated + `aaro/legacy-api` · Spec 17 → stories 31, `__tests__` 16 → 폴더 spec(composeStories), `Pages/Gallery` 삭제 · JSDoc 전수(`@default` 0→전수)·KNOWN_GAPS 0·앱 tone 93건 · (선택) `componentsManifest: true` + addon-mcp | STORIES_MISSING 0 · KNOWN_GAPS 0 · 다음 `feat!:`(= 2.0.0) 로 legacy 제거 |

사용자 문서에서 고쳐 넣은 것: 레지스트리 URL · «ESLint 로 implicit any» → tsc · 8px 격자 → 4px 화이트리스트 · `SelectError` → `FieldError` · shadcn `accent`/`muted` 의 뜻 ·
«1px 즉시 실패» 는 도커 + self-host 폰트가 선행 · test-runner 는 superseded(Vitest addon) · 봇 Version PR 은 이 조직에서 고장 · Radix 유지(shadcn 은 2026-07 부터 Base UI 기본 —
LLM 분포 이동 시 부품 구조 차이 가능, llms.txt 에 명시) · `@default` 는 optional prop 에만 · hex 0건은 크롬 범위만 · stories 가 d.ts 로 새지 않게 exclude 선행.

### 2.6 도입 순서(§2.5-i 의 추가 항목이 각 Phase 에 합쳐진다)

| Phase | 작업 | 완료 조건 |
|---|---|---|
| **A** 이식 직후 | A1 CI 뼈대(`static`·`unit`·`package`) + 루트 `verify` · A2 tsconfig 엄격 1벌 + test 프로필, 주석 현행화 · A3 `"./*"` 닫기 + `exports.spec` + publint/attw · A4 래칫 스펙 이식 + vitest projects + `tokens-snapshot`·`ladders`·`references`·`dark-parity` · A5 버그 2건 | CI 초록, attw 와일드카드 오류 0, 래칫 기준선 실측 확정 |
| **B** 토큰 정본화 | B1 `tokens/motion.ts`+`motion.spec` · B2 DTCG JSON + SD + 포맷 3 + `generated/` 미연결(해석 맵 == 스냅샷) · B3 연결(스냅샷·dark-parity 삭제, 앱 4개 빌드·갤러리 확인) · B4 새 토큰({tone}-ink/-line, rust/moss/amber, layer, duration, size, overlay, font-weight/tracking initial, corner) + `legacy.json` + `legacy-alias-use` 래칫 · B5 `lib/tone.ts`+statusRecipe, 리터럴→유틸리티, 앱 `tone="info"` 7곳 | `tokens:check` CI, `@theme inline` 리터럴 0·정적 `var(` 0, 죽은 원시 0, `tsx-arbitrary-literal`·`js-ms-literal` 0, 다크 1벌 |
| **C** 시각·대비·a11y·린트 | C1 스토리 결정론화(폰트 self-host·storageKey·reducedMotion) + `#tokens` + VRT `maxDiffPixels 0` + `vrt` 필수 · C2 `contrast.spec`+`KNOWN_FAILURES`, `tokens` job, addon-a11y `test: 'error'` + `KNOWN_A11Y_FAILURES` · C3 user-event·jest-dom·axe·coverage, `render-all`·`describeComponentContract(stories)`, 문턱 실측 · C4 ESLint error 승격/stylelint/Prettier(포맷 전용 PR) + `@jhleeweb/squircle-design-system/eslint` 프리셋 배포 · C5 크기 드리프트 브라우저 확인 뒤 교정 · C6 manifest·llms.txt·docs 생성 + `agent/` 블록·스킬 + `sds-agent sync` | 여섯 job + pr-title 전부 필수, `KNOWN_FAILURES`·`KNOWN_A11Y_FAILURES` 감소 시작, 스토리 스냅샷 라이트·다크 커밋, 캔버스 불변 통과, 소비 레포 린트 프리셋 적용 |
| **D** 컴포넌트 정렬 | P1·P2 항목을 컴포넌트 단위 PR(의존 역순 Spinner → Button → Choice/Input → Badge/Alert/Toast → Card(CollapseToggle) → DropdownMenu → 나머지), 만지는 김에 폴더 재배치·spec/gallery 병치; legacy/도메인 격리는 앱 PR 과 짝 | `forward-ref`·`non-cva`·`boolean-string`·`domain` 기준선 0, 전 `*Variants/*Props` export, 무테스트 0, 로컬 ESLint 규칙 4개 error |

---

## Part 3 — 모서리: Apple 식 연속 곡률(스쿼클)

### 3.1 실태와 판정 근거(공식 출처, 2026-09-29)

- **구현 수단은 CSS `corner-shape` 하나다**(CSS Borders 4 ED §3.7-3.9). `squircle` = `superellipse(2)` = 초타원 지수 n=4(스펙 K 는 log2 n).
  통설 «Apple = n≈5(K≈2.32)» 는 Figma 가 «순수 초타원이 아니다» 로 반박했고 실제 iOS 곡선은 베지어 기반(Figma 스무딩 60%≈iOS)이라
  **정확한 대응값은 없다** → 스펙 키워드를 기준값으로 두고 카탈로그에서 눈으로 맞춘다. 테두리·box-shadow·outline·overflow clip·배경·
  backdrop-filter·히트테스트가 전부 모양을 따른다(§3.9.4).
- **지원**: Chrome/Edge 139+ 정식(2025-08). Safari 27.0 정식(2026-09-17) **미지원**(STP 251+ 만), Firefox 정식 **미지원**(Nightly pref).
  미지원 엔진은 속성을 무시해 `border-radius` 원호로 떨어지고 레이아웃은 불변. apple.com·Vercel Geist·shadcn·Radix Themes 도 아직 안 쓴다.
- **폴백은 «원호 강등» 뿐**: clip-path/mask 는 CSS Masking 스펙상 영역 밖 테두리·outline·그림자를 지워 `shadow-card/modal`·그림자 안
  `0 0 0 1px` 헤어라인·`focus-ring`(WCAG 2.4.7) 이 소실되고, `filter: drop-shadow` 는 `position: fixed` 컨테이닝 블록을 바꿔 Modal 이
  깨지며, Houdini 는 폴백이 필요한 바로 그 엔진(Safari·Firefox)에서 안 돈다. 원호와 K=2 의 대각선 차이는 0.134R(card 1.6px·modal 2.1px).
- **체감 반경**: 같은 반경이면 스쿼클이 작아 보인다(대각 깊이 원호 0.293R vs K=2 0.159R). 대각선 중점 일치 보정은 n=4 에서 ×1.84.
  보정은 `@supports` 안에서만 적용해야 미지원 엔진의 반경이 커지지 않는다.
- **이 저장소 실태**: `packages/ui` 의 `rounded-*` 43건 + 평문 CSS `border-radius` 10건(원시값 `999px`·`50%` 3건), Radix dist 에 radius 0건,
  앱 하드코딩(india 12 · parking-studio 5 · module1 4 · ds-gallery `rounded-[7px]` 1 · floorplan 다수), 저장소 전체에 `corner-shape` 0건,
  tailwindcss 4.3.3 에 `corner-*` 유틸 없음(PR #19298 미머지). 캐스케이드 함정: `tokens.css:89-96` 의 레이어 없는 `button{border-radius:0}` 이
  레이어 안 규칙을 이기므로 새 규칙도 레이어 밖에 둔다.

### 3.2 곡선 정의 — 토큰 하나, 사다리 이름 불변

«radius 는 역할이 정하고, 곡률은 시스템이 정한다.» **모든 모서리 = 크롬의 radius>0 모서리**. 캔버스(`--radius-none: 0`)는 스펙상 곡률 효과가
없어(§3.7) 방향 C 가 구조로 보장되고, 원형·pill(`--radius-full`·`50%`)은 초타원이면 캡슐 끝이 눌리므로 `round` 고정.

신규 `packages/ui/src/corner.css`(곡률의 유일한 집, `theme.css` 가 `@import`, `exports` 에 `./corner.css` 명시, `@layer` 로 감싸지 않음):
```css
:root { --corner-k: 1; --corner-shape: round; }
@supports (corner-shape: squircle) {
  :root { --corner-shape: squircle; --corner-k: 1.5; }                    /* Q5 — 1.5 로 시작, 카탈로그에서 1.84·n=5 와 비교 */
  :root[data-corner="round"] { --corner-shape: round; --corner-k: 1; }    /* 킬 스위치: 데모 직전 전량 원호 복귀 · 성능 A/B */
  *, ::before, ::after { corner-shape: var(--corner-shape); }             /* 반경 0 엔 효과 없음 → 캔버스 불변 */
  .rounded-full, .ds-scroll-area-thumb, .switch-track, .switch-knob,
  [data-corner="round"], [data-corner="round"] * { corner-shape: round; } /* 원형은 원호 */
}
```
`theme.css` 사다리는 이름·체감값 그대로, 계수만 곱한다(chip·full 제외 — 6px 에서 차이는 서브픽셀이고 9–11px 은 20px 배지를 알약으로 만든다):
`--radius-control: calc(8px * var(--corner-k, 1))`, card/float `12px`, modal `16px`; `--radius-chip: 6px`, `--radius-full: 9999px`.
(Q3 개명 뒤 이름은 `--radius-sm/md/lg/xl` = 6/8/12/16 — 이 절은 개명 전 이름으로 적었고 규칙은 동일하다.)
`cn.ts`·`tokens.spec`·43곳 클래스·앱의 `var(--radius-*)` 는 무변경. 동심원은 `calc(바깥 토큰 − 패딩)` 만 허용 임의값(계수를 따라가 양쪽 엔진에서 유지).
`corner` 단축 속성은 쓰지 않는다(미지원 엔진이 통째로 무시해 radius 까지 사라짐). DTCG 도입 뒤에는 `layer.json` 의 `corner.shape`·`corner.k` 토큰이 이 파일을 생성한다.

### 3.3 함께 따라야 하는 것 · 컴포넌트 변경

| 대상 | 스펙 | 할 일 |
|---|---|---|
| 1px border · `border-l-3` 띠(Alert·Toast) | 추종 | 없음. 두꺼운 왼쪽 띠는 STP 253 이 고치던 케이스 → 스냅샷 |
| `shadow-card/pop/modal` + 그림자 안 헤어라인 | 추종 | 없음. border 와 이중선 아닌지 스냅샷 |
| `focus-ring`(outline 2px offset 1px, 12곳)·별도 outline 2곳 | 추종(정확 렌더는 구현 정의) | Chromium 포커스 스냅샷 승인. 어긋나면 box-shadow 링 플랜 B |
| `overflow: hidden` 클립(Modal·Drawer·DropdownMenu·CardWell·Progress·`.panel`) · `backdrop-filter`(Toolbar) | 추종 | 없음, 스냅샷 |
| MediaCard 선택 링 `::after` 사각(`MediaCard.tsx:147-150`) | — | `after:rounded-card` / flat `after:rounded-[calc(var(--radius-card)-1px)]` |
| `.ds-card-strip`(`card-motion.css:22-31`) radius 없음 | — | `border-radius: inherit` |
| SegmentedControl `rounded-[6px]`(`:79`) · shell 탭 `chip`(`:284`) · DropdownMenu 항목 `control`(float 12−패딩 8) | 동심원 | `calc(var(--radius-control) - 2px)` · `calc(var(--radius-float) - 8px)`(카탈로그에서 확정) |
| Radix Arrow SVG · 네이티브 range `.ds-slider` | 해당 없음/UA | «알려진 비순응» 문서화 |

앱·패키지(이 저장소, 래칫이 관리): ds-gallery `rounded-[7px]`→`rounded-control`; india `RuleList.tsx:19 rounded-[4px]`→`rounded-chip`,
`app.css` 3–5px ×9 → `var(--radius-chip)`, `flow.css:17 50%` → `--radius-full` + `corner-shape: round`, 뷰어 위 2px(`district-plan.css:3`·
`viewer-ds.css:125`)는 요소별 «캔버스(0)/크롬(chip)» 판정; parking-studio 2–4px → chip, `.swatch`(범례) → 0; module1 `site-input.css` 4건 → control/chip;
floorplan `style.css` 50% ×4·`viewer.css:12` 는 **원형만** `corner-shape: round`(전역 규칙에 즉시 걸린다), 나머지 px 는 별도 이슈; regulation-generator·SVG `rx` 는 범위 밖.

### 3.4 폴백 정책

지원 엔진(Chromium 139+)은 스쿼클 + 보정 반경, 미지원(Safari 27 정식·Firefox 정식)은 체감 반경의 원호. **원호 강등은 결함이 아니라 허용된 폴백**이라고
`theme.css` 머리·`index.ts`·`design-system-patterns.md` «곡률» 절에 적는다. 카드·모달 한정 런타임 폴백도 넣지 않는다(3.1 근거).
Apple 기기 사용자에게 원호로 보이는 것은 진행형 향상의 본질적 한계 → 데모 브라우저 결정(Q5)이 이 작업의 데모 가치를 정한다.

### 3.5 검증

1. **정적 불변식** `__tests__/corner.spec.ts`(node, postcss devDep 명시): 전역 규칙이 `@supports` 안·`@layer` 밖·`*` 선택자 / `--corner-k` 는
   `@supports` 밖에서 `1` / `corner-shape` 는 corner.css 밖에서 `round` 만 / 원형 radius 규칙의 selector 가 round 예외 목록에 있음 /
   control·card·float·modal 이 `calc(Npx * var(--corner-k, 1))` 형식·chip 6px·full 9999px / `border-radius` 원시값 래칫(theme 1·shell 2) /
   TSX `rounded-[…]` 는 `calc(var(--radius-` 로 시작하는 것만. 의도적 위반 3종으로 빨개지는지 1회 확인.
2. **CSSOM 스윕**(Playwright, 카탈로그 `?sheet=corners` 또는 Corners 스토리): `body *` 중 radius>0 요소가 원형이면 `round`, 아니면 `squircle` 인지;
   기대값은 페이지 안 `CSS.supports("corner-shape","squircle")` 에서 파생(Safari 출시 날 저절로 뒤집힘). card 견본 반경 = 12×K, 킬 스위치 시 12.
   주의: Playwright WebKit 은 trunk 라 Safari 정식판을 대신하지 못한다.
3. **엔진별 스냅샷**(chromium·webkit·firefox, DPR 2, 엔진 접미 골든): 사다리 5단 견본·Button `:focus-visible`·Card raised·Toolbar backdrop·
   MediaCard 선택·Modal·Alert·Toast. Chromium 이 «정답»(포커스 링 추종·헤어라인 단선 육안 승인 1회), 나머지는 «현재 상태 기록».
4. **픽셀 프로파일**(순수 함수 + vitest): 견본 좌상단 48×48 device px 커버리지에 원과 초타원(n=4)을 반경 자유 변수로 적합해
   `MAE_super < 0.5·MAE_circle` 이면 스쿼클(대각선 샘플만으론 못 가른다 — 접선 근처가 갈린다). chip 은 CSSOM 스윕만.
5. **소비자 래칫**: `packages/ui/src/testing/corner-audit.ts`(`raw-radius`·`circular-without-round`·`corner-shape-outside-ui`·`arbitrary-rounded`)
   + 앱별 `__arch__/corner-radius.spec.ts` 기준선(india `app.css 9·flow.css 1·RuleList 1·district-plan 1·viewer-ds 1`, parking-studio 5, module1 4, module5 0).
6. **성능·수동**: india `.panel` 스크롤 60프레임 CDP 트레이싱 `data-corner` 유·무 A/B(p95 ≤16.7ms, round 대비 +20% 이내; 초과 시 `.panel` 만 round 예외);
   이 Mac 의 Safari 정식판 스크린샷을 `docs/architecture/corner-support-<date>.png` 로(유일한 정식판 증거); 데모 노트북 Chrome ≥139; 킬 스위치 리허설.

### 3.6 도입 순서(새 레포 Phase B 말~C, 소비자는 DS 갱신 PR 에 짝지어)

| 단계 | 내용 | 완료 조건 |
|---|---|---|
| 1 | `corner.css` 신설, 사다리 calc 화 + import + 머리 주석, `exports`, `index.ts` 한 줄 | 기존 tokens·cn·overlay·select·scroll-area 스펙 통과 |
| 2 | 3.3 DS 표(SegmentedControl·shell 탭·DropdownMenu·MediaCard·card-motion) | test·typecheck |
| 3 | 정적 불변식 스펙 | 7검사 통과, 위반 3종 빨강 |
| 4 | 카탈로그 Corners 시트(사다리별 96×96 견본·원·동심원·실컴포넌트·사다리 표(토큰·체감·계산값)·`CSS.supports` 배지) | K·계수·chip·DropdownMenu 동심원을 눈으로 확정 |
| 5 | Playwright 3엔진 CSSOM 스윕·프로파일·스냅샷(`test:visual` 을 `test` 와 분리) | Chromium 승인 → 초록 |
| 6 | 소비자 래칫(corner-audit + 앱별 스펙) + floorplan 원형 4건 round | `pnpm test:all` 기준선 일치 |
| 7 | 앱 하드코딩 이전(3.3 앱 표), 기준선 감소 | typecheck·build |
| 8 | 성능 A/B·Safari 수동 증거·`design-system-patterns.md` «곡률» 절 | 수치·스크린샷 커밋 |

---

## 이 저장소에서 바뀌는 파일

| 패턴 | 대표 경로 | PR |
|---|---|---|
| 신규 `.npmrc` | 루트 | PR-1 |
| manifest 5개 `workspace:*` → `npm:@jhleeweb/squircle-design-system@0.1.0` | `apps/india-residential-configurator/package.json` 외 module5·parking-studio·ds-gallery·`packages/module1` | PR-1 |
| `src/ds.css` 4곳 `@source` | `apps/india-residential-configurator/src/ds.css:25`(module5·parking-studio `:25`, ds-gallery `:9`) | PR-1 교체 → PR-2 제거 |
| `pnpm-lock.yaml` | 루트 | PR-1·PR-2 |
| `packages/ui/package.json` «동결» | | PR-1 |
| 조건부 Vite `optimizeDeps`/Vitest `server.deps.inline` | `apps/*/vite.config.ts`, `packages/module1/vitest.config.ts` | PR-1(실측 시) |
| 삭제 | `packages/ui/`, `apps/ds-gallery/`, `package.json:26`, `.claude/launch.json:39-43` | PR-2 |
| 문서 | `CLAUDE.md`, `AGENTS.md`, `README.md` §14, `docs/architecture/design-system-patterns.md`(스텁), `react-app-structure.md:193,292`, `VISUALIZATION-AI-HANDOFF.md:140,167`, `apps/module5/src/tokens.css:9` | PR-2 |
| module1 peer 화 · arch 스펙(지정자 일치·overrides 부재) | `packages/module1/package.json`, `apps/india-residential-configurator/src/__arch__/` | PR-2 |
| `server.fs.allow` + `DS_LINK` | `apps/{india-residential-configurator,module5,parking-studio}/vite.config.ts` | Phase 4 |
| 갱신 자동화 | `.github/dependabot.yml` 또는 `.github/workflows/bump-ui.yml` | Phase 4 |
| Part 2·3 의 앱 쪽 코드모드 | shadcn 어휘 개명(유틸 57 + `var(--chrome-*)` 138 + `tone=` 93, 린트 `--fix`) · `[&_svg]:size-4` 15곳 · 레거시 import 32파일(`Select`·`Field`·`Tabs`·`KeyValue` → `@buildos/ui/legacy`) · 우회 `rounded-*`/`border-radius` | DS 버전 갱신 PR 에 짝지어 |
| 소비자 린트 프리셋 · 에이전트 배선 | 루트 `eslint.config.js`(신설, `import ui from "@buildos/ui/eslint"`; module5·parking-studio 의 `forbid-elements` 는 ignores 로 시작) · `AGENTS.md` 관리 블록(`sds-agent sync` 가 upsert) · `.claude/skills/squircle-ds/SKILL.md` · `src/ds.css` 의 `@source` 를 `dist` 로 | Phase C |
| 무변경 | 소스 `.ts/.tsx` 65파일(PR-1), `turbo.json`, `tsconfig*`, `vercel.json`, `packages/typescript-config` | — |

---

## 검증 — 끝에서 끝까지

1. **DS 레포 CI**: `pnpm verify && pnpm build` — 15스펙 104 `it`(tokens.spec 방향 C·cn 사다리 포함) → 표준화 뒤 여섯 job + pr-title 초록.
   pack 계약: tarball 에 `dist/index.js`·`dist/index.d.ts`·`dist/canvas-metrics.*`·CSS 6개, `__tests__` 없음. publint `--strict`·attw 오류 0.
2. **레지스트리**: `gh api /user/packages/npm/squircle-design-system` → `visibility: private`, `repository: jhleeWEB/squircle-design-system`;
   `npm view @jhleeweb/squircle-design-system --registry https://npm.pkg.github.com` 로 버전·exports.
3. **이 저장소 clean clone**:
   ```bash
   env -i HOME=$HOME PATH=$PATH NODE_AUTH_TOKEN=$NODE_AUTH_TOKEN sh -c 'cd $(mktemp -d) && git clone --depth 1 -b build/consume-aaro-lab-ui git@github.com:aaro-lab/apartment-configurator.git . && pnpm install --frozen-lockfile && pnpm --filter india-residential-configurator build'
   unset NODE_AUTH_TOKEN; pnpm install --frozen-lockfile; echo "exit=$?"   # env 치환 오류로 실패해야 한다(기대 동작)
   ```
4. **별칭·lockfile**: `node_modules/@buildos/ui` realpath 가 `.pnpm/@jhleeweb+squircle-design-system@0.1.0…`, `pnpm why @jhleeweb/squircle-design-system` 한 버전,
   `grep -c 'link:../../packages/ui' pnpm-lock.yaml` = 0, `grep -c 'npm:@jhleeweb/squircle-design-system@0.1.0'` = 5.
5. **typecheck/test/build**: `pnpm build:types && pnpm typecheck:all && pnpm test:all && pnpm build`. `tsc --traceResolution` 에서
   `@buildos/ui` → `.pnpm/…/dist/index.d.ts`. india 스펙(`vi.mock` 3)·`worker-imports.spec`·`reachability.spec`·module1 UI 스펙 통과.
6. **Tailwind**: `grep -c 'rounded-control' apps/india-residential-configurator/dist/index.html` > 0, `--radius-control`·`--text-title`·
   `--size-gap`·`--shadow-chip` 존재(세 앱 반복). 0 이면 `@source`/자기 등록 문제.
7. **dev 서버**: `pnpm dev`(5179) 콘솔에 «Module externalized»·«React is not defined»·CSS 404 없음, Button/Card/Modal/Toast/ScrollArea
   스타일 렌더, `node_modules/.vite/deps/@buildos_ui.js` 로 사전 번들 경로 실측. parking-studio·module5 도 1회. DS `pnpm storybook`(6006) 의 `Pages/Workbench` 가 원 갤러리와 동일.
8. **React 단일 인스턴스**: react 청크 하나, ToastProvider/TooltipProvider 컨텍스트 오류 없음.
9. **Vercel**: `NODE_AUTH_TOKEN` 설정 후 프리뷰 로그에서 `@jhleeweb/squircle-design-system` 수신(blocked 와 분리 판단).
10. **되돌리기 리허설**: PR-1 머지 후 별도 브랜치 `git revert <squash>` → 토큰 없이 `pnpm install` → `pnpm typecheck && pnpm test` 통과.
11. **릴리스 사이클**: patch changeset → Version PR → 머지 → publish → 태그 `@jhleeweb/squircle-design-system@0.1.1` → 이 저장소 갱신 PR diff 가 manifest 5 + lockfile 뿐.
12. **개발 루프**: override link + `DS_LINK=… pnpm dev` 에서 DS 저장 → HMR, 해제 후 `git diff package.json pnpm-lock.yaml` 빈 것.
13. **PR-2 후**: 문서 grep 0건, `turbo run build:types --dry-run` 에 ui 없음.
14. **표준화(Part 2)**: Phase 마다 `pnpm verify && pnpm build && publint` 초록, 래칫 기준선 합계 ≤ 직전, public-api 스냅샷 diff 가 의도한 것뿐,
    스토리 시각 스냅샷 라이트·다크·캔버스 불변.
16. **AI 친화(§2.5)**: `rsc-directives.spec`(24파일 지시문·dist 잔존·`export *` 없음) · `manifest.spec`(export 전수·`@default`·값별 doc·`client` 일치, KNOWN_GAPS 0) ·
    `stories-contract.spec`(STORIES_MISSING 0, 3 export) · `compound.contract.spec` · addon-a11y `error` 에서 스토리 전부 통과(KNOWN_A11Y_FAILURES 0) · shadcn 개명 PR 의 VRT 0px ·
    소비 레포에서 `pnpm eslint`(프리셋) 위반 0 · `sds-agent sync` 뒤 `AGENTS.md` 블록·`.claude/skills/squircle-ds` 존재 · 에이전트 스모크: 이 저장소에서 «Select 로 필드 하나 추가» 를
    Claude Code 에 시켜 manifest 에 없는 prop 을 쓰지 않고 린트 0 으로 끝나는지 1회 확인 · Next 야간 스모크 녹색(비필수).
15. **모서리(Part 3)**: `corner.spec` 7검사 통과 · Chromium 에서 CSSOM 스윕 빈 배열, card 견본 12×K px, 킬 스위치 시 12 · 5단 견본 프로파일 판정이
    `CSS.supports` 와 일치 · Chromium 스냅샷 육안 승인(포커스 링 추종·헤어라인 단선) · Safari 정식판 스크린샷이 «미지원 — 원호 폴백» 이고 반경이
    체감값(8/12/16) · 스크롤 성능 p95 ≤16.7ms · 소비자 래칫 기준선 일치.

---

## 위험과 되돌리기

| 위험 | 완화 | 되돌리기 |
|---|---|---|
| 스코프 불일치로 `@buildos/ui` 발행 불가 | `@jhleeweb/squircle-design-system` + 별칭 | — |
| Tailwind 조용한 실패(민짜 렌더) | theme.css 자기 등록 + PR-1 중복 `@source` + 산출물 grep(검증 6) | ds.css 한 줄 |
| tarball 에 dist 누락 → TS7016 전량 | `files` dist, `prepack`, CI pack 계약·publint·attw | patch 재발행 |
| 빌드 산출물이 CSS side-effect import·상대 `@import` 를 깨뜨림 | tsdown `copy`/`unbundle` 실측, 실패 시 tsc emit + cp 로 대체, 소비자 스모크가 잡음 | 소스 배포(Q3 대안)로 전환 |
| React 이중 인스턴스 | react/react-dom peer + 정확 버전 + module1 peer(PR-2) + arch 스펙 | manifest 통일 |
| `NODE_AUTH_TOKEN` 없는 체크아웃에서 install 즉시 실패 | 의도된 fail-fast, CLAUDE.md 「빌드·검증」 첫 줄 | — |
| classic PAT 개인 계정 종속(만료·퇴사) | 발급자·만료일 기록, 소비 레포 늘면 머신 유저 | 토큰 교체 |
| GITHUB_TOKEN Version PR 에 CI 미트리거 | 필수 체크 미적용; 필요 시 PAT/App 토큰 | — |
| 이 저장소(다른 소유자) Actions 403 | 개인 계정 패키지는 같은 소유자 레포에만 Actions 접근을 줄 수 있다 → classic PAT secret `GH_PACKAGES_TOKEN` | — |
| 개인 계정 소유 레포·패키지 | 협업자 초대가 곧 패키지 권한(레포 권한 상속). 조직 코드가 개인 레포로 가는 소유권 문제는 사용자 결정. 조직으로 옮기면 스코프 개명(`@jhleeweb`→`@aaro-lab`)이 필요하므로 별칭 지정자 5 + `.npmrc` 2줄만 바뀌게 설계 | 이관 시 manifest 5 + `.npmrc` |
| 개발 루프 2단화(25커밋 중 18건이 앱과 원자적) | Phase 4 link 루프, DS PR changeset 필수 | — |
| `pnpm.overrides` link 커밋 유출 | arch 스펙 + PR 체크리스트 | override 삭제 |
| 검증 창 동안 죽은 `packages/ui` 수정 | «동결» 표기, 창 2주 | — |
| 표준화가 소비자 공개 API 를 깨뜨림(tone·size 어휘, 문구, legacy 경로) | 한 버전 `@deprecated` 별칭 + 앱 코드모드 PR 짝지음 + `public-api.spec` | 별칭 유지 기간 연장 |
| 래칫 기준선을 늘리는 PR 이 리뷰를 통과 | «줄었는데 안 낮췄다» 실패 + PR 템플릿 체크리스트 | — |
| 크기 드리프트를 현재 값으로 박제 | C5 에서 브라우저·시각 스냅샷 확인 뒤 기본값 확정 | — |
| **전체 되돌리기** | PR-1 은 squash revert 1건(packages/ui 잔존). PR-2 이후는 revert 2건 또는 `git checkout <PR-2 이전> -- packages/ui apps/ds-gallery` | |

---

## 참고

- GitHub Packages npm(스코프=소유자·`repository` 일치·256MB) https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry ·
  권한(classic PAT 만) https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages ·
  접근 제어 https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility ·
  과금(Team 2GB/10GB) https://docs.github.com/en/billing/concepts/product-billing/github-packages
- Vercel 비공개 의존성 https://vercel.com/guides/using-private-dependencies-with-vercel · Tailwind v4 `@source` https://tailwindcss.com/docs/detecting-classes-in-source-files ·
  pnpm overrides/link/alias https://pnpm.io/package_json#pnpmoverrides https://pnpm.io/aliases · Vitest `server.deps.inline` · Vite dep pre-bundling ·
  changesets https://github.com/changesets/action · git filter-repo https://github.com/newren/git-filter-repo
- DTCG https://tr.designtokens.org/format/ · Style Dictionary https://styledictionary.com/ · Tailwind `@theme`/`@utility` · tailwind-merge `extendTailwindMerge` · cva · Radix ·
  ESLint 10 suppressions https://eslint.org/docs/latest/use/suppressions · eslint-plugin-jsdoc · eslint-plugin-better-tailwindcss(no-unknown-classes·no-restricted-classes) ·
  Storybook 10.6(react-vite·addon-vitest·addon-a11y·addon-themes·AI best practices) https://storybook.js.org/docs · semantic-release https://semantic-release.gitbook.io/ ·
  llms.txt https://llmstxt.org/ · Vercel «AGENTS.md outperforms skills» · Next.js server/client boundary(정적 속성 컴파운드 undefined) · GitHub 2026-06-11 봇 PR 워크플로 승인 변경 ·
  stylelint 16 · Prettier + tailwind 플러그인 · Vitest 4 projects/browser ·
  Testing Library user-event · axe-core · Playwright snapshots/Docker · publint https://publint.dev/ · attw · size-limit · tsdown https://tsdown.dev/ ·
  WCAG 2.2 contrast · React 19 ref-as-prop
- 조직 선례: `aaro-lab/platform`(`.npmrc`, `release.yml`, `_checks.yml`, `.github/actions/setup`, `.changeset/config.json`) · `aaro-lab/aaro-harness` `policy/scripts/apply-ruleset.mjs` ·
  `aaro-lab/aaro-design-system`(HTML 명세) · `aaro-lab/buildos-configurator`(stage) `packages/ui`(별개 포크)
- 이 저장소: #4(이식 탄생) · #177(루트 `packages/`) · #1198/#1199(DS 수립, 방향 C) · #1202/#1203 · #1243/#1244 · #1245/#1246(`design-system-patterns.md`) ·
  #1266 · #1306 · #1315/#1316 · #1323/#1324 · `CLAUDE.md` 「공유 패키지 — Vite는 소스, tsc는 선언」 · `README.md` §14 · 메모리 `vercel-check-always-blocked.md`
