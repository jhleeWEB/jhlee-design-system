import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* @typescript-eslint/rule-tester 는 테스트 프레임워크 훅을 정적으로 받는다 — vitest 의 것을 꽂아야 describe/it 로 잡힌다. */
RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

export const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures");
/** 타입 정보가 필요한 케이스는 fixtures/tsconfig.json 프로젝트 안의 file.tsx 로 판다 — RuleTester 가 tsconfigRootDir 에 이어 붙이므로 상대 경로다. */
export const typedFile = "file.tsx";

/** 구문만 보는 규칙 — 타입 서비스 없이 JSX 만 켠다. */
export const syntaxTester = new RuleTester({
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

/** 타입 정보를 쓰는 규칙. */
export const typedTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: { jsx: true },
      project: "./tsconfig.json",
      tsconfigRootDir: fixturesDir,
    },
  },
});
