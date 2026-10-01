import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Table, Tbody, Td, Th, Thead, Tr } from "./Table";
import type { CellTone } from "./Table.variants";

/* 3스토리 계약(본보기 Button.stories). 표는 부품을 조립해 쓰므로 스토리의 render 가 부품을 세우고, args(탐침 포함)는 뿌리 `<table>` 에 펼친다.
 * 축은 `Td` 의 `tone` · `numeric` 이다 — Variants 는 두 축의 전 조합을 한 표에 행 = tone, 열 = numeric 으로 그린다. */
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
  render: (args) => (
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
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      <Table {...args}>
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
      </Table>
    </ThemePair>
  ),
};
