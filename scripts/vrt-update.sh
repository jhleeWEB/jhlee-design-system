#!/usr/bin/env sh
# VRT 기준선 갱신 — CI 의 vrt job 과 **같은 이미지**에서만 만든다. macOS 의 Chromium 은 폰트 래스터라이즈가 달라
# 로컬 PNG 를 커밋하면 CI 가 곧바로 빨개진다. 실행: `pnpm --filter @jhleeweb/jhlee-design-system vrt:update`.
#
# `VRT_CHECK=1` 이면 갱신하지 않고 **검사만** 한다 — 같은 컨테이너에서 `--update-snapshots` 없이 돌려 현재 기준선과의 diff 를 종료 코드로 낸다
# (시각이 바뀌면 안 되는 PR 이 머지 전에 0 diff 를 확인하는 길, C1). 실패 리포트는 vrt/report 로 되돌려 쓴다.
#
# 호스트 node_modules 는 건드리지 않는다(macOS 바이너리라 컨테이너에서 pnpm install 을 돌리면 호스트가 망가진다).
# 저장소를 컨테이너 안 /work 로 복사해 거기서 설치·빌드·촬영하고, 결과 PNG 만 vrt/__snapshots__ 로 되돌려 쓴다.
set -eu
ROOT=$(cd "$(dirname "$0")/.." && pwd)
IMAGE=mcr.microsoft.com/playwright:v1.63.0-noble
OUT="$ROOT/packages/ui/vrt/__snapshots__"
REPORT="$ROOT/packages/ui/vrt/report"
MODE=${VRT_CHECK:+check}
mkdir -p "$OUT" "$REPORT"

docker run --rm --ipc=host \
  -v "$ROOT":/src:ro \
  -v "$OUT":/out \
  -v "$REPORT":/report \
  -e CI=1 \
  -e MODE="$MODE" \
  "$IMAGE" bash -c '
    set -eu
    mkdir -p /work && cd /src
    tar --exclude=node_modules --exclude=.git --exclude=storybook-static --exclude=dist \
        --exclude=packages/ui/vrt/results --exclude=packages/ui/vrt/report -cf - . | tar -xf - -C /work
    cd /work
    corepack enable && corepack prepare "$(node -p "require(\"./package.json\").packageManager")" --activate
    pnpm install --frozen-lockfile
    cd packages/ui
    pnpm storybook:build
    if [ "$MODE" = check ]; then
      pnpm exec playwright test -c vrt/playwright.config.ts || { rm -rf /report/*; cp -R vrt/report/. /report/ 2>/dev/null || true; exit 1; }
      exit 0
    fi
    # =all — 맨 --update-snapshots 는 «changed» 라 비교에 실패한 것만 다시 쓴다. 비교가 픽셀마다 YIQ threshold 0.2 였을 때 토큰 색을
    # 한두 단 옮긴 변화(#55 의 muted-foreground #697183 → #636b7c)는 실패가 아니어서 기준선에 남지 않았다(지금 threshold 는 0, #70).
    # 픽셀이 같으면 PNG 도 같아 diff 는 없다.
    # --retries=2 — 갱신은 344장을 한 번에 쓰거나(cp) 아무것도 안 쓴다(set -e). 부하에서 무관한 스토리 하나가 타임아웃으로 한 번 넘어지면
    # 전체가 쓰기 없이 멈췄다(#70 · 4번). 재시도는 일시적 타임아웃만 살린다 — 세 번 다 실패하는 진짜 실패(예외 · 캔버스 흰색 단언)는
    # 여전히 0 이 아닌 종료 코드로 멈춘다. 검사 모드(위)는 재시도하지 않는다: 재시도로 통과한 흔들림은 «flaky» 로 0 종료가 되어 숨는다.
    pnpm exec playwright test -c vrt/playwright.config.ts --update-snapshots=all --retries=2
    rm -rf /out/*
    cp -R vrt/__snapshots__/. /out/
  '
if [ "$MODE" = check ]; then echo "VRT 검사 통과(0 diff): $OUT"; else echo "기준선 갱신 완료: $OUT"; fi
