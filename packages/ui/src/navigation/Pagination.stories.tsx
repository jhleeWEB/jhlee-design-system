import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Pagination } from "./Pagination";

/* 3스토리 계약(본보기 Button.stories). 축은 `size` — Variants 는 size × 위치(쪽이 적을 때 · 처음 · 가운데 · 끝)와 링크 모드를 그린다.
 * nav 랜드마크가 여럿 서므로 칸마다 이름을 가른다(landmark-unique). */
const sizeValues = ["sm", "md"] as const;
const positionValues = ["few", "start", "middle", "end"] as const;
const positions = {
  few: { page: 2, pageCount: 5 },
  start: { page: 1, pageCount: 20 },
  middle: { page: 10, pageCount: 20 },
  end: { page: 20, pageCount: 20 },
} as const;

const meta = {
  title: "Navigation/Pagination",
  component: Pagination,
  args: { page: 4, pageCount: 12, size: "md", onPageChange: fn() },
  argTypes: { size: { control: "select", options: sizeValues } },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const nav = canvas.getByRole("navigation", { name: "Pagination" });
    await expect(canvas.getByRole("button", { name: "Page 4" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await expect(args.onPageChange).toHaveBeenCalledWith(5);
    await expect(nav).toHaveAttribute("data-slot", "pagination");
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <div className="flex flex-col gap-4">
      {sizeValues.map((size) =>
        positionValues.map((position) => (
          <Pagination
            key={`${size}-${position}`}
            {...args}
            {...positions[position]}
            size={size}
            className="justify-start"
            aria-label={`${size} ${position}`}
          />
        )),
      )}
      <Pagination
        {...args}
        page={7}
        pageCount={40}
        siblingCount={2}
        aria-label="Links"
        className="justify-start"
        renderLink={(page, children) => <a href={`#page-${page}`}>{children}</a>}
      />
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>{(theme) => <Pagination {...args} aria-label={`Pagination (${theme})`} />}</ThemePair>
  ),
};
