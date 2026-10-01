import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./Command";
import * as stories from "./Command.stories";

/* 공통 계약을 스토리 `Default` 로 — 탐침은 루트에 얹힌다(D3, #44). */
describeComponentContract(stories, { slot: "command", axes: ["surface"] });

afterEach(cleanup);

function Palette({
  onSelect,
  loop,
  onKeyDown,
}: {
  onSelect?: (value: string) => void;
  loop?: boolean;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}) {
  const select = onSelect ? { onSelect } : {};
  return (
    <Command {...(loop ? { loop } : {})}>
      <CommandInput {...(onKeyDown ? { onKeyDown } : {})} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Sheets">
          <CommandItem {...select}>Plan</CommandItem>
          <CommandItem disabled {...select}>
            Section
          </CommandItem>
          <CommandItem {...select}>Elevation</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem keywords={["print"]} shortcut="⌘P" {...select}>
            Export as PDF
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

const input = () => screen.getByRole("combobox", { name: "Commands" });
/* 단축키 칩(Kbd)의 글자도 항목 이름에 실린다(DropdownMenu 항목과 같다) — 이름의 앞부분으로 찾는다. */
const option = (name: string) => screen.getByRole("option", { name: new RegExp(`^${name}`) });

describe("Command 동작", () => {
  it("입력이 목록을 aria-controls 로, 강조 항목을 aria-activedescendant 로 가리킨다 — 처음 강조는 첫 활성 항목", () => {
    render(<Palette />);
    const listbox = screen.getByRole("listbox", { name: "Commands" });
    expect(input()).toHaveAttribute("aria-controls", listbox.id);
    expect(input()).toHaveAttribute("aria-activedescendant", option("Plan").id);
    expect(option("Plan")).toHaveAttribute("aria-selected", "true");
    expect(option("Plan")).toHaveAttribute("data-highlighted", "");
    expect(option("Section")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("group", { name: "Sheets" })).toBeInTheDocument();
    expect(screen.queryByText("No results found.")).not.toBeInTheDocument();
  });

  it("타이핑하면 맞는 항목만 남고(키워드 포함) 빈 묶음 · 구분선이 숨는다", async () => {
    const user = userEvent.setup();
    render(<Palette />);
    await user.type(input(), "print");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Export as PDF⌘P"]);
    expect(screen.queryByRole("group", { name: "Sheets" })).not.toBeInTheDocument();
    expect(document.querySelector('[data-slot="command-separator"]')).toHaveAttribute("hidden");
    expect(input()).toHaveAttribute("aria-activedescendant", option("Export as PDF").id);
  });

  it("맞는 항목이 없으면 빈 상태를 보인다", async () => {
    const user = userEvent.setup();
    render(<Palette />);
    await user.type(input(), "zzz");
    expect(screen.queryAllByRole("option")).toEqual([]);
    expect(screen.getByText("No results found.")).toHaveAttribute("data-slot", "command-empty");
    expect(input()).not.toHaveAttribute("aria-activedescendant");
  });

  it("↓/↑ 는 비활성 항목을 건너뛰고 끝에서 멈춘다 · Enter 는 강조 항목을 실행한다", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Palette onSelect={onSelect} />);
    await user.click(input());
    await user.keyboard("{ArrowDown}");
    expect(input()).toHaveAttribute("aria-activedescendant", option("Elevation").id);
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(input()).toHaveAttribute("aria-activedescendant", option("Export as PDF").id);
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(input()).toHaveAttribute("aria-activedescendant", option("Plan").id);
    await user.keyboard("{ArrowUp}");
    expect(input()).toHaveAttribute("aria-activedescendant", option("Plan").id);
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledExactlyOnceWith("Elevation");
    expect(input()).toHaveFocus();
  });

  it("loop 면 끝에서 반대편 끝으로 돈다", async () => {
    const user = userEvent.setup();
    render(<Palette loop />);
    await user.click(input());
    await user.keyboard("{ArrowUp}");
    expect(input()).toHaveAttribute("aria-activedescendant", option("Export as PDF").id);
    await user.keyboard("{ArrowDown}");
    expect(input()).toHaveAttribute("aria-activedescendant", option("Plan").id);
  });

  it("포인터로 강조하고 누르면 실행한다 — 비활성 항목은 실행하지 않는다", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Palette onSelect={onSelect} />);
    await user.pointer({ target: option("Elevation") });
    expect(option("Elevation")).toHaveAttribute("aria-selected", "true");
    await user.click(option("Section"));
    expect(onSelect).not.toHaveBeenCalled();
    await user.click(option("Export as PDF"));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith("Export as PDF");
  });

  it("입력의 소비자 onKeyDown 이 먼저 돌고 preventDefault 하면 DS 동작을 건너뛴다", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Palette onSelect={onSelect} onKeyDown={(event) => event.preventDefault()} />);
    await user.click(input());
    await user.keyboard("{ArrowDown}{Enter}");
    expect(input()).toHaveAttribute("aria-activedescendant", option("Plan").id);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("한글 IME 조합 중의 Enter 는 실행하지 않는다", () => {
    const onSelect = vi.fn();
    render(<Palette onSelect={onSelect} />);
    fireEvent.keyDown(input(), { key: "Enter", isComposing: true });
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(onSelect).toHaveBeenCalledExactlyOnceWith("Plan");
  });

  it("제어 모드 검색어 — search · onSearchChange", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    function Controlled() {
      const [search, setSearch] = useState("pl");
      return (
        <Command
          search={search}
          onSearchChange={(next) => {
            onSearchChange(next);
            setSearch(next);
          }}
        >
          <CommandInput />
          <CommandList>
            <CommandItem>Plan</CommandItem>
            <CommandItem>Section</CommandItem>
          </CommandList>
        </Command>
      );
    }
    render(<Controlled />);
    expect(input()).toHaveValue("pl");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    await user.clear(input());
    expect(onSearchChange).toHaveBeenLastCalledWith("");
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });
});

describe("CommandDialog 동작", () => {
  it("열리면 검색 입력에 포커스가 가고 Escape 로 닫힌다 — 접근성 이름은 title", async () => {
    const user = userEvent.setup();
    function Launcher() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open palette
          </button>
          <CommandDialog open={open} onOpenChange={setOpen}>
            <Command>
              <CommandInput />
              <CommandList>
                <CommandItem onSelect={() => setOpen(false)}>Plan</CommandItem>
              </CommandList>
            </Command>
          </CommandDialog>
        </>
      );
    }
    render(<Launcher />);
    await user.click(screen.getByRole("button", { name: "Open palette" }));
    const dialog = screen.getByRole("dialog", { name: "Command palette" });
    expect(dialog).toHaveAttribute("data-slot", "command-dialog");
    expect(dialog.querySelector('[data-slot="command"]')).toHaveAttribute("data-surface", "plain");
    expect(input()).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open palette" }));
    await user.keyboard("{Enter}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
