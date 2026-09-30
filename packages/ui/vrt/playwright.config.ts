import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, devices, type Project } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));

/* 시각 회귀(계획 §2.4 «시각», §2.5-f). `storybook build --test` 산출물(`storybook-static`)을 정적으로 띄우고
 * `stories.vrt.spec.ts` 가 index.json 을 순회한다.
 *  - 기준선 PNG 는 리눅스 Chromium 한 벌만 커밋한다. macOS 는 폰트 래스터라이즈가 달라 로컬 PNG 를 기준선으로 쓰지 않는다 —
 *    갱신은 `scripts/vrt-update.sh`(도커 `mcr.microsoft.com/playwright:v1.63.0-noble`, CI 의 vrt job 과 같은 이미지)만.
 *  - snapshotPathTemplate 에 플랫폼 접미를 두지 않는 이유가 그것이다: 한 벌이 곧 기준선이다.
 *  - maxDiffPixels 50 은 Phase A 값. self-host 폰트·reducedMotion 이 자리잡는 Phase C 에 0 으로 내린다.
 *
 * 모서리(#26, `corners.spec.ts`)는 프로젝트가 따로다 — DPR 2 로 견본 픽셀을 읽고(프로파일), 3엔진 스냅샷은 `{projectName}-{platform}` 접미의
 * 별도 골든이다. CI 는 chromium 만 돈다(`VRT_ENGINES` 없음). 로컬 macOS 절차: `pnpm exec playwright install webkit firefox` 뒤
 * `VRT_ENGINES=1 pnpm vrt --project corners-chromium --project corners-webkit --project corners-firefox`(darwin 골든은 «현재 상태 기록» 이다 —
 * Playwright WebKit 은 trunk 라 Safari 정식판을 대신하지 못한다). */
const STORIES = /stories\.vrt\.spec\.ts$/;
const CORNERS = /corners\.spec\.ts$/;
const CORNER_SNAPSHOTS = "{testDir}/__snapshots__/corners/{arg}-{projectName}-{platform}{ext}";
const cornerProject = (name: string, device: (typeof devices)[string]): Project => ({
  name,
  testMatch: CORNERS,
  use: { ...device, deviceScaleFactor: 2 },
  snapshotPathTemplate: CORNER_SNAPSHOTS,
});

export default defineConfig({
  testDir: ".",
  testMatch: [/.*\.vrt\.spec\.ts/, CORNERS],
  outputDir: "./results",
  snapshotPathTemplate: "{testDir}/__snapshots__/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  /* exactOptionalPropertyTypes — undefined 를 넣을 수 없어 CI 에서만 키를 만든다. */
  ...(process.env.CI ? { workers: 2 } : {}),
  reporter: process.env.CI ? [["list"], ["html", { open: "never", outputFolder: "./report" }]] : [["list"]],
  expect: {
    toHaveScreenshot: { animations: "disabled", caret: "hide", maxDiffPixels: 50, scale: "css" },
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
  },
  webServer: {
    /* `pnpm exec` 는 cwd 를 패키지 루트로 되돌린다(실측) — 상대 경로를 vrt/ 기준으로 적으면 빈 디렉터리를 서빙해 404 가 난다. */
    cwd: resolve(here, ".."),
    command: "pnpm exec http-server storybook-static -p 6007 -s -c-1",
    url: "http://127.0.0.1:6007/index.json",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    { name: "chromium", testMatch: STORIES },
    cornerProject("corners-chromium", devices["Desktop Chrome"]),
    ...(process.env.VRT_ENGINES ? [cornerProject("corners-webkit", devices["Desktop Safari"]), cornerProject("corners-firefox", devices["Desktop Firefox"])] : []),
  ],
});
