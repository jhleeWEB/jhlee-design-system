# jhlee design system

`@jhleeweb/jhlee-design-system` — 도면 캔버스와 UI 크롬을 가른 토큰, Radix 기반 컨트롤 · 오버레이 · 피드백 · 내비게이션 · 데이터 층.
3.0.0 에서 3열 작업대 셸(`./legacy`)과 옛 이름 alias 를 지웠다 — 이행은 [`packages/ui/README.md`](packages/ui/README.md) «2.x → 3.0».
4.0.0 에서 이름을 `squircle-design-system`(패키지 `@jhleeweb/squircle-design-system`)에서 바꿨다(#91) — 이행은 [`packages/ui/README.md`](packages/ui/README.md) «3.x → 4.0».
GitHub Packages(npm.pkg.github.com)에 **공개(public) 패키지**로 발행하고, 저장소(소스)도 공개다(2026-10-02, #94 · #96). `aaro-lab/apartment-configurator` 의 `packages/ui` 를 2026-09-29 에 이력째 분리했다.

## 쓰기

```
# .npmrc (소비 레포)
@jhleeweb:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

```bash
NODE_AUTH_TOKEN=$(gh auth token) pnpm add @jhleeweb/jhlee-design-system
```

공개 패키지지만 **토큰은 여전히 필요하다** — GitHub Packages 의 npm 레지스트리는 공개 패키지도 익명 설치를 받지 않는다(익명 요청 401 · `read:packages` 토큰 200, 2026-10-02 실측).
GitHub 계정이 있는 누구나 자기 토큰(classic PAT `read:packages`, 또는 `gh auth token`)으로 설치한다 — 초대는 필요 없다. 배포 빌드(Vercel · Docker …)는 `NODE_AUTH_TOKEN` 을 빌드 환경 변수로 준다.

```css
/* 앱 진입 CSS */
@import "tailwindcss/theme.css" layer(theme);
@import "@jhleeweb/jhlee-design-system/theme.css";
@import "tailwindcss/utilities.css" source(none);
@source "./";
```

이 네 줄이 컴포넌트의 여백 · 패딩 · 간격(`px-3` · `gap-3` · `m-0` …)과 토큰(`--spacing: 4px` …)을 앱 CSS 로 만든다 — `theme.css` 의 `@source "./"` 가 패키지 dist 를 훑으므로
소비자가 따로 `@source` 를 적지 않아도 DS 컴포넌트가 쓰는 유틸이 모두 생긴다(Next 스모크 빌드 실측, #94). Tailwind v4 없이 쓰면 컴포넌트는 스타일 없이 그려진다.

```tsx
import { Button, Card, ToastProvider } from "@jhleeweb/jhlee-design-system";
```

토큰 값·이름·컴포넌트 계약은 [`CLAUDE.md`](CLAUDE.md) 「도메인 지침」과 [`docs/architecture/design-system-patterns.md`](docs/architecture/design-system-patterns.md).

## AGENTS

에이전트가 이 패키지를 지어내지 않고 쓰게 하는 산출물이 패키지에 실린다 — `llms.txt`(색인) · `dist/components.manifest.json`(기계 판독 정본) ·
`docs/components/*.md` · 린트 프리셋 `@jhleeweb/jhlee-design-system/eslint` · bin `jds-agent`. 소비 레포 루트에서 `npx jds-agent sync` 를 한 번 돌리면
`AGENTS.md` 에 «디자인 시스템 계약(에이전트)» 관리 블록이 들어가고 `.claude/skills/jhlee-ds/`(Analyze → Compose → Audit)가 생긴다(멱등, 갱신 때마다 다시).
자세한 것은 [`packages/ui/README.md`](packages/ui/README.md) «AGENTS».

## 개발

```bash
pnpm install && pnpm storybook   # 카탈로그 http://localhost:6006 (Pages/Workbench 가 제품 화면 복제, 컴포넌트마다 Default · Variants · ThemeContrast)
pnpm verify                      # typecheck + lint + tokens:check + manifest:check + test + build
pnpm --filter @jhleeweb/jhlee-design-system test:stories   # 스토리를 Chromium 에서 play + axe
pnpm --filter @jhleeweb/jhlee-design-system vrt            # 시각 회귀(storybook:build 뒤). 기준선 갱신은 vrt:update(도커)만
```

## 발행

`main` 머지 → `release.yml` 이 semantic-release 로 버전·태그·Release·publish. PR 제목의 type 이 버전을 정한다(`fix` patch · `feat` minor · `feat!:` major).
패키지 가시성은 **public** 이다(2026-10-02 사용자 결정, #94 — 공개 패키지는 다시 비공개로 돌릴 수 없다). 읽기는 GitHub 계정이 있는 누구나 토큰으로 하고,
**발행은 이 레포의 쓰기 권한(release.yml 의 GITHUB_TOKEN)만** 한다. 다른 레포의 Actions 는 자기 GITHUB_TOKEN(`permissions: packages: read`)으로 공개 패키지를
읽을 수 있다(GitHub 문서 기준, 실측 전) — 안 되면 classic PAT(`read:packages`) 시크릿을 쓴다. 저장소도 공개라 이슈는 GitHub 계정이 있는 누구나 연다(아래 «컴포넌트 요청»).

## 컴포넌트 요청

필요한 컴포넌트 · 부품 · 변형이 없으면 소비 레포에서 따로 짓기 전에 [컴포넌트 요청 양식](https://github.com/jhleeWEB/jhlee-design-system/issues/new?template=component-request.yml)으로
이슈를 연다(라벨 `component-request`). **원하는 모양의 이미지(스크린샷 · 시안 · 손그림)를 첨부해 주세요** — 양식의 «참고 이미지» 칸에 끌어다 놓으면 올라간다.
소비 레포의 에이전트도 같은 길을 간다 — `npx jds-agent sync` 가 심는 계약 블록과 `jhlee-ds` 스킬이 «지어내지 말고, 사용자 동의를 받아 이 양식으로 요청한다» 를 싣는다(#96).

## 관련

- 원 저장소 `aaro-lab/apartment-configurator` — 이식 이전 이력의 `#N` 은 그 저장소 번호. `aaro-lab/buildos-configurator` 의 `packages/ui` 는 별개 포크.
- 분리·표준화 계획: [`docs/plan/2026-09-29-separation-and-standardization.md`](docs/plan/2026-09-29-separation-and-standardization.md)
