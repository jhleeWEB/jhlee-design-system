import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Breadcrumb } from "./Breadcrumb";

/* 3스토리 계약(본보기 Button.stories). 축이 없다 — Variants 는 조각의 세 모양(링크 · 버튼 · 현재 위치)과 길이를 나란히 둔다. */
const meta = {
  title: "Navigation/Breadcrumb",
  component: Breadcrumb,
  args: {
    items: [
      { label: "Projects", href: "#projects" },
      { label: "Tower A", onSelect: fn() },
      { label: "Level 3" },
    ],
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText("Level 3")).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("button", { name: "Tower A" }));
    await expect(args.items[1]?.onSelect).toHaveBeenCalledOnce();
    // 링크 조각은 브라우저 기본 링크(파랑 · 밑줄)가 아니라 경로의 muted 글자다(#70) — 버튼 조각과 같은 색이어야 한다.
    const link = canvas.getByRole("link", { name: "Projects" });
    const button = canvas.getByRole("button", { name: "Tower A" });
    await userEvent.unhover(button);
    await expect(getComputedStyle(link).textDecorationLine).toBe("none");
    await expect(getComputedStyle(link).color).toBe(getComputedStyle(button).color);
    (document.activeElement as HTMLElement | null)?.blur();
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: () => (
    <div className="flex flex-col gap-4">
      <Breadcrumb aria-label="Single" items={[{ label: "Projects" }]} />
      <Breadcrumb
        aria-label="Links"
        items={[{ label: "Projects", href: "#projects" }, { label: "Tower A" }]}
      />
      <Breadcrumb
        aria-label="Buttons"
        items={[
          { label: "Projects", onSelect: () => {} },
          { label: "Tower A", onSelect: () => {} },
          { label: "Level 3" },
        ]}
      />
      <div className="w-(--size-panel)">
        <Breadcrumb
          aria-label="Truncated"
          items={[
            { label: "Projects", href: "#projects" },
            { label: "Riverside residential tower, phase two", href: "#tower" },
            { label: "Level 3 — typical floor plate" },
          ]}
        />
      </div>
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>{(theme) => <Breadcrumb {...args} aria-label={`Breadcrumb (${theme})`} />}</ThemePair>
  ),
};
