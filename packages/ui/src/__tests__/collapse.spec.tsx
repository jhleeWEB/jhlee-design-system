import { Fragment, StrictMode, act, useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { Card, CardCollapse, CardHeader, CardWell } from "../primitives";

/* 접기 회귀 검사 (#1198).
 *
 * 이 기능이 깨지는 방식 셋은 전부 «눈으로만 보이고 타입은 통과하는» 부류다:
 *   1. 접힘 클래스가 호출처 `className` 보다 먼저 병합되어 `w-[290px]` 에 진다 — 실제로 그랬다.
 *      `data-collapsed` 는 붙는데 카드는 그대로 서 있다.
 *   2. 내용을 언마운트해 스크롤 위치와 입력 중이던 값이 날아간다.
 *   3. 접힌 카드에 되돌리는 버튼이 없어 되살릴 길이 사라진다.
 */

let host: HTMLDivElement;
let root: Root;

function render(ui: React.ReactNode) {
  act(() => {
    root.render(<StrictMode>{ui}</StrictMode>);
  });
}

beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

const card = () => host.querySelector('[data-slot="card"]')!;

describe("Card — strip 접기", () => {
  it.each(["w-[290px] shrink-0", "min-w-0 flex-1"])("접는 동안 펼침 치수 %s를 지워 버리지 않는다", className => {
    const draw = (collapsed: boolean) => render(
      <Card className={className} style={{ maxWidth: 600 }} collapsed={collapsed} onCollapsedChange={() => {}} collapseTo="strip" collapsedLabel="Planning brief">
        <CardWell>body</CardWell>
      </Card>,
    );
    draw(false);
    const original = card();
    for (const collapsed of [true, false]) {
      draw(collapsed);
      expect(card()).toBe(original);
      expect(card().getAttribute("data-collapse-to")).toBe("strip");
      expect(card().getAttribute("data-collapsed")).toBe(collapsed ? "true" : null);
      for (const token of className.split(" ")) expect(card().classList.contains(token)).toBe(true);
      expect((card() as HTMLElement).style.maxWidth).toBe("600px");
    }
  });

  it("펼쳐 있으면 호출처의 폭이 산다", () => {
    render(
      <Card className="w-[290px] shrink-0" collapsed={false} onCollapsedChange={() => {}} collapseTo="strip" collapsedLabel="Planning brief">
        <CardWell>body</CardWell>
      </Card>,
    );
    expect(card().className).toContain("w-[290px]");
    expect(card().className).not.toContain("w-9");
  });

  it("내용을 언마운트하지 않고 감춘다", () => {
    render(
      <Card collapsed onCollapsedChange={() => {}} collapseTo="strip" collapsedLabel="Planning brief">
        <CardWell>
          <input defaultValue="half typed" />
        </CardWell>
      </Card>,
    );
    const input = host.querySelector("input");
    /* 언마운트하면 되펼칠 때 «처음 상태» 가 되어 접기가 파괴적 동작이 된다. */
    expect(input).not.toBeNull();
    expect(input!.closest('[aria-hidden="true"][inert]')).not.toBeNull();
  });

  it("접힌 자리에 되돌리는 버튼과 이름이 남는다", () => {
    render(
      <Card collapsed onCollapsedChange={() => {}} collapseTo="strip" collapsedLabel="Planning brief">
        <CardWell>body</CardWell>
      </Card>,
    );
    const button = card().querySelector("button")!;
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.title).toBe("Expand Planning brief");
    expect(button.getAttribute("aria-label")).toBe("Expand Planning brief");
    /* 세로 탭에 이름이 적혀 있어야 «방금 무엇을 없앴나» 를 기억하지 않아도 된다. */
    expect(button.textContent).toContain("Planning brief");
    /* `getElementById` 로 찾는다 — React 의 `useId` 는 `:` 를 넣으므로 CSS 선택자로는
       이스케이프 없이 쓸 수 없고, 이 jsdom 에는 `CSS.escape` 가 없다. ARIA 의 IDREF 는
       선택자가 아니므로 그 값 자체는 문제가 아니다. */
    expect(document.getElementById(button.getAttribute("aria-controls")!)).not.toBeNull();
  });

  it("누르면 펼침을 요청한다", () => {
    const seen: boolean[] = [];
    render(
      <Card collapsed onCollapsedChange={v => seen.push(v)} collapseTo="strip" collapsedLabel="Planning brief">
        <CardWell>body</CardWell>
      </Card>,
    );
    act(() => {
      card().querySelector("button")!.click();
    });
    expect(seen).toEqual([false]);
  });

  it("헤더의 공통 아이콘과 전체 strip을 왕복해도 포커스와 본문을 보존한다", () => {
    function Example() {
      const [collapsed, setCollapsed] = useState(false);
      return <Card collapsed={collapsed} onCollapsedChange={next => {
        // 실제 브라우저는 inert로 바뀐 strip의 포커스를 effect 전에 해제할 수 있다.
        if (!next) (document.activeElement as HTMLElement).blur();
        setCollapsed(next);
      }} collapseTo="strip" collapsedLabel="Model view" side="right">
        <CardHeader title="Model" />
        <input defaultValue="draft" />
      </Card>;
    }
    render(<Example />);
    const headerButton = host.querySelector<HTMLButtonElement>('[data-slot="card-header"] [data-slot="card-collapse"]')!;
    const strip = host.querySelector<HTMLButtonElement>('[data-card-strip]')!;
    const input = host.querySelector("input")!;
    const body = document.getElementById(headerButton.getAttribute("aria-controls")!)!;
    expect(headerButton.getAttribute("aria-label")).toBe("Collapse the Model view");
    expect(headerButton.classList.contains("opacity-0")).toBe(false);
    expect(headerButton.querySelector("svg")?.getAttribute("stroke-width")).toBe("2");
    expect(strip.querySelector("svg")?.getAttribute("stroke-width")).toBe("2");
    input.value = "half typed";
    act(() => { headerButton.focus(); headerButton.click(); });
    expect(card().getAttribute("data-collapsed")).toBe("true");
    expect(document.activeElement).toBe(strip);
    expect(strip.getAttribute("aria-expanded")).toBe("false");
    expect(strip.hasAttribute("inert")).toBe(false);
    expect(body.hasAttribute("inert")).toBe(true);
    expect(document.getElementById(strip.getAttribute("aria-controls")!)).toBe(body);
    act(() => strip.click());
    expect(card().hasAttribute("data-collapsed")).toBe(false);
    expect(document.activeElement).toBe(headerButton);
    expect(host.querySelector('[data-slot="card-header"] [data-slot="card-collapse"]')).toBe(headerButton);
    expect(host.querySelector("input")).toBe(input);
    expect(input.value).toBe("half typed");
    expect(body.hasAttribute("inert")).toBe(false);
  });

  it("보기 전용 헤더는 자동 버튼만 생략하고 strip과 본문 구조는 유지한다", () => {
    const seen: boolean[] = [];
    render(<Card collapsed onCollapsedChange={value => seen.push(value)} collapseTo="strip" collapsedLabel="Model">
      <CardHeader title="Model" collapseButton={false} />
      <input defaultValue="draft" />
    </Card>);
    expect(host.querySelector('[data-slot="card-header"] button')).toBeNull();
    expect(host.querySelector('[data-slot="card-content"] input')).not.toBeNull();
    const strip = host.querySelector<HTMLButtonElement>('[data-card-strip]')!;
    expect(strip.getAttribute("aria-label")).toBe("Expand Model");
    act(() => strip.click());
    expect(seen).toEqual([false]);
  });
});

