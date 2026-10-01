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

/* 위 import 가 싣는 면 전부. `document.fonts.ready` 는 «지금 받는 중인» 글꼴만 기다린다 — 글꼴은 글자가 그려질 때에야 받기 시작하므로
   첫 렌더 전에는 기다릴 것이 없어 곧바로 풀린다. 그 사이 열린 채로 그려지는 오버레이(Popover · HoverCard …)는 폴백 글꼴 폭의 트리거로
   자리를 재고, 글꼴이 온 뒤의 재계산은 트리거가 인라인 `<a>` 면 ResizeObserver 가 보지 못해(인라인 상자는 크기를 보고하지 않는다)
   타이밍에 따라 한 번씩만 일어났다 — 실측: HoverCard ThemeContrast 다크의 화살표 `left` 가 15회 중 1회 29.5px 대신 29.4609px 로 남아
   1px 옆에 그려졌다(#70 · 7번). 렌더 전에 면을 다 받아 두면 첫 측정부터 최종 폭이다. 두 번째 인자는 latin · latin-ext 두 subset 을
   모두 건드리는 글자다(`·` 는 latin, `Ā` 는 latin-ext). */
const FONT_FACES = [
  "400 1em 'Instrument Sans'",
  "500 1em 'Instrument Sans'",
  "600 1em 'Instrument Sans'",
  "700 1em 'Instrument Sans'",
  "400 1em 'Geist Mono'",
  "500 1em 'Geist Mono'",
];

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
  loaders: [
    async () => {
      await Promise.all(FONT_FACES.map((face) => document.fonts.load(face, "a·Ā")));
      return {};
    },
  ],
  parameters: {
    /* 'error' — addon-vitest 가 Chromium 에서 axe 를 돌려 위반이 있으면 스토리가 실패한다(C2). 알려진 위반은 그 스토리의
       `parameters.a11y.config.rules` 로만 끄고, 끈 스토리는 `stories-contract.spec` 의 KNOWN_A11Y_FAILURES 래칫에 있어야 한다. */
    a11y: { test: "error" },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: { disable: true },
  },
  /* `vrt` 는 시각 회귀 크롤러(vrt/stories.vrt.spec.ts)가 고르는 태그다. 빼려면 스토리에서 `tags: ["!vrt"]`. */
  tags: ["autodocs", "vrt"],
};

export default preview;
