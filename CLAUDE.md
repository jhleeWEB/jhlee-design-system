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
  src/tokens.css             base 토큰(회색조·판정색·셸 치수·글꼴) + 원칙을 강제하는 요소 규칙
  src/theme.css              방향 C — --canvas-*(라이트 고정·radius 0·무채색) / --chrome-*(듀얼 테마), Tailwind v4 @theme 매핑,
                             @source "./" 자기 등록, 컴포넌트 CSS(@import)
  src/{primitives,overlay,feedback,navigation,data}/   DS 컴포넌트(Tailwind 유틸 + cva + Radix)
  src/{shell,controls,design-system}.tsx               레거시 3열 작업대 셸·컨트롤(향후 ./legacy 서브패스로 격리)
  src/__tests__/             vitest + jsdom 동작·계약 테스트(15 스펙 104 it)
  tsdown.config.ts           unbundle ESM + d.ts + CSS 복사. banner 로 "use client" 를 붙이지 않는다 — 파일 첫 줄에 직접 둔다
packages/typescript-config/  tsconfig 프리셋(@buildos/typescript-config, 발행 안 함)
apps/ds-gallery/             작업대 — 컴포넌트 전부를 세워 두고 캔버스/크롬 경계와 다크를 눈으로 확인(포트 5186). Storybook 으로 이관 예정
docs/architecture/design-system-patterns.md   React 합성·접근성 계약(원 저장소 #1246)
docs/plan/                   분리·표준화 계획(2026-09-29). 단계별 진행은 이 레포 이슈로 관리한다
```

## 핵심 원칙

- **캔버스인가 크롬인가.** 새 컴포넌트를 만들 때 묻는 질문은 언제나 이것 하나다. 도면 요소·치수선·범례 스와치는 캔버스(흰 바탕 고정·radius 0·무채색·다크 없음),
  그 밖은 전부 크롬(듀얼 테마·작은 radius·부유 레이어에만 그림자).
- **유채색은 판정에만**(base 원칙 2) — 액센트 azure `#0869e1` 은 «지금 고른 것·주된 동작», 판정색은 «통과했는가». 상태는 항상 텍스트와 병기한다.
- **수치는 mono + tabular-nums**(원칙 3).
- **토큰 밖 값을 쓰지 않는다.** 색·간격·반경·글자·시간은 theme.css 의 사다리(`rounded-control`, `text-body`, `shadow-pop`, `h-ctl` …)만. 리터럴(hex·px·ms)이 필요하면 토큰을 더한다.
- **모든 크롬 모서리는 연속 곡률(스쿼클)을 향한다.** CSS `corner-shape` 진행형 향상 — 미지원 엔진(2026-09: Safari 정식·Firefox 정식)은 원호로 떨어지며 그것이 허용된 폴백이다. 원형·pill 은 원호 유지. (도입은 docs/plan Part 3.)
- **클라이언트 경계.** 훅·핸들러·컨텍스트·Radix 를 쓰는 파일은 첫 줄에 `"use client"`. 배럴(index.ts)·cn·canvas-metrics·순수 표시 컴포넌트에는 없다.
- **JS 에서 CSS 를 import 하지 않는다.** 컴포넌트 CSS 는 theme.css 가 `@import` 한다.

## 소비자 계약

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
pnpm gallery           # 작업대 (5186)
pnpm typecheck         # 엄격 프로필 + app 프로필
pnpm test              # vitest (jsdom)
pnpm build             # tsdown → packages/ui/dist
pnpm verify            # typecheck + test + build — PR 전 한 번
cd packages/ui && pnpm exec publint --strict && pnpm exec attw --pack . --profile esm-only   # 패키지 계약
```

**발행**은 `main` 머지 시 자동이다(AGENTS.md «릴리스»). 로컬에서 발행하려면 `~/.npmrc` 에
`//npm.pkg.github.com/:_authToken=<classic PAT: read:packages + write:packages>` 를 두고
`pnpm --filter @jhleeweb/squircle-design-system publish --no-git-checks`.

## 공유 패키지 — 워크스페이스는 소스, 소비자는 dist

`packages/ui/package.json` 의 `exports` 는 `src/*.ts` 를 가리키고(갤러리·Storybook 이 HMR 로 소스를 본다),
`publishConfig.exports` 가 `dist/*` 를 가리킨다 — pnpm 이 발행 시 바꿔 끼운다. `"./*"` 와일드카드는 없다: 서브패스는 명시된 것뿐이다.
