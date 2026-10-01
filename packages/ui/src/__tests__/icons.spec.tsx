/*
 * 아이콘 서브패스 `./icons` 의 계약(#64).
 *
 * 글리프 정본(`icons/glyphs.ts`)과 컴포넌트 목록(`icons/icons.ts`)은 두 곳이다 — 한쪽에만 더하면 이름 맵이나 컴포넌트가 빠진다. 여기서 둘이 같은
 * 집합인지, 렌더가 react-icons 시절의 속성(24 뷰박스 · 획 2 · round · currentColor)을 지키는지, 접근성 기본값(장식 → aria-hidden, title →
 * role="img")이 맞는지를 본다. 기존 화면의 픽셀이 같은지는 VRT 가 본다(0 diff).
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import * as subpath from "../icons";
import { GLYPHS, glyphNames, iconComponentName, icons } from "../icons";
import { ICON } from "../lib/icons";

/* jsdom 의 URL 은 file: 이 아니라 new URL(상대, import.meta.url) 이 안 된다 — 경로를 먼저 풀고 올라간다(render-all 과 같은 꼴). */
const PKG_DIR = `${resolve(dirname(fileURLToPath(import.meta.url)), "../..")}/`;

describe("글리프 ↔ 컴포넌트", () => {
  it("모든 글리프에 `Icon<Pascal>` 컴포넌트와 `icons` 맵 항목이 있고, 그 밖의 아이콘은 없다", () => {
    const exported = Object.keys(subpath)
      .filter((k) => /^Icon[A-Z0-9]/.test(k))
      .sort();
    expect(exported).toEqual(glyphNames.map(iconComponentName).sort());
    expect(Object.keys(icons).sort()).toEqual([...glyphNames].sort());
    for (const name of glyphNames) {
      const Component = icons[name];
      expect(Component.displayName, name).toBe(iconComponentName(name));
      expect(Component.glyph, name).toBe(name);
      expect((subpath as Record<string, unknown>)[iconComponentName(name)], name).toBe(Component);
    }
  });

  it("이름 → 컴포넌트 이름 규칙", () => {
    expect(iconComponentName("zoom-in")).toBe("IconZoomIn");
    expect(iconComponentName("x")).toBe("IconX");
    expect(iconComponentName("view-iso")).toBe("IconViewIso");
  });

  it("좌표는 24 뷰박스 안이다 — 글리프 문법(가장자리 여백 포함)", () => {
    for (const name of glyphNames)
      for (const [tag, attrs] of GLYPHS[name].nodes) {
        for (const [key, value] of Object.entries(attrs)) {
          if (key === "d" || key === "fill") continue;
          for (const n of value.split(/[\s,]+/).map(Number))
            expect(n >= 0 && n <= 24, `${name} ${tag} ${key}=${value}`).toBe(true);
        }
        if (attrs.fill !== undefined)
          expect(attrs.fill, `${name} 의 채움은 currentColor 만`).toBe("currentColor");
      }
  });

  it("lucide 에서 옮긴 글리프가 있으면 ISC 고지 파일이 배포물에 실린다", () => {
    expect(glyphNames.some((n) => "lucide" in GLYPHS[n])).toBe(true);
    expect(existsSync(`${PKG_DIR}src/icons/LICENSE-lucide.txt`)).toBe(true);
    expect(readFileSync(`${PKG_DIR}tsdown.config.ts`, "utf8")).toContain("src/icons/LICENSE-lucide.txt");
  });
});

describe("렌더", () => {
  it("기본은 장식 — aria-hidden · 16px · 획 2 · round · currentColor", () => {
    const { container } = render(<subpath.IconOrbit />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(svg).not.toHaveAttribute("role");
    expect(svg).toHaveAttribute("width", String(ICON.size));
    expect(svg).toHaveAttribute("height", String(ICON.size));
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("stroke", "currentColor");
    expect(svg).toHaveAttribute("fill", "none");
    expect(svg).toHaveAttribute("stroke-width", String(ICON.strokeWidth));
    expect(svg).toHaveAttribute("stroke-linecap", "round");
    expect(svg).toHaveAttribute("stroke-linejoin", "round");
    expect(svg).toHaveAttribute("data-slot", "icon");
    expect(svg.querySelector("title")).toBeNull();
    expect(svg.children).toHaveLength(GLYPHS.orbit.nodes.length);
  });

  it("title 을 주면 이름 있는 그림 — role=img · <title> · aria-hidden 없음", () => {
    const { getByRole } = render(<subpath.IconMove title="Move" />);
    const svg = getByRole("img", { name: "Move" });
    expect(svg).not.toHaveAttribute("aria-hidden");
    expect(svg.querySelector("title")).toHaveTextContent("Move");
  });

  it("size · className · 나머지 속성 · ref 가 svg 에 닿고, 소비자가 기본값을 덮을 수 있다", () => {
    const ref = createRef<SVGSVGElement>();
    const { container } = render(
      <subpath.IconSnap ref={ref} size="1.5em" className="size-4" strokeWidth={1.5} data-testid="snap" />,
    );
    const svg = container.querySelector("svg")!;
    expect(ref.current).toBe(svg);
    expect(svg).toHaveAttribute("width", "1.5em");
    expect(svg).toHaveClass("size-4");
    expect(svg).toHaveAttribute("stroke-width", "1.5");
    expect(svg).toHaveAttribute("data-testid", "snap");
  });

  it("ICON.size(16)는 토큰 --size-icon-md 와 같다", () => {
    const dimension = JSON.parse(readFileSync(`${PKG_DIR}tokens/primitive/dimension.json`, "utf8")) as {
      size: { icon: { md: { $value: string } } };
    };
    expect(dimension.size.icon.md.$value).toBe(`${ICON.size}px`);
  });
});
