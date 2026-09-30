import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { configDefaults, defineConfig } from "vitest/config";

const here = dirname(fileURLToPath(import.meta.url));

/* 세 프로젝트.
 *  - unit: 기존 jsdom 계약 테스트(`src/__tests__`). 오버레이 층이 하는 일(포커스 트랩 · 스크롤 락 · 포털)은 document 없이는
 *    확인할 수 없어 jsdom 이고, 파일 단위로 `@vitest-environment node` 를 덮어쓰는 스펙(stories-contract)은 그대로 존중된다.
 *  - arch: 소스 «파일» 을 읽는 가드(계획 §2.4 1·2·5층, #11) — 금지 패턴 래칫(`src/__arch__`)·토큰 모델 스펙(`src/__tests__/tokens`)·
 *    패키지 계약(`src/__tests__/package`). DOM 이 필요 없고 `import.meta.url` 이 file: 이어야 fileURLToPath 가 살아서 node 다.
 *    unit 의 include 와 겹치므로 unit 쪽에서 같은 경로를 빼 두 번 돌지 않게 한다.
 *  - storybook: addon-vitest 가 스토리를 진짜 Chromium 에서 렌더해 play + axe 를 돌린다. jsdom 으로는 불가능했던
 *    대비 4.5:1 실측이 여기서 나온다. `--project=` 로 골라 돌린다(`pnpm test` = unit + arch, `pnpm test:stories` = storybook). */

/** arch 프로젝트가 소유하는 스펙 경로 — unit 에서 빼고 arch 에서 든다. */
const ARCH_SPECS = ["src/__arch__/**/*.spec.ts", "src/__tests__/tokens/**/*.spec.ts", "src/__tests__/package/**/*.spec.ts", "src/__tests__/corner.spec.ts"];
export default defineConfig({
  test: {
    /* 커버리지(C3) — unit + arch 를 함께 돌린 첫 실측(2026-09-30)의 floor − 2 를 문턱으로 고정한다. 문턱은 «떨어지지 않는다» 를 지키는
     * 래칫이지 목표가 아니다 — 올릴 때는 실측이 오른 뒤 같은 PR 에서 올린다. 대상은 제품 소스뿐: 스펙·스토리·생성물·동결된 legacy 는 뺀다. */
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.stories.tsx", "src/__tests__/**", "src/__arch__/**", "src/generated/**", "src/legacy/**", "src/testing/**", "src/**/index.ts"],
      reporter: ["text-summary"],
      thresholds: { statements: 84, branches: 78, functions: 82, lines: 89 },
    },
    projects: [
      {
        test: {
          name: "unit",
          environment: "jsdom",
          globals: false,
          include: ["src/**/*.spec.{ts,tsx}"],
          exclude: [...configDefaults.exclude, ...ARCH_SPECS],
          setupFiles: ["./src/__tests__/setup.ts"],
        },
      },
      {
        test: {
          name: "arch",
          environment: "node",
          globals: false,
          include: ARCH_SPECS,
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
