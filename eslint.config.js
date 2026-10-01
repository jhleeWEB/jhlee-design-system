/* ESLint 10 flat config — 정적 검증 1층(계획 §2.4). Phase A 는 «기준선 래칫» 이다:
 * 첫 실행의 위반은 eslint-suppressions.json(bulk suppressions)이 덮고, 기준선 밖 신규 위반만 잡힌다.
 *
 * 계획은 «전부 warn + 기준선» 이라 적었지만 ESLint 의 bulk suppressions 는 **error 만** 덮는다(10.11 실측:
 * warn 569건에 `--suppress-all` 을 돌리면 파일이 `{}` 로 남고 경고가 그대로 찍힌다 — suppressions-service 가 severity 2 만 본다).
 * 그래서 모든 규칙을 error 로 정규화하고 기준선으로 덮는다 — «기존 위반은 통과, 신규 위반은 실패» 라는 계획의 효과는 같다.
 * 기준선을 걷어내는 승격·소비자 프리셋은 Phase C(C4)의 몫이다.
 *
 * 플러그인 버전은 2026-09-30 `npm view` 실측이다. eslint-plugin-jsx-a11y 6.10.2 만 peer 에 ESLint 10 이 없다 —
 * 소스에 제거된 context API(getSourceCode/getFilename/getScope…)가 없어 실제로 동작한다(#3) — 그래서 루트 package.json 의
 * `pnpm.peerDependencyRules.allowedVersions` 가 `eslint-plugin-jsx-a11y>eslint: 10` 을 허용해 설치 경고를 지운다(#8). 업스트림이 ESLint 10 을
 * peer 에 올리면 그 줄을 지운다. 10.x 마이너에서 플러그인이 깨지면 빼고, 같은 규칙군은 Storybook addon-a11y(axe, test 'error')가 브라우저에서 맡는다.
 */
import js from "@eslint/js";
import ds from "@buildos/eslint-rules";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import { flatConfigs as importX, createNodeResolver } from "eslint-plugin-import-x";
import jsdoc from "eslint-plugin-jsdoc";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

/* `no-restricted-classes` 의 패턴(옛 이름 개명 · hex · 단위 리터럴 · 격자 밖 간격)은 소비자 프리셋(`packages/ui/src/eslint/index.ts`)과 한 벌이다(#31) —
 * 워크스페이스와 소비 레포가 같은 규칙을 돌려야 «여기서는 통과, 저기서는 실패» 가 없다. Node 24 가 .ts 를 그대로 읽으므로 빌드 없이 import 된다.
 * 옛 이름 표는 tokens/legacy-map.mjs(정적 표, #49)가 원천이고 tokens/build.mjs 가 src/generated/legacy-classes.json 으로 굽는다(`pnpm tokens:check`) — {pattern, fix} 라
 * **`eslint --fix` 가 곧 코드모드**다. */
import { restrictedClassPatterns } from "./packages/ui/src/eslint/index.ts";

/** 모든 규칙을 error 로 정규화한다 — bulk suppressions 가 덮는 유일한 severity 라서(파일 머리의 «왜»). */
const asError = (configs) =>
  configs.map((config) =>
    config.rules
      ? {
          ...config,
          rules: Object.fromEntries(
            Object.entries(config.rules).map(([name, entry]) => {
              if (entry === "off" || entry === 0) return [name, entry];
              if (Array.isArray(entry)) return [name, ["error", ...entry.slice(1)]];
              return [name, "error"];
            }),
          ),
        }
      : config,
  );

const TSX_FILES = ["**/*.tsx"];
/* 타입 정보로 검사하는 소스. tsconfig 가 파일을 실제로 include 해야 한다 — tsconfig.json 은 src 전량(스펙·스토리 제외)이고
 * 스펙·아키텍처 가드는 tsconfig.test.json 이 같은 엄격도로 include 한다(#11). 설정 파일(vite/vitest/tsdown config)은 stories 프로필이 본다. */
