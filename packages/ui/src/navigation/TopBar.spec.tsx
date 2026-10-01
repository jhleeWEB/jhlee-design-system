import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { TopBar } from "./TopBar";
import * as stories from "./TopBar.stories";

/* 공통 계약을 스토리 `Default` 로 — 탐침은 `<header>` 에 얹힌다. */
describeComponentContract(stories, { slot: "top-bar", axes: ["size"] });

afterEach(cleanup);

describe("TopBar 동작", () => {
  it("제목은 h1 이 기본이고 headingLevel 로 내린다", () => {
    const { unmount } = render(<TopBar title="Studio" />);
    expect(screen.getByRole("heading", { level: 1, name: "Studio" })).toBeInTheDocument();
    unmount();
    render(<TopBar title="Studio" headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "Studio" })).toBeInTheDocument();
  });

  it("슬롯은 고정 순서로 선다 — leading · 제목 · eyebrow · 브레드크럼 · children · actions", () => {
    render(
      <TopBar
        title="Title"
        eyebrow="Eyebrow"
        leading={<span>Leading</span>}
        breadcrumb={<nav aria-label="Path">Path</nav>}
        actions={<button type="button">Act</button>}
      >
        <span>Middle</span>
      </TopBar>,
    );
    const text = screen.getByRole("banner").textContent;
    expect(text).toBe("LeadingTitleEyebrowPathMiddleAct");
    expect(
      screen.getByRole("button", { name: "Act" }).closest('[data-slot="top-bar-actions"]'),
    ).not.toBeNull();
  });

  it("빈 슬롯은 자리를 남기지 않는다 · size 는 data-size 로 드러난다(기본 md)", () => {
    const { container, unmount } = render(<TopBar title="Only" />);
    const header = container.querySelector("header")!;
    expect(header.children).toHaveLength(1);
    expect(header).toHaveAttribute("data-size", "md");
    unmount();
    render(<TopBar title="Small" size="sm" />);
    expect(screen.getByRole("banner")).toHaveAttribute("data-size", "sm");
  });
});
