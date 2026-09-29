import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const here = dirname(fileURLToPath(import.meta.url));

/* 두 프로젝트.
 *  - unit: 기존 jsdom 계약 테스트(`src/__tests__`). 오버레이 층이 하는 일(포커스 트랩 · 스크롤 락 · 포털)은 document 없이는
 *    확인할 수 없어 jsdom 이고, 파일 단위로 `@vitest-environment node` 를 덮어쓰는 스펙(tokens·stories-contract)은 그대로 존중된다.
 *  - storybook: addon-vitest 가 스토리를 진짜 Chromium 에서 렌더해 play + axe 를 돌린다. jsdom 으로는 불가능했던
 *    대비 4.5:1 실측이 여기서 나온다. `--project=` 로 골라 돌린다(`pnpm test` = unit, `pnpm test:stories` = storybook). */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          environment: "jsdom",
          globals: false,
          include: ["src/**/*.spec.{ts,tsx}"],
          setupFiles: ["./src/__tests__/setup.ts"],
        },
      },
      {
        plugins: [storybookTest({ configDir: join(here, ".storybook") })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
