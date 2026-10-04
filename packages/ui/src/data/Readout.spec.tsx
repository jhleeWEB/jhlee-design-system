import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { toneValues } from "../lib/tone";
import { Readout, ReadoutItem } from "./Readout";
import * as stories from "./Readout.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 픽스처다. 칸(ReadoutItem)은 render-all.spec 의 부품 픽스처가 돈다. */
describeComponentContract(stories, { slot: "readout", axes: ["size", "variant"] });

afterEach(cleanup);

describe("Readout 렌더", () => {
  it("이름–값 목록이다 — 칸마다 dt(라벨) · dd(값 · 단위)", () => {
    render(
      <Readout>
        <ReadoutItem label="Coverage" value="42.5" unit="%" />
      </Readout>,
    );
    const term = screen.getByText("Coverage");
    expect(term.tagName).toBe("DT");
    const detail = term.nextElementSibling;
    expect(detail?.tagName).toBe("DD");
    expect(detail).toHaveTextContent("42.5%");
    expect(detail).toHaveClass("tnum");
  });

  it.each(toneValues)("tone=%s 는 data-tone 을 찍고 값 글자에만 그 톤 색을 입힌다", (tone) => {
    render(
      <Readout>
        <ReadoutItem label="Height" value="68.4" unit="m" tone={tone} status="Status text" />
      </Readout>,
    );
    const item = screen.getByText("Height").closest('[data-slot="readout-item"]');
    expect(item).toHaveAttribute("data-tone", tone);
    const detail = screen.getByText("Height").nextElementSibling;
    expect(detail).toHaveClass(tone === "neutral" ? "text-foreground" : `text-${tone}`);
    // 라벨은 판정색을 받지 않는다 — 판정은 값과 status 글자가 말한다.
    expect(screen.getByText("Height")).toHaveClass("text-muted-foreground");
    expect(screen.getByText("Status text")).toHaveAttribute("data-slot", "readout-status");
  });

  it("tone 이 없으면 neutral 이고 status 글자도 없다", () => {
    render(
      <Readout>
        <ReadoutItem label="Units" value="412" />
      </Readout>,
    );
    expect(screen.getByText("Units").closest("[data-tone]")).toHaveAttribute("data-tone", "neutral");
    expect(document.querySelector('[data-slot="readout-status"]')).toBeNull();
  });

  it("kind=status 는 값 자리의 글자를 mono 가 아니라 sans 본문 글자로 그린다 — 판정 톤이면 점이 붙는다(#106)", () => {
    render(
      <Readout>
        <ReadoutItem label="Units" value="412" />
        <ReadoutItem label="Contact status" kind="status" value="Contacts checked" tone="success" />
        <ReadoutItem label="Assembly" kind="status" value="Fixed layout" />
      </Readout>,
    );
    const checked = screen.getByText("Contact status").nextElementSibling;
    expect(checked?.tagName).toBe("DD");
    expect(checked).toHaveTextContent("Contacts checked");
    expect(checked).toHaveClass("font-sans", "text-body", "text-success");
    expect(checked).not.toHaveClass("tnum");
    expect(checked).not.toHaveClass("text-readout");
    expect(checked?.closest('[data-slot="readout-item"]')).toHaveAttribute("data-kind", "status");
    const dot = checked?.querySelector('[data-slot="readout-dot"]');
    expect(dot).toHaveAttribute("aria-hidden", "true");

    // neutral 은 판정이 아니다 — 점 없이 글자만.
    const assembly = screen.getByText("Assembly").nextElementSibling;
    expect(assembly).toHaveClass("font-sans", "text-foreground");
    expect(assembly?.querySelector('[data-slot="readout-dot"]')).toBeNull();

    // 기본은 수치 칸이다.
    const units = screen.getByText("Units").nextElementSibling;
    expect(units).toHaveClass("tnum");
    expect(units?.closest('[data-slot="readout-item"]')).toHaveAttribute("data-kind", "value");
  });

  it("live 면 aria-live=polite, 기본은 낭독하지 않는다", () => {
    const { rerender } = render(
      <Readout aria-label="Metrics">
        <ReadoutItem label="Units" value="412" />
      </Readout>,
    );
    const list = document.querySelector('[data-slot="readout"]');
    expect(list).not.toHaveAttribute("aria-live");
    rerender(
      <Readout aria-label="Metrics" live>
        <ReadoutItem label="Units" value="412" />
      </Readout>,
    );
    expect(list).toHaveAttribute("aria-live", "polite");
  });
});
