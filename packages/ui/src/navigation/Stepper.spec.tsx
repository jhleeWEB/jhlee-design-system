import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { Stepper } from "./Stepper";
import * as stories from "./Stepper.stories";

/* 공통 계약(slot · slot-locked · className · ref · rest · axes · axe) — 스토리 `Default` 가 유일한 픽스처다. */
describeComponentContract(stories, { slot: "stepper", axes: ["orientation", "status"] });

afterEach(cleanup);

const steps = [
  { label: "Site" },
  { label: "Massing" },
  { label: "Units", status: "error" as const },
  { label: "Export" },
];

describe("Stepper 동작", () => {
  it("순서 있는 목록이고, current 앞은 끝남 · 같으면 지금 · 뒤는 대기다 — 상태는 글자로도 읽힌다", () => {
    render(<Stepper aria-label="Progress" steps={steps} current={1} />);
    const list = screen.getByRole("list", { name: "Progress" });
    expect(list.tagName).toBe("OL");
    const items = screen.getAllByRole("listitem");
    expect(items.map((li) => li.getAttribute("data-status"))).toEqual([
      "complete",
      "current",
      "error",
      "upcoming",
    ]);
    expect(items.map((li) => li.textContent)).toEqual([
      "SiteComplete",
      "2MassingCurrent",
      "UnitsError",
      "4ExportUpcoming",
    ]);
    expect(items.filter((li) => li.getAttribute("aria-current") === "step")).toEqual([items[1]]);
  });

  it("current 가 단계 수 이상이면 전부 끝났고 aria-current 가 없다", () => {
    render(<Stepper steps={[{ label: "A" }, { label: "B" }]} current={2} orientation="vertical" />);
    const items = screen.getAllByRole("listitem");
    expect(items.every((li) => li.getAttribute("data-status") === "complete")).toBe(true);
    expect(items.some((li) => li.hasAttribute("aria-current"))).toBe(false);
    expect(screen.getByRole("list")).toHaveAttribute("data-orientation", "vertical");
  });
});
