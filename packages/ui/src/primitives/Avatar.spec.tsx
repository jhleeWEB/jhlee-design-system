import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { Avatar, AvatarGroup } from "./Avatar";
import * as stories from "./Avatar.stories";

/* 공통 계약(slot · slot-locked · className · ref · rest · axes · axe) — 스토리 `Default` 가 유일한 픽스처다. AvatarGroup 은 render-all.spec 의 FIXTURES. */
describeComponentContract(stories, { slot: "avatar", axes: ["size"] });

afterEach(cleanup);

describe("Avatar 동작", () => {
  it("이미지가 없으면 이름의 이니셜을 이름과 함께 보인다", () => {
    render(
      <>
        <Avatar name="Grace Brewster Hopper" />
        <Avatar name="hypatia" />
      </>,
    );
    expect(screen.getByRole("img", { name: "Grace Brewster Hopper" })).toHaveTextContent(/^GH$/);
    expect(screen.getByRole("img", { name: "hypatia" })).toHaveTextContent(/^H$/);
  });

  it("묶음은 max 를 넘는 아바타를 +N 으로 접고 그 수를 말한다 — 크기는 묶음을 따른다", () => {
    render(
      <AvatarGroup aria-label="Reviewers" max={2} size="lg">
        <Avatar name="Ada Lovelace" />
        <Avatar name="Alan Turing" size="sm" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Donald Knuth" />
      </AvatarGroup>,
    );
    const group = screen.getByRole("group", { name: "Reviewers" });
    expect(within(group).getByRole("img", { name: "2 more" })).toHaveTextContent("+2");
    expect(within(group).queryByRole("img", { name: "Grace Hopper" })).not.toBeInTheDocument();
    expect(
      within(group).getByRole("img", { name: "Ada Lovelace" }).closest("[data-slot=avatar]"),
    ).toHaveAttribute("data-size", "lg");
    // 아바타가 직접 적은 size 는 묶음보다 앞선다.
    expect(
      within(group).getByRole("img", { name: "Alan Turing" }).closest("[data-slot=avatar]"),
    ).toHaveAttribute("data-size", "sm");
  });

  it("max 를 넘지 않으면 +N 이 없다", () => {
    render(
      <AvatarGroup aria-label="Pair" max={3}>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Alan Turing" />
      </AvatarGroup>,
    );
    expect(screen.queryByRole("img", { name: /more$/ })).not.toBeInTheDocument();
  });
});
