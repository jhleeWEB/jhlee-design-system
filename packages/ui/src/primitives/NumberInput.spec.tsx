import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { NumberInput } from "./NumberInput";
import * as stories from "./NumberInput.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 픽스처다. className 은 바깥 줄, ref · rest 는 입력 칸으로 간다(NumberInput 머리 주석). */
describeComponentContract(stories, { slot: "number-input", axes: ["size"] });

afterEach(cleanup);

const input = () => screen.getByRole<HTMLInputElement>("spinbutton", { name: "Area" });

describe("NumberInput — 보폭 · Shift ×10 · 경계", () => {
  it("↑↓ 는 step, Shift 와 함께면 ×10 — 소수 보폭의 부동소수 꼬리는 반올림한다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<NumberInput aria-label="Area" defaultValue={1} step={0.1} onValueChange={onValueChange} />);
    await user.click(input());
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(input()).toHaveValue(1.2);
    expect(onValueChange).toHaveBeenLastCalledWith(1.2);
    await user.keyboard("{Shift>}{ArrowUp}{/Shift}");
    expect(input()).toHaveValue(2.2);
    await user.keyboard("{Shift>}{ArrowDown}{ArrowDown}{/Shift}");
    expect(input()).toHaveValue(0.2);
    expect(onValueChange).toHaveBeenLastCalledWith(0.2);
  });

  it("증감은 min–max 에서 멈추고 경계의 버튼은 비활성이 된다", async () => {
    const user = userEvent.setup();
    render(<NumberInput aria-label="Area" defaultValue={8} min={0} max={10} step={1} />);
    await user.click(input());
    await user.keyboard("{Shift>}{ArrowUp}{/Shift}");
    expect(input()).toHaveValue(10);
    expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled();
    await user.keyboard("{Shift>}{ArrowDown}{ArrowDown}{/Shift}");
    expect(input()).toHaveValue(0);
    expect(screen.getByRole("button", { name: "Decrease" })).toBeDisabled();
  });

  it("타이핑 중 범위 밖 값은 확정하지 않고, 칸을 떠날 때 경계로 당겨 확정한다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <NumberInput aria-label="Area" defaultValue={150} min={100} max={500} onValueChange={onValueChange} />,
    );
    await user.tripleClick(input());
    await user.keyboard("1");
    // «1» 은 min 100 밖이다 — 당기면 «150» 을 칠 수 없으므로 초안으로만 둔다.
    expect(input()).toHaveValue(1);
    expect(onValueChange).not.toHaveBeenCalled();
    await user.keyboard("20");
    expect(onValueChange).toHaveBeenLastCalledWith(120);
    await user.keyboard("0");
    expect(input()).toHaveValue(1200);
    await user.tab();
    expect(input()).toHaveValue(500);
    expect(onValueChange).toHaveBeenLastCalledWith(500);
  });

  it("빈 칸으로 떠나면 마지막 확정 값으로 되돌린다 — Enter 도 같은 확정이다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <NumberInput aria-label="Area" defaultValue={42} min={0} max={50} onValueChange={onValueChange} />,
    );
    await user.clear(input());
    expect(input()).toHaveValue(null);
    await user.tab();
    expect(input()).toHaveValue(42);
    await user.click(input());
    await user.keyboard("{Control>}a{/Control}99{Enter}");
    expect(input()).toHaveValue(50);
    expect(onValueChange).toHaveBeenLastCalledWith(50);
  });

  it("증감 버튼은 탭 순서에 들지 않고, 눌러도 칸의 포커스를 빼앗지 않는다", async () => {
    const user = userEvent.setup();
    render(<NumberInput aria-label="Area" defaultValue={3} />);
    const plus = screen.getByRole("button", { name: "Increase" });
    expect(plus).toHaveAttribute("tabindex", "-1");
    await user.click(input());
    await user.click(plus);
    expect(input()).toHaveValue(4);
    expect(input()).toHaveFocus();
    await user.tab();
    expect(plus).not.toHaveFocus();
  });

  it("제어 값 — 부모가 값을 바꾸면 칸이 따라가고, 메아리는 초안을 덮지 않는다", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState(10);
      return (
        <>
          <NumberInput aria-label="Area" value={value} onValueChange={setValue} />
          <button type="button" onClick={() => setValue(25)}>
            Reset
          </button>
        </>
      );
    }
    render(<Controlled />);
    await user.tripleClick(input());
    await user.keyboard("12.5");
    expect(input()).toHaveValue(12.5);
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(input()).toHaveValue(25);
  });

  it("unit 은 입력 안의 접미사이고 값은 mono + tabular-nums 다", () => {
    const { container } = render(<NumberInput aria-label="Area" defaultValue={1250} unit="m²" />);
    expect(container.querySelector('[data-slot="input-wrapper"]')).toHaveTextContent("m²");
    expect(input()).toHaveAttribute("data-numeric", "");
    expect(input()).toHaveClass("tnum");
  });

  it("stepper={false} 면 버튼이 없고, disabled · readOnly 면 키보드 증감도 막힌다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<NumberInput aria-label="Area" defaultValue={5} stepper={false} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    rerender(<NumberInput aria-label="Area" defaultValue={5} readOnly onValueChange={onValueChange} />);
    expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled();
    await user.click(input());
    await user.keyboard("{ArrowUp}");
    expect(input()).toHaveValue(5);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("NumberInput — Input 의 숫자 계약을 물려받는다(CLAUDE.md «DS Input 의 type=number»)", () => {
  it("'0234' 를 한 자씩 치면 정수부 선행 0 이 사라져 234 가 된다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<NumberInput aria-label="Area" onValueChange={onValueChange} />);
    await user.click(input());
    await user.keyboard("0234");
    expect(input().value).toBe("234");
    expect(onValueChange).toHaveBeenLastCalledWith(234);
  });

  it("값이 0 인 칸을 클릭하면 전체 선택돼 다음 입력이 0 을 대체한다", async () => {
    const user = userEvent.setup();
    render(<NumberInput aria-label="Area" defaultValue={0} />);
    const select = vi.spyOn(HTMLInputElement.prototype, "select");
    await user.click(input());
    expect(select).toHaveBeenCalled();
    select.mockRestore();
  });

  it("ref 는 실제 <input> 을 가리킨다", () => {
    let node: HTMLInputElement | null = null;
    render(
      <NumberInput
        aria-label="Area"
        ref={(el) => {
          node = el;
        }}
      />,
    );
    expect(node).toBe(input());
  });
});
