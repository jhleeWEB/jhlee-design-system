import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen } from "storybook/test";

import { ThemeSides } from "../../stories/helpers/ThemeSides";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./HoverCard";

/* 3스토리 계약(본보기 Button.stories). 호버 카드는 **열린 채로** 그린다(`open`) — 호버를 기다리면 VRT 가 상자를 보지 못한다.
 * 트리거는 `#storybook-root` 안의 링크이고 상자는 포털로 뜬다. 상자는 트리거 아래로 편다 — `avoidCollisions={false}` 로
 * 뷰포트 끝에서 뒤집히지 않게 한다(DropdownMenu 의 실측: 뒤집히면 픽셀이 뷰포트 높이에 매인다).
 * `!autodocs` — 문서 페이지에 열린 상자 여럿이 뜨면 서로 겹친다. */
const flagValues = [false, true] as const;

const meta = {
  title: "Overlay/HoverCard",
  component: HoverCardContent,
  tags: ["!autodocs"],
  args: { onCanvas: false, arrow: false, side: "bottom", align: "start", avoidCollisions: false },
} satisfies Meta<typeof HoverCardContent>;

export default meta;
type Story = StoryObj<typeof meta>;

function SheetSummary() {
  return (
    <div className="flex flex-col gap-2">
      <p className="m-0 font-semibold">A-101 · Ground floor plan</p>
      <p className="m-0 text-muted-foreground">Revised 3 days ago by the site team.</p>
      <p className="m-0 tnum font-mono text-muted-foreground">1 : 100 · 12 layers</p>
    </div>
  );
}

function SheetLink({ label = "A-101" }: { label?: string }) {
  return (
    <HoverCardTrigger href="#a-101" className="text-primary underline underline-offset-2">
      {label}
    </HoverCardTrigger>
  );
}

export const Default: Story = {
  render: (args) => (
    <div className="h-48">
      <HoverCard open>
        <SheetLink />
        <HoverCardContent {...args}>
          <SheetSummary />
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
  play: async () => {
    const card = await screen.findByText("A-101 · Ground floor plan");
    await expect(card.closest('[data-slot="hover-card"]')).not.toBeNull();
  },
};

/* onCanvas × arrow. 캔버스 면 위에 띄워야 on-canvas 의 반투명 + 블러가 보인다 — 트리거를 캔버스 칸 안에 둔다. */
export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <div className="grid grid-cols-2 gap-6 bg-canvas p-6">
      {flagValues.map((onCanvas) =>
        flagValues.map((arrow) => (
          <div
            key={`${onCanvas}-${arrow}`}
            className="flex h-56 flex-col items-start border border-canvas-line-strong p-4"
          >
            <HoverCard open>
              <SheetLink label={`onCanvas · ${onCanvas} · arrow · ${arrow}`} />
              <HoverCardContent {...args} onCanvas={onCanvas} arrow={arrow}>
                <SheetSummary />
              </HoverCardContent>
            </HoverCard>
          </div>
        )),
      )}
    </div>
  ),
};

/* 같은 카드를 라이트·다크로 — 포털이 칸을 벗어나므로 상자에 `data-theme` 을 직접 단다. */
export const ThemeContrast: Story = {
  args: { arrow: true },
  render: (args) => (
    <ThemeSides>
      {(theme) => (
        <div className="h-48">
          <HoverCard open>
            <SheetLink label={`A-101 (${theme})`} />
            <HoverCardContent {...args} data-theme={theme}>
              <SheetSummary />
            </HoverCardContent>
          </HoverCard>
        </div>
      )}
    </ThemeSides>
  ),
};
