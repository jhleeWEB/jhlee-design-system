import type { Meta, StoryObj } from "@storybook/react-vite";

import { Gallery, GalleryProviders } from "./gallery/Gallery";

/* 옛 `apps/ds-gallery` 전체 — 작업대 복제 + 컴포넌트 명세 17절. 라이트·다크를 스토리로 고정해 두는 이유는
   VRT 기준선이 «전체 화면 두 장» 으로 남아야 토큰 개명(Phase B)·모서리(Part 3) 같은 전면 변경을 0px 로 검증할 수 있기 때문이다.
   `!manifest`: 페이지 스토리는 컴포넌트 매니페스트(Phase C)의 입력이 아니다. */
const meta = {
  title: "Pages/Gallery",
  component: Gallery,
  tags: ["!manifest", "!autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    Story => (
      <GalleryProviders>
        <Story />
      </GalleryProviders>
    ),
  ],
} satisfies Meta<typeof Gallery>;

export default meta;
type Story = StoryObj<typeof meta>;

/* 스토리 수준 `globals` 는 툴바 선택을 잠근다 — 크롤러는 이 두 스토리를 테마별로 한 번씩만 찍는다(`theme-locked`). */
export const Light: Story = { tags: ["theme-locked"], globals: { theme: "light" } };
export const Dark: Story = { tags: ["theme-locked"], globals: { theme: "dark" } };
