import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

/* `storybook-static/index.json` 을 순회해 `vrt` 태그 스토리를 라이트·다크로 연다.
 * URL 의 `globals=theme:…` 은 addon-themes 전역이라 preview.tsx 의 `withThemeByDataAttribute` 가 `html[data-theme]` 을 단다.
 * `theme-locked` 스토리는 스토리 수준 `globals` 가 툴바를 잠가 URL 이 먹지 않는다 — 한 번만 찍는다. 오늘 이 태그를 쓰는 스토리는 없다
 * (유일한 사용처였던 Pages/Gallery 의 Light·Dark 는 #48 에서 지웠다) — 테마를 고정해야 하는 페이지 스토리가 다시 생기면 쓴다. */
type Entry = { id: string; type: string; title: string; name: string; tags?: string[] };

const index = JSON.parse(
  readFileSync(new URL("../storybook-static/index.json", import.meta.url), "utf8"),
) as {
  entries: Record<string, Entry>;
};

const stories = Object.values(index.entries).filter((e) => e.type === "story" && e.tags?.includes("vrt"));
const themes = ["light", "dark"] as const;

test.describe("stories", () => {
  for (const story of stories) {
    const locked = story.tags?.includes("theme-locked") ?? false;
    for (const theme of locked ? (["locked"] as const) : themes) {
      test(`${story.id} · ${theme}`, async ({ page }) => {
        /* CSS 전이를 끈다. 테마는 첫 렌더 **뒤에** 데코레이터가 `data-theme` 을 달아 바꾸므로, 다크 스냅샷은 `transition-colors`(100ms)를
           가진 요소마다 라이트 → 다크 전이를 거친다(실측: data-theme 이 붙은 프레임에 CSSTransition 6개가 running). `animations: "disabled"` 는
           촬영 순간에야 전이를 끝으로 감고, 그 전에 그려진 중간 프레임이 둥근 모서리 AA 픽셀에 ±1~4 를 남겼다 — 전이의 «출발 색» 이 다크
           스냅샷에 새어, 라이트 토큰 하나만 바꾼 빌드에서 다크 스냅샷 11장(Input · Tabs · ToggleGroup …)이 바뀌었다(#70). 정적 스냅샷에 전이는 뜻이 없다. */
        await page.addInitScript(() => {
          const style = document.createElement("style");
          style.textContent = "*, *::before, *::after { transition: none !important; }";
          (document.head ?? document.documentElement).append(style);
        });
        const globals = theme === "locked" ? "" : `&globals=theme:${theme}`;
        await page.goto(`/iframe.html?id=${story.id}&viewMode=story${globals}`);
        await page.locator("#storybook-root > *").first().waitFor();
        /* 폰트가 늦게 도착하면 글자 폭이 바뀐다 — 렌더 완료를 기다리는 유일한 신뢰할 만한 신호가 fonts.ready 다. */
        await page.evaluate(() => document.fonts.ready);

        if (theme !== "locked") {
          await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        }
        if (theme === "dark") {
          /* 방향 C 의 약속: 다크에서도 캔버스는 흰색이다. 커스텀 프로퍼티는 문자열로 돌아오고 minifier 가 `#ffffff` 를 `#fff` 로
             줄이므로(실측) 원문 비교는 깨진다 — 프로브 요소에 실제로 칠해 계산된 rgb 로 비교한다. */
          const canvasBg = await page.evaluate(() => {
            const probe = document.createElement("div");
            probe.style.backgroundColor = "var(--canvas-bg)";
            document.body.appendChild(probe);
            const rgb = getComputedStyle(probe).backgroundColor;
            probe.remove();
            return rgb;
          });
          expect(canvasBg).toBe("rgb(255, 255, 255)");
        }

        await expect(page).toHaveScreenshot(`${story.id}--${theme}.png`, { fullPage: true });
      });
    }
  }
});
