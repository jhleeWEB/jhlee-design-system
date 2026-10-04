import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Table, TableCaption, Tbody, Td, Tfoot, Th, Thead, Tr } from "./Table";
import type { CellTone } from "./Table.variants";

/* 3스토리 계약(본보기 Button.stories). 표는 부품을 조립해 쓰므로 스토리의 render 가 부품을 세우고, args(탐침 포함)는 뿌리 `<table>` 에 펼친다.
 * 축은 `Td` 의 `tone` · `numeric` 이다 — Variants 는 두 축의 전 조합을 한 표에 행 = tone, 열 = numeric 으로 그린다.
 * 그 아래 두 표는 합성 부품이다(#108): 캡션(위 · 아래) · 줄 머리(`Th variant="text"`) · 합계 구역(`Tfoot`, 합계 줄 둘). */
const toneValues = ["neutral", "success", "warning", "destructive"] as const satisfies readonly CellTone[];

const meta = {
  title: "Data/Table",
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Table {...args}>
      <Thead>
        <Tr>
          <Th>Block</Th>
          <Th numeric>Floors</Th>
          <Th numeric>Units</Th>
          <Th numeric>Area</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td>A</Td>
          <Td numeric>21</Td>
          <Td numeric>84</Td>
          <Td numeric>18,204</Td>
        </Tr>
        <Tr selected>
          <Td>B</Td>
          <Td numeric>21</Td>
          <Td numeric>84</Td>
          <Td numeric>18,914</Td>
        </Tr>
        <Tr>
          <Td>C</Td>
          <Td numeric>2</Td>
          <Td numeric>—</Td>
          <Td numeric tone="destructive">
            −48
          </Td>
        </Tr>
      </Tbody>
    </Table>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("table")).toBeInTheDocument();
    await expect(canvas.getAllByRole("columnheader")).toHaveLength(4);
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  play: async ({ canvas }) => {
    // 캡션이 표의 이름이다 — 합계 구역은 줄 둘, 줄 머리는 본문 글자(대문자 mono 가 아니다).
    const schedule = canvas.getByRole("table", { name: "Room schedule" });
    const totals = within(schedule).getAllByRole("rowgroup").at(-1);
    if (!totals) throw new Error("합계 구역(tfoot)이 없다");
    await expect(totals).toHaveAttribute("data-slot", "table-footer");
    await expect(within(totals).getAllByRole("row")).toHaveLength(2);
    const rowHead = within(schedule).getByRole("rowheader", { name: "Kitchen" });
    await expect(getComputedStyle(rowHead).textTransform).toBe("none");
    await expect(canvas.getByRole("table", { name: /inside face of walls/ })).toBeInTheDocument();
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Table {...args}>
        <Thead>
          <Tr>
            <Th>tone</Th>
            <Th>text</Th>
            <Th numeric>numeric</Th>
          </Tr>
        </Thead>
        <Tbody>
          {toneValues.map((tone) => (
            <Tr key={tone}>
              <Th scope="row">{tone}</Th>
              <Td tone={tone}>Label {tone}</Td>
              <Td tone={tone} numeric>
                1,234.50
              </Td>
            </Tr>
          ))}
          <Tr selected>
            <Th scope="row">selected</Th>
            <Td>Selected row</Td>
            <Td numeric>98.00</Td>
          </Tr>
        </Tbody>
      </Table>
      <Table>
        <TableCaption>Room schedule</TableCaption>
        <Thead>
          <Tr>
            <Th>Room</Th>
            <Th numeric>Area</Th>
            <Th numeric>Share</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Th scope="row" variant="text">
              Living
            </Th>
            <Td numeric>24.50</Td>
            <Td numeric>38%</Td>
          </Tr>
          <Tr>
            <Th scope="row" variant="text">
              Kitchen
            </Th>
            <Td numeric>12.00</Td>
            <Td numeric>19%</Td>
          </Tr>
          <Tr>
            <Th scope="row" variant="text">
              Bedroom 1
            </Th>
            <Td numeric>14.20</Td>
            <Td numeric>22%</Td>
          </Tr>
        </Tbody>
        <Tfoot>
          <Tr>
            <Th scope="row" variant="text">
              Usable interior
            </Th>
            <Td numeric>50.70</Td>
            <Td numeric>79%</Td>
          </Tr>
          <Tr>
            <Th scope="row" variant="text">
              Calculated total
            </Th>
            <Td numeric>64.10</Td>
            <Td numeric>100%</Td>
          </Tr>
        </Tfoot>
      </Table>
      <Table>
        <TableCaption side="bottom">Areas in m², measured to the inside face of walls.</TableCaption>
        <Thead>
          <Tr>
            <Th>Room</Th>
            <Th numeric>Area</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Th scope="row" variant="text">
              Living
            </Th>
            <Td numeric>24.50</Td>
          </Tr>
        </Tbody>
      </Table>
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      <Table {...args}>
        <TableCaption>Block schedule</TableCaption>
        <Thead>
          <Tr>
            <Th>Block</Th>
            <Th numeric>Units</Th>
            <Th numeric>Balance</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>A</Td>
            <Td numeric>84</Td>
            <Td numeric tone="success">
              +120
            </Td>
          </Tr>
          <Tr selected>
            <Td>B</Td>
            <Td numeric>84</Td>
            <Td numeric tone="warning">
              0
            </Td>
          </Tr>
          <Tr>
            <Td>C</Td>
            <Td numeric>—</Td>
            <Td numeric tone="destructive">
              −48
            </Td>
          </Tr>
        </Tbody>
        <Tfoot>
          <Tr>
            <Th scope="row" variant="text">
              Total
            </Th>
            <Td numeric>168</Td>
            <Td numeric>+72</Td>
          </Tr>
        </Tfoot>
      </Table>
    </ThemePair>
  ),
};
