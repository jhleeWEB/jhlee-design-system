import type { UIEvent } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataTable } from "../data/DataTable";
import { Table, Tbody, Td, Tr } from "../data/Table";
import { Drawer, DrawerBody, DrawerContent, DrawerHeader } from "../overlay/Drawer";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "../overlay/Modal";

afterEach(cleanup);

describe("DS 스크롤을 소비하는 본문과 표", () => {
  it.each(["modal", "drawer"] as const)("%s의 본문만 스크롤하고 기존 본문 레이아웃과 스크롤 이벤트를 보존한다", kind => {
    let scrollTarget: EventTarget | null = null;
    let captureTarget: EventTarget | null = null;
    const onScroll = vi.fn((event: UIEvent<HTMLDivElement>) => { scrollTarget = event.currentTarget; });
    const onScrollCapture = vi.fn((event: UIEvent<HTMLDivElement>) => { captureTarget = event.currentTarget; });
    const Body = kind === "modal" ? ModalBody : DrawerBody;
    const body = <Body id="details" role="region" aria-label="Details" className="grid gap-3 p-2" onScroll={onScroll} onScrollCapture={onScrollCapture}>
      <button>First control</button><button>Second control</button>
    </Body>;
    render(kind === "modal"
      ? <Modal defaultOpen><ModalContent aria-describedby={undefined}><ModalHeader title="Settings" />{body}<ModalFooter><button>Save</button></ModalFooter></ModalContent></Modal>
      : <Drawer defaultOpen><DrawerContent aria-describedby={undefined}><DrawerHeader title="Settings" />{body}<footer><button>Save</button></footer></DrawerContent></Drawer>);
    const content = screen.getByRole("region", { name: "Details" });
    const viewport = content.closest<HTMLElement>('[data-slot="scroll-area-viewport"]')!;
    const scrollArea = viewport.closest('[data-slot="scroll-area"]')!;
    expect(viewport).not.toBeNull();
    expect(content.id).toBe("details");
    expect(content.dataset.slot).toBe(`${kind}-body`);
    expect(content.className).toBe("grid gap-3 p-2");
    expect(content.children).toHaveLength(2);
    expect(scrollArea.contains(screen.getByRole("heading", { name: "Settings" }))).toBe(false);
    expect(scrollArea.contains(screen.getByRole("button", { name: "Save" }))).toBe(false);
    fireEvent.scroll(viewport, { target: { scrollTop: 40 } });
    expect(onScroll).toHaveBeenCalledTimes(1);
    expect(onScrollCapture).toHaveBeenCalledTimes(1);
    expect(scrollTarget).toBe(viewport);
    expect(captureTarget).toBe(viewport);
  });

  it("일반 표는 가로 viewport 안에서도 표 속성과 넓은 내용의 폭을 유지한다", () => {
    render(<Table aria-label="Schedule" className="wide-table" style={{ minWidth: 900 }}>
      <Tbody><Tr><Td>Wide schedule</Td></Tr></Tbody>
    </Table>);
    const table = screen.getByRole("table", { name: "Schedule" });
    const viewport = table.closest<HTMLElement>('[data-slot="scroll-area-viewport"]')!;
    expect(viewport).not.toBeNull();
    expect(viewport.style.overflowX).toBe("scroll");
    expect(viewport.style.overflowY).toBe("hidden");
    expect(table.classList.contains("wide-table")).toBe(true);
    expect(table.style.minWidth).toBe("900px");
  });

  it("데이터 표의 높이 제한과 정렬·행 선택·합계는 양방향 viewport 안에서도 유지된다", () => {
    const select = vi.fn();
    const rows = [{ id: "b", homes: 20 }, { id: "a", homes: 10 }];
    render(<DataTable caption="Homes" className="max-h-64" stickyHeader rows={rows} rowKey={row => row.id} onSelect={select}
      columns={[{ key: "id", header: "Building" }, { key: "homes", header: "Homes", numeric: true, sortValue: row => row.homes, total: 30 }]} />);
    const table = screen.getByRole("table", { name: "Homes" });
    const viewport = table.closest<HTMLElement>('[data-slot="scroll-area-viewport"]')!;
    expect(viewport).not.toBeNull();
    expect(viewport.style.overflowX).toBe("scroll");
    expect(viewport.style.overflowY).toBe("scroll");
    expect(table.closest('[data-slot="data-table"]')?.classList.contains("max-h-64")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Homes" }));
    expect(table.querySelector("tbody tr")?.textContent).toBe("a10");
    fireEvent.click(screen.getByText("a"));
    expect(select).toHaveBeenCalledWith("a", rows[1]);
    expect(table.querySelector("tfoot")?.textContent).toBe("Total30");
  });
});
