import { createRef, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Input } from "../primitives/Input";

afterEach(cleanup);

function numberInput() {
  return screen.getByRole("spinbutton", { name: "Area" }) as HTMLInputElement;
}

describe("숫자 입력의 불필요한 선행 0", () => {
  it("실제 input 이벤트의 DOM·onInput·onChange 값이 같은 정규화 결과를 전달한다", () => {
    const inputValues = vi.fn(), changeValues = vi.fn();
    function Example() {
      const [value, setValue] = useState(0);
      return <Input type="number" aria-label="Area" value={value}
        onInput={event => inputValues(event.currentTarget.value, event.target === event.currentTarget, event.currentTarget.valueAsNumber)}
        onChange={event => {
          changeValues(event.currentTarget.value, event.target.value, event.currentTarget.valueAsNumber);
          setValue(Number(event.currentTarget.value));
        }} />;
    }
    render(<Example />);
    const input = numberInput();
    fireEvent.input(input, { target: { value: "0234213" } });
    expect(input.value).toBe("234213");
    expect(inputValues).toHaveBeenCalledExactlyOnceWith("234213", true, 234213);
    expect(changeValues).toHaveBeenCalledExactlyOnceWith("234213", "234213", 234213);
  });

  it.each([[0, "00", "0"], [1, "01", "1"]] as const)(
    "부모의 수치 %s가 바뀌지 않아도 %s 입력의 DOM을 %s로 정리한다",
    (initial, typed, expected) => {
      const changed = vi.fn();
      function Example() {
        const [value, setValue] = useState<number>(initial);
        return <Input type="number" aria-label="Area" value={value} onChange={event => {
          changed(event.target.value);
          setValue(Number(event.target.value));
        }} />;
      }
      render(<Example />);
      const input = numberInput();
      fireEvent.input(input, { target: { value: typed } });
      expect(input.value).toBe(expected);
      expect(changed).toHaveBeenCalledExactlyOnceWith(expected);
    },
  );

  it.each([
    ["000", "0"],
    ["0", "0"],
    ["0.05", "0.05"],
    ["0.50", "0.50"],
    ["000.50", "0.50"],
    ["-12.5", "-12.5"],
    ["-001.20", "-1.20"],
    ["001e-03", "1e-03"],
    ["", ""],
  ])("문자열 제어 입력 %s에서 값·정밀도·빈 상태를 보존해 %s를 전달한다", (typed, expected) => {
    const changed = vi.fn();
    function Example() {
      const [value, setValue] = useState("12");
      return <Input type="number" step="any" aria-label="Area" value={value} onChange={event => {
        changed(event.target.value);
        setValue(event.target.value);
      }} />;
    }
    render(<Example />);
    const input = numberInput();
    fireEvent.change(input, { target: { value: typed } });
    expect(input.value).toBe(expected);
    expect(changed).toHaveBeenCalledExactlyOnceWith(expected);
  });

  it("비제어 입력은 콜백 없이도 붙여넣은 정수부의 0을 제거한다", () => {
    render(<Input type="number" aria-label="Area" defaultValue="0" />);
    const input = numberInput();
    fireEvent.input(input, { target: { value: "000234" } });
    expect(input.value).toBe("234");
  });

  it("onInput만 사용하는 비제어 입력도 정규화 결과를 한 번 전달한다", () => {
    const typed = vi.fn();
    render(<Input type="number" aria-label="Area" defaultValue="0" onInput={event => typed(event.currentTarget.value)} />);
    const input = numberInput();
    fireEvent.input(input, { target: { value: "00056" } });
    expect(input.value).toBe("56");
    expect(typed).toHaveBeenCalledExactlyOnceWith("56");
  });

  it("초기·갱신 제어 문자열과 읽기 전용 값도 정리하고 ref·접미사를 보존한다", () => {
    const ref = createRef<HTMLInputElement>();
    const { rerender } = render(<Input ref={ref} type="number" aria-label="Area" readOnly value="00012" suffix="m²" />);
    const input = numberInput();
    expect(input.value).toBe("12");
    expect(input.readOnly).toBe(true);
    expect(ref.current).toBe(input);
    expect(screen.getByText("m²")).toBeTruthy();
    rerender(<Input ref={ref} type="number" aria-label="Area" readOnly value="00034" />);
    expect(numberInput()).toBe(input);
    expect(input.value).toBe("34");
    expect(ref.current).toBe(input);
  });

  it("초기 defaultValue는 정리하되 사용자가 바꾼 비제어 값은 재렌더에서 유지한다", () => {
    const { rerender } = render(<Input type="number" aria-label="Area" defaultValue="00012" />);
    const input = numberInput();
    expect(input.value).toBe("12");
    fireEvent.input(input, { target: { value: "00056" } });
    rerender(<Input type="number" aria-label="Area" defaultValue="00034" suffix="m²" />);
    expect(numberInput()).toBe(input);
    expect(input.value).toBe("56");
  });

  it("numeric 정렬을 쓰는 텍스트 입력의 선행 0과 콜백은 바꾸지 않는다", () => {
    const typed = vi.fn(), changed = vi.fn();
    render(<Input numeric type="text" aria-label="Identifier" defaultValue="001"
      onInput={event => typed(event.currentTarget.value)} onChange={event => changed(event.target.value)} />);
    const input = screen.getByRole("textbox", { name: "Identifier" }) as HTMLInputElement;
    expect(input.value).toBe("001");
    fireEvent.input(input, { target: { value: "002" } });
    expect(input.value).toBe("002");
    expect(typed).toHaveBeenCalledExactlyOnceWith("002");
    expect(changed).toHaveBeenCalledExactlyOnceWith("002");
  });
});
