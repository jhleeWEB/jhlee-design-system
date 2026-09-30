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
  // color-contrast: text-muted-foreground 가 페이지 바탕(bg-background)·트랙 위에서 4.5:1 미만 — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText("Level 3")).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("button", { name: "Tower A" }));
    await expect(args.items[1]?.onSelect).toHaveBeenCalledOnce();
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  // color-contrast: text-muted-foreground 가 페이지 바탕(bg-background)·트랙 위에서 4.5:1 미만 — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
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
  // color-contrast: ThemePair 의 테마 라벨과 muted 글자 — 토큰 값의 몫(#23)
  // landmark-unique: ThemePair 가 같은 args 를 두 번 그려 같은 이름의 랜드마크가 둘 선다 — 하네스의 산물이지 컴포넌트의 위반이 아니다
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: "color-contrast", enabled: false },
          { id: "landmark-unique", enabled: false },
        ],
      },
    },
  },
  render: (args) => (
    <ThemePair>
      <Breadcrumb {...args} />
    </ThemePair>
  ),
};
