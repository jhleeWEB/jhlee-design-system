import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { Slider } from "./Slider";
import * as stories from "./Slider.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 픽스처다. className 은 바깥 래퍼, ref · rest 는 조작부(Radix 루트)로 간다(Slider 머리 주석). */
describeComponentContract(stories, { slot: "slider", axes: ["size"] });

afterEach(cleanup);

describe("Slider 동작", () => {
  it("화살표는 step 만큼, PageUp 은 크게, Home/End 는 경계로 — 값은 min–max 를 넘지 않는다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Slider aria-label="Setback" defaultValue={[98]} max={100} step={1} onValueChange={onValueChange} />,
    );
    const thumb = screen.getByRole("slider", { name: "Setback" });
    thumb.focus();

    await user.keyboard("{ArrowRight}");
    expect(thumb).toHaveAttribute("aria-valuenow", "99");
    await user.keyboard("{ArrowUp}{ArrowUp}{ArrowUp}");
    expect(thumb).toHaveAttribute("aria-valuenow", "100");
    await user.keyboard("{ArrowLeft}");
    expect(thumb).toHaveAttribute("aria-valuenow", "99");
    await user.keyboard("{Home}");
    expect(thumb).toHaveAttribute("aria-valuenow", "0");
    await user.keyboard("{PageUp}");
    expect(Number(thumb.getAttribute("aria-valuenow"))).toBeGreaterThan(1);
    await user.keyboard("{End}");
    expect(thumb).toHaveAttribute("aria-valuenow", "100");
    expect(onValueChange).toHaveBeenLastCalledWith([100]);
  });

  it("범위는 손잡이 둘 — 이름은 «이름 minimum/maximum», 서로를 넘지 않는다", async () => {
    const user = userEvent.setup();
    render(<Slider aria-label="Height" defaultValue={[20, 21]} />);
    const low = screen.getByRole("slider", { name: "Height minimum" });
    const high = screen.getByRole("slider", { name: "Height maximum" });
    expect(low).toHaveAttribute("aria-valuenow", "20");
    expect(high).toHaveAttribute("aria-valuenow", "21");
    low.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
    // Radix 는 기본으로 손잡이가 겹치기까지만 민다(minStepsBetweenThumbs 0) — 아래 손잡이는 위 손잡이 값을 넘지 않는다.
    expect(Number(low.getAttribute("aria-valuenow"))).toBeLessThanOrEqual(
      Number(high.getAttribute("aria-valuenow")),
    );
  });

  it("showValue 는 비제어여도 드래그 · 키보드의 값을 따라가고, formatValue 가 표기와 aria-valuetext 를 함께 만든다", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Slider aria-label="Setback" defaultValue={[4]} max={10} showValue formatValue={(v) => `${v} m`} />,
    );
    const value = container.querySelector('[data-slot="slider-value"]');
    expect(value).toHaveTextContent("4 m");
    expect(value).toHaveAttribute("aria-hidden", "true");
    expect(value).toHaveClass("tnum");
    const thumb = screen.getByRole("slider", { name: "Setback" });
    expect(thumb).toHaveAttribute("aria-valuetext", "4 m");
    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(value).toHaveTextContent("5 m");
    expect(thumb).toHaveAttribute("aria-valuetext", "5 m");
  });

  it("제어 값은 부모가 든다 — 부모가 값을 바꾸지 않으면 손잡이도 그대로다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Slider aria-label="Setback" value={[30]} onValueChange={onValueChange} />);
    const thumb = screen.getByRole("slider", { name: "Setback" });
    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenCalledWith([31]);
    expect(thumb).toHaveAttribute("aria-valuenow", "30");
  });

  it("onValueCommit 은 키보드 조작이 끝날 때 한 번 온다", () => {
    const onValueCommit = vi.fn();
    render(<Slider aria-label="Setback" defaultValue={[10]} onValueCommit={onValueCommit} />);
    const thumb = screen.getByRole("slider", { name: "Setback" });
    fireEvent.keyDown(thumb, { key: "ArrowRight" });
    expect(onValueCommit).toHaveBeenCalledExactlyOnceWith([11]);
  });

  it("marks 는 범위 안의 눈금만 장식으로 그린다", () => {
    const { container } = render(
      <Slider
        aria-label="Setback"
        min={0}
        max={10}
        marks={[
          { value: 0, label: "0" },
          { value: 5, label: "5" },
          { value: 10, label: "10" },
          { value: 12, label: "12" },
        ]}
      />,
    );
    const row = container.querySelector('[data-slot="slider-marks"]');
    expect(row).toHaveAttribute("aria-hidden", "true");
    expect(row).toHaveTextContent("0510");
    expect(row).not.toHaveTextContent("12");
  });

  it("disabled 면 손잡이가 탭 순서에서 빠지고 키보드가 값을 바꾸지 않는다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Slider aria-label="Setback" defaultValue={[10]} disabled onValueChange={onValueChange} />);
    const thumb = screen.getByRole("slider", { name: "Setback" });
    expect(thumb).not.toHaveAttribute("tabindex");
    await user.tab();
    expect(thumb).not.toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("aria-label 은 루트가 아니라 손잡이에 달린다 — 역할 없는 span 의 이름은 axe 위반이다", () => {
    const { container } = render(<Slider aria-label="Setback" />);
    expect(container.querySelector('[data-slot="slider-control"]')).not.toHaveAttribute("aria-label");
    expect(screen.getByRole("slider")).toHaveAccessibleName("Setback");
  });
});
