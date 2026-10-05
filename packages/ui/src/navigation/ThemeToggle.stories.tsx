import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { ThemeToggle } from "./ThemeToggle";

/* 3스토리 계약(본보기 Button.stories). 토글은 `html[data-theme]` 을 읽는다 — 이 카탈로그에서는 툴바의 테마 애드온이 같은 속성을 쓰므로 둘이 함께 움직인다.
 * `storageKey` 는 주지 않는다(결정적 렌더). ThemePair 의 반쪽은 서브트리 속성이라 토글의 아이콘은 문서(html)의 테마를 따른다 — 면과 글자색만 갈린다. */
const meta = {
  title: "Navigation/ThemeToggle",
  component: ThemeToggle,
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    // 누르지 않는다 — 누르면 문서의 테마가 바뀌어 다음 스토리 · VRT 스냅샷에 남는다. 누르기는 옆 spec 이 본다.
    await expect(canvas.getByRole("button", { name: /^Switch to (dark|light) theme$/ })).toBeVisible();
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <div className="flex items-center gap-6 font-sans text-body text-foreground">
      <div className="flex items-center gap-2">
        <ThemeToggle {...args} />
        <span>default</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle {...args} disabled />
        <span>disabled</span>
      </div>
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      <ThemeToggle {...args} />
      <ThemeToggle {...args} disabled />
    </ThemePair>
  ),
};
