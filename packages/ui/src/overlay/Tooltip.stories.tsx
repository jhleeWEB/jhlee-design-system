import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen } from "storybook/test";

import { ThemeSides } from "../../stories/helpers/ThemeSides";
import { Button } from "../primitives/Button";
import { Tooltip, TooltipProvider } from "./Tooltip";

/* 3스토리 계약(본보기 Button.stories). 툴팁은 **열린 채로**(`open`) 그린다 — 포인터를 올려야 뜨는 것은 VRT 가 보지 못한다.
 * 트리거는 `#storybook-root` 안에 있고 말풍선은 포털로 뜬다. 칸마다 위아래 여백을 두어 말풍선이 뷰포트 끝에서 뒤집히지 않게 한다.
 * `!autodocs` — 문서 페이지에서는 열린 말풍선이 다른 스토리를 덮는다. */
const sideValues = ["top", "right", "bottom", "left"] as const;

const meta = {
  title: "Overlay/Tooltip",
  component: Tooltip,
  tags: ["!autodocs"],
  args: { label: "Zoom to fit", shortcut: "⇧2", open: true, side: "top", children: null },
  argTypes: { side: { control: "select", options: sideValues }, children: { control: false } },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="p-12">
      <Tooltip {...args}>
        <Button variant="outline">Fit</Button>
      </Tooltip>
    </div>
  ),
  play: async () => {
    const tooltip = await screen.findByRole("tooltip");
    await expect(tooltip).toHaveTextContent("Zoom to fit");
  },
};

/* side 네 방향 × 단축키 유무. 말풍선끼리 겹치지 않게 칸을 넉넉히 둔다. */
export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <div className="grid grid-cols-2 gap-24 p-24">
      {sideValues.map((side) =>
        [args.shortcut, undefined].map((shortcut) => (
          <div key={`${side}-${shortcut ?? "none"}`} className="flex justify-center">
            <Tooltip {...args} side={side} shortcut={shortcut} label={`side · ${side}`}>
              <Button variant="outline">{side}</Button>
            </Tooltip>
          </div>
        )),
      )}
    </div>
  ),
};

/* 같은 말풍선을 라이트·다크로 — 포털이 칸을 벗어나므로 말풍선에 `data-theme` 을 직접 단다. 툴팁은 면을 뒤집으므로 두 칸의 말풍선이 서로 반대 색이다. */
export const ThemeContrast: Story = {
  // color-contrast: ThemeSides 칸 머리글(text-muted-foreground 4.33:1)이 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #20 · #24) — Button ThemeContrast 와 같은 면제
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  args: { side: "bottom" },
  render: (args) => (
    <ThemeSides>
      {(theme) => (
        <div className="h-24">
          <Tooltip {...args} data-theme={theme}>
            <Button variant="outline">Fit</Button>
          </Tooltip>
        </div>
      )}
    </ThemeSides>
  ),
};
