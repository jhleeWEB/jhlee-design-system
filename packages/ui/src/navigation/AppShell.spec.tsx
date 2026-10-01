import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { AppShell, type AppShellProps } from "./AppShell";
import * as stories from "./AppShell.stories";
import { TopBar } from "./TopBar";

/* 공통 계약을 스토리 `Default` 로 — 탐침은 셸 뿌리에 얹힌다. */
describeComponentContract(stories, { slot: "app-shell", axes: ["variant"] });

afterEach(cleanup);
beforeEach(() => window.localStorage.clear());

function Shell(props: Partial<AppShellProps>) {
  const [open, setOpen] = useState(true);
  return (
    <AppShell
      inspectorId="inspector"
      inspectorOpen={open}
      onInspectorOpenChange={setOpen}
      topBar={
        <TopBar
          title="Studio"
          actions={
            <button
              type="button"
              aria-controls="inspector"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              Toggle inspector
            </button>
          }
        />
      }
      sidebar={<nav aria-label="Main">Nav</nav>}
      inspector={<button type="button">Inside inspector</button>}
      footer={<footer>Status</footer>}
      {...props}
    >
      Canvas
    </AppShell>
  );
}

describe("AppShell 동작", () => {
  it("랜드마크 — 상단바(banner) · 내비게이션 · 본문(main) · 인스펙터(complementary) · 바닥줄", () => {
    render(<Shell />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Canvas");
    expect(screen.getByRole("complementary", { name: "Inspector" })).toHaveAttribute("id", "inspector");
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Status");
    // resizable 이 아니면 손잡이가 없다.
    expect(screen.queryByRole("separator")).toBeNull();
  });

  it("상단바 토글로 접으면 인스펙터가 inert 가 되고, 안에 있던 포커스는 토글로 돌아온다", async () => {
    const user = userEvent.setup();
    render(<Shell />);
    const inspector = screen.getByRole("complementary", { name: "Inspector" });
    screen.getByRole("button", { name: "Inside inspector" }).focus();
    // 키보드 사용자가 인스펙터 안에서 단축키로 닫는 상황 — 여기서는 토글 버튼의 클릭 핸들러를 포커스 이동 없이 부른다.
    screen.getByRole("button", { name: "Toggle inspector" }).click();
    await vi.waitFor(() => expect(inspector).toHaveAttribute("data-state", "closed"));
    expect(inspector).toHaveAttribute("inert");
    expect(screen.getByRole("button", { name: "Toggle inspector" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Toggle inspector" }));
    expect(inspector).toHaveAttribute("data-state", "open");
    expect(inspector).not.toHaveAttribute("inert");
  });

  it("resizable 이면 손잡이가 생기고 Enter 가 onInspectorOpenChange 로 닫는다 · 화살표가 폭을 바꾼다", async () => {
    const user = userEvent.setup();
    render(<Shell resizable inspectorDefaultSize={320} inspectorMinSize={240} inspectorMaxSize={480} />);
    const handle = screen.getByRole("separator", { name: "Resize inspector" });
    expect(handle).toHaveAttribute("aria-controls", "inspector");
    expect(handle).toHaveAttribute("aria-valuenow", "320");
    handle.focus();
    // 인스펙터는 손잡이 뒤에 있다 — ← 가 키운다.
    await user.keyboard("{ArrowLeft}");
    expect(handle).toHaveAttribute("aria-valuenow", "336");
    await user.keyboard("{End}");
    expect(handle).toHaveAttribute("aria-valuenow", "480");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("complementary", { name: "Inspector", hidden: true })).toHaveAttribute(
      "data-state",
      "closed",
    );
    expect(screen.getByRole("button", { name: "Toggle inspector" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("storageKey 를 주면 끌어서 정한 인스펙터 폭이 남는다", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Shell resizable inspectorDefaultSize={320} storageKey="shell" />);
    screen.getByRole("separator").focus();
    await user.keyboard("{ArrowLeft}");
    unmount();
    render(<Shell resizable inspectorDefaultSize={320} storageKey="shell" />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-valuenow", "336");
    expect(JSON.parse(window.localStorage.getItem("shell")!)).toEqual({
      sizes: { inspector: 336 },
      collapsed: {},
    });
  });

  it("mainAs='div' 는 main 랜드마크를 세우지 않고, 인스펙터가 없으면 칸도 없다", () => {
    render(
      <AppShell mainAs="div" variant="inset">
        Canvas
      </AppShell>,
    );
    expect(screen.queryByRole("main")).toBeNull();
    expect(screen.queryByRole("complementary")).toBeNull();
    expect(document.querySelector('[data-slot="app-shell"]')).toHaveAttribute("data-variant", "inset");
    expect(document.querySelector('[data-slot="app-shell-main"]')).toHaveTextContent("Canvas");
  });
});