describe("Card — header 접기", () => {
  it("머리줄만 남기고 나머지 자식을 감춘다", () => {
    render(
      <Card collapsed onCollapsedChange={() => {}} collapseTo="header" collapsedLabel="FSI ledger">
        <CardHeader title="FSI ledger" />
        <div data-testid="body">rows</div>
      </Card>,
    );
    expect(host.querySelector('[data-slot="card-header"]')).not.toBeNull();
    const body = host.querySelector('[data-testid="body"]')!;
    expect(body).not.toBeNull();
    expect(body.closest('[aria-hidden="true"][inert]')).not.toBeNull();
    expect(host.querySelector('[data-slot="card-header"]')?.closest('[aria-hidden="true"]')).toBeNull();
  });

  it("머리줄이 접기 버튼을 스스로 단다", () => {
    render(
      <Card collapsed={false} onCollapsedChange={() => {}} collapseTo="header" collapsedLabel="FSI ledger">
        <CardHeader title="FSI ledger" />
        <div>rows</div>
      </Card>,
    );
    /* 호출처가 매번 버튼을 달게 하면 빠진다. */
    const button = host.querySelector<HTMLButtonElement>('[data-slot="card-header"] button')!;
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(button.title).toBe("Collapse FSI ledger");
    expect(document.getElementById(button.getAttribute("aria-controls")!)).not.toBeNull();
  });

  it("본문 ARIA 대상과 입력 DOM을 접기 전후 동일하게 보존한다", () => {
    const renderCard = (collapsed: boolean) => render(
      <Card collapsed={collapsed} onCollapsedChange={() => {}} collapsedLabel="Draft">
        <CardHeader title="Draft" />
        <div><input defaultValue="original" /></div>
      </Card>,
    );
    renderCard(false);
    const button = host.querySelector('[data-slot="card-header"] button')!;
    const body = document.getElementById(button.getAttribute("aria-controls")!)!;
    const input = body.querySelector("input")!;
    input.value = "half typed";
    for (const collapsed of [true, false]) {
      renderCard(collapsed);
      const current = host.querySelector('[data-slot="card-header"] button')!;
      expect(document.getElementById(current.getAttribute("aria-controls")!)).toBe(body);
      expect(body.getAttribute("aria-hidden")).toBe(collapsed ? "true" : null);
      expect(body.hasAttribute("inert")).toBe(collapsed);
      expect(body.querySelector("input")).toBe(input);
      expect(input.value).toBe("half typed");
    }
  });

  it("중첩 Fragment의 머리줄은 남기고 같은 지역 key의 입력도 따로 보존한다", () => {
    function Example() {
      const [collapsed, setCollapsed] = useState(false);
      return <Card collapsed={collapsed} onCollapsedChange={setCollapsed} collapsedLabel="Draft">
        <>
          <><CardHeader title="Draft" /></>
          <Fragment key="first"><input key="draft" aria-label="First" defaultValue="first" /></Fragment>
          <Fragment key="second"><input key="draft" aria-label="Second" defaultValue="second" /></Fragment>
        </>
      </Card>;
    }
    render(<Example />);
    const header = host.querySelector('[data-slot="card-header"]')!;
    const button = header.querySelector<HTMLButtonElement>("button")!;
    const body = document.getElementById(button.getAttribute("aria-controls")!)!;
    const first = body.querySelector<HTMLInputElement>('[aria-label="First"]')!;
    const second = body.querySelector<HTMLInputElement>('[aria-label="Second"]')!;
    first.value = "first draft";
    second.value = "second draft";
    for (const collapsed of [true, false]) {
      act(() => button.click());
      expect(header.closest('[aria-hidden="true"]')).toBeNull();
      expect(button.getAttribute("aria-expanded")).toBe(String(!collapsed));
      expect(body.getAttribute("aria-hidden")).toBe(collapsed ? "true" : null);
      expect(body.hasAttribute("inert")).toBe(collapsed);
      expect(document.getElementById(button.getAttribute("aria-controls")!)).toBe(body);
      expect(body.querySelector('[aria-label="First"]')).toBe(first);
      expect(body.querySelector('[aria-label="Second"]')).toBe(second);
      expect(first.value).toBe("first draft");
      expect(second.value).toBe("second draft");
    }
  });
});

