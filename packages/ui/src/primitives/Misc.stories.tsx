import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Kbd, SectionLabel, Separator } from "./Misc";

/* 3스토리 계약(본보기 Button.stories). Misc 모듈의 대표는 Kbd 다 — Separator · SectionLabel 은 Variants · ThemeContrast 에 함께 그린다. */
const meta = {
  title: "Primitives/Misc",
  component: Kbd,
  args: { children: "⌘K" },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("⌘K").tagName).toBe("KBD");
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  // color-contrast: SectionLabel(text-micro muted-foreground) — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <div className="flex w-80 flex-col gap-4 font-sans text-body text-foreground">
      <SectionLabel>Shortcuts</SectionLabel>
      <div className="flex items-center gap-2">
        <Kbd {...args} />
        <Kbd>⇧</Kbd>
        <Kbd>Esc</Kbd>
        <Kbd>1</Kbd>
      </div>
      <Separator />
      <div className="flex h-8 items-center gap-3">
        <span>Left</span>
        <Separator orientation="vertical" />
        <span>Right</span>
      </div>
    </div>
  ),
};

export const ThemeContrast: Story = {
  // color-contrast: ThemePair 머리(text-micro muted-foreground, 라이트) — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <ThemePair>
      <div className="flex w-48 flex-col gap-3">
        <SectionLabel>Shortcuts</SectionLabel>
        <Separator />
        <div className="flex items-center gap-2">
          <Kbd {...args} />
          <Kbd>Esc</Kbd>
        </div>
      </div>
    </ThemePair>
  ),
};
