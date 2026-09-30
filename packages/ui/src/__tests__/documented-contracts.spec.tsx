/*
 * CLAUDE.md 가 문장으로 약속한 계약을 실제 사용자 동작으로 확인한다(계획 §2.4 D-3, C3).
 * `numeric-input.spec` 은 fireEvent 로 DOM 값을 직접 넣는다 — 여기서는 user-event 가 키를 한 자씩 치고 마우스로 누르므로
 * «선행 0 제거 · 0 전체선택 · 아이콘 교체» 가 브라우저 이벤트 순서(keydown → beforeinput → input → keyup)에서도 성립하는지 본다.
 */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LuMaximize2, LuMinimize2 } from "react-icons/lu";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Input } from "../primitives/Input";
import { PanelToggleButton } from "../primitives/PanelToggleButton";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Input type=number — 선행 0(CLAUDE.md «DS Input 의 type=number»)", () => {
  it("'0234' 를 한 자씩 치면 정수부 선행 0 이 사라져 234 가 된다", async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    render(<Input type="number" aria-label="Area" defaultValue="" onChange={event => changed(event.currentTarget.value)} />);
    const input = screen.getByRole("spinbutton", { name: "Area" });
    await user.type(input, "0234");
    expect(input).toHaveValue(234);
    expect(changed).toHaveBeenLastCalledWith("234");
  });

  it("값이 0 인 입력을 클릭하면 전체 선택돼 다음 입력이 0 을 대체한다(select spy)", async () => {
    const user = userEvent.setup();
    const select = vi.spyOn(HTMLInputElement.prototype, "select");
    render(<Input type="number" aria-label="Area" defaultValue={0} />);
    const input = screen.getByRole("spinbutton", { name: "Area" });
    await user.click(input);
    expect(select).toHaveBeenCalled();
    await user.keyboard("7");
    expect(input).toHaveValue(7);
  });

  it("값이 0 이 아니면 클릭이 전체 선택을 만들지 않는다", async () => {
    const user = userEvent.setup();
    const select = vi.spyOn(HTMLInputElement.prototype, "select");
    render(<Input type="number" aria-label="Area" defaultValue={12} />);
    await user.click(screen.getByRole("spinbutton", { name: "Area" }));
    expect(select).not.toHaveBeenCalled();
  });
});

describe("PanelToggleButton — 아이콘(CLAUDE.md «Lucide LuMinimize2/LuMaximize2 를 16px»)", () => {
  const iconMarkup = (Icon: typeof LuMinimize2) => {
    const { container, unmount } = render(<Icon size={16} strokeWidth={2} aria-hidden="true" focusable={false} />);
    const html = container.querySelector("svg")!.outerHTML;
    unmount();
    return html;
  };

  it.each([
    [true, "Collapse", LuMinimize2],
    [false, "Show", LuMaximize2],
  ] as const)("open=%s → %s 라벨과 그 아이콘", (open, verb, Icon) => {
    const expected = iconMarkup(Icon);
    render(<PanelToggleButton open={open} onOpenChange={() => {}} label="inspector" />);
    const button = screen.getByRole("button", { name: `${verb} the inspector` });
    expect(button).toHaveAttribute("aria-expanded", String(open));
    const svg = button.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg!.outerHTML).toBe(expected);
  });

  it("누르면 반대 상태를 알린다", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<PanelToggleButton open onOpenChange={onOpenChange} label="inspector" />);
    await user.click(screen.getByRole("button", { name: "Collapse the inspector" }));
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });
});