describe("Card — 접기 중 본문과 포커스 수명", () => {
  it.each(["strip", "header"] as const)("%s 왕복에도 입력·지역 상태·스크롤과 ARIA 대상을 보존한다", collapseTo => {
    let mounts = 0;
    function Body() {
      const [count, setCount] = useState(0);
      useEffect(() => { mounts++; }, []);
      return <div data-test-scroll style={{ overflow: "auto", height: 80 }}>
        <input defaultValue="draft" />
        <button data-counter onClick={() => setCount(value => value + 1)}>{count}</button>
        <div style={{ height: 400 }}>Long content</div>
      </div>;
    }
    const draw = (collapsed: boolean) => render(<Card collapsed={collapsed} onCollapsedChange={() => {}} collapseTo={collapseTo} collapsedLabel="Draft">
      <CardHeader title="Draft" /><Body />
    </Card>);
    draw(false);
    const content = host.querySelector<HTMLElement>('[data-slot="card-content"]')!;
    const input = content.querySelector("input")!;
    const scroll = content.querySelector<HTMLElement>('[data-test-scroll]')!;
    const counter = content.querySelector<HTMLButtonElement>('[data-counter]')!;
    const initialMounts = mounts;
    input.value = "half typed";
    scroll.scrollTop = 48;
    (card() as HTMLElement).scrollTop = 120;
    act(() => counter.click());
    for (const collapsed of [true, false, true, false]) {
      draw(collapsed);
      expect(host.querySelector('[data-slot="card-content"]')).toBe(content);
      expect(content.querySelector("input")).toBe(input);
      expect(input.value).toBe("half typed");
      expect(scroll.scrollTop).toBe(48);
      expect((card() as HTMLElement).scrollTop).toBe(collapseTo === "strip" && collapsed ? 0 : 120);
      expect(counter.textContent).toBe("1");
      expect(mounts).toBe(initialMounts);
      for (const trigger of host.querySelectorAll('[data-slot="card-collapse"]')) {
        expect(document.getElementById(trigger.getAttribute("aria-controls")!)).toBe(content);
      }
    }
  });

  it.each(["strip", "header"] as const)("%s 외부 접기는 내부 포커스를 남아 있는 접기 버튼으로 돌린다", collapseTo => {
    const draw = (collapsed: boolean) => render(<Card collapsed={collapsed} onCollapsedChange={() => {}} collapseTo={collapseTo} collapsedLabel="Draft">
      <CardHeader title="Draft" /><input />
    </Card>);
    draw(false);
    host.querySelector("input")!.focus();
    draw(true);
    const trigger = collapseTo === "strip" ? host.querySelector('[data-card-strip]') : host.querySelector('[data-slot="card-header"] button');
    expect(document.activeElement).toBe(trigger);
    if (collapseTo === "strip") {
      draw(false);
      expect(document.activeElement).toBe(host.querySelector('[data-slot="card-header"] button'));
    }
  });
});

describe("Card — 접히지 않는 카드", () => {
  it("collapsed 를 주지 않으면 버튼이 생기지 않는다", () => {
    render(
      <Card>
        <CardHeader title="Plain" />
        <CardCollapse />
      </Card>,
    );
    expect(host.querySelector("button")).toBeNull();
    expect(card().hasAttribute("data-collapsed")).toBe(false);
    expect(card().hasAttribute("data-collapse-to")).toBe(false);
    expect(card().querySelector('[data-slot="card-content"]')).toBeNull();
    expect(card().firstElementChild?.getAttribute("data-slot")).toBe("card-header");
  });
});
