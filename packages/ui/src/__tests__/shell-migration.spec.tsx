import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell, Panel, PanelGroup, Tabs, ViewerPanel } from "../shell";
import { Select, Slider, Toggle } from "../controls";
import { DesignSystemProvider } from "../design-system";
import { SegmentedControl } from "../navigation/SegmentedControl";

afterEach(cleanup);

describe("기존 셸의 DS 전환", () => {
  it("선택한 앱은 카드 셸을 쓰고 기존 소비자는 같은 DOM 계약을 유지한다", () => {
    const shell = <AppShell topbar="Header" parameters={<Panel title="Parameters">Inputs</Panel>} viewer={<ViewerPanel>Canvas</ViewerPanel>} inspect={<Panel title="Inspect" variant="inspect">Checks</Panel>} />;
    const { container, rerender } = render(shell);
    expect(container.querySelector('aside[aria-label="Parameters"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="card"]')).toBeNull();
    rerender(<DesignSystemProvider>{shell}</DesignSystemProvider>);
    expect(container.querySelector('.app-shell[data-design-system]')).not.toBeNull();
    expect(container.querySelectorAll('.workspace [data-slot="card"]')).toHaveLength(3);
    expect(screen.getByRole("region", { name: "Viewer" }).textContent).toBe("Canvas");
  });

  it("그룹을 접어도 작성 중 입력과 DOM을 보존한다", () => {
    const { container } = render(<DesignSystemProvider><PanelGroup title="Height" echo="Ten floors above ground"><input aria-label="Draft" defaultValue="10" /></PanelGroup></DesignSystemProvider>);
    expect(screen.getByTitle("Ten floors above ground").textContent).toBe("Ten floors above ground");
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "24" } });
    fireEvent.click(screen.getByTitle("Collapse Height"));
    expect(screen.getByTitle("Expand Height").getAttribute("aria-expanded")).toBe("false");
    expect(input.closest('[aria-hidden="true"]')).not.toBeNull();
    fireEvent.click(screen.getByTitle("Expand Height"));
    expect(screen.getByRole("textbox")).toBe(input);
    expect(input.value).toBe("24");
  });

  it("검사 패널을 접어도 입력과 스크롤을 보존하고 보이는 복원 버튼으로 포커스를 돌린다", () => {
    function Example() {
      const [open, setOpen] = useState(true);
      return <AppShell topbar="Header" parameters={<Panel title="Parameters">Inputs</Panel>}
        viewer={<>
          <div inert><button aria-controls="inspect-test">Inactive viewer</button></div>
          <div hidden><button aria-controls="inspect-test">Hidden viewer</button></div>
          <div aria-hidden="true"><button aria-controls="inspect-test">Hidden programme</button></div>
          <div style={{ visibility: "hidden" }}><button aria-controls="inspect-test">Invisible viewer</button></div>
          <div style={{ display: "none" }}><button aria-controls="inspect-test">Removed viewer</button></div>
          <button disabled aria-controls="inspect-test">Unavailable restore</button>
          <button aria-controls="inspect-test" onClick={() => setOpen(!open)}>Toggle inspect</button>
        </>}
        inspectId="inspect-test" inspectOpen={open}
        inspect={<Panel title="Inspect" variant="inspect"><input aria-label="Draft" defaultValue="10" /></Panel>} />;
    }
    render(<DesignSystemProvider><Example /></DesignSystemProvider>);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    const slot = document.getElementById("inspect-test")!;
    const viewport = slot.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')!;
    fireEvent.change(input, { target: { value: "24" } });
    viewport.scrollTop = 80;
    input.focus();
    fireEvent.click(screen.getByRole("button", { name: "Toggle inspect" }));
    expect(slot.getAttribute("aria-hidden")).toBe("true");
    expect(slot.hasAttribute("inert")).toBe(true);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Toggle inspect" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle inspect" }));
    expect(slot.hasAttribute("inert")).toBe(false);
    expect(screen.getByRole("textbox")).toBe(input);
    expect(input.value).toBe("24");
    expect(viewport.scrollTop).toBe(80);
  });

  it("검사 막대는 본문만 숨기고 자체 복원 버튼과 입력·스크롤·포커스를 유지한다", () => {
    function Example() {
      const [open, setOpen] = useState(true);
      return <AppShell topbar="Header" parameters={<Panel title="Parameters">Inputs</Panel>}
        viewer={<button aria-controls="inspect-strip" onClick={() => setOpen(!open)}>External toggle</button>}
        inspectId="inspect-strip" inspectOpen={open} inspectCollapseTo="strip"
        inspect={<Panel title="Inspect" variant="inspect" collapsed={!open} onCollapsedChange={collapsed => setOpen(!collapsed)}
          collapseTo="strip" collapsedLabel="Inspect" collapsedSignal={<span>2 checks</span>} side="right">
          <input aria-label="Draft" defaultValue="10" />
        </Panel>} />;
    }
    const { container } = render(<DesignSystemProvider><Example /></DesignSystemProvider>);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    const slot = document.getElementById("inspect-strip")!;
    const card = screen.getByRole("complementary", { name: "Inspect" });
    const content = card.querySelector<HTMLElement>('[data-slot="card-content"]')!;
    const viewport = card.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')!;
    const close = card.querySelector<HTMLButtonElement>('[data-slot="card-header"] [data-slot="card-collapse"]')!;
    expect(close.getAttribute("aria-controls")).toBe(content.id);
    fireEvent.change(input, { target: { value: "24" } });
    viewport.scrollTop = 80;
    input.focus();
    fireEvent.click(close);

    const restore = screen.getByRole("button", { name: /Expand Inspect/ });
    expect(container.querySelector('.workspace.inspect-closed')?.getAttribute("data-inspect-collapse")).toBe("strip");
    expect(slot.hasAttribute("inert")).toBe(false);
    expect(slot.getAttribute("aria-hidden")).not.toBe("true");
    expect(card.getAttribute("data-collapsed")).toBe("true");
    expect(content.getAttribute("aria-hidden")).toBe("true");
    expect(content.hasAttribute("inert")).toBe(true);
    expect(restore.textContent).toContain("2 checks");
    expect(restore.getAttribute("aria-controls")).toBe(content.id);
    expect(document.activeElement).toBe(restore);

    fireEvent.click(restore);
    expect(screen.getByRole("complementary", { name: "Inspect" })).toBe(card);
    expect(card.querySelector('[data-slot="card-content"]')).toBe(content);
    expect(card.querySelector('[data-slot="scroll-area-viewport"]')).toBe(viewport);
    expect(screen.getByRole("textbox")).toBe(input);
    expect(input.value).toBe("24");
    expect(viewport.scrollTop).toBe(80);
    expect(content.hasAttribute("inert")).toBe(false);
    expect(document.activeElement).toBe(close);
  });

  it("숫자 선택과 스위치의 공개 값 계약을 보존한다", () => {
    const select = vi.fn(), toggle = vi.fn();
    render(<DesignSystemProvider><Select label="Floors" value={10} options={[{ value: 10, label: "Ten" }, { value: 20, label: "Twenty" }]} onChange={select} className="floor-select" /><Toggle label="Shadows" hint="Model shading" value={false} onChange={toggle} /></DesignSystemProvider>);
    fireEvent.keyDown(screen.getByRole("button", { name: "Floors" }), { key: "ArrowDown" });
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Twenty" }));
    expect(select).toHaveBeenCalledWith(20);
    expect(screen.getByRole("button", { name: "Floors" }).getAttribute("data-slot")).toBe("select");
    fireEvent.click(screen.getByRole("switch", { name: "Shadows" }));
    expect(toggle).toHaveBeenCalledWith(true);
  });

  it("슬라이더는 드래그 중 draft를 유지하고 마지막 값만 한 번 commit한다", () => {
    const commit = vi.fn();
    render(<DesignSystemProvider><Slider label="Height" min={0} max={100} value={10} onCommit={commit} /></DesignSystemProvider>);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "30" } });
    fireEvent.change(slider, { target: { value: "40" } });
    expect(commit).not.toHaveBeenCalled();
    fireEvent.pointerUp(slider);
    fireEvent.blur(slider);
    expect(commit).toHaveBeenCalledExactlyOnceWith(40);
  });

  it("탭은 패널 의미를 유지하고 방향키로 선택과 포커스를 함께 옮긴다", () => {
    function Example() {
      const [tab, setTab] = useState("plan");
      return <Tabs label="Views" value={tab} onChange={setTab} options={[{ value: "plan", label: "Plan" }, { value: "model", label: "Model" }]} />;
    }
    render(<DesignSystemProvider><Example /></DesignSystemProvider>);
    const plan = screen.getByRole("tab", { name: "Plan" });
    plan.focus();
    fireEvent.keyDown(plan, { key: "ArrowRight" });
    const model = screen.getByRole("tab", { name: "Model" });
    expect(model.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(model);
  });

  it("세그먼트는 비활성 선택지를 건너뛰고 숫자 값을 반환한다", () => {
    const change = vi.fn();
    render(<SegmentedControl label="Levels" value={1} onChange={change} options={[{ value: 1, label: "One" }, { value: 2, label: "Two", disabled: true }, { value: 3, label: "Three" }]} />);
    const one = screen.getByRole("radio", { name: "One" });
    one.focus();
    fireEvent.keyDown(one, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Three" }));
    expect(change).toHaveBeenCalledWith(3);
    expect(screen.getAllByRole("radio").every(button => button.hasAttribute("data-slot"))).toBe(true);
  });
});
