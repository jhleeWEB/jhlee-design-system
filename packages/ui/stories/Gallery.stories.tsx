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
// 옛 갤러리를 통째 옮긴 페이지라 위반이 여럿이다 — color-contrast 는 토큰 값의 몫(contrast.spec), aria-progressbar-name·label 은 Phase D 가 Spec 을 컴포넌트
// 스토리로 쪼갤 때 고친다(각 Spec 이 자기 라벨을 든다). 그때까지 스토리 단위로만 끈다(C2, stories-contract.spec KNOWN_A11Y_FAILURES).
const knownA11y = { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }, { id: "aria-progressbar-name", enabled: false }, { id: "label", enabled: false }] } } };
export const Light: Story = { tags: ["theme-locked"], globals: { theme: "light" }, parameters: knownA11y };
export const Dark: Story = { tags: ["theme-locked"], globals: { theme: "dark" }, parameters: knownA11y };
