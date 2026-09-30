/*
 * 모션 상수 ↔ CSS 대조(계획 §2.4 `motion.spec` · §2.6 B1, #15 → #18).
 *
 * `generated/tokens.ts` 의 숫자와 `generated/tokens.css` 의 `--duration-*` 는 **같은 토큰의 두 표기**다 — 토스트 퇴장은 toast.css 가 그리고
 * 큐 정리는 JS 가 하므로, 둘이 갈리면 퇴장 중인 토스트가 큐에서 먼저 빠져 화면에서 뚝 사라진다. 생성기가 둘을 한 정본에서 내지만
 * 포맷은 둘이라(ts-consts 의 toMs · css-vars), 이 스펙이 값의 동일성과 그 사이의 순서 불변식, 그리고 **CSS 규칙이 실제로 그 토큰을
 * 읽는지**(toast.css · theme.css 의 ms 리터럴이 되돌아오지 않았는지)를 붙든다.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { MOTION } from "../../generated/tokens";
import { loadTokenModel, resolvedMap } from "./model";

const css = (file: string): string =>
  readFileSync(fileURLToPath(new URL(`../../${file}`, import.meta.url)), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );

const toast = css("feedback/toast.css");
const theme = css("theme.css");
const light = resolvedMap(loadTokenModel(), "light");
const ms = (name: string): number => {
  const value = light[name];
  expect(value, `${name} 이 해석되지 않았다`).toMatch(/^\d+ms$/);
  return Number(value!.slice(0, -2));
};

describe("모션 상수 == CSS 토큰", () => {
  it("MOTION 의 키마다 --duration-* 가 있고 값이 같다", () => {
    const pairs: Record<keyof typeof MOTION, string> = {
      instantMs: "--duration-instant",
      fastMs: "--duration-fast",
      baseMs: "--duration-base",
      slowMs: "--duration-slow",
      collapseMs: "--duration-collapse",
      scrollHideDelayMs: "--duration-scrollbar-hide-delay",
      scrollFadeMs: "--duration-scrollbar-fade",
      toastEnterMs: "--duration-toast-enter",
      toastExitMs: "--duration-toast-exit",
      toastQueueGraceMs: "--duration-toast-queue-grace",
      toastDefaultMs: "--duration-toast-default",
      tooltipDelayMs: "--duration-tooltip-delay",
    };
    for (const [key, name] of Object.entries(pairs) as [keyof typeof MOTION, string][])
      expect(ms(name), key).toBe(MOTION[key]);
  });

  it("토스트 등장·퇴장은 toast.css 가 토큰으로 읽는다 — ms 리터럴이 아니다", () => {
    expect(toast).toMatch(/animation:\s*ds-toast-enter\s+var\(--duration-toast-enter\)/);
    expect(toast).toMatch(/animation:\s*ds-toast-exit\s+var\(--duration-toast-exit\)/);
    expect(toast).not.toMatch(/\d+ms/);
  });

  it("접기는 옛 이름 --motion-collapse-duration 이 --duration-collapse 를 잇고 reduced-motion 에서 0 이 된다", () => {
    const model = loadTokenModel();
    expect(light["--motion-collapse-duration"]).toBe(`${MOTION.collapseMs}ms`);
    expect(model.tokens.find((t) => t.name === "--motion-collapse-duration")?.refs).toEqual([
      "--duration-collapse",
    ]);
    expect(
      model.tokens.find((t) => t.name === "--duration-collapse" && t.scope === "reduced-motion")?.value,
    ).toBe("0ms");
  });

  it("스크롤바 페이드는 theme.css 의 .ds-scroll-area-scrollbar 가 토큰으로 읽는다", () => {
    expect(theme).toMatch(
      /\.ds-scroll-area-scrollbar\s*\{[^}]*transition:\s*opacity\s+var\(--duration-scrollbar-fade\)/,
    );
    expect(ms("--duration-scrollbar-fade")).toBe(MOTION.scrollFadeMs);
  });
});

describe("모션 불변식", () => {
  it("토스트 퇴장은 큐 정리 유예 안에 끝난다", () => {
    /* 유예가 퇴장보다 짧으면 Radix Presence 가 퇴장을 끝내기 전에 큐에서 빠져 애니메이션이 잘린다(toast.css 머리 주석). */
    expect(MOTION.toastExitMs).toBeLessThan(MOTION.toastQueueGraceMs);
  });

  it("스크롤바 페이드는 숨김 지연보다 길지 않다", () => {
    /* 페이드가 지연보다 길면 다음 스크롤이 시작될 때 아직 사라지는 중인 스크롤바가 튀어 오른다. */
    expect(MOTION.scrollFadeMs).toBeLessThanOrEqual(MOTION.scrollHideDelayMs);
  });

  it("4단은 instant(0) < fast < base < slow 이고 접기는 slow 다", () => {
    expect(MOTION.instantMs).toBe(0);
    expect(MOTION.fastMs).toBeLessThan(MOTION.baseMs);
    expect(MOTION.baseMs).toBeLessThan(MOTION.slowMs);
    expect(MOTION.collapseMs).toBe(MOTION.slowMs);
  });

  it("모든 값은 0 이상의 정수 ms 이고 instant 말고는 양수다", () => {
    for (const [name, value] of Object.entries(MOTION)) {
      expect(Number.isInteger(value), name).toBe(true);
      expect(value, name).toBeGreaterThanOrEqual(0);
      if (name !== "instantMs") expect(value, name).toBeGreaterThan(0);
    }
  });
});
