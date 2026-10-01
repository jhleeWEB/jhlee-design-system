import { availableParallelism } from "node:os";
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
const ARCH_SPECS = [
  "src/__arch__/**/*.spec.ts",
  "src/__tests__/tokens/**/*.spec.ts",
  "src/__tests__/package/**/*.spec.ts",
  "src/__tests__/corner.spec.ts",
];
export default defineConfig({
  test: {
    /* 부하 내성(#70 · 6번). 기본 워커 수(코어 수)는 한가한 기계 기준이라, 다른 일(도커 VRT · 두 번째 vitest)과 겹치면 jsdom 계약 스펙의 무거운
     * 케이스가 5초 기본 타임아웃을 넘었다 — 실측(8코어 macOS): 한가할 때 가장 느린 케이스 DatePicker·Calendar `slot` 1.4~1.9초,
     * unit 을 셋 동시에 돌리면 DatePicker `slot` 5.8~6.1초로 세 번 모두 실패. 워커를 코어의 절반(8코어 → 4)으로 묶으면 같은 부하에서
     * 최악 2.6~2.8초 · 실패 0, 한가할 때 unit 전체는 44.8초 → 48.2초. 과다 구독을 줄이는 쪽이 타임아웃만 올리는 것보다 낫다 — 느려진 원인이 사라진다. */
    maxWorkers: Math.max(1, Math.floor(availableParallelism() / 2)),
    /* 커버리지(C3) — unit + arch 를 함께 돌린 첫 실측(2026-09-30)의 floor − 2 를 문턱으로 고정한다. 문턱은 «떨어지지 않는다» 를 지키는
     * 래칫이지 목표가 아니다 — 올릴 때는 실측이 오른 뒤 같은 PR 에서 올린다. 대상은 제품 소스뿐: 스펙·스토리·생성물은 뺀다. */
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.stories.tsx",
        "src/__tests__/**",
        "src/__arch__/**",
        "src/generated/**",
        "src/testing/**",
        "src/**/index.ts",
      ],
      reporter: ["text-summary"],
      thresholds: { statements: 84, branches: 78, functions: 82, lines: 89 },
    },
    projects: [
      {
        test: {
          name: "unit",
          environment: "jsdom",
          /* 15초 — 위 실측의 부하 최악(6.1초)의 두 배 남짓. 진짜 멈춤(대기 중인 Promise · 무한 루프)은 여전히 15초에 잡힌다 —
           * 이보다 크게 올리면 걸림을 느린 테스트로 숨긴다. */
          testTimeout: 15_000,
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
