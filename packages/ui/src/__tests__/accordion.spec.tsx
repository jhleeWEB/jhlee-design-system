import { createRef, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "../navigation/Accordion";

afterEach(cleanup);

function Parts() {
  return (
    <>
      <AccordionItem value="a">
        <AccordionHeader>
          <AccordionTrigger>Alpha</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          <input aria-label="Draft" defaultValue="Saved" />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionHeader>
          <AccordionTrigger>Beta</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          <p>Beta content</p>
        </AccordionContent>
      </AccordionItem>
    </>
  );
}

describe("상태를 보존하는 DS Accordion", () => {
  it("비제어 single은 기본 항목에서 시작하고 접어도 입력 DOM과 초안을 보존한다", () => {
    const { container } = render(
      <Accordion type="single" defaultValue="a" collapsible>
        <Parts />
      </Accordion>,
    );
    const alpha = screen.getByRole("button", { name: "Alpha" });
    const beta = screen.getByRole("button", { name: "Beta" });
    const input = screen.getByRole("textbox", { name: "Draft" }) as HTMLInputElement;
    const content = input.closest('[data-slot="accordion-content"]')!;
    fireEvent.change(input, { target: { value: "Unsaved draft" } });
    fireEvent.click(beta);
    expect(alpha.getAttribute("aria-expanded")).toBe("false");
    expect(beta.getAttribute("aria-expanded")).toBe("true");
    expect(content.getAttribute("aria-hidden")).toBe("true");
    expect(content.hasAttribute("inert")).toBe(true);
    expect(screen.queryByRole("textbox", { name: "Draft" })).toBeNull();
    fireEvent.click(alpha);
    expect(screen.getByRole("textbox", { name: "Draft" })).toBe(input);
    expect(input.value).toBe("Unsaved draft");
    fireEvent.click(alpha);
    expect(container.querySelectorAll('[data-slot="accordion-trigger"][aria-expanded="true"]')).toHaveLength(
      0,
    );
    expect(container.querySelector('[aria-label="Draft"]')).toBe(input);
  });

  it("multiple은 열린 항목을 독립적으로 추가하고 뺀다", () => {
    const changed = vi.fn();
    render(
      <Accordion type="multiple" defaultValue={["a"]} onValueChange={changed}>
        <Parts />
      </Accordion>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Beta" }));
    expect(changed).toHaveBeenLastCalledWith(["a", "b"]);
    expect(screen.getByRole("button", { name: "Alpha" }).getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("button", { name: "Beta" }).getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Alpha" }));
    expect(changed).toHaveBeenLastCalledWith(["b"]);
  });

  it("제어 값은 요청만 전달하고 외부에서 닫으면 본문 포커스를 트리거로 돌린다", () => {
    const changed = vi.fn();
    const { rerender } = render(
      <Accordion type="single" value="a" onValueChange={changed} collapsible>
        <Parts />
      </Accordion>,
    );
    const alpha = screen.getByRole("button", { name: "Alpha" });
    fireEvent.click(screen.getByRole("button", { name: "Beta" }));
    expect(changed).toHaveBeenCalledExactlyOnceWith("b");
    expect(alpha.getAttribute("aria-expanded")).toBe("true");
    screen.getByRole("textbox", { name: "Draft" }).focus();
    rerender(
      <Accordion type="single" value="b" onValueChange={changed} collapsible>
        <Parts />
      </Accordion>,
    );
    expect(document.activeElement).toBe(alpha);
    expect(alpha.getAttribute("aria-expanded")).toBe("false");
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it("키보드 이동은 비활성 항목을 건너뛰고 Home/End를 지원한다", () => {
    render(
      <Accordion type="multiple">
        {[
          ["a", false],
          ["b", true],
          ["c", false],
        ].map(([value, disabled]) => (
          <AccordionItem key={String(value)} value={String(value)} disabled={Boolean(disabled)}>
            <AccordionHeader>
              <AccordionTrigger>{String(value)}</AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>{String(value)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>,
    );
    const a = screen.getByRole("button", { name: "a" });
    const c = screen.getByRole("button", { name: "c" });
    a.focus();
    fireEvent.keyDown(a, { key: "ArrowDown" });
    expect(document.activeElement).toBe(c);
    fireEvent.keyDown(c, { key: "Home" });
    expect(document.activeElement).toBe(a);
    fireEvent.keyDown(a, { key: "End" });
    expect(document.activeElement).toBe(c);
    fireEvent.click(screen.getByRole("button", { name: "b" }));
    expect(screen.getByRole("button", { name: "b" }).getAttribute("aria-expanded")).toBe("false");
  });

  it("native props와 ref를 합성하고 Trigger/Content의 ARIA 연결을 유지한다", () => {
    const rootRef = createRef<HTMLDivElement>();
    const triggerRef = createRef<HTMLButtonElement>();
    const contentRef = createRef<HTMLDivElement>();
    const clicked = vi.fn();
    const { unmount } = render(
      <Accordion ref={rootRef} type="single" collapsible id="settings">
        <AccordionItem value="a">
          <AccordionHeader>
            <AccordionTrigger ref={triggerRef} onClick={clicked}>
              Settings
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent ref={contentRef} contentClassName="settings-body">
            Content
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    fireEvent.click(triggerRef.current!);
    expect(clicked).toHaveBeenCalledTimes(1);
    expect(rootRef.current?.id).toBe("settings");
    expect(triggerRef.current?.getAttribute("aria-controls")).toBe(contentRef.current?.id);
    expect(contentRef.current?.getAttribute("aria-labelledby")).toBe(triggerRef.current?.id);
    expect(contentRef.current?.querySelector(".settings-body")?.textContent).toBe("Content");
    unmount();
    expect(rootRef.current).toBeNull();
    expect(triggerRef.current).toBeNull();
    expect(contentRef.current).toBeNull();
  });

  it("asChild와 콜백 ref 정리를 보존하고 빠른 반전에도 지역 상태를 유지한다", () => {
    const detached = vi.fn();
    const triggerRef = vi.fn((node: HTMLButtonElement | null) => (node ? detached : undefined));
    function Counter() {
      const [count, setCount] = useState(0);
      return <button onClick={() => setCount(count + 1)}>Count {count}</button>;
    }
    const { container, unmount } = render(
      <Accordion type="single" collapsible defaultValue="a">
        <AccordionItem value="a">
          <AccordionHeader>
            <AccordionTrigger asChild ref={triggerRef}>
              <button data-custom-trigger>Custom</button>
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent asChild>
            <section data-custom-content>
              <Counter />
            </section>
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const trigger = screen.getByRole("button", { name: "Custom" });
    const content = container.querySelector("[data-custom-content]");
    fireEvent.click(screen.getByRole("button", { name: "Count 0" }));
    for (let i = 0; i < 4; i++) fireEvent.click(trigger);
    expect(container.querySelector("[data-custom-content]")).toBe(content);
    expect(screen.getByRole("button", { name: "Count 1" })).toBeDefined();
    expect(detached).not.toHaveBeenCalled();
    unmount();
    expect(detached).toHaveBeenCalledTimes(1);
  });
});
