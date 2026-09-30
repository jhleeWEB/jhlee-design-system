import { useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Select } from "../legacy/controls";
import { DesignSystemProvider } from "../legacy/design-system";

afterEach(cleanup);

describe("DS 선택 목록", () => {
  it("기존 소비자는 네이티브 select와 숫자 값 계약을 유지한다", () => {
    const onChange = vi.fn();
    render(
      <Select
        label="Count"
        value={0}
        options={[
          { value: 0, label: "None" },
          { value: 2, label: "Two" },
        ]}
        onChange={onChange}
        className="legacy-count"
      />,
    );
    const input = screen.getByRole("combobox", { name: "Count" });
    expect(input.tagName).toBe("SELECT");
    expect(input.classList.contains("legacy-count")).toBe(true);
    fireEvent.change(input, { target: { value: "2" } });
    expect(onChange).toHaveBeenCalledExactlyOnceWith(2);
  });

  it("네이티브 select는 오류 설명을 연결하고 수정하면 오류 상태를 해제한다", () => {
    function Example() {
      const [value, setValue] = useState(0);
      const invalid = value === 0;
      return (
        <>
          <Select
            label="Count"
            value={value}
            options={[
              { value: 0, label: "None" },
              { value: 2, label: "Two" },
            ]}
            onChange={setValue}
            invalid={invalid}
            aria-describedby={invalid ? "count-error" : undefined}
          />
          {invalid && <span id="count-error">Choose a count.</span>}
        </>
      );
    }
    render(<Example />);
    const input = screen.getByRole("combobox", {
      name: "Count",
      description: "Choose a count.",
    }) as HTMLSelectElement;
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("count-error");
    fireEvent.change(input, { target: { value: "2" } });
    expect(input.value).toBe("2");
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(input.hasAttribute("aria-describedby")).toBe(false);
    expect(screen.queryByText("Choose a count.")).toBeNull();
  });

  it("DS 오류 설명은 선택값 안내를 보존하고 수정하면 선택값만 안내한다", () => {
    function Example() {
      const [value, setValue] = useState(0);
      const invalid = value === 0;
      return (
        <>
          <Select
            label="Count"
            value={value}
            options={[
              { value: 0, label: "None" },
              { value: 2, label: "Two" },
            ]}
            onChange={setValue}
            invalid={invalid}
            aria-describedby={invalid ? "count-hint count-error" : undefined}
          />
          {invalid && (
            <>
              <span id="count-hint">Required.</span>
              <span id="count-error">Choose a count.</span>
            </>
          )}
        </>
      );
    }
    render(
      <DesignSystemProvider>
        <Example />
      </DesignSystemProvider>,
    );
    const trigger = screen.getByRole("button", {
      name: "Count",
      description: "None Required. Choose a count.",
    });
    const valueId = trigger.querySelector(".ds-select-value")!.id;
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    expect(trigger.getAttribute("aria-describedby")).toBe(`${valueId} count-hint count-error`);
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Two" }));
    expect(screen.getByRole("button", { name: "Count", description: "Two" })).toBe(trigger);
    expect(trigger.hasAttribute("aria-invalid")).toBe(false);
    expect(trigger.getAttribute("aria-describedby")).toBe(valueId);
    expect(screen.queryByText("Choose a count.")).toBeNull();
  });

  it("선택 목록은 잘리는 부모 밖에 열리고 숫자 0도 선택 표시와 입력에 보존한다", async () => {
    const onChange = vi.fn();
    function Example() {
      const [value, setValue] = useState(2);
      return (
        <Select
          label="Count"
          value={value}
          options={[
            { value: 0, label: "None" },
            { value: 2, label: "Two" },
          ]}
          onChange={(next) => {
            onChange(next);
            setValue(next);
          }}
          className="count-control"
        />
      );
    }
    const { container } = render(
      <DesignSystemProvider>
        <div style={{ overflow: "hidden", width: 100 }}>
          <Example />
        </div>
      </DesignSystemProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Count" });
    expect(trigger.classList.contains("count-control")).toBe(true);
    expect(trigger.textContent).toBe("Two");
    expect(document.getElementById(trigger.getAttribute("aria-describedby")!)?.textContent).toBe("Two");
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const menu = screen.getByRole("menu", { name: "Count" });
    expect(container.contains(menu)).toBe(false);
    expect(screen.getByRole("menuitemradio", { name: "Two" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("menuitemradio", { name: "None" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(0);
    expect(trigger.textContent).toBe("None");
    expect(document.getElementById(trigger.getAttribute("aria-describedby")!)?.textContent).toBe("None");
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("빈 문자열도 선택할 수 있고 이미 선택한 항목은 change를 중복 전달하지 않는다", () => {
    const onChange = vi.fn();
    render(
      <DesignSystemProvider>
        <Select
          label="Floor"
          value="G"
          options={[
            { value: "", label: "Choose a floor" },
            { value: "G", label: "Ground" },
          ]}
          onChange={onChange}
        />
      </DesignSystemProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Floor" });
    fireEvent.keyDown(trigger, { key: "Enter" });
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Ground" }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(trigger, { key: "Enter" });
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Choose a floor" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith("");
  });

  it("방향키 선택과 Enter 확정 후 트리거로 포커스를 돌린다", async () => {
    const onChange = vi.fn();
    render(
      <DesignSystemProvider>
        <Select
          label="Direction"
          value="a"
          options={[
            { value: "a", label: "Alpha" },
            { value: "b", label: "Beta" },
            { value: "g", label: "Gamma" },
          ]}
          onChange={onChange}
        />
      </DesignSystemProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Direction" });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const alpha = screen.getByRole("menuitemradio", { name: "Alpha" });
    const beta = screen.getByRole("menuitemradio", { name: "Beta" });
    await waitFor(() => expect(document.activeElement).toBe(alpha));
    fireEvent.keyDown(alpha, { key: "ArrowDown" });
    await waitFor(() => expect(document.activeElement).toBe(beta));
    fireEvent.keyDown(beta, { key: "Enter" });
    expect(onChange).toHaveBeenCalledExactlyOnceWith("b");
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("문자 탐색 후 Escape로 취소하면 값은 유지되고 포커스가 돌아온다", async () => {
    const onChange = vi.fn();
    render(
      <DesignSystemProvider>
        <Select
          label="Direction"
          value="a"
          options={[
            { value: "a", label: "Alpha" },
            { value: "b", label: "Beta" },
            { value: "g", label: "Gamma" },
          ]}
          onChange={onChange}
        />
      </DesignSystemProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Direction" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const alpha = screen.getByRole("menuitemradio", { name: "Alpha" });
    const gamma = screen.getByRole("menuitemradio", { name: "Gamma" });
    await waitFor(() => expect(document.activeElement).toBe(alpha));
    fireEvent.keyDown(alpha, { key: "g" });
    await waitFor(() => expect(document.activeElement).toBe(gamma));
    fireEvent.keyDown(gamma, { key: "Escape" });
    expect(onChange).not.toHaveBeenCalled();
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("비활성 목록은 키보드로 열리지 않는다", () => {
    const onChange = vi.fn();
    render(
      <DesignSystemProvider>
        <Select
          label="Direction"
          value="a"
          options={[{ value: "a", label: "Alpha" }]}
          disabled
          onChange={onChange}
        />
      </DesignSystemProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Direction" }) as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });
});
