# AGENTS.md — jhlee-design-system

이 저장소에서 일하는 **모든 에이전트와 사람이 따르는 작업 규약의 정본**이다. Codex 는 이 파일을 직접 읽고,
Claude Code 는 `CLAUDE.md` 의 `@AGENTS.md` import 로 같은 내용을 싣는다 — 규약은 여기서만 고친다.
출처는 `aaro-lab/apartment-configurator` 의 AGENTS.md 이고, 라이브러리 레포에 맞게 아래 «예외» 만 다르다.

## 작업 절차

1. **계획부터.** 코드를 건드리기 전에 무엇을·왜·어디를 바꿀지 정리한다.
2. **이슈 등록.** 그 계획을 한글 이슈로 올린다(`gh issue create`). 계획 없이 들어온 작업도 예외 없이 이슈를 먼저 만든다.
3. **브랜치.** `main` 에서 `<type>/<slug>` 를 딴다. 도구 이름(`codex/…`·`claude/…`)을 브랜치에 붙이지 않는다.
4. **작업 + 커밋.** 커밋 본문에 `#이슈번호`.
5. **PR.** `gh pr create --base main --title "type(scope): 한글 설명" --body "... Closes #N"`. **PR 제목이 곧 squash 커밋 제목이고 곧 버전 입력이다**(아래 «릴리스»).
6. **머지 — 사용자 승인 뒤에만.** CI 가 초록이면 멈추고 «승인 대기» 로 보고한다. 사용자가 GitHub 에서 «Bypass rules» 로 머지하거나,
   채팅으로 **그 PR 의** 머지를 명시하면 `gh pr merge <N> --squash --admin --delete-branch`(아래 «브랜치»). 그냥 `gh pr merge` 는 «review required» 로 실패한다 — 정상이다.

## 브랜치 — 라이브러리 레포 예외

```
main            기본 브랜치이자 유일한 장기 브랜치. 모든 PR 의 base. 머지 = 릴리스 후보
<type>/<slug>   단기 작업 브랜치
```

원 저장소의 `develop`/`main` 이중 구조를 쓰지 않는다 — 라이브러리는 발행된 버전이 곧 승격이라 승격 단계가 하는 일이 없다.
`main` 은 ruleset 둘로 보호한다(2026-10-02 사용자 결정 «내가 승인해야 머지되도록», #98 — 저장소가 public 이 되어 무료 플랜에서도 쓸 수 있다).

| ruleset | 규칙 | 우회 |
|---|---|---|
| `main — PR · CI 필수(우회 없음)` | 직접 push 금지(PR 필수) · squash 만 · 필수 체크 7개(package · pr-title · static · storybook · tokens · unit · vrt) · 강제 push · 삭제 금지 | 없음 — 사용자도 CI 가 빨간 PR 은 못 넣는다 |
| `main — 승인 1(소유자만 우회)` | 승인 리뷰 1 | 저장소 admin(사용자)만, PR 머지에서만 |

GitHub 는 자기 PR 을 승인하지 못하게 하고 에이전트의 PR 도 사용자 계정으로 열린다 — 그래서 «승인» 은 사용자가 GitHub 의 «Bypass rules» 로 머지하거나
채팅으로 그 PR 의 머지를 명시하는 것이다. 에이전트는 명시가 있을 때만 `--admin` 을 쓴다(«끝나면 머지해줘» 같은 앞선 포괄 지시는 이 규칙 전의 것이다).
`main` 에 직접 push 하지 않는다(ruleset 이 막는다). PR 은 CI 가 전부 초록이고 사용자가 승인했을 때만 squash 로 머지한다.

## 릴리스

`main` 에 push 될 때마다 GitHub Actions 의 `release.yml` 이 **semantic-release** 로 버전·태그(`vX.Y.Z`)·GitHub Release·
`npm.pkg.github.com` 발행을 자동으로 한다. 버전은 squash 커밋 제목(= PR 제목)의 type 이 정한다.

| 제목 | 버전 |
|---|---|
| `fix: …` `perf: …` `refactor: …`(release 규칙상 patch 대상 type) | patch |
| `feat: …` | minor |
| `feat!: …` 또는 본문에 `BREAKING CHANGE: …` | **major** — 0.x 예외 없음(실측: `feat(tokens)!:` 한 건이 0.2.0 → 1.0.0 을 냈다, #25) |
| `docs` `chore` `ci` `test` `build` `style` | 발행 없음 |

한국어 설명만으로는 major 가 오르지 않는다 — 파괴적 변경은 반드시 `!` 또는 `BREAKING CHANGE:` 를 적는다.
반대로 `!` 는 언제나 major 다 — 스쿼클 폐기(#37)가 2.0.0 을, 새 부품 Select·Field·Tabs(#47)와 legacy 셸·옛 이름 alias·`normalizeTone`·루트 배럴 legacy 별칭 제거(D8 #49)를 한 PR 로 묶은 것이 **3.0.0** 을, 패키지 · 저장소 개명(`squircle-design-system` → `jhlee-design-system`, #91)이 **4.0.0** 을 냈다. 다음 파괴적 변경은 5.0.0 이다. 소비 레포는 정확 버전을 고정하므로 major 가 잦아도 깨지지 않는다.
잘못 올린 버전은 삭제하지 않고 patch 를 하나 더 올린다. 패키지 가시성은 **public** 이다(2026-10-02 사용자 결정, #94 — 공개 패키지는 다시 비공개가 되지 않는다).
저장소(소스)도 같은 날 public 이 됐다(#96). 공개여도 GitHub Packages 의 npm 레지스트리는 설치에 토큰(`read:packages`)을 요구한다.

## 커밋 메시지

Conventional Commits — **영문 type + 한글 설명**. `type(scope): 한글 설명`, 평서형 현재("~한다"), 마침표 없음.
허용 type: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`. "추가"는 `add` 가 아니라 `feat`.

## 언어

- 문서·주석·커밋·이슈·PR 본문 = **한국어**. 커밋 type·브랜치 이름 = 영어. 화면 문자열(라벨·버튼·`aria-label`) = **영어**.
- 주석은 "무엇"이 아니라 **"왜"** 를 적는다 — 값이 측정에서 나왔거나 앞선 시도가 실패해서 지금 형태가 된 경우.

## 도구별 주의

- `gh` 가 실패해도 단계를 건너뛰지 않는다. 이슈 없는 커밋과 PR 없는 머지는 규약 위반이지 대안이 아니다.
- 이력의 `#N` 은 2026-09-29 이식 이전 커밋에서는 **`aaro-lab/apartment-configurator` 의 번호**다.
