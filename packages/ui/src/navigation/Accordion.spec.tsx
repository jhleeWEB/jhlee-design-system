import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from "./Accordion";
import * as stories from "./Accordion.stories";

/* 공통 계약(slot · slot-locked · className · ref · rest · axes · axe) — 스토리 `Default` 가 유일한 픽스처다(#45). 축은 `variant`(#84). */
describeComponentContract(stories, { slot: "accordion", axes: ["variant"] });

afterEach(cleanup);

const VARIANTS = ["separated", "contained", "flush"] as const;

function Sections({ variant }: { variant: (typeof VARIANTS)[number] }) {
  return (
    <Accordion type="single" collapsible variant={variant}>
      {["Site", "Massing", "Review"].map((title) => (
        <AccordionItem key={title} value={title} disabled={title === "Massing"}>
          <AccordionHeader>
            <AccordionTrigger>{title}</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            <input aria-label={`${title} draft`} defaultValue="Saved" />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

describe("Accordion 의 variant(#84)", () => {
  it("기본은 separated 이고 뿌리 · 항목 · 트리거에 같은 data-variant 가 찍힌다", () => {
    const { container } = render(
      <Accordion type="single">
        <AccordionItem value="a">
          <AccordionHeader>
            <AccordionTrigger>Alpha</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Body</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    for (const slot of ["accordion", "accordion-item", "accordion-trigger"])
      expect(container.querySelector(`[data-slot="${slot}"]`)).toHaveAttribute("data-variant", "separated");
  });

  it("안쪽 아코디언은 바깥의 variant 를 물려받지 않는다 — 자기 뿌리의 값을 찍는다", () => {
    render(
      <Accordion type="single" defaultValue="outer" variant="flush">
        <AccordionItem value="outer">
          <AccordionHeader>
            <AccordionTrigger>Outer</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            <Accordion type="single" variant="contained">
              <AccordionItem value="inner">
                <AccordionHeader>
                  <AccordionTrigger>Inner</AccordionTrigger>
                </AccordionHeader>
                <AccordionContent>Body</AccordionContent>
              </AccordionItem>
            </Accordion>
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByRole("button", { name: "Outer" })).toHaveAttribute("data-variant", "flush");
    expect(screen.getByRole("button", { name: "Inner" })).toHaveAttribute("data-variant", "contained");
  });

  it.each(VARIANTS)("%s — 여닫기 · 초안 보존 · 키보드 이동(비활성 건너뛰기)이 같다", async (variant) => {
    const user = userEvent.setup();
    const { container } = render(<Sections variant={variant} />);
    expect(container.querySelector("[data-slot=accordion]")).toHaveAttribute("data-variant", variant);
    const site = screen.getByRole("button", { name: "Site" });
    const review = screen.getByRole("button", { name: "Review" });

    await user.click(site);
    expect(site).toHaveAttribute("aria-expanded", "true");
    const draft = screen.getByRole("textbox", { name: "Site draft" });
    fireEvent.change(draft, { target: { value: "Unsaved" } });

    // 접어도 본문은 DOM 에 남아 초안이 그대로다(forceMount + inert).
    await user.click(site);
    expect(site).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("textbox", { name: "Site draft" })).toBeNull();
    await user.click(site);
    expect(screen.getByRole("textbox", { name: "Site draft" })).toHaveValue("Unsaved");

    // 화살표는 비활성 «Massing» 을 건너뛴다.
    site.focus();
    await user.keyboard("{ArrowDown}");
    expect(review).toHaveFocus();
    await user.keyboard("{Home}");
    expect(site).toHaveFocus();
  });
});
