import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { Pagination } from "./Pagination";
import * as stories from "./Pagination.stories";

/* 공통 계약(slot · slot-locked · className · ref · rest · axes · axe) — 스토리 `Default` 가 유일한 픽스처다. PaginationLink 는 render-all.spec 의 FIXTURES. */
describeComponentContract(stories, { slot: "pagination", axes: ["size"] });

afterEach(cleanup);

/** 칸의 글자를 순서대로 — 생략은 «More pages»(sr-only)로 읽힌다. */
function items(): string[] {
  return within(screen.getByRole("list"))
    .getAllByRole("listitem")
    .map((li) => li.textContent ?? "");
}

describe("Pagination 동작", () => {
  it("첫 · 끝 · 지금 ± 이웃만 보이고 나머지는 생략한다 — 한 쪽만 건너뛰면 그 번호를 채운다", () => {
    const { rerender } = render(<Pagination page={10} pageCount={20} />);
    expect(items()).toEqual(["Previous", "1", "More pages", "9", "10", "11", "More pages", "20", "Next"]);

    rerender(<Pagination page={4} pageCount={20} />);
    expect(items()).toEqual(["Previous", "1", "2", "3", "4", "5", "More pages", "20", "Next"]);

    rerender(<Pagination page={20} pageCount={20} siblingCount={0} />);
    expect(items()).toEqual(["Previous", "1", "More pages", "18", "19", "20", "Next"]);

    rerender(<Pagination page={2} pageCount={7} />);
    expect(items()).toEqual(["Previous", "1", "2", "3", "4", "5", "6", "7", "Next"]);
  });

  it("버튼 모드 — 번호 · 이전 · 다음이 onPageChange 를 부르고 끝에서는 비활성이다", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={1} pageCount={3} onPageChange={onPageChange} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Page 3" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onPageChange.mock.calls).toEqual([[3], [2]]);

    // 키보드로도 같다 — 비활성 이전 칸은 Tab 순서에 없다.
    (document.activeElement as HTMLElement | null)?.blur();
    await user.tab();
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveFocus();
  });

  it("링크 모드 — renderLink 요소에 칸이 얹혀 href · aria-current · 내용을 받고, 끝의 이전 칸은 링크가 아니다", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination
        page={1}
        pageCount={4}
        onPageChange={onPageChange}
        renderLink={(page, children) => (
          <a href={`#page-${page}`} onClick={(e) => e.preventDefault()}>
            {children}
          </a>
        )}
      />,
    );
    const current = screen.getByRole("link", { name: "Page 1" });
    expect(current).toHaveAttribute("href", "#page-1");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveAttribute("data-slot", "pagination-link");
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "#page-2");
    expect(screen.queryByRole("link", { name: "Previous" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();

    await user.click(screen.getByRole("link", { name: "Page 4" }));
    expect(onPageChange).toHaveBeenCalledExactlyOnceWith(4);
  });

  it("범위 밖의 page 는 끝으로 깎는다", () => {
    render(<Pagination page={99} pageCount={3} />);
    expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });
});
