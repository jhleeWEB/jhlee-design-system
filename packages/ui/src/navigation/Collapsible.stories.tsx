import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./Collapsible";

/* 3스토리 계약(본보기 Button.stories). 축은 트리거의 `variant`(row · inline) — Variants 는 variant × 상태(열림 · 닫힘 · 비활성) 격자다.
 * 본문은 접혀도 DOM 에 남으므로(forceMount) 닫힌 칸도 같은 높이 계산을 탄다 — 픽셀은 grid-rows 0fr 로 접힌 모습이다. */
const variantValues = ["row", "inline"] as const;
const stateValues = ["open", "closed", "disabled"] as const;

function Body() {
  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0 text-body text-muted-foreground">
      <li>Setback · 3.0 m</li>
      <li>Height limit · 45 m</li>
      <li>Coverage · 60 %</li>
    </ul>
  );
}

const meta = {
  title: "Navigation/Collapsible",
  component: Collapsible,
  args: { defaultOpen: true },
  render: (args) => (
    <div className="w-(--size-panel)">
      <Collapsible {...args}>
        <CollapsibleTrigger>Advanced settings</CollapsibleTrigger>
        <CollapsibleContent className="px-3">
          <Body />
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Advanced settings" });
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: () => (
    <Matrix
      rows={variantValues}
      cols={stateValues}
      rowLabel="variant"
      colLabel="state"
      cell={(variant, state) => (
        <div className="w-56">
          <Collapsible defaultOpen={state === "open"} disabled={state === "disabled"}>
            <CollapsibleTrigger variant={variant}>{`${variant} · ${state}`}</CollapsibleTrigger>
            <CollapsibleContent className="px-3">
              <Body />
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    />
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      {(theme) => (
        <div className="w-56">
          <Collapsible {...args}>
            <CollapsibleTrigger>
              Advanced settings<span className="sr-only"> · {theme}</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3">
              <Body />
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </ThemePair>
  ),
};
