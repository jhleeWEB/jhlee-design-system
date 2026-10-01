import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { IconFileText, IconLayers, IconMap, IconSettings } from "../icons/icons";
import { TooltipProvider } from "../overlay/Tooltip";
import { Sidebar, SidebarGroup, SidebarItem, type SidebarProps } from "./Sidebar";

/* 3스토리 계약(본보기 Button.stories). 축은 `side`, 상태는 `collapsed` — Variants 는 둘의 격자다.
 * 접힘 상태는 args 로만 든다(usePanelLayout · localStorage 를 쓰지 않는다) — 저장본이 스토리 픽셀을 흔들면 VRT 가 결정적이지 않다. */
const sideValues = ["left", "right"] as const;

function Items() {
  return (
    <>
      <SidebarGroup label="Project">
        <SidebarItem icon={<IconMap />} label="Site" active badge="3" />
        <SidebarItem icon={<IconLayers />} label="Massing" badge="12" />
        <SidebarItem icon={<IconFileText />} label="Report" />
      </SidebarGroup>
      <SidebarGroup label="Workspace">
        <SidebarItem icon={<IconSettings />} label="Settings" shortcut="⌘," />
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
  render: (args) => (
    <ThemePair>
      {(theme) => (
        <>
          <Sidebar {...args} label={`${args.label ?? "Main"} (${theme})`}>
            <Items />
          </Sidebar>
          <Sidebar {...args} collapsed label={`${args.label ?? "Main"} (${theme} rail)`}>
            <Items />
          </Sidebar>
        </>
      )}
    </ThemePair>
  ),
};
