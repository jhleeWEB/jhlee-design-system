import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { searchForWorkspaceRoot } from "vite";
import { defineConfig } from "vitest/config";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  server: {
    // 워크스페이스 패키지 소스(@jhleeweb/squircle-design-system)를 개발 서버가 그대로 서빙한다 — pnpm 심링크 너머의 실제 경로.
    fs: { allow: [searchForWorkspaceRoot(process.cwd())] },
  },
  build: { outDir: "dist", emptyOutDir: true },
});
