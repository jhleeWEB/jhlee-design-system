import { createRef, forwardRef, useState, type ComponentPropsWithoutRef } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../primitives/Button";
import { Input } from "../primitives/Input";
import { Checkbox, RadioGroup, RadioGroupItem, Switch } from "../primitives/Choice";
import { SegmentedControl } from "../navigation/SegmentedControl";
import { Toggle } from "../legacy/controls";
import { DesignSystemProvider } from "../legacy/design-system";

afterEach(cleanup);

describe("컨트롤의 React 합성 계약", () => {
  it.each(["disabled", "loading"] as const)(
    "slotted 링크의 %s 상태가 자식과 부모의 활성화를 막고 해제 시 복원한다",
    (blockedProp) => {
      const childClick = vi.fn(),
        parentClick = vi.fn(),
        childCapture = vi.fn(),
        parentCapture = vi.fn();
      const childKey = vi.fn(),
        parentKey = vi.fn();
      const parentRef = createRef<HTMLButtonElement>(),
        childRef = createRef<HTMLAnchorElement>();
      const view = (blocked: boolean) => (
        <Button
          asChild
          {...{ [blockedProp]: blocked }}
          ref={parentRef}
          onClick={parentClick}
          onClickCapture={parentCapture}
          onKeyDown={parentKey}
        >
          <a
            href="#continue"
            ref={childRef}
            onClick={childClick}
            onClickCapture={childCapture}
            onKeyDown={childKey}
          >
            Continue
          </a>
        </Button>
      );
      const { rerender } = render(view(true));
      const link = screen.getByRole("link", { name: "Continue" });
      expect(parentRef.current).toBe(link);
      expect(childRef.current).toBe(link);
      expect(link.hasAttribute("href")).toBe(false);
      expect(link.getAttribute("aria-disabled")).toBe("true");
      expect(link.tabIndex).toBe(-1);
      expect(fireEvent.click(link)).toBe(false);
      expect(fireEvent.keyDown(link, { key: "Enter" })).toBe(false);
      expect(fireEvent.keyDown(link, { key: " " })).toBe(false);
      for (const callback of [childClick, parentClick, childCapture, parentCapture, childKey, parentKey])
        expect(callback).not.toHaveBeenCalled();
      expect(fireEvent.keyDown(link, { key: "Tab" })).toBe(true);

      rerender(view(false));
      expect(screen.getByRole("link", { name: "Continue" })).toBe(link);
      expect(link.getAttribute("href")).toBe("#continue");
      expect(link.hasAttribute("aria-disabled")).toBe(false);
      expect(link.tabIndex).toBe(0);
      fireEvent.click(link);
      for (const callback of [childClick, parentClick, childCapture, parentCapture])
        expect(callback).toHaveBeenCalledTimes(1);
    },
  );

  it("slotted 커스텀 버튼에도 native disabled와 두 ref를 전달한다", () => {
    const CustomButton = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<"button">>((props, ref) => (
      <button {...props} ref={ref} />
    ));
    const parentRef = createRef<HTMLButtonElement>(),
      childRef = createRef<HTMLButtonElement>();
    const click = vi.fn();
    const { rerender } = render(
      <Button asChild loading ref={parentRef}>
        <CustomButton ref={childRef} onClick={click}>
          Save
        </CustomButton>
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(parentRef.current).toBe(button);
    expect(childRef.current).toBe(button);
    fireEvent.click(button);
    expect(click).not.toHaveBeenCalled();
    rerender(
      <Button asChild ref={parentRef}>
        <CustomButton ref={childRef} onClick={click}>
          Save
        </CustomButton>
      </Button>,
    );
    expect(button.disabled).toBe(false);
    fireEvent.click(button);
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("포커스된 링크가 loading이 되어도 Escape·Tab의 부모·자식 핸들러 순서를 보존한다", () => {
    const calls: string[] = [];
    const handlers = (source: string) => ({
      onKeyDownCapture: () => calls.push(`${source}:down:capture`),
      onKeyDown: () => calls.push(`${source}:down`),
      onKeyUpCapture: () => calls.push(`${source}:up:capture`),
      onKeyUp: () => calls.push(`${source}:up`),
    });
    const view = (loading: boolean) => (
      <Button asChild loading={loading} {...handlers("parent")}>
        <a href="#continue" {...handlers("child")}>
          Continue
        </a>
      </Button>
    );
    const { rerender } = render(view(false));
    const link = screen.getByRole("link", { name: "Continue" });
    link.focus();
    rerender(view(true));
    expect(document.activeElement).toBe(link);
    for (const key of ["Escape", "Tab"]) {
      expect(fireEvent.keyDown(link, { key })).toBe(true);
      expect(fireEvent.keyUp(link, { key })).toBe(true);
      expect(calls.splice(0)).toEqual([
        "child:down:capture",
        "parent:down:capture",
        "child:down",
        "parent:down",
        "child:up:capture",
        "parent:up:capture",
        "child:up",
        "parent:up",
      ]);
    }
    for (const key of ["Enter", " "]) {
      expect(fireEvent.keyDown(link, { key })).toBe(false);
      expect(fireEvent.keyUp(link, { key })).toBe(false);
    }
    expect(calls).toEqual([]);
  });

  it.each([
    { Control: Checkbox, role: "checkbox" },
    { Control: Switch, role: "switch" },
  ])("$role asChild가 실제 버튼, 비제어 상태, 합성 ref를 유지한다", ({ Control, role }) => {
    const parentRef = createRef<HTMLButtonElement>(),
      childRef = createRef<HTMLButtonElement>();
    const change = vi.fn(),
      childClick = vi.fn();
    const { unmount } = render(
      <Control asChild defaultChecked onCheckedChange={change} ref={parentRef}>
        <button ref={childRef} onClick={childClick}>
          Shadows
        </button>
      </Control>,
    );
    const control = screen.getByRole(role, { name: "Shadows" });
    expect(control.tagName).toBe("BUTTON");
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(control.querySelector("span")).not.toBeNull();
    expect(parentRef.current).toBe(control);
    expect(childRef.current).toBe(control);
    fireEvent.click(control);
    expect(change).toHaveBeenCalledExactlyOnceWith(false);
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(control.getAttribute("aria-checked")).toBe("false");
    unmount();
    expect(parentRef.current).toBeNull();
    expect(childRef.current).toBeNull();
  });

  it("Choice asChild의 제어 상태는 외부 값만 따르고 자식 preventDefault를 존중한다", () => {
    const change = vi.fn();
    const { rerender } = render(
      <Checkbox asChild checked={false} onCheckedChange={change}>
        <button>Agree</button>
      </Checkbox>,
    );
    const control = screen.getByRole("checkbox", { name: "Agree" });
    fireEvent.click(control);
    expect(change).toHaveBeenCalledExactlyOnceWith(true);
    expect(control.getAttribute("aria-checked")).toBe("false");
    rerender(
      <Checkbox asChild checked onCheckedChange={change}>
        <button onClick={(event) => event.preventDefault()}>Agree</button>
      </Checkbox>,
    );
    expect(screen.getByRole("checkbox", { name: "Agree" })).toBe(control);
    expect(control.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(control);
    expect(change).toHaveBeenCalledTimes(1);
  });

  it("slotted 라디오가 그룹 선택, 내부 표시와 ref를 유지한다", () => {
    const parentRef = createRef<HTMLButtonElement>(),
      childRef = createRef<HTMLButtonElement>();
    const change = vi.fn();
    render(
      <RadioGroup defaultValue="plan" onValueChange={change} aria-label="View">
        <RadioGroupItem asChild value="plan">
          <button>Plan</button>
        </RadioGroupItem>
        <RadioGroupItem asChild value="model" ref={parentRef}>
          <button ref={childRef}>Model</button>
        </RadioGroupItem>
      </RadioGroup>,
    );
    const model = screen.getByRole("radio", { name: "Model" });
    expect(model.tagName).toBe("BUTTON");
    expect(parentRef.current).toBe(model);
    expect(childRef.current).toBe(model);
    fireEvent.click(model);
    expect(change).toHaveBeenCalledExactlyOnceWith("model");
    expect(model.getAttribute("aria-checked")).toBe("true");
    expect(model.querySelector("span")).not.toBeNull();
    expect(screen.getByRole("radio", { name: "Plan" }).getAttribute("aria-checked")).toBe("false");
  });

  it("Input 단위를 붙이거나 제거해도 DOM·비제어 값·포커스·선택 영역을 보존한다", () => {
    const ref = createRef<HTMLInputElement>();
    const view = (suffix?: string) => (
      <Input ref={ref} aria-label="Width" defaultValue="21" {...(suffix ? { suffix } : {})} />
    );
    const { rerender } = render(view());
    const input = screen.getByRole("textbox", { name: "Width" }) as HTMLInputElement;
    input.focus();
    fireEvent.change(input, { target: { value: "1234" } });
    input.setSelectionRange(1, 3);
    for (const suffix of ["m", "m²", undefined]) {
      rerender(view(suffix));
      expect(screen.getByRole("textbox", { name: "Width" })).toBe(input);
      expect(ref.current).toBe(input);
      expect(input.value).toBe("1234");
      expect(document.activeElement).toBe(input);
      expect([input.selectionStart, input.selectionEnd]).toEqual([1, 3]);
    }
  });

  it("Input의 제어 값과 native id·설명·오류 연결을 단위 변경에도 전달한다", () => {
    const change = vi.fn();
    const { rerender } = render(
      <>
        <label htmlFor="width">Width</label>
        <span id="hint">Minimum ten</span>
        <Input id="width" aria-describedby="hint" value="10" invalid onChange={change} />
      </>,
    );
    const input = screen.getByRole("textbox", { name: "Width" }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "20" } });
    expect(change).toHaveBeenCalledTimes(1);
    expect(input.value).toBe("10");
    rerender(
      <>
        <label htmlFor="width">Width</label>
        <span id="hint">Minimum ten</span>
        <Input id="width" aria-describedby="hint" value="20" suffix="m" invalid onChange={change} />
      </>,
    );
    expect(screen.getByRole("textbox", { name: "Width" })).toBe(input);
    expect(input.value).toBe("20");
    expect(input.getAttribute("aria-describedby")).toBe("hint");
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });
});

describe("세그먼트의 키보드 계약", () => {
  const options = [
    { value: 0, label: "Zero" },
    { value: 1, label: "One", disabled: true },
    { value: 2, label: "Two" },
  ];

  it.each([1, 99])("선택값 %s이 비활성 또는 없을 때도 첫 활성 항목으로 진입한다", async (value) => {
    const change = vi.fn();
    render(<SegmentedControl label="Levels" options={options} value={value} onChange={change} />);
    const first = screen.getByRole("radio", { name: "Zero" });
    expect(first.tabIndex).toBe(0);
    expect(screen.getAllByRole("radio").filter((radio) => radio.tabIndex === 0)).toEqual([first]);
    act(() => first.focus());
    expect(document.activeElement).toBe(first);
    expect(change).not.toHaveBeenCalled();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Two" })));
    expect(change).toHaveBeenCalledExactlyOnceWith(2);
  });

  it("방향키·Home·End가 비활성 항목을 건너뛰고 숫자 선택과 포커스를 함께 옮긴다", async () => {
    const change = vi.fn();
    function Example() {
      const [value, setValue] = useState(0);
      return (
        <SegmentedControl
          label="Levels"
          options={options}
          value={value}
          onChange={(next) => {
            change(next);
            setValue(next);
          }}
        />
      );
    }
    render(<Example />);
    act(() => screen.getByRole("radio", { name: "Zero" }).focus());
    for (const [key, name, value] of [
      ["End", "Two", 2],
      ["Home", "Zero", 0],
      ["ArrowLeft", "Two", 2],
    ] as const) {
      fireEvent.keyDown(document.activeElement!, { key });
      const next = screen.getByRole("radio", { name });
      await waitFor(() => expect(document.activeElement).toBe(next));
      expect(next.getAttribute("aria-checked")).toBe("true");
      expect(change).toHaveBeenLastCalledWith(value);
      fireEvent.keyUp(next, { key });
    }
    expect(change).toHaveBeenCalledTimes(3);
  });

  it("전체 비활성 그룹에는 Tab 진입점과 키보드·클릭 변경이 없다", () => {
    const change = vi.fn();
    render(<SegmentedControl label="Levels" options={options} value={0} onChange={change} disabled />);
    const group = screen.getByRole("radiogroup", { name: "Levels" });
    expect(group.tabIndex).toBe(-1);
    for (const radio of screen.getAllByRole("radio")) {
      expect((radio as HTMLButtonElement).disabled).toBe(true);
      expect(radio.tabIndex).toBe(-1);
      fireEvent.click(radio);
      fireEvent.keyDown(radio, { key: "ArrowRight" });
    }
    expect(change).not.toHaveBeenCalled();
  });

  it("비활성 항목에서 전달된 키와 수정키 조합은 선택을 바꾸지 않는다", () => {
    const change = vi.fn();
    render(<SegmentedControl label="Levels" options={options} value={0} onChange={change} />);
    const zero = screen.getByRole("radio", { name: "Zero" });
    zero.focus();
    fireEvent.keyDown(screen.getByRole("radio", { name: "One" }), { key: "ArrowRight" });
    fireEvent.keyDown(zero, { key: "ArrowRight", ctrlKey: true });
    expect(document.activeElement).toBe(zero);
    expect(change).not.toHaveBeenCalled();
  });

  it("빠르게 누르고 놓은 방향키도 포커스와 제어 선택을 함께 옮긴다", async () => {
    const change = vi.fn();
    function Example() {
      const [value, setValue] = useState(0);
      return (
        <SegmentedControl
          label="Levels"
          options={options}
          value={value}
          onChange={(next) => {
            change(next);
            setValue(next);
          }}
        />
      );
    }
    render(<Example />);
    const zero = screen.getByRole("radio", { name: "Zero" });
    act(() => zero.focus());
    act(() => {
      fireEvent.keyDown(zero, { key: "ArrowRight" });
      fireEvent.keyUp(zero, { key: "ArrowRight" });
    });
    const two = screen.getByRole("radio", { name: "Two" });
    await waitFor(() => expect(document.activeElement).toBe(two));
    expect(two.getAttribute("aria-checked")).toBe("true");
    expect(change).toHaveBeenCalledExactlyOnceWith(2);
  });

  it("제어 값이 아직 반영되지 않아도 반복 방향키는 현재 포커스에서 계속 이동한다", () => {
    const change = vi.fn();
    render(<SegmentedControl label="Levels" options={options} value={0} onChange={change} />);
    const zero = screen.getByRole("radio", { name: "Zero" });
    const two = screen.getByRole("radio", { name: "Two" });
    zero.focus();
    fireEvent.keyDown(zero, { key: "ArrowDown" });
    expect(document.activeElement).toBe(two);
    fireEvent.keyDown(two, { key: "ArrowDown", repeat: true });
    expect(document.activeElement).toBe(zero);
    fireEvent.keyDown(zero, { key: "ArrowUp" });
    expect(document.activeElement).toBe(two);
    expect(change.mock.calls).toEqual([[2], [0], [2]]);
    expect(zero.getAttribute("aria-checked")).toBe("true");
    expect(two.getAttribute("aria-checked")).toBe("false");
  });
});

describe("스위치 설명 연결", () => {
  it.each([false, true])("DS=%s에서 hint를 안정된 설명 ID로 연결하고 숨긴 문구를 참조하지 않는다", (ds) => {
    const toggle = (hint: string, hideText = false) => {
      const control = (
        <Toggle label="Tandem stalls" hint={hint} hideText={hideText} value={false} onChange={() => {}} />
      );
      return ds ? <DesignSystemProvider>{control}</DesignSystemProvider> : control;
    };
    const { rerender } = render(toggle("Up to 20% by count"));
    const control = screen.getByRole("switch", { name: "Tandem stalls" });
    const id = control.getAttribute("aria-describedby")!;
    expect(id).toBeTruthy();
    expect(document.getElementById(id)?.textContent).toBe("Up to 20% by count");
    rerender(toggle("Capacity limit applies"));
    expect(control.getAttribute("aria-describedby")).toBe(id);
    expect(document.getElementById(id)?.textContent).toBe("Capacity limit applies");
    rerender(toggle("Capacity limit applies", true));
    expect(control.hasAttribute("aria-describedby")).toBe(false);
    expect(screen.getByRole("switch", { name: "Tandem stalls" })).toBe(control);
    expect(document.getElementById(id)).toBeNull();
  });
});
