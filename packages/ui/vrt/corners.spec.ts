import { expect, test, type Page } from "@playwright/test";

import { coverageFromRgba, profileCorner, type Rgb } from "../src/testing/corner-profile";

/* 곡률의 동적 검증(계획 §3.5-2·3·4, #26) — `Foundations/Corners` 스토리 위에서.
 *  1. CSSOM 스윕: `body *` 가운데 radius > 0 인 요소는 원형이면 `round`, 아니면 `squircle` 이어야 한다. 기대값은 페이지 안
 *     `CSS.supports("corner-shape", "squircle")` 에서 나온다 — Safari 가 지원을 켜는 날 스펙이 저절로 뒤집힌다(그날의 회귀는 스냅샷이 잡는다).
 *  2. 견본 반경: card(lg) 견본 = 12 × 1.5 = 18px(지원) · 12px(미지원 또는 킬 스위치). chip(sm)은 언제나 6px.
 *  3. 픽셀 프로파일: 견본 좌상단 48×48 device px 에 원과 초타원(n=4)을 적합해 `MAE_super < 0.5·MAE_circle` 이면 스쿼클. CSSOM 은 «선언» 을,
 *     픽셀은 «그렸는가» 를 말한다. chip 은 스윕만(6px 은 서브픽셀 차이).
 *  4. 엔진 스냅샷(VRT_ENGINES 일 때만): 3엔진 골든은 로컬 macOS 절차다 — CI 의 chromium 리눅스 골든은 stories.vrt.spec 이 이미 찍는다. */

const LADDER = "/iframe.html?id=foundations-corners--ladder&viewMode=story";
const COMPONENTS = "/iframe.html?id=foundations-corners--components&viewMode=story";
const MODAL = "/iframe.html?id=foundations-corners--modal-open&viewMode=story";
const WINDOW = 48;

interface Mismatch {
  readonly element: string;
  readonly radius: string;
  readonly expected: string;
  readonly actual: string;
}

async function open(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await page.locator("#storybook-root > *").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
}

const supportsSquircle = (page: Page): Promise<boolean> => page.evaluate(() => CSS.supports("corner-shape", "squircle"));

/** 스윕 — 브라우저 안에서 판정해 불일치만 돌려준다. */
function sweep(page: Page): Promise<{ supported: boolean; checked: number; mismatches: Mismatch[] }> {
  return page.evaluate(() => {
    const supported = CSS.supports("corner-shape", "squircle");
    /* Chromium 153 실측: 계산값은 키워드가 아니라 `superellipse(2)`(squircle) · `superellipse(1)`(round) 다. 미지원 엔진은 빈 문자열을 낸다. */
    const normalize = (v: string): string => {
      const one = v.trim().split(/\s+(?![^(]*\))/)[0] ?? "";
      if (one === "" || one === "round" || one === "superellipse(1)") return "round";
      if (one === "squircle" || one === "superellipse(2)") return "squircle";
      return one;
    };
    const px = (v: string): number => (v.endsWith("%") ? Number.POSITIVE_INFINITY : Number.parseFloat(v) || 0);
    const corners = ["border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius"] as const;
    const mismatches: Mismatch[] = [];
    let checked = 0;
    for (const el of document.querySelectorAll<HTMLElement>("body *")) {
      /* 비교용 후보(1.84 · n=5 · 강제 원호)는 출하 값이 아니다 — 스토리가 data-corner-candidate 로 표시한다. */
      if (el.dataset.cornerCandidate !== undefined) continue;
      const cs = getComputedStyle(el);
      const radii = corners.map(c => cs.getPropertyValue(c));
      const max = Math.max(...radii.map(px));
      if (max <= 0) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      checked++;
      /* 원형·pill: 반경이 짧은 변의 절반 이상(9999px · 50%) — 원호여야 한다. */
      const circular = max >= Math.min(rect.width, rect.height) / 2;
      const expected = circular || !supported ? "round" : "squircle";
      const actual = normalize(cs.getPropertyValue("corner-shape"));
      if (actual !== expected) {
        const id = el.dataset.cornerSpecimen ? `[data-corner-specimen=${el.dataset.cornerSpecimen}]` : el.dataset.slot ? `[data-slot=${el.dataset.slot}]` : el.tagName.toLowerCase();
        mismatches.push({ element: `${id}.${String(el.className).split(" ").slice(0, 3).join(".")}`, radius: radii.join(" "), expected, actual });
      }
    }
    return { supported, checked, mismatches };
  });
}

const radiusOf = (page: Page, selector: string, pseudo?: string): Promise<number> =>
  page.evaluate(([s, p]) => Number.parseFloat(getComputedStyle(document.querySelector(s!)!, p || null).borderTopLeftRadius), [selector, pseudo]);

