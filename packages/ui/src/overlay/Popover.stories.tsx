import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen } from "storybook/test";

import { ThemeSides } from "../../stories/helpers/ThemeSides";
import { Button } from "../primitives/Button";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "./Popover";

/* 3스토리 계약(본보기 Button.stories). 팝오버는 **열린 채로** 그린다 — 트리거는 `#storybook-root` 안에 있고 상자는 포털로 뜬다.
 * `!autodocs` — 문서 페이지에 열린 팝오버 여럿이 뜨면 포커스가 페이지를 떠난다. */
const flagValues = [false, true] as const;

const meta = {
  title: "Overlay/Popover",
  component: PopoverContent,
  tags: ["!autodocs"],
  args: { "aria-label": "Scale", onCanvas: false, arrow: false },
} satisfies Meta<typeof PopoverContent>;

export default meta;
type Story = StoryObj<typeof meta>;

function ScaleForm() {
  return (
    <div className="flex flex-col gap-3">
      <p className="m-0 text-muted-foreground">Plot scale for the current sheet.</p>
      <PopoverClose asChild>
        <Button variant="outline" size="sm">
          Done
        </Button>
      </PopoverClose>
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <Popover open>
      <PopoverTrigger asChild>
        <Button variant="outline">1 : 100</Button>
      </PopoverTrigger>
      <PopoverContent {...args}>
        <ScaleForm />
      </PopoverContent>
    </Popover>
  ),
  play: async () => {
    const popover = await screen.findByRole("dialog", { name: "Scale" });
    await expect(popover).toHaveAttribute("data-slot", "popover");
  },
};

/* onCanvas × arrow. 캔버스 면(흰 바탕 · 도면 선) 위에 띄워야 on-canvas 의 반투명 + 블러가 보인다 — 트리거를 캔버스 칸 안에 둔다. */
export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <div className="grid grid-cols-2 gap-6 bg-canvas p-6">
      {flagValues.map((onCanvas) =>
        flagValues.map((arrow) => (
          <div
            key={`${onCanvas}-${arrow}`}
            className="flex h-64 flex-col items-start border border-canvas-line-strong p-4"
          >
            <Popover open>
              <PopoverTrigger asChild>
                <Button variant="outline">{`onCanvas · ${onCanvas} · arrow · ${arrow}`}</Button>
              </PopoverTrigger>
              <PopoverContent
                {...args}
                aria-label={`onCanvas ${onCanvas} arrow ${arrow}`}
                onCanvas={onCanvas}
                arrow={arrow}
              >
                <ScaleForm />
              </PopoverContent>
            </Popover>
          </div>
        )),
      )}
    </div>
  ),
};

/* 같은 팝오버를 라이트·다크로 — 포털이 칸을 벗어나므로 상자에 `data-theme` 을 직접 단다. */
export const ThemeContrast: Story = {
  args: { arrow: true },
  render: (args) => (
    <ThemeSides>
      {(theme) => (
        <div className="h-48">
          <Popover open>
            <PopoverTrigger asChild>
              <Button variant="outline">1 : 100</Button>
            </PopoverTrigger>
            <PopoverContent {...args} aria-label={`Scale ${theme}`} data-theme={theme}>
              <ScaleForm />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </ThemeSides>
  ),
};
