import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Drawer, DrawerContent, DrawerHeader } from "../overlay/Drawer";
import { CardGrid } from "../primitives/MediaCard";

afterEach(cleanup);

/* 계획 §2.3 이 확인한 버그 2건의 회귀 테스트(#10). 둘 다 «prop 을 받아 놓고 버린다» 부류라
 * 타입은 통과하고 화면만 조용히 틀리므로 DOM 으로 못 박는다. */
describe("확인된 버그 2건(#10)", () => {
  it("CardGrid 는 소비자 style 을 격자 열 정의와 병합한다 — 어느 쪽도 상대를 지우지 않는다", () => {
    const { container } = render(<CardGrid min="180px" style={{ marginTop: 8 }} />);
    const grid = container.querySelector<HTMLDivElement>('[data-slot="card-grid"]')!;
    /* 예전에는 `style` 이 `{...rest}` 앞에 있어 소비자 style 이 열 정의를 통째로 덮었다 — 카드가 한 줄에 쌓였다. */
    expect(grid.style.gridTemplateColumns).toBe("repeat(auto-fit, minmax(180px, 1fr))");
    expect(grid.style.marginTop).toBe("8px");
  });

  it("CardGrid 의 소비자 style 이 열 정의를 명시하면 그것이 이긴다", () => {
    const { container } = render(<CardGrid style={{ gridTemplateColumns: "1fr 1fr" }} />);
    const grid = container.querySelector<HTMLDivElement>('[data-slot="card-grid"]')!;
    expect(grid.style.gridTemplateColumns).toBe("1fr 1fr");
  });

  it("DrawerHeader 는 children 을 제목 블록과 닫기 버튼 사이에 렌더한다(ModalHeader 와 같은 계약)", () => {
    render(
      <Drawer open>
        <DrawerContent aria-describedby={undefined}>
          <DrawerHeader title="Inspector">
            <button type="button">Pin</button>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>,
    );
    const header = screen.getByText("Inspector").closest('[data-slot="drawer-header"]')!;
    const pin = screen.getByRole("button", { name: "Pin" });
    const close = screen.getByRole("button", { name: "Close" });
    expect(header.contains(pin)).toBe(true);
    /* 순서도 계약이다 — 제목 → 부가 조치 → 닫기. 닫기가 항상 맨 끝에 있어야 키보드 순서가 예측된다. */
    expect(header.compareDocumentPosition(pin) & Node.DOCUMENT_POSITION_CONTAINED_BY).toBeTruthy();
    expect(pin.compareDocumentPosition(close) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
