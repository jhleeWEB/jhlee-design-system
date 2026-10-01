import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen } from "storybook/test";

import { ThemeSides } from "../../stories/helpers/ThemeSides";
import { ConfirmDialog } from "./AlertDialog";

/* 3스토리 계약(본보기 Button.stories). 확인 대화는 **열린 채로** 그린다 — 포털로 나가므로 `#storybook-root` 에는 보이지 않는 앵커를 둔다.
 * `!autodocs` — 문서 페이지에 열린 확인 대화가 뜨면 포커스 트랩과 스크림이 페이지를 덮는다. */
const toneValues = ["destructive", "primary", "neutral"] as const;

const meta = {
  title: "Overlay/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["!autodocs"],
  args: {
    open: true,
    onOpenChange: fn(),
    onConfirm: fn(),
    title: "Delete this layer?",
    description: "Its walls and openings are removed from every sheet. This cannot be undone.",
    confirmLabel: "Delete layer",
    tone: "destructive",
  },
  argTypes: { tone: { control: "select", options: toneValues } },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <span className="sr-only">Confirm dialog open</span>
      <ConfirmDialog {...args} />
    </>
  ),
  play: async () => {
    const dialog = await screen.findByRole("alertdialog", { name: "Delete this layer?" });
    await expect(dialog).toHaveAttribute("data-slot", "confirm-dialog");
    // 첫 포커스는 취소다 — 되돌릴 수 없는 실행이 Enter 한 번에 일어나지 않게.
    await expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  },
};

/* tone × 두 갈래/세 갈래(secondaryAction). 가운데 고정(fixed)이면 여섯이 겹치므로 흐름 안(relative)으로 내려 차례로 쌓는다. */
export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <>
      <span className="sr-only">Confirm dialog tones</span>
      {toneValues.map((tone) =>
        [false, true].map((threeWay) => (
          <ConfirmDialog
            key={`${tone}-${threeWay}`}
            {...args}
            tone={tone}
            title={`tone · ${tone}${threeWay ? " · secondaryAction" : ""}`}
            confirmLabel={threeWay ? "Save and leave" : "Confirm"}
            secondaryAction={threeWay ? { label: "Discard", onSelect: fn() } : undefined}
            className="relative top-auto left-auto mx-auto my-6 translate-x-0 translate-y-0"
          />
        )),
      )}
    </>
  ),
};

/* 같은 대화를 라이트·다크로 — 포털이 칸을 벗어나므로 상자에 `data-theme` 을 직접 단다. 둘이 겹치지 않게 좌우 4분점에 둔다. */
export const ThemeContrast: Story = {
  render: (args) => (
    <ThemeSides>
      {(theme) => (
        <ConfirmDialog {...args} data-theme={theme} className={theme === "light" ? "left-1/4" : "left-3/4"} />
      )}
    </ThemeSides>
  ),
};
