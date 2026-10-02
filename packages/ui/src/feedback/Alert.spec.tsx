import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { Alert } from "./Alert";
import * as stories from "./Alert.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 유일한 픽스처다. 실패 0 이 계약이다(#43). */
describeComponentContract(stories, { slot: "alert", axes: ["tone"] });

afterEach(cleanup);

describe("Alert 톤 표시(#78)", () => {
  it.each(["info", "success", "warning", "destructive"] as const)(
    "%s — 톤 아이콘이 있고 장식이다(판정은 제목 글자가 말한다)",
    (tone) => {
      render(<Alert tone={tone} title="Notice" />);
      const icon = document.querySelector('[data-slot="alert-icon"]');
      expect(icon).not.toBeNull();
      expect(icon).toHaveAttribute("aria-hidden", "true");
    },
  );

  it("왼쪽 띠가 없다 — 톤이 면 · 테두리 · 글자를 함께 물들인다", () => {
    render(<Alert tone="warning" title="Check" />);
    const alert = screen.getByRole("status");
    expect(alert.className).not.toMatch(/border-l-/);
    expect(alert.className).toMatch(/bg-warning-soft/);
    expect(alert.className).toMatch(/text-warning/);
  });

  it("destructive 만 끼어들어 읽힌다(role=alert), 나머지는 status", () => {
    render(<Alert tone="destructive" title="Failed" />);
    expect(screen.getByRole("alert")).toHaveAttribute("data-tone", "destructive");
    cleanup();
    render(<Alert title="Heads up" />);
    expect(screen.getByRole("status")).toHaveAttribute("data-tone", "info");
  });
});
