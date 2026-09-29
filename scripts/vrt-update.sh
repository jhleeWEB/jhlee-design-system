#!/usr/bin/env sh
# VRT 기준선 갱신 — CI 의 vrt job 과 **같은 이미지**에서만 만든다. macOS 의 Chromium 은 폰트 래스터라이즈가 달라
# 로컬 PNG 를 커밋하면 CI 가 곧바로 빨개진다. 실행: `pnpm --filter @jhleeweb/squircle-design-system vrt:update`.
#
# 호스트 node_modules 는 건드리지 않는다(macOS 바이너리라 컨테이너에서 pnpm install 을 돌리면 호스트가 망가진다).
# 저장소를 컨테이너 안 /work 로 복사해 거기서 설치·빌드·촬영하고, 결과 PNG 만 vrt/__snapshots__ 로 되돌려 쓴다.
set -eu
ROOT=$(cd "$(dirname "$0")/.." && pwd)
IMAGE=mcr.microsoft.com/playwright:v1.63.0-noble
OUT="$ROOT/packages/ui/vrt/__snapshots__"
mkdir -p "$OUT"

docker run --rm --ipc=host \
  -v "$ROOT":/src:ro \
  -v "$OUT":/out \
  -e CI=1 \
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
    pnpm exec playwright test -c vrt/playwright.config.ts --update-snapshots
    rm -rf /out/*
    cp -R vrt/__snapshots__/. /out/
  '
echo "기준선 갱신 완료: $OUT"
