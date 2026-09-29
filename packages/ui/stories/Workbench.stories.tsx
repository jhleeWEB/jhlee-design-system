import type { Meta, StoryObj } from "@storybook/react-vite";

import { GalleryProviders, Workbench } from "./gallery/Gallery";

/* 제품 화면의 복제(옅은 바닥 · 64px 레일 · 두 줄 헤더 · 떠 있는 카드 셋 · 상태 줄)만 따로 — 토큰과 컴포넌트가 실제 배치에서
   어떻게 서는지가 컴포넌트 목록보다 먼저 보여야 한다. `Pages/Gallery` 가 Phase D 에 사라진 뒤에도 이것은 남는다. */
const meta = {
  title: "Pages/Workbench",
  component: Workbench,
  tags: ["!manifest", "!autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    Story => (
      <GalleryProviders>
        <div className="bg-chrome font-sans text-body text-ink">
          <Story />
        </div>
      </GalleryProviders>
    ),
  ],
} satisfies Meta<typeof Workbench>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
