import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { axeViolations } from "../__tests__/axe";
import { DataTable } from "./DataTable";
import * as stories from "./DataTable.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 유일한 픽스처다. DataTable 은 cva 축이 없다. */
describeComponentContract(stories, { slot: "data-table" });

afterEach(cleanup);

interface Room {
  readonly id: string;
  readonly name: string;
  readonly area: number;
}

/* 키는 내부 id(«U1-kitchen»)이고 사람이 아는 이름은 첫 열에 그려지는 `name` 이다 — 소비 레포에서 실측한 모양(#101). */
const rooms: readonly Room[] = [
  { id: "U1-kitchen", name: "Kitchen", area: 12 },
  { id: "U1-bed-1", name: "Bedroom 1", area: 14 },
];

const columns = [
  { key: "name", header: "Room" },
  { key: "area", header: "Area", numeric: true },
] as const;

describe("DataTable 선택 radio 의 접근 이름(#101)", () => {
  it("rowLabel 이 없으면 첫 칸에 그려진 글자가 이름이다 — 내부 키(rowKey)는 읽히지 않는다", async () => {
    render(
      <DataTable
        caption="Rooms"
        columns={columns}
        rows={rooms}
        rowKey={(row) => row.id}
        onSelect={() => {}}
      />,
    );
    const table = screen.getByRole("table", { name: "Rooms" });
    const radios = within(table).getAllByRole("radio");
    expect(radios.map((radio) => radio.getAttribute("aria-label"))).toEqual([null, null]);
    expect(within(table).getByRole("radio", { name: "Select row Kitchen" })).toHaveAttribute(
      "value",
      "U1-kitchen",
    );
    expect(within(table).getByRole("radio", { name: "Select row Bedroom 1" })).toBeInTheDocument();
    for (const radio of radios) expect(radio).not.toHaveAccessibleName(/U1-/);
    // 가리킨 id 가 모두 DOM 에 있다(aria-valid-attr-value) — 숨긴 앞말과 첫 칸.
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("rowLabel 이 이름을 정하고 selectLabel 이 앞말을 바꾼다", () => {
    render(
      <DataTable
        caption="Rooms"
        columns={columns}
        rows={rooms}
        rowKey={(row) => row.id}
        rowLabel={(row, index) => `${index + 1}. ${row.name}`}
        selectLabel="Choose"
        onSelect={() => {}}
      />,
    );
    const radio = screen.getByRole("radio", { name: "Choose 1. Kitchen" });
    expect(radio).toHaveAttribute("aria-label", "Choose 1. Kitchen");
    expect(radio).not.toHaveAttribute("aria-labelledby");
    expect(screen.getByRole("radio", { name: "Choose 2. Bedroom 1" })).toBeInTheDocument();
  });

  it("selectLabel 은 rowLabel 없이도 앞말이 된다 — 이름은 «앞말 + 첫 칸»", () => {
    render(
      <DataTable
        caption="Rooms"
        columns={columns}
        rows={rooms}
        rowKey={(row) => row.id}
        selectLabel="Pick"
        onSelect={() => {}}
      />,
    );
    expect(screen.getByRole("radio", { name: "Pick Kitchen" })).toBeInTheDocument();
  });

  it("표 둘이 한 화면에 있어도 이름이 섞이지 않는다 — id 는 표마다 다르다", () => {
    render(
      <>
        <DataTable
          caption="Unit 1"
          columns={columns}
          rows={rooms}
          rowKey={(row) => row.id}
          onSelect={() => {}}
        />
        <DataTable
          caption="Unit 2"
          columns={columns}
          rows={[{ id: "U2-living", name: "Living", area: 20 }]}
          rowKey={(row) => row.id}
          onSelect={() => {}}
        />
      </>,
    );
    const second = screen.getByRole("table", { name: "Unit 2" });
    expect(within(second).getByRole("radio", { name: "Select row Living" })).toBeInTheDocument();
    const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("onSelect 가 없으면(읽기 전용) radio 도, 이름을 위한 id · 숨긴 앞말도 없다", () => {
    const { container } = render(
      <DataTable caption="Rooms" columns={columns} rows={rooms} rowKey={(row) => row.id} />,
    );
    expect(screen.queryByRole("radio")).toBeNull();
    expect(container.querySelector("td[id]")).toBeNull();
    expect(container.querySelector("span[hidden]")).toBeNull();
  });
});
