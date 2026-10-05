import { defineConfig } from "tsdown";

/* 배포물은 «모듈 구조를 보존한 ESM + d.ts + CSS 원본 복사» 다.
 *  - unbundle: 파일 단위를 유지해야 파일별 "use client" 지시문이 살아남고(번들 모드는 지시문을 조용히 뗀다),
 *    심볼 단위 트리셰이킹·docgen·매니페스트가 잡힌다.
 *  - CSS 는 빌드 파이프라인을 태우지 않고 그대로 복사한다 — @theme·@utility·@source 원문이 소비자 Tailwind 에 닿아야 한다.
 *  - 소비자는 publishConfig.exports(dist) 를, 워크스페이스(갤러리·Storybook)는 exports(src) 를 본다 — pnpm 이 발행 시 바꿔 끼운다. */
export default defineConfig({
  // testing/index 는 소비 레포의 __arch__ 래칫이 부르는 검사기(corner-audit, #26 · 규칙은 #36 에서 «corner-shape 금지» 로) — 배럴에 닿지 않으므로 별도 entry 다.
  // eslint/index 는 소비자 린트 프리셋(`./eslint` 서브패스), agent/cli 는 bin `jds-agent` — 둘 다 배럴에 닿지 않는 별도 entry 다(#31).
  entry: [
    "src/index.ts",
    "src/canvas-metrics.ts",
    "src/testing/index.ts",
    "src/eslint/index.ts",
    // icons/index 는 아이콘 서브패스 `./icons`(#64) — 루트 배럴에는 싣지 않는다(공개 표면은 컴포넌트, 아이콘은 서브패스).
    "src/icons/index.ts",
    "src/agent/cli.ts",
  ],
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
    // 비어 있는 호환 파일 — theme.css 가 `@import "./corner.css"` 로 본다(#26, #36 뒤 규칙 없음).
    { from: "src/corner.css", to: "dist" },
    // 생성물 — theme.css · tokens.css 가 `@import "./generated/…"` 로 본다(#18). 디렉터리 깊이를 소스와 같게 유지해야 tarball 안에서도 상대경로가 산다.
    { from: "src/generated/tokens.css", to: "dist/generated" },
    { from: "src/generated/theme.tailwind.css", to: "dist/generated" },
    // 커서(#64) — 서브패스 `./cursors.css` 가 cursors.css(:root 의 --cursor-*)와 cursors.tailwind.css(@utility cursor-cad-*)를 @import 한다(#102 — theme.css · tokens.css 는 싣지 않는다).
    { from: "src/cursors.css", to: "dist" },
    { from: "src/generated/cursors.css", to: "dist/generated" },
    { from: "src/generated/cursors.tailwind.css", to: "dist/generated" },
    // lucide 에서 옮긴 글리프의 ISC 고지 — 아이콘 서브패스 옆에 싣는다(#64).
    { from: "src/icons/LICENSE-lucide.txt", to: "dist/icons" },
    { from: "src/canvas.css", to: "dist" },
    { from: "src/feedback/toast.css", to: "dist/feedback" },
    { from: "src/primitives/card-motion.css", to: "dist/primitives" },
  ],
  // 파일 단위 "use client" 는 unbundle 에서 보존된다(dist 25파일 실측). rolldown 의 «번들에서 의미가 안 지켜질 수 있다» 경고만 끈다.
  inputOptions: { checks: { moduleLevelDirective: false } },
  // peer·dependencies 는 번들하지 않는다 — `external` 은 0.23 에서 폐기됐고 `deps.neverBundle` 이 정식 이름이다(#13).
  deps: {
    neverBundle: [
      /^react($|\/)/,
      /^react-dom($|\/)/,
      /^radix-ui($|\/)/,
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      // 프리셋의 optional peer — 소비자가 설치한 것을 쓴다(#31). bin(agent/cli)의 node 내장 모듈은 platform neutral 이라 명시해야 경고가 없다.
      /^eslint($|\/)/,
      /^eslint-plugin-better-tailwindcss($|\/)/,
      /^node:/,
    ],
  },
});
