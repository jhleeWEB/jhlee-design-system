import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataTable } from "../data/DataTable";
import { Sidebar, SidebarItem } from "../navigation/Sidebar";
import { TooltipProvider } from "../overlay/Tooltip";

afterEach(cleanup);

describe("접힌 사이드바 이름", () => {
  it("툴팁이 닫혀 있고 아이콘이 장식이어도 항목 이름이 남는다", () => {
    render(
      <TooltipProvider>
        <Sidebar collapsed>
          <SidebarItem icon={<svg aria-hidden="true" />} label="Site" />
        </Sidebar>
      </TooltipProvider>,
    );
    expect(screen.getByRole("button", { name: "Site" }).getAttribute("aria-label")).toBe("Site");
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("호출처가 지정한 접근성 이름을 접힘과 펼침 모두에서 보존한다", () => {
    const item = (
      <SidebarItem icon={<svg aria-hidden="true" />} label="Site" aria-label="Open the current site" />
    );
    const view = render(
      <TooltipProvider>
        <Sidebar collapsed>{item}</Sidebar>
      </TooltipProvider>,
    );
    expect(screen.getByRole("button", { name: "Open the current site" })).not.toBeNull();
    view.rerender(
      <TooltipProvider>
        <Sidebar>{item}</Sidebar>
      </TooltipProvider>,
    );
    expect(screen.getByRole("button", { name: "Open the current site" }).textContent).toBe("Site");
  });
});

const rows = [
  { id: "T1", homes: 10 },
  { id: "T2", homes: 20 },
];
const columns = [
  { key: "id", header: "Tower" },
  { key: "homes", header: "Homes" },
];

describe("데이터 표의 행 선택", () => {
  it("표 의미를 유지하고 네이티브 선택 컨트롤과 행 클릭이 같은 제어 상태를 바꾼다", () => {
    const select = vi.fn();
    function ControlledTable() {
      const [selected, setSelected] = useState("T1");
      return (
        <DataTable
          caption="Towers"
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          selectedKey={selected}
          onSelect={(key, row) => {
            select(key, row);
            setSelected(key);
          }}
        />
      );
    }
    render(<ControlledTable />);
    const table = screen.getByRole("table", { name: "Towers" });
    const first = within(table).getByRole("radio", { name: "Select row T1" }) as HTMLInputElement;
    const second = within(table).getByRole("radio", { name: "Select row T2" }) as HTMLInputElement;
    expect(first.tagName).toBe("INPUT");
    expect(first.type).toBe("radio");
    expect(first.tabIndex).toBe(0);
    expect(first.checked).toBe(true);
    expect(first.name).toBe(second.name);
    expect(within(table).getAllByRole("columnheader")).toHaveLength(2);
    expect(first.closest("tr")?.getAttribute("role")).toBeNull();

    fireEvent.click(second);
    expect(select).toHaveBeenCalledExactlyOnceWith("T2", rows[1]);
    expect(first.checked).toBe(false);
    expect(second.checked).toBe(true);
    fireEvent.click(within(table).getByText("T1"));
    expect(select).toHaveBeenCalledTimes(2);
    expect(select).toHaveBeenLastCalledWith("T1", rows[0]);
    expect(first.checked).toBe(true);
  });

  it("임의 셀의 버튼·링크·입력은 선택 컨트롤과 중첩되거나 행 선택을 중복 호출하지 않는다", () => {
    const select = vi.fn(),
      edit = vi.fn(),
      change = vi.fn();
    render(
      <DataTable
        caption="Editable towers"
        rows={rows.slice(0, 1)}
        rowKey={(row) => row.id}
        onSelect={select}
        columns={[
          { key: "id", header: "Tower", cell: (row) => <button onClick={edit}>Edit {row.id}</button> },
          {
            key: "homes",
            header: "Homes",
            cell: () => (
              <>
                <label htmlFor="homes">Homes</label>
                <input id="homes" defaultValue="10" onChange={change} />
                <a href="#details">Details</a>
              </>
            ),
          },
        ]}
      />,
    );
    const radio = screen.getByRole("radio", { name: "Select row T1" });
    expect(radio.closest("button")).toBeNull();
    expect(screen.getByRole("button", { name: "Edit T1" }).parentElement).toBe(radio.parentElement);
    fireEvent.click(screen.getByRole("button", { name: "Edit T1" }));
    fireEvent.click(screen.getByText("Homes", { selector: "label" }));
    fireEvent.click(screen.getByRole("textbox", { name: "Homes" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Homes" }), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("link", { name: "Details" }));
    expect(edit).toHaveBeenCalledOnce();
    expect(change).toHaveBeenCalledOnce();
    expect(select).not.toHaveBeenCalled();
    fireEvent.click(radio);
    expect(select).toHaveBeenCalledExactlyOnceWith("T1", rows[0]);
  });

  it("별도 표의 선택 그룹을 분리하고 읽기 전용 표에는 컨트롤을 추가하지 않는다", () => {
    const view = render(
      <>
        <DataTable
          caption="First schedule"
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          onSelect={() => {}}
        />
        <DataTable
          caption="Second schedule"
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          onSelect={() => {}}
        />
      </>,
    );
    const first = within(screen.getByRole("table", { name: "First schedule" })).getAllByRole(
      "radio",
    )[0] as HTMLInputElement;
    const second = within(screen.getByRole("table", { name: "Second schedule" })).getAllByRole(
      "radio",
    )[0] as HTMLInputElement;
    expect(first.name).not.toBe(second.name);
    view.rerender(
      <DataTable caption="Read-only schedule" columns={columns} rows={rows} rowKey={(row) => row.id} />,
    );
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.getByRole("cell", { name: "T1" }).childElementCount).toBe(0);
  });
});