const TYPED = {
  ui: { files: ["packages/ui/src/**/*.{ts,tsx}"], project: "packages/ui/tsconfig.json" },
  // ui 블록 뒤에 둔다 — src/__tests__/** 는 두 files 에 다 맞고 뒤가 이긴다.
  tests: {
    files: [
      "packages/ui/src/__tests__/**/*.{ts,tsx}",
      "packages/ui/src/__arch__/**/*.{ts,tsx}",
      // 컴포넌트·훅 옆 `Name.spec.tsx` · `useX.spec.ts`(Phase D 공통 계약, #42 · #48) — tsconfig.test.json 이 include 한다.
      "packages/ui/src/**/*.spec.{ts,tsx}",
    ],
    project: "packages/ui/tsconfig.test.json",
  },
  // 스토리·Storybook 설정·VRT·패키지 설정 파일은 tsconfig.stories.json 만 include 한다(#7) — src 안의 *.stories.tsx 도 여기다.
  stories: {
    files: [
      "packages/ui/src/**/*.stories.tsx",
      "packages/ui/stories/**/*.{ts,tsx}",
      "packages/ui/.storybook/**/*.{ts,tsx}",
      "packages/ui/vrt/**/*.{ts,tsx}",
      "packages/ui/vitest.config.ts",
      "packages/ui/tsdown.config.ts",
      // 매니페스트·문서 생성기 — Node 가 직접 실행하는 빌드 도구라 stories 프로필이 본다(#31).
      "packages/ui/scripts/**/*.ts",
    ],
    project: "packages/ui/tsconfig.stories.json",
  },
};
const TEST_FILES = ["**/__tests__/**", "**/__arch__/**", "**/*.spec.{ts,tsx}", "**/*.test.{ts,tsx}"];

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/",
      "**/dist/",
      "**/storybook-static/",
      "**/*.tsbuildinfo",
      ".claude/",
      "packages/eslint-rules/src/__tests__/fixtures/",
      // 산출물 — Playwright 리포트(번들 JS)·결과·커버리지는 gitignore 지만 ESLint 는 gitignore 를 읽지 않는다(C4 실측: report/ 하나로 3,422건).
      "**/vrt/report/",
      "**/vrt/results/",
      "**/coverage/",
    ],
  },

  // ── 기본: JS 권장 + TS 권장(타입 검사 없음) ──
  ...asError([js.configs.recommended]),
  ...asError(tseslint.configs.recommended),
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node, ...globals.es2024 },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },

  // ── 타입 검사 규칙: 소스 디렉터리에만. recommendedTypeChecked 로 시작한다 — strictTypeChecked 는 첫 실측에서
  //    잡음(non-nullable assertion·template literal 타입 등)이 커서 기준선을 부풀린다. 승격은 Phase C. ──
  ...asError(tseslint.configs.recommendedTypeChecked).map((config) => ({
    ...config,
    files: [...TYPED.ui.files, ...TYPED.tests.files, ...TYPED.stories.files],
  })),
  {
    files: TYPED.ui.files,
    languageOptions: { parserOptions: { project: TYPED.ui.project, tsconfigRootDir: import.meta.dirname } },
  },
  {
    files: TYPED.tests.files,
    languageOptions: {
      parserOptions: { project: TYPED.tests.project, tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    // ui 블록 뒤에 둔다 — src/**/*.stories.tsx 는 두 files 에 다 맞고 뒤가 이긴다.
    files: TYPED.stories.files,
    languageOptions: {
      parserOptions: { project: TYPED.stories.project, tsconfigRootDir: import.meta.dirname },
    },
  },

  // ── React hooks · JSX a11y ──
  ...asError([reactHooks.configs.flat["recommended-latest"]]).map((config) => ({
    ...config,
    files: TSX_FILES,
  })),
  ...asError([jsxA11y.flatConfigs.recommended]).map((config) => ({ ...config, files: TSX_FILES })),
  {
    // 포커스를 받는 separator 는 위젯이다(WAI-ARIA 1.2 separator · APG Window Splitter — tabindex · aria-valuenow · 키보드 조작이 계약이다).
    // jsx-a11y 6.10 은 separator 를 늘 비대화형 역할로 보아 tabIndex 와 키 · 포인터 핸들러를 잡는다 — 역할 예외 옵션이 없어 그 파일에서만 끈다(#60).
    files: ["packages/ui/src/navigation/ResizablePanels.tsx"],
    rules: {
      "jsx-a11y/no-noninteractive-element-interactions": "off",
      "jsx-a11y/no-noninteractive-tabindex": "off",
    },
  },

  // ── import-x: 순환 금지 · 배럴 내부 import 금지 · 테스트 import 금지 ──
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    plugins: { "import-x": importX.recommended.plugins["import-x"] },
    settings: {
      "import-x/resolver-next": [
        createNodeResolver({ extensions: [".ts", ".tsx", ".mts", ".js", ".mjs", ".jsx", ".json"] }),
      ],
    },
    rules: {
      "import-x/no-cycle": ["error", { ignoreExternal: true }],
      "import-x/no-self-import": "error",
      "import-x/no-duplicates": "error",
    },
  },
  {
    // 패키지 소스는 자기 배럴(index.ts)이나 자기 패키지 이름으로 되돌아 import 하지 않는다 — 순환과 «서브패스 아닌 전체 로드» 를 막는다.
    // stories/·.storybook/ 은 소비자 시점이라 패키지 이름으로 import 하는 것이 맞다 — 여기 넣지 않는다.
    files: ["packages/ui/src/**/*.{ts,tsx}"],
    ignores: ["packages/ui/src/index.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/index", "**/index.ts", "../index", "./index"],
              message: "Import the module directly, not the barrel.",
            },
            {
              group: ["@jhleeweb/squircle-design-system", "@jhleeweb/squircle-design-system/*"],
              message: "Inside the package, import relative modules.",
            },
            {
              group: ["**/__tests__/**", "**/*.spec", "**/*.spec.*", "**/*.test", "**/*.test.*"],
              message: "Production code must not import tests.",
            },
          ],
        },
      ],
    },
  },
  {
    // 제품 코드는 테스트 코드를 import 하지 않는다. 테스트끼리(setup·helper)는 허용한다.
    files: [
      "packages/ui/stories/**/*.{ts,tsx}",
      "packages/ui/.storybook/**/*.{ts,tsx}",
      "packages/eslint-rules/src/**/*.js",
    ],
    ignores: TEST_FILES,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/__tests__/**", "**/*.spec", "**/*.spec.*", "**/*.test", "**/*.test.*"],
              message: "Production code must not import tests.",
            },
          ],
        },
      ],
    },
  },
  {
    // 테스트는 배럴·자기 패키지 이름을 통해 import 해도 된다 — 소비자 시점의 계약 테스트가 그것이다.
    files: TEST_FILES,
    rules: { "no-restricted-imports": "off" },
  },

  // ── JSDoc 계약(계획 §2.5-c): 공개 심볼은 /** */ + 설명. 태그는 default/example/deprecated/since/slot ──
  {
    files: ["packages/ui/src/**/*.{ts,tsx}"],
    ignores: TEST_FILES,
    plugins: { jsdoc },
    settings: { jsdoc: { mode: "typescript" } },
    rules: {
      "jsdoc/require-jsdoc": [
        "error",
        {
          publicOnly: true,
          // --fix 가 빈 `/** */` 를 끼워 넣지 않게 — 첫 코드모드 실행(#22)에서 172개 빈 블록이 생겼다. 설명 없는 JSDoc 은 계약이 아니다.
          enableFixer: false,
          require: {
            FunctionDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
            ClassDeclaration: true,
          },
          contexts: ["TSInterfaceDeclaration", "TSTypeAliasDeclaration", "TSPropertySignature"],
        },
      ],
      "jsdoc/require-description": ["error", { contexts: ["any"] }],
      "jsdoc/check-tag-names": [
        "error",
        { definedTags: ["default", "example", "deprecated", "since", "slot"], typed: true },
      ],
    },
  },

  // ── better-tailwindcss: theme.css 밖의 클래스 · 제한 클래스 ──
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "better-tailwindcss": betterTailwindcss },
    // tailwindcss 는 루트가 아니라 packages/ui 에 설치돼 있다 — 플러그인이 `cwd` 에서 tailwindcss/package.json 을 찾는다(#361 실측).
    settings: {
      "better-tailwindcss": {
        cwd: "packages/ui",
        entryPoint: `${import.meta.dirname}/packages/ui/src/theme.css`,
      },
    },
    rules: {
      // `ds-*` 는 theme.css 가 @import 하는 컴포넌트 CSS 의 클래스다 — 토큰 밖 유틸리티가 아니라 DS 자신의 훅이다.
      "better-tailwindcss/no-unknown-classes": ["error", { ignore: ["^ds-"], detectComponentClasses: true }],
      "better-tailwindcss/no-restricted-classes": [
        "error",
        // ① 옛 이름(코드모드, 앞에 두어 개명이 먼저 보이게) ② raw 색(hex·색 함수) ③ 임의 단위(px·rem·em·ms) ④ 격자 밖 간격(4px 스텝 화이트리스트,
        // 간격 계열에만) — 프리셋과 같은 한 벌(src/eslint/index.ts). 초기 위반은 기준선(eslint-suppressions.json)이 든다.
        { restrict: restrictedClassPatterns() },
      ],
    },
  },

  // ── 로컬 규칙 ds/* ──
  {
    files: ["**/*.{js,mjs,ts,tsx}"],
    plugins: { ds },
    rules: {
      "ds/no-literal-style-value": "error",
      "ds/no-magic-ms": "error",
      "ds/no-forward-ref": "error",
      "ds/no-boolean-string-data-attr": "error",
      "ds/legacy-tone": "error",
    },
  },

  // ── 예외 ──
  {
    // 테스트는 타입 검사 규칙 중 «await 를 빼먹었다» 류만 남기고 나머지 잡음(unsafe any 등)은 끈다 — 테스트 값은 any 가 많다.
    files: TEST_FILES,
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "ds/no-magic-ms": "off",
    },
  },
  {
    // 규칙 패키지는 ESLint AST 를 다루느라 any 캐스트가 불가피하다.
    files: ["packages/eslint-rules/**"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
);
