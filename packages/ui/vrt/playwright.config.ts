import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));

/* 시각 회귀(계획 §2.4 «시각», §2.5-f). `storybook build --test` 산출물(`storybook-static`)을 정적으로 띄우고
 * `stories.vrt.spec.ts` 가 index.json 을 순회한다.
 *  - 기준선 PNG 는 리눅스 Chromium 한 벌만 커밋한다. macOS 는 폰트 래스터라이즈가 달라 로컬 PNG 를 기준선으로 쓰지 않는다 —
 *    갱신은 `scripts/vrt-update.sh`(도커 `mcr.microsoft.com/playwright:v1.63.0-noble`, CI 의 vrt job 과 같은 이미지)만.
 *  - snapshotPathTemplate 에 플랫폼 접미를 두지 않는 이유가 그것이다: 한 벌이 곧 기준선이다.
 *  - maxDiffPixels 0(C1, 계획 §2.5-f) — Phase A 의 50 은 self-host 폰트·reducedMotion 이 자리잡기 전의 여유였다. 같은 이미지에서 같은 입력은
 *    같은 픽셀이어야 한다: 도커 컨테이너에서 전 스냅샷 0 diff 를 확인하고 내렸다(2026-09-30). 흔들리는 스토리는 여유로 덮지 않고 원인을 고친다.
 *  - threshold 는 기본 0.2 다(#70 · #75 실측). 0 으로 내리면 도커 안에서는 결정론이 된다(아래 두 수정으로 344장 × 3회 0 실패) — 그러나
 *    기준선을 만드는 개발 기기(Apple Silicon → arm64 컨테이너)와 CI(x86_64)는 Skia 의 그림자 블러 · 안티에일리어싱이 달라 CI 에서 75장이
 *    수천~수만 px 로 실패했고, Rosetta 의 amd64 에뮬레이션도 CI 와 SIMD 경로가 달라 320장이 실패했다. 로컬에서 CI 와 같은 픽셀을 만들 길이
 *    없으므로 전체는 0.2 로 아키텍처 차이를 흡수하고, **토큰 색 감지는 단색 견본 스토리(Foundations/Colors · Swatches)만 threshold 0** 으로
 *    맡긴다(stories.vrt.spec 의 STRICT) — 정수 좌표의 단색 면은 아키텍처와 무관하게 같은 픽셀이다.
 *  - 그래도 흔들림의 원인은 고쳐 둔다: Chromium 의 부분 래스터(무효화된 사각형만 다시 그리고 나머지 타일은 앞 프레임 것을 남겨 테마 전이 중간의
 *    모서리 픽셀이 남는다)는 `--disable-partial-raster` 로, 테마 전이는 spec 의 «CSS 전이 끄기» 로 — 흔들리던 스토리 12개 × 테마 × 10회에서
 *    실패 36/240 → 0/240(threshold 0 · 도커 기준).
 *  - timeout · expect.timeout — 부하에서 toHaveScreenshot 의 «연속 두 장이 같을 때까지» 대기가 기본 5초를 넘어 무관한 스토리가 넘어졌다(#70 · 4번).
 *
 * 모서리 전용 프로젝트(#26 의 corners.spec · DPR 2 · 3엔진 골든)는 스쿼클 폐기(#36)와 함께 지웠다 — 반경은 일반 스토리 스냅샷이 본다. */
const STORIES = /stories\.vrt\.spec\.ts$/;

export default defineConfig({
  testDir: ".",
  testMatch: /.*\.vrt\.spec\.ts/,
  outputDir: "./results",
  snapshotPathTemplate: "{testDir}/__snapshots__/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 60_000,
  /* exactOptionalPropertyTypes — undefined 를 넣을 수 없어 CI 에서만 키를 만든다. */
  ...(process.env.CI ? { workers: 2 } : {}),
  reporter: process.env.CI ? [["list"], ["html", { open: "never", outputFolder: "./report" }]] : [["list"]],
  expect: {
    timeout: 15_000,
    toHaveScreenshot: { animations: "disabled", caret: "hide", maxDiffPixels: 0, scale: "css" },
  },
  use: {
    ...devices["Desktop Chrome"],
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    colorScheme: "light",
    /* 시스템 폰트 폴백이 끼어들지 않게 — 스토리는 self-host 폰트만 쓴다(preview.tsx). */
    locale: "en-US",
    timezoneId: "UTC",
    baseURL: "http://127.0.0.1:6007",
    trace: "retain-on-failure",
    /* 부분 래스터를 끈다 — 위 머리 주석의 «흔들림의 원인». STRICT 스냅샷(threshold 0)이 이것에 기댄다. */
    launchOptions: { args: ["--disable-partial-raster"] },
  },
  webServer: {
    /* `pnpm exec` 는 cwd 를 패키지 루트로 되돌린다(실측) — 상대 경로를 vrt/ 기준으로 적으면 빈 디렉터리를 서빙해 404 가 난다. */
    cwd: resolve(here, ".."),
    command: "pnpm exec http-server storybook-static -p 6007 -s -c-1",
    url: "http://127.0.0.1:6007/index.json",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [{ name: "chromium", testMatch: STORIES }],
});
