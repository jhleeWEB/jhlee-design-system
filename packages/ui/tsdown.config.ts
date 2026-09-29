import { defineConfig } from "tsdown";

/* 배포물은 «모듈 구조를 보존한 ESM + d.ts + CSS 원본 복사» 다.
 *  - unbundle: 파일 단위를 유지해야 파일별 "use client" 지시문이 살아남고(번들 모드는 지시문을 조용히 뗀다),
 *    심볼 단위 트리셰이킹·docgen·매니페스트가 잡힌다.
 *  - CSS 는 빌드 파이프라인을 태우지 않고 그대로 복사한다 — @theme·@utility·@source 원문이 소비자 Tailwind 에 닿아야 한다.
 *  - 소비자는 publishConfig.exports(dist) 를, 워크스페이스(갤러리·Storybook)는 exports(src) 를 본다 — pnpm 이 발행 시 바꿔 끼운다. */
export default defineConfig({
  entry: ["src/index.ts", "src/canvas-metrics.ts"],
  format: "esm",
  platform: "neutral",
  unbundle: true,
  dts: true,
  sourcemap: true,
  clean: true,
  // `to` 는 디렉터리다 — 파일 경로를 주면 그 이름의 디렉터리가 생긴다(0.23 실측).
  copy: [
    { from: "src/theme.css", to: "dist" },
    { from: "src/tokens.css", to: "dist" },
    { from: "src/shell.css", to: "dist" },
    { from: "src/canvas.css", to: "dist" },
    { from: "src/feedback/toast.css", to: "dist/feedback" },
    { from: "src/primitives/card-motion.css", to: "dist/primitives" },
  ],
  // 파일 단위 "use client" 는 unbundle 에서 보존된다(dist 25파일 실측). rolldown 의 «번들에서 의미가 안 지켜질 수 있다» 경고만 끈다.
  inputOptions: { checks: { moduleLevelDirective: false } },
  external: [/^react($|\/)/, /^react-dom($|\/)/, /^radix-ui($|\/)/, /^react-icons($|\/)/, "class-variance-authority", "clsx", "tailwind-merge"],
});
