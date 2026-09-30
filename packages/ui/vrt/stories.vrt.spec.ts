import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

/* `storybook-static/index.json` 을 순회해 `vrt` 태그 스토리를 라이트·다크로 연다.
 * URL 의 `globals=theme:…` 은 addon-themes 전역이라 preview.tsx 의 `withThemeByDataAttribute` 가 `html[data-theme]` 을 단다.
 * `theme-locked` 스토리(Pages/Gallery 의 Light·Dark)는 스토리 수준 `globals` 가 툴바를 잠가 URL 이 먹지 않는다 — 한 번만 찍는다. */
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
