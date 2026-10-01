import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanels,
  type ResizablePanelsProps,
} from "./ResizablePanels";
import * as stories from "./ResizablePanels.stories";

/* 공통 계약을 스토리 `Default` 로 — 탐침은 묶음 뿌리에 얹힌다. 부품(ResizablePanel · ResizableHandle)은 render-all 픽스처가 본다. */
describeComponentContract(stories, { slot: "resizable-panels", axes: ["orientation"] });

afterEach(cleanup);
beforeEach(() => window.localStorage.clear());

/* jsdom 에는 레이아웃이 없다 — getBoundingClientRect 가 전부 0 이라 «맞은편 이웃까지» 상한은 걸리지 않고 maxSize 만 남는다(컴포넌트 주석). */
function Group({
  onCollapsedChange,
  startCollapsible = true,
  ...props
}: Partial<ResizablePanelsProps> & {
  onCollapsedChange?: (v: boolean) => void;
  startCollapsible?: boolean;
}) {
  return (
    <ResizablePanels {...props}>
      <ResizablePanel
        id="start"
        defaultSize={200}
        minSize={120}
        maxSize={320}
        collapsible={startCollapsible}
        {...(onCollapsedChange ? { onCollapsedChange } : {})}
      >
        Layers
      </ResizablePanel>
      <ResizableHandle controls="start" label="Resize layers" />
      <ResizablePanel id="canvas" className="flex-1">
        Canvas
      </ResizablePanel>
      <ResizableHandle controls="end" label="Resize inspector" />
      <ResizablePanel id="end" defaultSize={240} minSize={160} maxSize={400}>
        Inspector
      </ResizablePanel>
    </ResizablePanels>
  );
}

const handle = (name: string) => screen.getByRole("separator", { name });

