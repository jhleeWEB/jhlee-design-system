import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { type Column, DataTable } from "./DataTable";

/* 3스토리 계약(본보기 Button.stories). DataTable 은 cva 축이 없다 — 상태(정렬 · 선택 · 합계 · 로딩 · 빈 표)가 곧 변형이라
 * Variants 는 그 상태들을 한 장에 세로로 쌓는다. 수치 열은 우측 정렬 + mono + tabular-nums(원칙 3). */
interface Block {
  readonly id: string;
  readonly floors: number;
  readonly units: number;
  readonly area: number;
  readonly balance: number;
}

const fmt = new Intl.NumberFormat("en-US");
const blocks: readonly Block[] = [
  { id: "A", floors: 21, units: 84, area: 18204, balance: 120 },
  { id: "B", floors: 21, units: 84, area: 18914, balance: 0 },
  { id: "C", floors: 2, units: 0, area: 4860, balance: -48 },
];

const columns: readonly Column<Block>[] = [
  { key: "id", header: "Block", sortValue: (r) => r.id },
  { key: "floors", header: "Floors", numeric: true, sortValue: (r) => r.floors },
  {
    key: "units",
    header: "Units",
    numeric: true,
    sortValue: (r) => r.units,
    cell: (r) => r.units || "—",
    total: fmt.format(168),
  },
  {
    key: "area",
    header: "Area",
    numeric: true,
    sortValue: (r) => r.area,
    cell: (r) => `${fmt.format(r.area)} m²`,
    total: `${fmt.format(41978)} m²`,
  },
  {
    key: "balance",
    header: "Balance",
    numeric: true,
    cell: (r) => (r.balance > 0 ? `+${r.balance}` : r.balance < 0 ? `−${-r.balance}` : "0"),
    tone: (r) => (r.balance > 0 ? "success" : r.balance < 0 ? "destructive" : "warning"),
  },
];

const meta = {
  title: "Data/DataTable",
  component: DataTable<Block>,
  args: { caption: "Block schedule", columns, rows: blocks, rowKey: (r) => r.id },
} satisfies Meta<typeof DataTable<Block>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // color-contrast: success 톤 글자(+120)가 bg-background 위에서 4.23 — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #20 · #24)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  play: async ({ canvas }) => {
    const sort = canvas.getByRole("button", { name: "Floors" });
    await userEvent.click(sort);
    await expect(sort.closest("th")).toHaveAttribute("aria-sort", "ascending");
    await userEvent.click(sort);
    await userEvent.click(sort);
    await expect(sort.closest("th")).toHaveAttribute("aria-sort", "none");
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  // color-contrast: 판정 톤 글자와 muted-foreground 캡션·빈 표 문구가 bg-background 위에서 4.5 미만 — 토큰 값의 몫(#20 · #24)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <DataTable
        {...args}
        caption="Selectable, sticky header"
        captionVisible
        selectedKey="B"
        onSelect={() => {}}
        stickyHeader
      />
      <DataTable {...args} caption="Loading" captionVisible loading loadingRows={3} />
      <DataTable
        {...args}
        caption="Empty"
        captionVisible
        rows={[]}
        empty={
          <div className="px-3 py-8 text-center text-body text-muted-foreground">
            Add a block to fill the schedule.
          </div>
        }
      />
    </div>
  ),
};

export const ThemeContrast: Story = {
  // color-contrast: 라이트의 muted-foreground 라벨·success 톤 글자 — 토큰 값의 몫(#20 · #24)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <ThemePair>
      <DataTable {...args} selectedKey="B" onSelect={() => {}} />
    </ThemePair>
  ),
};
