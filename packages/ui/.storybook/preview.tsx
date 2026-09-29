import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";

/* 글꼴은 self-host 다 — 갤러리가 쓰던 Google Fonts 링크는 네트워크·캐시에 따라 픽셀이 달라져 VRT 를 흔든다.
   가중치는 theme.css 가 실제로 쓰는 것만(sans 400·500·600·700, mono 400·500). */
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/500.css";
import "@fontsource/instrument-sans/600.css";
import "@fontsource/instrument-sans/700.css";
import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/500.css";

import "./storybook.css";

const preview: Preview = {
  decorators: [
    /* `html[data-theme]` 이 theme.css 의 규약이다 — `:root[data-theme="dark"]` 가 토글 다크, `:root:not([data-theme="light"])` 가
       OS 다크다. addon-themes 의 기본값(parentSelector "html" · attributeName "data-theme", 10.6.1 dist 실측)이 그와 같아
       옵션을 적지 않아도 되지만, 규약이 바뀌면 여기가 첫 번째로 깨지는 자리라 명시한다. */
    withThemeByDataAttribute({
      themes: { light: "light", dark: "dark" },
      defaultTheme: "light",
      parentSelector: "html",
      attributeName: "data-theme",
    }),
  ],
  parameters: {
    /* Phase A 는 'todo' — 위반을 보고만 하고 실패시키지 않는다. Phase C 에서 'error' + KNOWN_A11Y_FAILURES 래칫. */
    a11y: { test: "todo" },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: { disable: true },
  },
  /* `vrt` 는 시각 회귀 크롤러(vrt/stories.vrt.spec.ts)가 고르는 태그다. 빼려면 스토리에서 `tags: ["!vrt"]`. */
  tags: ["autodocs", "vrt"],
};

export default preview;
