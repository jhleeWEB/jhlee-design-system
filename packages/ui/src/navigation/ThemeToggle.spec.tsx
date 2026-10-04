import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { ThemeToggle } from "./ThemeToggle";
import * as stories from "./ThemeToggle.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 유일한 픽스처다. */
describeComponentContract(stories, { slot: "theme-toggle" });

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("data-theme");
  window.localStorage.clear();
});

describe("ThemeToggle(#112)", () => {
  it("이름과 아이콘은 누르면 갈 테마를 말하고, 누르면 html[data-theme] 이 뒤집힌다", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    // jsdom 에는 matchMedia 가 없다 — system 은 라이트로 풀린다.
    const button = screen.getByRole("button", { name: "Switch to dark theme" });
    expect(button).toHaveAttribute("title", "Switch to dark theme");

    await user.click(button);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(await screen.findByRole("button", { name: "Switch to light theme" })).toBe(button);

    await user.click(button);
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(await screen.findByRole("button", { name: "Switch to dark theme" })).toBe(button);
  });

  it("storageKey 를 주면 고른 테마를 저장한다", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle storageKey="jds-theme" />);
    await user.click(screen.getByRole("button", { name: "Switch to dark theme" }));
    expect(window.localStorage.getItem("jds-theme")).toBe("dark");
  });

  it("disabled 면 누를 수 없다", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle disabled />);
    await user.click(screen.getByRole("button"));
    expect(document.documentElement).not.toHaveAttribute("data-theme");
  });
});
