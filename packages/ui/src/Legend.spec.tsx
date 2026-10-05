import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { describeComponentContract } from "./__arch__/component-contract";
import { Legend, LegendItem } from "./Legend";
import * as stories from "./Legend.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 픽스처다. 항목(LegendItem)은 render-all.spec 의 부품 픽스처가 돈다. */
describeComponentContract(stories, { slot: "legend", axes: ["orientation"] });

afterEach(cleanup);

describe("Legend — 상자는 크롬, 스와치는 캔버스(#80)", () => {
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
    const tile = item.querySelector('[data-slot="legend-swatch-tile"]');
    expect(tile).toHaveAttribute("aria-hidden", "true");
    expect(tile?.querySelector('[data-slot="legend-swatch"]')).toBeInTheDocument();
  });

  it("상자는 크롬 떠 있는 패널이다 — rounded-lg · 테두리 · 카드 면 · shadow-pop · 크롬 라벨 글자", () => {
    render(
      <Legend>
        <LegendItem>Wall</LegendItem>
      </Legend>,
    );
    expect(screen.getByRole("list")).toHaveClass(
      "rounded-lg",
      "border-border",
      "bg-card",
      "shadow-pop",
      "text-label",
      "text-foreground-2",
    );
  });

  it("스와치와 타일은 캔버스 토큰만 쓴다 — 크롬 색 · 둥근 모서리 · 그림자가 없다(다크에서도 같은 픽셀)", () => {
    render(
      <Legend>
        <LegendItem swatch="muted" pattern="hatch">
          Core
        </LegendItem>
      </Legend>,
    );
    const nodes = [...document.querySelectorAll('[data-slot^="legend-swatch"]')];
    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toHaveClass("bg-canvas");
    for (const node of nodes) {
      const classes = [...node.classList];
      expect(classes.filter((c) => /^rounded-(?!none)/.test(c))).toEqual([]);
      expect(classes.filter((c) => /^shadow-/.test(c))).toEqual([]);
      expect(classes.filter((c) => /^(?:bg|text|border)-(?!canvas|current|solid|none)/.test(c))).toEqual([]);
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
    expect(line!.querySelector('[data-slot="legend-swatch"]')).toHaveClass("h-0.5", "w-3");
    expect(fallback).toHaveAttribute("data-swatch", "ink");
    expect(fallback).toHaveAttribute("data-pattern", "fill");
  });

  it("color 를 주면 swatch 대신 그 색으로 그린다 — 무늬 · 타일 · 각진 모서리는 그대로(#110)", () => {
    render(
      <Legend>
        <LegendItem color="#c2410c" pattern="outline" swatch="muted">
          Wet room
        </LegendItem>
        <LegendItem swatch="muted">Core</LegendItem>
      </Legend>,
    );
    const [custom, plain] = screen.getAllByRole("listitem");
    expect(custom).toHaveAttribute("data-swatch", "color");
    expect(custom).toHaveAttribute("data-pattern", "outline");
    expect(custom).not.toHaveAttribute("color");
    const swatch = custom!.querySelector<HTMLElement>('[data-slot="legend-swatch"]')!;
    expect(swatch.style.getPropertyValue("--legend-swatch")).toBe("#c2410c");
    expect(swatch).toHaveClass("text-(--legend-swatch)", "border-current", "rounded-none");
    expect([...swatch.classList].filter((c) => c.startsWith("text-canvas-"))).toEqual([]);
    expect(custom!.querySelector('[data-slot="legend-swatch-tile"]')).toHaveClass("bg-canvas");
    // color 가 없는 항목은 그대로 캔버스 무채색이고 인라인 스타일이 없다.
    const plainSwatch = plain!.querySelector<HTMLElement>('[data-slot="legend-swatch"]')!;
    expect(plainSwatch).toHaveClass("text-canvas-muted");
    expect(plainSwatch.getAttribute("style")).toBeNull();
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