describe("ResizablePanels 동작", () => {
  it("손잡이는 separator 이고 값 · 한계 · 조절 대상을 싣는다 — 방향은 묶음에 수직이다", () => {
    render(<Group />);
    const layers = handle("Resize layers");
    expect(layers).toHaveAttribute("aria-valuenow", "200");
    // 접을 수 있는 패널의 하한은 접힌 크기(0)다 — Enter 로 거기까지 간다.
    expect(layers).toHaveAttribute("aria-valuemin", "0");
    expect(layers).toHaveAttribute("aria-valuemax", "320");
    expect(layers).toHaveAttribute("aria-controls", "start");
    expect(layers).toHaveAttribute("aria-orientation", "vertical");
    expect(layers).toHaveAttribute("tabindex", "0");
    expect(handle("Resize inspector")).toHaveAttribute("aria-valuemin", "160");
    expect(document.getElementById("start")).toHaveStyle({ width: "200px" });
    // 크기 없는 패널은 인라인 크기를 받지 않는다 — 남는 폭은 className(flex-1)이 정한다.
    expect(document.getElementById("canvas")).not.toHaveAttribute("style");
  });

  it("화살표는 보폭(16)만큼, Shift 는 네 배 — 앞 패널은 → 로 커지고 뒤 패널은 → 로 작아진다", async () => {
    const user = userEvent.setup();
    render(<Group />);
    await user.tab();
    expect(handle("Resize layers")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(handle("Resize layers")).toHaveAttribute("aria-valuenow", "216");
    expect(document.getElementById("start")).toHaveStyle({ width: "216px" });
    await user.keyboard("{Shift>}{ArrowLeft}{/Shift}");
    expect(handle("Resize layers")).toHaveAttribute("aria-valuenow", "152");

    await user.tab();
    expect(handle("Resize inspector")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(handle("Resize inspector")).toHaveAttribute("aria-valuenow", "224");
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(handle("Resize inspector")).toHaveAttribute("aria-valuenow", "256");
  });

  it("Home 은 하한, End 는 상한 — 화살표도 한계 밖으로 나가지 않는다", async () => {
    const user = userEvent.setup();
    render(<Group />);
    handle("Resize layers").focus();
    await user.keyboard("{End}");
    expect(handle("Resize layers")).toHaveAttribute("aria-valuenow", "320");
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(handle("Resize layers")).toHaveAttribute("aria-valuenow", "320");
    await user.keyboard("{Home}");
    expect(handle("Resize layers")).toHaveAttribute("aria-valuenow", "120");
    await user.keyboard("{ArrowLeft}");
    expect(handle("Resize layers")).toHaveAttribute("aria-valuenow", "120");
  });

  it("세로 묶음은 ↑↓ 로 높이를 바꾸고 손잡이는 가로선이다", async () => {
    const user = userEvent.setup();
    render(<Group orientation="vertical" />);
    const layers = handle("Resize layers");
    expect(layers).toHaveAttribute("aria-orientation", "horizontal");
    layers.focus();
    await user.keyboard("{ArrowRight}");
    expect(layers).toHaveAttribute("aria-valuenow", "200");
    await user.keyboard("{ArrowDown}");
    expect(layers).toHaveAttribute("aria-valuenow", "216");
    expect(document.getElementById("start")).toHaveStyle({ height: "216px" });
  });

  it("Enter · 더블클릭으로 접고 편다 — 접힌 패널은 마운트를 유지한 채 inert 다", async () => {
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();
    render(<Group onCollapsedChange={onCollapsedChange} />);
    const layers = handle("Resize layers");
    const panel = document.getElementById("start")!;
    layers.focus();
    await user.keyboard("{Enter}");
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
    expect(panel).toHaveAttribute("data-state", "closed");
    expect(panel).toHaveAttribute("inert");
    expect(panel).toHaveTextContent("Layers");
    expect(layers).toHaveAttribute("aria-valuenow", "0");
    // 줄이는 쪽 화살표는 할 일이 없고, 키우는 쪽은 접기 전 크기로 편다.
    await user.keyboard("{ArrowLeft}");
    expect(panel).toHaveAttribute("data-state", "closed");
    await user.keyboard("{ArrowRight}");
    expect(panel).toHaveAttribute("data-state", "open");
    expect(layers).toHaveAttribute("aria-valuenow", "200");
    await user.dblClick(layers);
    expect(panel).toHaveAttribute("data-state", "closed");
    await user.dblClick(layers);
    expect(panel).toHaveAttribute("data-state", "open");
    expect(onCollapsedChange.mock.calls.map(([v]) => v)).toEqual([true, false, true, false]);
  });

  it("접을 수 없는 패널은 Enter 에 반응하지 않는다", async () => {
    const user = userEvent.setup();
    render(<Group startCollapsible={false} />);
    handle("Resize layers").focus();
    await user.keyboard("{Enter}");
    expect(document.getElementById("start")).toHaveAttribute("data-state", "open");
    expect(handle("Resize layers")).toHaveAttribute("aria-valuemin", "120");
  });

  it("끌기 — 포인터 이동만큼 크기가 바뀌고 한계에서 멈추며, 하한의 절반 아래로 끌면 접힌다", async () => {
    const user = userEvent.setup();
    render(<Group />);
    const layers = handle("Resize layers");
    await user.pointer([
      { keys: "[MouseLeft>]", target: layers, coords: { clientX: 200 } },
      { target: layers, coords: { clientX: 240 } },
    ]);
    expect(layers).toHaveAttribute("aria-valuenow", "240");
    expect(layers).toHaveAttribute("data-resizing");
    expect(layers).toHaveFocus();
    await user.pointer({ target: layers, coords: { clientX: 600 } });
    expect(layers).toHaveAttribute("aria-valuenow", "320");
    await user.pointer({ target: layers, coords: { clientX: 110 } });
    // 200 − 90 = 110 < 120: 하한에서 멈춘다(접기 문턱 60 보다 위).
    expect(layers).toHaveAttribute("aria-valuenow", "120");
    await user.pointer({ target: layers, coords: { clientX: 40 } });
    expect(document.getElementById("start")).toHaveAttribute("data-state", "closed");
    await user.pointer({ keys: "[/MouseLeft]", target: layers });
    expect(layers).not.toHaveAttribute("data-resizing");
  });

  it("뒤 패널을 끌면 방향이 뒤집힌다 — 손잡이를 왼쪽으로 옮기면 커진다", async () => {
    const user = userEvent.setup();
    render(<Group />);
    const inspector = handle("Resize inspector");
    await user.pointer([
      { keys: "[MouseLeft>]", target: inspector, coords: { clientX: 500 } },
      { target: inspector, coords: { clientX: 450 } },
      { keys: "[/MouseLeft]", target: inspector },
    ]);
    expect(inspector).toHaveAttribute("aria-valuenow", "290");
  });

  it("제어 접힘은 호출처가 든다 — onCollapsedChange 만 부르고 스스로 바꾸지 않는다", async () => {
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();
    function Controlled() {
      const [collapsed, setCollapsed] = useState(false);
      return (
        <>
          <button type="button" aria-controls="panel" onClick={() => setCollapsed((c) => !c)}>
            Toggle
          </button>
          <ResizablePanels>
            <ResizablePanel
              id="panel"
              defaultSize={200}
              collapsible
              collapsed={collapsed}
              onCollapsedChange={onCollapsedChange}
            >
              <button type="button">Inside</button>
            </ResizablePanel>
            <ResizableHandle controls="panel" />
            <ResizablePanel id="rest" className="flex-1" />
          </ResizablePanels>
        </>
      );
    }
    render(<Controlled />);
    const sep = screen.getByRole("separator", { name: "Resize panel" });
    sep.focus();
    await user.keyboard("{Enter}");
    expect(onCollapsedChange).toHaveBeenCalledExactlyOnceWith(true);
    expect(document.getElementById("panel")).toHaveAttribute("data-state", "open");

    // 상태를 바꾸는 것은 호출처다.
    await user.click(screen.getByRole("button", { name: "Toggle" }));
    expect(document.getElementById("panel")).toHaveAttribute("data-state", "closed");
  });

  it("접혀 포커스를 잃는 자리면 aria-controls 로 가리키는 버튼으로 포커스를 옮긴다", async () => {
    const user = userEvent.setup();
    function Outside() {
      const [collapsed, setCollapsed] = useState(false);
      return (
        <>
          <button type="button" aria-controls="side" onClick={() => setCollapsed(true)}>
            Hide side
          </button>
          <ResizablePanels>
            <ResizablePanel id="side" defaultSize={200} collapsible collapsed={collapsed}>
              <button type="button" onClick={() => setCollapsed(true)}>
                Close from inside
              </button>
            </ResizablePanel>
            <ResizableHandle controls="side" />
            <ResizablePanel id="main" className="flex-1" />
          </ResizablePanels>
        </>
      );
    }
    render(<Outside />);
    await user.click(screen.getByRole("button", { name: "Close from inside" }));
    expect(document.getElementById("side")).toHaveAttribute("inert");
    expect(screen.getByRole("button", { name: "Hide side" })).toHaveFocus();
  });

  it("storageKey 를 주면 크기와 비제어 접힘이 남고, 다시 그리면 저장본에서 시작한다", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Group storageKey="test-panels" />);
    handle("Resize layers").focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    handle("Resize inspector").focus();
    await user.keyboard("{Enter}"); // 뒤 패널은 접을 수 없다 — 저장본에 접힘이 생기지 않는다.
    expect(JSON.parse(window.localStorage.getItem("test-panels")!)).toEqual({
      sizes: { start: 232 },
      collapsed: {},
    });
    handle("Resize layers").focus();
    await user.keyboard("{Enter}");
    unmount();

    render(<Group storageKey="test-panels" />);
    expect(document.getElementById("start")).toHaveAttribute("data-state", "closed");
    handle("Resize layers").focus();
    await user.keyboard("{ArrowRight}");
    expect(handle("Resize layers")).toHaveAttribute("aria-valuenow", "232");
  });

  it("storageKey 가 없으면 저장하지 않고, 깨진 저장본 · 막힌 저장소에서도 화면은 산다", async () => {
    const user = userEvent.setup();
    render(<Group />);
    handle("Resize layers").focus();
    await user.keyboard("{ArrowRight}");
    expect(window.localStorage.length).toBe(0);
    cleanup();

    window.localStorage.setItem("broken", "{not json");
    render(<Group storageKey="broken" />);
    expect(handle("Resize layers")).toHaveAttribute("aria-valuenow", "200");
    cleanup();

    window.localStorage.setItem("odd", JSON.stringify({ sizes: { start: "wide" }, collapsed: { start: 1 } }));
    render(<Group storageKey="odd" />);
    expect(handle("Resize layers")).toHaveAttribute("aria-valuenow", "200");
    cleanup();

    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    render(<Group storageKey="blocked" />);
    handle("Resize layers").focus();
    await user.keyboard("{ArrowRight}");
    expect(handle("Resize layers")).toHaveAttribute("aria-valuenow", "216");
    setItem.mockRestore();
  });

  it("묶음 밖의 패널 · 손잡이는 바로 알린다", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ResizableHandle controls="x" />)).toThrow(/inside <ResizablePanels>/);
    expect(() => render(<ResizablePanel id="x" />)).toThrow(/inside <ResizablePanels>/);
    vi.restoreAllMocks();
  });
});
