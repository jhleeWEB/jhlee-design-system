import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "./ContextMenu";
import * as stories from "./ContextMenu.stories";

/* 공통 계약(slot · slot-locked · className · ref · rest · axes · axe)을 스토리 `Default` 로 — 스토리가 마운트 때 우클릭을 보내 연다(D3, #44). */
describeComponentContract(stories, { slot: "context-menu" });

afterEach(cleanup);

function Sheet({ onSelect }: { onSelect?: (action: string) => void }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>Sheet A-101</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => onSelect?.("copy")}>Copy</ContextMenuItem>
        <ContextMenuItem disabled>Paste</ContextMenuItem>
        <ContextMenuItem tone="destructive" onSelect={() => onSelect?.("delete")}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

describe("ContextMenu 동작", () => {
  it("우클릭하면 메뉴가 열리고 첫 항목으로 화살표가 움직인다 — 비활성은 건너뛴다", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Sheet onSelect={onSelect} />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await user.pointer({ keys: "[MouseRight]", target: screen.getByText("Sheet A-101") });
    const menu = await screen.findByRole("menu");
    expect(menu).toHaveAttribute("data-slot", "context-menu");
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Copy" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledExactlyOnceWith("delete");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("Escape 는 실행하지 않고 닫는다", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Sheet onSelect={onSelect} />);
    await user.pointer({ keys: "[MouseRight]", target: screen.getByText("Sheet A-101") });
    await screen.findByRole("menu");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("왼쪽 클릭으로는 열리지 않는다 — 우클릭 영역은 버튼이 아니다", async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    await user.click(screen.getByText("Sheet A-101"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.getByText("Sheet A-101")).toHaveAttribute("data-slot", "context-menu-trigger");
  });
});
