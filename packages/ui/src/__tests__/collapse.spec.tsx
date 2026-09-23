import { StrictMode, act } from "react";
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
  it("접히면 호출처의 폭 클래스를 **이긴다**", () => {
    render(
      <Card className="w-[290px] shrink-0" collapsed onCollapsedChange={() => {}} collapseTo="strip" collapsedLabel="Planning brief">
        <CardWell>body</CardWell>
      </Card>,
    );
    const cls = card().className;
    /* tailwind-merge 는 같은 그룹에서 **뒤에 온 것**을 남긴다. 접힘은 모드이고 모드가
       소유한 속성은 모드가 이겨야 하므로, 병합 순서상 w-9 가 살아남아야 한다. */
    expect(cls).toContain("w-9");
    expect(cls).not.toContain("w-[290px]");
    expect(cls).toContain("flex-none");
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
    expect(input!.closest("[hidden]")).not.toBeNull();
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
    /* CSS 로 감추므로 DOM 에는 남는다 — 선택자가 깨지면 이 검사가 잡는다. */
    expect(host.querySelector('[data-testid="body"]')).not.toBeNull();
    expect(card().className).toContain("[&>*:not([data-slot='card-header'])]:hidden");
  });

  it("머리줄이 접기 버튼을 스스로 단다", () => {
    render(
      <Card collapsed={false} onCollapsedChange={() => {}} collapseTo="header" collapsedLabel="FSI ledger">
        <CardHeader title="FSI ledger" />
        <div>rows</div>
      </Card>,
    );
    /* 호출처가 매번 버튼을 달게 하면 빠진다. */
    const button = host.querySelector('[data-slot="card-header"] button')!;
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(button.title).toBe("Collapse FSI ledger");
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
  });
});
