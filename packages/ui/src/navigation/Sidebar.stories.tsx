import type { Meta, StoryObj } from "@storybook/react-vite";
import { LuFileText, LuLayers, LuMap, LuSettings } from "react-icons/lu";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { TooltipProvider } from "../overlay/Tooltip";
import { Sidebar, SidebarGroup, SidebarItem, type SidebarProps } from "./Sidebar";

/* 3스토리 계약(본보기 Button.stories). 축은 `side`, 상태는 `collapsed` — Variants 는 둘의 격자다.
 * 접힘 상태는 args 로만 든다(usePanelLayout · localStorage 를 쓰지 않는다) — 저장본이 스토리 픽셀을 흔들면 VRT 가 결정적이지 않다. */
const sideValues = ["left", "right"] as const;

function Items() {
  return (
    <>
      <SidebarGroup label="Project">
        <SidebarItem icon={<LuMap aria-hidden="true" />} label="Site" active badge="3" />
        <SidebarItem icon={<LuLayers aria-hidden="true" />} label="Massing" badge="12" />
        <SidebarItem icon={<LuFileText aria-hidden="true" />} label="Report" />
      </SidebarGroup>
      <SidebarGroup label="Workspace">
        <SidebarItem icon={<LuSettings aria-hidden="true" />} label="Settings" shortcut="⌘," />
      </SidebarGroup>
    </>
  );
}

const meta = {
  title: "Navigation/Sidebar",
  component: Sidebar,
  args: { collapsed: false, side: "left", label: "Main" },
  argTypes: { side: { control: "select", options: sideValues } },
  // 접힌 항목의 툴팁은 앱 뿌리의 TooltipProvider 를 쓴다 — 스토리도 앱처럼 감싼다.
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  render: (args) => (
    <Sidebar {...args}>
      <Items />
    </Sidebar>
  ),
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // color-contrast: 항목 배지(`opacity-70` 의 muted 글자, 2.75:1) — 배지 표현을 바꾸면 기존 픽셀(Gallery · Workbench)이 움직여 이 PR 밖이다(#45 보고)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: /^Site/ })).toHaveAttribute("aria-current", "page");
  },
};

const cases: readonly SidebarProps[] = sideValues.flatMap((side) =>
  [false, true].map((collapsed) => ({ side, collapsed, label: `${side} ${collapsed ? "rail" : "panel"}` })),
);

export const Variants: Story = {
  tags: ["!manifest"],
  // color-contrast: 항목 배지(`opacity-70` 의 muted 글자, 2.75:1) — 배지 표현을 바꾸면 기존 픽셀(Gallery · Workbench)이 움직여 이 PR 밖이다(#45 보고)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: () => (
    <div className="flex items-start gap-6">
      {cases.map((props) => (
        <Sidebar key={props.label} {...props} className="h-(--size-panel)">
          <Items />
        </Sidebar>
      ))}
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
      <Sidebar {...args}>
        <Items />
      </Sidebar>
      <Sidebar {...args} collapsed>
        <Items />
      </Sidebar>
    </ThemePair>
  ),
};
