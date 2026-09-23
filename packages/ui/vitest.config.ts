import { defineConfig } from "vitest/config";

/* 이 패키지의 테스트는 DOM 을 요구한다 — 오버레이 층이 하는 일(포커스 트랩 · 스크롤 락 ·
   포털)은 전부 document 없이는 확인할 수 없다. */
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/__tests__/setup.ts"],
  },
});
