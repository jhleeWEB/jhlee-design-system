# AGENTS.md — squircle-design-system

이 저장소에서 일하는 **모든 에이전트와 사람이 따르는 작업 규약의 정본**이다. Codex 는 이 파일을 직접 읽고,
Claude Code 는 `CLAUDE.md` 의 `@AGENTS.md` import 로 같은 내용을 싣는다 — 규약은 여기서만 고친다.
출처는 `aaro-lab/apartment-configurator` 의 AGENTS.md 이고, 라이브러리 레포에 맞게 아래 «예외» 만 다르다.

## 작업 절차

1. **계획부터.** 코드를 건드리기 전에 무엇을·왜·어디를 바꿀지 정리한다.
2. **이슈 등록.** 그 계획을 한글 이슈로 올린다(`gh issue create`). 계획 없이 들어온 작업도 예외 없이 이슈를 먼저 만든다.
3. **브랜치.** `main` 에서 `<type>/<slug>` 를 딴다. 도구 이름(`codex/…`·`claude/…`)을 브랜치에 붙이지 않는다.
4. **작업 + 커밋.** 커밋 본문에 `#이슈번호`.
5. **PR.** `gh pr create --base main --title "type(scope): 한글 설명" --body "... Closes #N"`. **PR 제목이 곧 squash 커밋 제목이고 곧 버전 입력이다**(아래 «릴리스»).
6. **머지.** `gh pr merge --squash --delete-branch`.

## 브랜치 — 라이브러리 레포 예외

```
main            기본 브랜치이자 유일한 장기 브랜치. 모든 PR 의 base. 머지 = 릴리스 후보
<type>/<slug>   단기 작업 브랜치
```

원 저장소의 `develop`/`main` 이중 구조를 쓰지 않는다 — 라이브러리는 발행된 버전이 곧 승격이라 승격 단계가 하는 일이 없다.
`main` 은 ruleset 으로 보호하려 했으나 **무료 개인 플랜의 비공개 레포에서는 ruleset(브랜치 보호)을 쓸 수 없다** — 브랜치 보호는 규약뿐이다.
`main` 에 직접 push 하지 않는다. PR 은 CI 가 전부 초록일 때만 squash 로 머지한다.

## 릴리스

`main` 에 push 될 때마다 GitHub Actions 의 `release.yml` 이 **semantic-release** 로 버전·태그(`vX.Y.Z`)·GitHub Release·
`npm.pkg.github.com` 발행을 자동으로 한다. 버전은 squash 커밋 제목(= PR 제목)의 type 이 정한다.

| 제목 | 버전 |
|---|---|
| `fix: …` `perf: …` `refactor: …`(release 규칙상 patch 대상 type) | patch |
| `feat: …` | minor |
| `feat!: …` 또는 본문에 `BREAKING CHANGE: …` | major(0.x 에서는 minor 가 올라간다) |
| `docs` `chore` `ci` `test` `build` `style` | 발행 없음 |

한국어 설명만으로는 major 가 오르지 않는다 — 파괴적 변경은 반드시 `!` 또는 `BREAKING CHANGE:` 를 적는다.
잘못 올린 버전은 삭제하지 않고 patch 를 하나 더 올린다. 가시성은 private 유지(public 은 되돌릴 수 없다).

## 커밋 메시지

Conventional Commits — **영문 type + 한글 설명**. `type(scope): 한글 설명`, 평서형 현재("~한다"), 마침표 없음.
허용 type: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`. "추가"는 `add` 가 아니라 `feat`.

## 언어

- 문서·주석·커밋·이슈·PR 본문 = **한국어**. 커밋 type·브랜치 이름 = 영어. 화면 문자열(라벨·버튼·`aria-label`) = **영어**.
- 주석은 "무엇"이 아니라 **"왜"** 를 적는다 — 값이 측정에서 나왔거나 앞선 시도가 실패해서 지금 형태가 된 경우.

## 도구별 주의

- `gh` 가 실패해도 단계를 건너뛰지 않는다. 이슈 없는 커밋과 PR 없는 머지는 규약 위반이지 대안이 아니다.
- 이력의 `#N` 은 2026-09-29 이식 이전 커밋에서는 **`aaro-lab/apartment-configurator` 의 번호**다.
