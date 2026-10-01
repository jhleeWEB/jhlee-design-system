import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { describeComponentContract } from "./__arch__/component-contract";
import { Legend, LegendItem } from "./Legend";
import * as stories from "./Legend.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 픽스처다. 항목(LegendItem)은 render-all.spec 의 부품 픽스처가 돈다. */
describeComponentContract(stories, { slot: "legend", axes: ["orientation"] });

afterEach(cleanup);

describe("Legend — 캔버스 컴포넌트", () => {
  it("이름 있는 목록이고 스와치는 장식이다 — 스크린리더는 라벨만 읽는다", () => {
    render(
      <Legend>
        <LegendItem swatch="ink">Wall</LegendItem>
      </Legend>,
    );
    expect(screen.getByRole("list", { name: "Legend" })).toBeInTheDocument();
    const item = screen.getByRole("listitem");
    expect(item).toHaveAccessibleName("");
    expect(item).toHaveTextContent("Wall");
    expect(item.querySelector('[data-slot="legend-swatch"]')).toHaveAttribute("aria-hidden", "true");
  });

  it("캔버스 토큰만 쓴다 — 크롬 색 · 둥근 모서리 · 그림자가 없다", () => {
    render(
      <Legend>
        <LegendItem swatch="muted" pattern="hatch">
          Core
        </LegendItem>
      </Legend>,
    );
    const nodes = [screen.getByRole("list"), ...document.querySelectorAll('[data-slot^="legend"]')];
    for (const node of nodes) {
      const classes = [...node.classList];
      expect(classes.filter((c) => /^rounded-(?!none)/.test(c))).toEqual([]);
      expect(classes.filter((c) => /^shadow-/.test(c))).toEqual([]);
      expect(
        classes.filter(
          (c) => /^(?:bg|text|border)-(?!canvas|current|solid|none)/.test(c) && !/^text-micro$/.test(c),
        ),
      ).toEqual([]);
    }
  });

  it("swatch · pattern 이 data 속성과 스와치 클래스로 찍힌다", () => {
    render(
      <Legend orientation="horizontal">
        <LegendItem swatch="line-strong" pattern="outline">
          Boundary
        </LegendItem>
        <LegendItem swatch="ink-2" pattern="line">
          Dimension
        </LegendItem>
        <LegendItem>Default</LegendItem>
      </Legend>,
    );
    expect(screen.getByRole("list")).toHaveAttribute("data-orientation", "horizontal");
    const [outline, line, fallback] = screen.getAllByRole("listitem");
    expect(outline).toHaveAttribute("data-swatch", "line-strong");
    expect(outline).toHaveAttribute("data-pattern", "outline");
    expect(outline!.querySelector('[data-slot="legend-swatch"]')).toHaveClass(
      "text-canvas-line-strong",
      "border-current",
    );
    expect(line!.querySelector('[data-slot="legend-swatch"]')).toHaveClass("h-0.5", "w-4");
    expect(fallback).toHaveAttribute("data-swatch", "ink");
    expect(fallback).toHaveAttribute("data-pattern", "fill");
  });

  it("aria-label 로 이름을 바꾼다", () => {
    render(
      <Legend aria-label="Plan legend">
        <LegendItem>Wall</LegendItem>
      </Legend>,
    );
    expect(screen.getByRole("list", { name: "Plan legend" })).toBeInTheDocument();
  });
});
