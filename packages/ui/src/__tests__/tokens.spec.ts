// @vitest-environment node
// 이 스펙은 소스 «파일» 을 읽는다. jsdom 환경에서는 `import.meta.url` 이 file: 스킴이 아니라
// fileURLToPath 가 죽는다 — DOM 이 필요 없으므로 이 파일만 node 로 돌린다.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/* 방향 C 의 계약을 소스에서 검사한다.
 *
 * 「캔버스는 다크에서도 바뀌지 않는다」는 이 시스템의 **유일한 구조적 약속**이고,
 * 그것이 깨지는 방식은 언제나 같다 — 누군가 다크 블록에 `--canvas-*` 한 줄을 더한다.
 * 그 순간 도면이 어두워지고, 인쇄와 색각 이상 근거가 함께 무너진다. */

const theme = readFileSync(fileURLToPath(new URL("../theme.css", import.meta.url)), "utf8");
const cn = readFileSync(fileURLToPath(new URL("../cn.ts", import.meta.url)), "utf8");

/** `theme.css` 에서 다크 토큰을 정의하는 두 블록만 잘라낸다. */
function darkBlocks(): readonly string[] {
  const out: string[] = [];
  for (const marker of ['prefers-color-scheme: dark', ':root[data-theme="dark"]']) {
    let i = theme.indexOf(marker);
    while (i !== -1) {
      const open = theme.indexOf("{", i);
      let depth = 0;
      let end = open;
      for (; end < theme.length; end++) {
        if (theme[end] === "{") depth++;
        else if (theme[end] === "}" && --depth === 0) break;
      }
      out.push(theme.slice(open, end));
      i = theme.indexOf(marker, end);
    }
  }
  return out;
}

describe("방향 C — 캔버스와 크롬의 분리", () => {
  it("다크 블록은 --canvas-* 를 하나도 건드리지 않는다", () => {
    const blocks = darkBlocks();
    expect(blocks.length).toBeGreaterThanOrEqual(2);
    for (const block of blocks) {
      const touched = [...block.matchAll(/--canvas-[a-z0-9-]+\s*:/g)].map(m => m[0]);
      expect(touched).toEqual([]);
    }
  });

  it("다크 블록 둘이 같은 크롬 토큰 집합을 정의한다", () => {
    const [media, attr] = darkBlocks();
    const names = (block: string) =>
      [...block.matchAll(/(--chrome-[a-z0-9-]+)\s*:/g)].map(m => m[1]).sort();
    /* 한쪽에만 토큰이 있으면 OS 다크와 토글 다크가 **다른 색**으로 열린다. */
    expect(names(attr!)).toEqual(names(media!));
  });

  it("캔버스 토큰은 :root 한 곳에서만 정의된다", () => {
    const defs = [...theme.matchAll(/--canvas-bg\s*:/g)];
    expect(defs).toHaveLength(1);
  });
});

describe("사다리", () => {
  it("Tailwind 기본 사다리를 지워 역할 이름만 남긴다", () => {
    for (const ns of ["--radius-*", "--shadow-*", "--text-*", "--color-*"]) {
      expect(theme).toContain(`${ns}: initial`);
    }
  });

  it("cn.ts 의 사다리가 theme.css 와 같다", () => {
    /* 둘이 갈리면 증상은 «className 덮어쓰기가 가끔 안 먹는다» 로 나타나 추적하기 어렵다.
       그래서 검사로 묶는다 — cn.ts 주석이 약속한 것이 이것이다. */
    const declared = (ns: string) =>
      [...theme.matchAll(new RegExp(`--${ns}-([a-z0-9-]+):`, "g"))]
        .map(m => m[1]!)
        .filter(n => n !== "*")
        .sort();
    const listed = (key: string) => {
      const m = cn.match(new RegExp(`${key}: \\[([^\\]]*)\\]`));
      return m
        ? m[1]!
            .split(",")
            .map(s => s.trim().replace(/^"|"$/g, ""))
            .filter(Boolean)
            .sort()
        : null;
    };
    expect(listed("radius")).toEqual(declared("radius"));
    expect(listed("shadow")).toEqual(declared("shadow"));
    expect(listed("text")).toEqual(declared("text").filter(n => !n.includes("--")));
  });
});
