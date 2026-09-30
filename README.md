# Squircle Design System

`@jhleeweb/squircle-design-system` — 도면 캔버스와 UI 크롬을 가른 토큰, Radix 기반 오버레이·피드백 층, 3열 작업대 셸과 컨트롤.
GitHub Packages(npm.pkg.github.com)에 **비공개**로 발행한다. `aaro-lab/apartment-configurator` 의 `packages/ui` 를 2026-09-29 에 이력째 분리했다.

## 쓰기

```
# .npmrc (소비 레포)
@jhleeweb:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

```bash
NODE_AUTH_TOKEN=<classic PAT read:packages> pnpm add @jhleeweb/squircle-design-system
```

```css
/* 앱 진입 CSS */
@import "tailwindcss/theme.css" layer(theme);
@import "@jhleeweb/squircle-design-system/theme.css";
@import "tailwindcss/utilities.css" source(none);
@source "./";
```

```tsx
import { Button, Card, ToastProvider } from "@jhleeweb/squircle-design-system";
```

토큰 값·이름·컴포넌트 계약은 [`CLAUDE.md`](CLAUDE.md) 「도메인 지침」과 [`docs/architecture/design-system-patterns.md`](docs/architecture/design-system-patterns.md).

## AGENTS

에이전트가 이 패키지를 지어내지 않고 쓰게 하는 산출물이 패키지에 실린다 — `llms.txt`(색인) · `dist/components.manifest.json`(기계 판독 정본) ·
`docs/components/*.md` · 린트 프리셋 `@jhleeweb/squircle-design-system/eslint` · bin `sds-agent`. 소비 레포 루트에서 `npx sds-agent sync` 를 한 번 돌리면
`AGENTS.md` 에 «디자인 시스템 계약(에이전트)» 관리 블록이 들어가고 `.claude/skills/squircle-ds/`(Analyze → Compose → Audit)가 생긴다(멱등, 갱신 때마다 다시).
자세한 것은 [`packages/ui/README.md`](packages/ui/README.md) «AGENTS».

## 개발

```bash
pnpm install && pnpm storybook   # 카탈로그 http://localhost:6006 (Pages/Workbench 가 제품 화면 복제, Pages/Gallery 가 컴포넌트 명세)
pnpm verify                      # typecheck + lint + tokens:check + manifest:check + test + build
pnpm --filter @jhleeweb/squircle-design-system test:stories   # 스토리를 Chromium 에서 play + axe
pnpm --filter @jhleeweb/squircle-design-system vrt            # 시각 회귀(storybook:build 뒤). 기준선 갱신은 vrt:update(도커)만
```

## 발행

`main` 머지 → `release.yml` 이 semantic-release 로 버전·태그·Release·publish. PR 제목의 type 이 버전을 정한다(`fix` patch · `feat` minor · `feat!:` major).
접근 권한은 이 레포의 권한을 상속한다 — 패키지를 읽어야 하는 사람은 collaborator 로 초대한다. 다른 소유자의 레포 CI 는 GITHUB_TOKEN 이 아니라
classic PAT(`read:packages`)로 읽는다.

## 관련

- 원 저장소 `aaro-lab/apartment-configurator` — 이식 이전 이력의 `#N` 은 그 저장소 번호. `aaro-lab/buildos-configurator` 의 `packages/ui` 는 별개 포크.
- 분리·표준화 계획: [`docs/plan/2026-09-29-separation-and-standardization.md`](docs/plan/2026-09-29-separation-and-standardization.md)
