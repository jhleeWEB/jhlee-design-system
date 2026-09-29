import { defineConfig } from "vitest/config";

/* RuleTester 는 DOM 이 필요 없다 — node 환경이 가장 빠르고 jsdom 의 전역 오염도 없다. */
export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["src/__tests__/**/*.spec.ts"],
  },
});
