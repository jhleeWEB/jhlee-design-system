import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { ScrollArea } from "./ScrollArea";

/* 3스토리 계약(본보기 Button.stories). 스크롤바는 스크롤하는 동안만 보인다 — 정지 화면(VRT)은 막대 없는 상태가 기준선이다.
 * 높이는 뿌리 className 으로 제한한다(스크롤 영역의 크기는 언제나 호출처가 정한다). */
const orientationValues = ["vertical", "horizontal", "both"] as const;
const frame = "h-(--size-panel) w-(--size-panel) rounded-md border border-border bg-card";
const rows = Array.from({ length: 24 }, (_, i) => `Level ${String(i + 1).padStart(2, "0")}`);

function Rows({ wide = false }: { wide?: boolean }) {
  return (
    <ul className={wide ? "m-0 flex w-max flex-col gap-1 p-3" : "m-0 flex flex-col gap-1 p-3"}>
      {rows.map((row) => (
        <li key={row} className="list-none font-mono text-body text-foreground tabular-nums">
          {wide ? `${row} · gross floor area 1,240 m² · net 1,012 m² · efficiency 81.6 %` : row}
        </li>
      ))}
    </ul>
  );
}

const meta = {
  title: "Navigation/ScrollArea",
  component: ScrollArea,
  // 크기는 className 으로 — 뿌리에 펼치는 args 라 계약 탐침의 className 도 같은 자리에 닿는다.
  // 스크롤되는 내용에 포커스 가능한 요소가 없으면 뷰포트가 탭 순서에 서야 키보드로 스크롤할 수 있다(axe scrollable-region-focusable).
  args: { orientation: "vertical", className: frame, viewportProps: { tabIndex: 0 } },
  argTypes: { orientation: { control: "select", options: orientationValues } },
  render: (args) => (
    <ScrollArea {...args}>
      <Rows />
    </ScrollArea>
  ),
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
    await expect(viewport).not.toBeNull();
    await expect(viewport!.scrollHeight).toBeGreaterThan(viewport!.clientHeight);
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: () => (
    <div className="flex items-start gap-6">
      {orientationValues.map((orientation) => (
        <div key={orientation} className="flex flex-col gap-2">
          <span className="font-mono text-micro text-foreground">{orientation}</span>
          <ScrollArea orientation={orientation} className={frame} viewportProps={{ tabIndex: 0 }}>
            <Rows wide={orientation !== "vertical"} />
          </ScrollArea>
        </div>
      ))}
    </div>
  ),
};

export const ThemeContrast: Story = {
  // color-contrast: ThemePair 의 테마 라벨과 muted 글자 — 토큰 값의 몫(#23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <ThemePair>
      <ScrollArea {...args}>
        <Rows />
      </ScrollArea>
    </ThemePair>
  ),
};
