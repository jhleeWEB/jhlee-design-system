import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { StorybookConfig } from "@storybook/react-vite";

/* Storybook 이 컴포넌트 카탈로그의 정본이다(계획 §2.5-e).
 * 스토리는 두 곳에 산다 — 컴포넌트 옆(`src/**\/*.stories.tsx`, 3스토리 계약)과 페이지 단위(`stories/`, 옛 갤러리).
 * 소비 앱과 같은 Vite 플러그인(react · tailwindcss)을 붙여야 화면이 소비 앱과 같은 기준선에서 선다 —
 * react-vite 프레임워크는 react 플러그인을 자동으로 넣지만 Tailwind 는 넣지 않으므로 둘 다 명시한다. */
const here = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.stories.tsx", "../stories/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest", "@storybook/addon-themes"],
  core: { disableTelemetry: true },
  typescript: {
    /* docgen 은 Controls 표를 채우는 용도다. 정본 매니페스트는 Phase C 의 자체 생성기가 만든다. */
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      tsconfigPath: join(here, "../tsconfig.stories.json"),
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: prop => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  viteFinal: cfg => {
    const plugins = cfg.plugins ?? [];
    /* 프레임워크가 이미 넣은 react 플러그인과 겹치면 JSX 가 두 번 변환된다 — 이름으로 있는지 보고 없을 때만 더한다. */
    const hasReact = plugins.flat().some(p => p && typeof p === "object" && "name" in p && String(p.name).startsWith("vite:react"));
    return { ...cfg, plugins: [...plugins, ...(hasReact ? [] : [react()]), tailwindcss()] };
  },
};

export default config;