test.describe("corners", () => {
  test("CSSOM sweep — every radius > 0 element is squircle, circular ones are round; the kill switch reverts all", async ({ page }) => {
    await open(page, LADDER);
    const first = await sweep(page);
    expect(first.checked).toBeGreaterThan(5);
    expect(first.mismatches).toEqual([]);

    /* 견본 반경 — lg = 12 × k. chip 은 계수를 타지 않는다. 동심원 안쪽 = 바깥(lg) − 패딩 4px. */
    const k = first.supported ? 1.5 : 1;
    expect(await radiusOf(page, '[data-corner-specimen="lg"]')).toBeCloseTo(12 * k, 3);
    expect(await radiusOf(page, '[data-corner-specimen="md"]')).toBeCloseTo(8 * k, 3);
    expect(await radiusOf(page, '[data-corner-specimen="xl"]')).toBeCloseTo(16 * k, 3);
    expect(await radiusOf(page, '[data-corner-specimen="sm"]')).toBe(6);
    expect(await radiusOf(page, '[data-corner-specimen="concentric-inner"]')).toBeCloseTo(12 * k - 4, 3);

    /* 킬 스위치 — 지원 엔진을 미지원 엔진과 같은 그림으로. */
    await page.evaluate(() => {
      document.documentElement.dataset.corner = "round";
    });
    const killed = await sweep(page);
    expect(killed.mismatches.filter(m => m.expected === "round")).toEqual([]);
    expect(await radiusOf(page, '[data-corner-specimen="lg"]')).toBe(12);
    expect(await radiusOf(page, '[data-corner-specimen="sm"]')).toBe(6);
    await page.evaluate(() => {
      delete document.documentElement.dataset.corner;
    });
    expect(await radiusOf(page, '[data-corner-specimen="lg"]')).toBeCloseTo(12 * k, 3);
  });

  test("CSSOM sweep — real components (focus ring, cards, toolbar, media card ring, alerts, dropdown)", async ({ page }) => {
    await open(page, COMPONENTS);
    const result = await sweep(page);
    expect(result.checked).toBeGreaterThan(10);
    expect(result.mismatches).toEqual([]);
    /* MediaCard 선택 버튼의 ::after 링은 카드 반경을 따른다 — raised 는 lg, flat 은 lg − 1px 헤어라인. */
    const k = result.supported ? 1.5 : 1;
    expect(await radiusOf(page, '[data-elevation="raised"] [data-slot="media-card-select"]', "::after")).toBeCloseTo(12 * k, 3);
    expect(await radiusOf(page, '[data-elevation="flat"] [data-slot="media-card-select"]', "::after")).toBeCloseTo(12 * k - 1, 3);
  });

  test("pixel profile — md · lg · xl specimens render as squircle when supported, round otherwise", async ({ page }) => {
    await open(page, LADDER);
    const supported = await supportsSquircle(page);
    for (const step of ["md", "lg", "xl"] as const) {
      const specimen = page.locator(`[data-corner-specimen="${step}"]`);
      const colours = await specimen.evaluate(el => ({
        fill: getComputedStyle(el).backgroundColor,
        background: getComputedStyle(el.parentElement!).backgroundColor === "rgba(0, 0, 0, 0)" ? getComputedStyle(document.body).backgroundColor : getComputedStyle(el.parentElement!).backgroundColor,
      }));
      const rgb = (s: string): Rgb => {
        const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(s);
        return { r: Number(m?.[1]), g: Number(m?.[2]), b: Number(m?.[3]) };
      };
      /* 요소 스크린샷은 device px 다(DPR 2 → 192×192). 좌상단 48×48 만 캔버스로 읽는다 — 디코더 의존성 없이 브라우저가 PNG 를 푼다. */
      const png = (await specimen.screenshot({ scale: "device" })).toString("base64");
      const data = await page.evaluate(
        async ([b64, size]) => {
          const img = new Image();
          img.src = `data:image/png;base64,${b64}`;
          await img.decode();
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, size, size, 0, 0, size, size);
          return Array.from(ctx.getImageData(0, 0, size, size).data);
        },
        [png, WINDOW] as const,
      );
      const profile = profileCorner(coverageFromRgba(data, WINDOW, rgb(colours.fill), rgb(colours.background)));
      const expectedRadius = { md: 8, lg: 12, xl: 16 }[step] * (supported ? 1.5 : 1) * 2;
      test.info().annotations.push({ type: `profile-${step}`, description: `${JSON.stringify(profile)} expected r=${expectedRadius}` });
      expect(profile.shape, `${step}: ${JSON.stringify(profile)}`).toBe(supported ? "squircle" : "round");
      const fit = supported ? profile.squircle : profile.circle;
      expect(Math.abs(fit.radius - expectedRadius), `${step}: fitted ${fit.radius} vs ${expectedRadius}`).toBeLessThanOrEqual(2);
    }
  });

  test("engine snapshots — local three-engine record (VRT_ENGINES)", async ({ page }) => {
    test.skip(!process.env.VRT_ENGINES, "3엔진 골든은 로컬 macOS 절차다 — CI 의 chromium 리눅스 골든은 stories.vrt.spec 이 찍는다");
    for (const [name, url] of [
      ["ladder", LADDER],
      ["components", COMPONENTS],
      ["modal", MODAL],
    ] as const) {
      await open(page, url);
      await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
    }
  });
});
