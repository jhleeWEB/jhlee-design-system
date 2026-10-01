import type { Meta, StoryObj } from "@storybook/react-vite";

import { Workbench, WorkbenchProviders } from "./workbench/Workbench";

/* 제품 화면의 복제(옅은 바닥 · 64px 레일 · 두 줄 헤더 · 떠 있는 카드 셋 · 상태 줄)만 따로 — 토큰과 컴포넌트가 실제 배치에서
   어떻게 서는지를 한 화면에서 본다. 컴포넌트 명세였던 `Pages/Gallery` 는 Phase D 에 컴포넌트 스토리로 나뉘어 지웠고(#48), 이것은 영구다. */
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
  // aria-progressbar-name 은 제품 화면 복제의 Progress 에 라벨이 없어서다 — Phase D 의 몫.
  parameters: {
    a11y: {
      config: {
        rules: [{ id: "aria-progressbar-name", enabled: false }],
      },
    },
  },
};
