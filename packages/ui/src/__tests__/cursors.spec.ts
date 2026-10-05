/*
 * 3D 모델링 커서(#64) — 정본 `cursors/cursors.ts` 의 약속.
 *
 * 핫스팟이 32 칸 밖이면 브라우저가 커서 전체를 버리고 폴백으로 간다(Chromium 은 조용히, 경고 없이). 폴백이 키워드가 아니면 `cursor` 선언 전체가
 * 무효다. 둘 다 눈으로는 «커서가 안 바뀐다» 로만 보여 원인을 찾기 어렵다 — 여기서 막는다. 생성물의 최신성은 `pnpm tokens:check` 가 본다.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  CURSOR_KEYWORDS,
  CURSORS,
  cursorNames,
  cursorSvg,
  cursorValue,
  svgDataUri,
} from "../cursors/cursors";

/* jsdom 의 URL 은 file: 이 아니라 new URL(상대, import.meta.url) 이 안 된다 — 경로를 먼저 풀고 올라간다(render-all 과 같은 꼴). */
const GENERATED = `${resolve(dirname(fileURLToPath(import.meta.url)), "../generated")}/`;
const SRC = `${resolve(dirname(fileURLToPath(import.meta.url)), "..")}/`;

describe("커서", () => {
  it.each(cursorNames)("%s — 핫스팟은 0..31 정수, 폴백은 CSS 커서 키워드", (name) => {
    const { hotspot, fallback } = CURSORS[name];
    for (const v of hotspot) {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(31);
    }
    expect(CURSOR_KEYWORDS).toContain(fallback);
  });

  it.each(cursorNames)("%s — 32×32 SVG, 흰 외곽(획 5) 위에 검정 본체(획 2)", (name) => {
    const svg = cursorSvg(name);
    expect(svg).toMatch(
      /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="32" height="32" viewBox="0 0 32 32">/,
    );
    const white = svg.indexOf('stroke-width="5"');
    const black = svg.indexOf('stroke-width="2"');
    expect(white).toBeGreaterThan(0);
    expect(black).toBeGreaterThan(white);
    expect(svg).toContain('color="white"');
    expect(svg).toContain('color="black"');
  });

  it("CSS 값 — url(data:…) x y, 폴백 · data URI 안에 큰따옴표와 날 # < > 가 없다", () => {
    for (const name of cursorNames) {
      const value = cursorValue(name);
      const { hotspot, fallback } = CURSORS[name];
      expect(value.endsWith(`") ${hotspot[0]} ${hotspot[1]}, ${fallback}`), name).toBe(true);
      const uri = svgDataUri(cursorSvg(name));
      expect(uri.startsWith("data:image/svg+xml,")).toBe(true);
      expect(uri).not.toMatch(/["#<>]/);
    }
  });

  it("생성물이 이름마다 변수 하나 · 유틸리티 하나를 낸다", () => {
    const css = readFileSync(`${GENERATED}cursors.css`, "utf8");
    const tw = readFileSync(`${GENERATED}cursors.tailwind.css`, "utf8");
    expect([...css.matchAll(/^ {2}--cursor-([a-z-]+):/gm)].map((m) => m[1])).toEqual(cursorNames);
    expect([...tw.matchAll(/^@utility cursor-cad-([a-z-]+) \{$/gm)].map((m) => m[1])).toEqual(cursorNames);
  });

  it("theme.css · tokens.css 는 커서를 싣지 않고 서브패스 cursors.css 만 싣는다 — 쓰지 않는 앱이 20 kB 를 받지 않는다(#102)", () => {
    /* `:root` 선언은 Tailwind 가 유틸리티처럼 걸러 내지 못한다 — @import 사슬에 다시 들어오면 모든 소비 앱의 산출 CSS 에 실린다. */
    const imports = (file: string) =>
      [...readFileSync(`${SRC}${file}`, "utf8").matchAll(/^@import\s+"([^"]+)"/gm)].map((m) => m[1]!);
    const reachable = (file: string, seen = new Set<string>()): Set<string> => {
      for (const target of imports(file)) {
        if (!target.startsWith("./")) continue;
        const next = `${file.includes("/") ? `${dirname(file)}/` : ""}${target.slice(2)}`;
        if (seen.has(next)) continue;
        seen.add(next);
        reachable(next, seen);
      }
      return seen;
    };
    for (const entry of ["theme.css", "tokens.css", "canvas.css"])
      expect(
        [...reachable(entry)].filter((f) => f.includes("cursors")),
        entry,
      ).toEqual([]);
    expect(imports("cursors.css")).toEqual(["./generated/cursors.css", "./generated/cursors.tailwind.css"]);
  });

  it("유틸리티 이름이 Tailwind 내장 cursor-<키워드> 와 겹치지 않는다(겹치면 내장 규칙을 덮는다)", () => {
    const tw = readFileSync(`${GENERATED}cursors.tailwind.css`, "utf8");
    for (const keyword of [...CURSOR_KEYWORDS, "pointer", "text", "auto", "none"])
      expect(tw).not.toContain(`@utility cursor-${keyword} {`);
  });
});
