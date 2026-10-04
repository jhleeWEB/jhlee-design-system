import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { Table, TableCaption, Tbody, Td, Tfoot, Th, Thead, Tr } from "./Table";
import * as stories from "./Table.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 유일한 픽스처이고 탐침은 뿌리 `<table>` 에 얹힌다.
 * 부품(Thead · Tbody · Tfoot · TableCaption · Tr · Th · Td)의 계약은 render-all.spec 의 픽스처가 돈다 — `Td` 의 `tone` · `Th` 의 `variant` ·
 * `TableCaption` 의 `side` 축(data-*)도 거기서 본다. 여기는 합성 부품의 뜻(이름 · 구역 · 줄 머리)을 본다(#108). */
describeComponentContract(stories, { slot: "table" });

afterEach(cleanup);

function Schedule({ caption }: { caption: React.ReactNode }) {
  return (
    <Table>
      {caption}
      <Thead>
        <Tr>
          <Th>Room</Th>
          <Th numeric>Area</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Th scope="row" variant="text">
            Kitchen
          </Th>
          <Td numeric>12.00</Td>
        </Tr>
      </Tbody>
      <Tfoot>
        <Tr>
          <Th scope="row" variant="text">
            Usable interior
          </Th>
          <Td numeric>50.70</Td>
        </Tr>
        <Tr>
          <Th scope="row" variant="text">
            Calculated total
          </Th>
          <Td numeric>64.10</Td>
        </Tr>
      </Tfoot>
    </Table>
  );
}

describe("TableCaption — 표의 이름", () => {
  it("캡션의 글자가 표의 접근 이름이고, 기본은 표 위다", () => {
    render(<Schedule caption={<TableCaption>Room schedule</TableCaption>} />);
    const table = screen.getByRole("table", { name: "Room schedule" });
    const caption = table.querySelector("caption");
    expect(caption).toHaveAttribute("data-slot", "table-caption");
    expect(caption).toHaveAttribute("data-side", "top");
    expect(caption).toHaveClass("caption-top", "pb-2");
    expect(caption).not.toHaveAttribute("data-visually-hidden");
  });

  it("side=bottom 은 표 아래에 서고 사이 여백이 위로 붙는다", () => {
    render(<Schedule caption={<TableCaption side="bottom">Areas in m²</TableCaption>} />);
    const caption = screen.getByRole("table", { name: "Areas in m²" }).querySelector("caption");
    expect(caption).toHaveAttribute("data-side", "bottom");
    expect(caption).toHaveClass("caption-bottom", "pt-2");
    expect(caption).not.toHaveClass("pb-2");
  });

  it("visuallyHidden 은 화면에서만 숨긴다 — 표의 이름은 남고, 패딩은 붙지 않는다", () => {
    render(<Schedule caption={<TableCaption visuallyHidden>Room schedule</TableCaption>} />);
    const caption = screen.getByRole("table", { name: "Room schedule" }).querySelector("caption");
    expect(caption).toHaveClass("sr-only");
    expect(caption).toHaveAttribute("data-visually-hidden", "");
    expect(caption?.className).not.toMatch(/\bp[xytb]?-\d/);
  });
});

describe("Tfoot — 합계 구역", () => {
  it("tfoot 으로 그려지고 합계 줄을 여럿 담는다", () => {
    render(<Schedule caption={<TableCaption>Room schedule</TableCaption>} />);
    const table = screen.getByRole("table", { name: "Room schedule" });
    const foot = table.querySelector("tfoot");
    expect(foot).toHaveAttribute("data-slot", "table-footer");
    expect(foot).toHaveClass("border-t-2", "border-border-strong", "bg-muted", "font-medium");
    expect(within(foot as HTMLElement).getAllByRole("row")).toHaveLength(2);
  });

  it("className 은 tailwind-merge 로 합쳐진다 — 면을 걷을 수 있다", () => {
    render(
      <Table>
        <Tfoot className="bg-transparent">
          <Tr>
            <Td>Total</Td>
          </Tr>
        </Tfoot>
      </Table>,
    );
    const foot = screen.getByRole("table").querySelector("tfoot");
    expect(foot).toHaveClass("bg-transparent");
    expect(foot).not.toHaveClass("bg-muted");
  });
});

describe("Th — 열 머리와 줄 머리", () => {
  it("기본은 열 머리의 메타 라벨(scope=col · mono 대문자 · 아래 구분선)이다", () => {
    render(<Schedule caption={null} />);
    const head = screen.getByRole("columnheader", { name: "Room" });
    expect(head).toHaveAttribute("scope", "col");
    expect(head).toHaveAttribute("data-variant", "label");
    expect(head).toHaveClass("uppercase", "font-mono", "border-b");
  });

  it('variant="text" 는 줄 머리를 본문 글자로 세운다 — 대문자 · mono · 아래 구분선이 없다', () => {
    render(<Schedule caption={null} />);
    const rowHead = screen.getByRole("rowheader", { name: "Kitchen" });
    expect(rowHead).toHaveAttribute("scope", "row");
    expect(rowHead).toHaveAttribute("data-variant", "text");
    expect(rowHead).toHaveClass("text-body", "font-medium", "text-foreground");
    expect(rowHead).not.toHaveClass("uppercase");
    expect(rowHead).not.toHaveClass("font-mono");
    // 구분선은 줄(Tr)이 긋는다 — 줄 머리가 따로 그으면 마지막 줄(`last:border-b-0`) 아래에 선이 남는다.
    expect(rowHead).not.toHaveClass("border-b");
  });

  it("scope 를 따로 적지 않은 줄 머리(`scope` 없이 variant 만)는 col 로 남는다 — 뜻은 호출처가 적는다", () => {
    render(
      <Table>
        <Tbody>
          <Tr>
            <Th variant="text">Kitchen</Th>
          </Tr>
        </Tbody>
      </Table>,
    );
    expect(screen.getByRole("columnheader", { name: "Kitchen" })).toHaveAttribute("data-variant", "text");
  });
});
