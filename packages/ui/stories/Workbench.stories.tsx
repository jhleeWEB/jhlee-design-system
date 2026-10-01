import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Workbench, WorkbenchProviders } from "./workbench/Workbench";

/* 제품 화면의 복제 — 3D 배치 설정기 작업대(#71). AppShell(inset) · TopBar · 끌어 바꾸고 접는 인스펙터 · 레일 · 캔버스 위 툴 클러스터 ·
   CAD 커서 · 범례 · 축척 · 판독 · 명령 팔레트가 실제 배치에서 어떻게 서는지를 한 화면에서 본다. 라이트/다크는 VRT 가 테마 전역으로 두 번 찍는다.
   컴포넌트 명세였던 `Pages/Gallery` 는 Phase D 에 컴포넌트 스토리로 나뉘어 지웠고(#48), 이것은 영구다. */
const meta = {
  title: "Pages/Workbench",
  component: Workbench,
  tags: ["!manifest", "!autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <WorkbenchProviders>
        <div className="bg-background font-sans text-body text-foreground">
          <Story />
        </div>
      </WorkbenchProviders>
    ),
  ],
} satisfies Meta<typeof Workbench>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  /* 쥔 툴 ↔ 커서 · 단축키 · ⌘K 팔레트 · 인스펙터 접기를 키보드로 한 바퀴 돌고, VRT 가 처음 상태를 찍도록 전부 되돌린다
     (포인터를 쓰지 않는 것은 툴팁이 열린 채 남지 않게 하려는 것이다). */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const stage = canvasElement.querySelector<HTMLElement>("[data-slot=workbench-canvas]");
    await expect(stage).toHaveAttribute("data-tool", "select");
    await expect(stage).toHaveClass("cursor-cad-select");
    await expect(canvas.getByRole("radio", { name: "Select" })).toHaveAttribute("aria-checked", "true");

    await userEvent.keyboard("g");
    await expect(stage).toHaveAttribute("data-tool", "move");
    await expect(stage).toHaveClass("cursor-cad-move");
    await expect(canvas.getByRole("radio", { name: "Move" })).toHaveAttribute("aria-checked", "true");
    await userEvent.keyboard("v");
    await expect(stage).toHaveAttribute("data-tool", "select");

    await userEvent.keyboard("{Meta>}k{/Meta}");
    const palette = await within(document.body).findByRole("dialog", { name: "Command palette" });
    await expect(palette).toHaveAttribute("data-state", "open");
    await userEvent.keyboard("{Escape}");
    await expect(within(document.body).queryByRole("dialog")).not.toBeInTheDocument();

    const toggle = canvas.getByRole("button", { name: "Collapse the inspector" });
    toggle.focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("button", { name: "Show the inspector" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(canvas.getByRole("complementary", { name: "Inspector", hidden: true })).toHaveAttribute(
      "inert",
    );
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("complementary", { name: "Inspector" })).not.toHaveAttribute("inert");
    (document.activeElement as HTMLElement | null)?.blur();
  },
};
