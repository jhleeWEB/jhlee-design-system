import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { MediaCard } from "./MediaCard";
import * as stories from "./MediaCard.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 유일한 픽스처다. 같은 모듈의 부품은 render-all.spec 의 FIXTURES 가 돈다(#48). */
describeComponentContract(stories, { slot: "media-card", axes: ["orientation", "elevation"] });

afterEach(cleanup);

/* 자르기는 기본이고 푸는 것이 선택이다 — 소비 레포가 잘리면 안 되는 근거 문장을 `meta` 자리에 넣어 우회했다(#103). */
describe("MediaCard descriptionLines", () => {
  const sentence = "Rear setback is 4.5 m against a required 6.0 m under regulation 41(2).";

  it("기본은 두 줄에서 자른다", () => {
    render(<MediaCard title="Candidate 03" description={sentence} />);
    const description = screen.getByText(sentence);
    expect(description).toHaveClass("line-clamp-2");
    expect(description).toHaveAttribute("data-lines", "2");
  });

  it("3 은 세 줄에서 자른다", () => {
    render(<MediaCard title="Candidate 03" description={sentence} descriptionLines={3} />);
    const description = screen.getByText(sentence);
    expect(description).toHaveClass("line-clamp-3");
    expect(description).not.toHaveClass("line-clamp-2");
  });

  it("none 은 자르지 않는다", () => {
    render(<MediaCard title="Candidate 03" description={sentence} descriptionLines="none" />);
    const description = screen.getByText(sentence);
    expect(description.className).not.toMatch(/line-clamp/);
    expect(description).toHaveAttribute("data-lines", "none");
  });
});
