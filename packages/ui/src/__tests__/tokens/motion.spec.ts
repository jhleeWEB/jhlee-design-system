/*
 * 모션 상수 ↔ CSS 대조(계획 §2.4 `motion.spec` · §2.6 B1, #15).
 *
 * `tokens/motion.ts` 의 숫자는 CSS 의 ms 와 **같은 값의 두 표기**다 — 토스트 퇴장은 toast.css 가 그리고 큐 정리는 JS 가 하므로,
 * 둘이 갈리면 퇴장 중인 토스트가 큐에서 먼저 빠져 화면에서 뚝 사라진다. 이 스펙은 값의 동일성과 그 사이의 순서 불변식을 붙든다.
 * B3 가 정본을 JSON 으로 옮기면 CSS 와 TS 가 같은 토큰에서 나오고, 그때 이 대조는 `generated-parity.spec` 이 이어받는다.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { MOTION } from "../../tokens/motion";
import { loadTokenModel, resolvedMap } from "./model";

const css = (file: string): string => readFileSync(fileURLToPath(new URL(`../../${file}`, import.meta.url)), "utf8");

/** `selector { … animation: name 220ms … }` 에서 이름 뒤의 ms — 주석은 걷어내고 본다. */
function animationMs(source: string, keyframes: string): number {
  const body = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const m = body.match(new RegExp(`animation:\\s*${keyframes}\\s+(\\d+)ms`));
  expect(m, `${keyframes} 의 ms 를 찾지 못했다`).not.toBeNull();
  return Number(m![1]);
}

const toast = css("feedback/toast.css");
const theme = css("theme.css");
const light = resolvedMap(loadTokenModel(), "light");

describe("모션 상수 == CSS", () => {
  it("토스트 등장·퇴장은 toast.css 의 keyframes 길이와 같다", () => {
    expect(animationMs(toast, "ds-toast-enter")).toBe(MOTION.toastEnterMs);
    expect(animationMs(toast, "ds-toast-exit")).toBe(MOTION.toastExitMs);
  });

  it("접기는 theme.css 의 --motion-collapse-duration 과 같다", () => {
    expect(light["--motion-collapse-duration"]).toBe(`${MOTION.collapseMs}ms`);
  });

  it("스크롤바 페이드는 theme.css 의 .ds-scroll-area-scrollbar 전환과 같다", () => {
    const rule = theme.match(/\.ds-scroll-area-scrollbar\s*\{[^}]*transition:\s*opacity\s+(\d+)ms/);
    expect(rule, "스크롤바 transition 을 찾지 못했다").not.toBeNull();
    expect(Number(rule![1])).toBe(MOTION.scrollFadeMs);
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

  it("모든 값은 양의 정수 ms 다", () => {
    for (const [name, value] of Object.entries(MOTION)) {
      expect(Number.isInteger(value), name).toBe(true);
      expect(value, name).toBeGreaterThan(0);
    }
  });
});
