import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { Avatar, AvatarGroup } from "./Avatar";

/* 3스토리 계약(본보기 Button.stories). 축은 `size` 하나 — Variants 는 size × 모양(이미지 · 이니셜 · 한 글자 · 깨진 이미지)과 묶음을 그린다.
 * 이미지는 data URI 의 SVG 다 — 네트워크가 없어도 같은 픽셀이고(VRT), jsdom 은 이미지를 불러오지 않아 이니셜 폴백을 본다(계약 테스트). */
const sizeValues = ["sm", "md", "lg"] as const;
const shapeValues = ["image", "initials", "single", "broken"] as const;

/** 사람 사진 대신 쓰는 무채색 추상 그림 — 픽셀이 결정적이다. */
const PORTRAIT = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#d5dae1"/><circle cx="20" cy="16" r="7" fill="#7b8594"/><rect x="8" y="26" width="24" height="18" rx="12" fill="#7b8594"/></svg>',
)}`;
/** 불러오지 못하는 주소 — 폴백이 남는다. */
const BROKEN = "data:image/png;base64,broken";

const meta = {
  title: "Primitives/Avatar",
  component: Avatar,
  args: { name: "Ada Lovelace", size: "md" },
  argTypes: { size: { control: "select", options: sizeValues } },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "Ada Lovelace" })).toHaveTextContent("AL");
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Matrix
        rows={sizeValues}
        cols={shapeValues}
        rowLabel="size"
        colLabel="shape"
        cell={(size, shape) => (
          <Avatar
            {...args}
            size={size}
            name={shape === "single" ? "Hypatia" : args.name}
            src={shape === "image" ? PORTRAIT : shape === "broken" ? BROKEN : undefined}
          />
        )}
      />
      {sizeValues.map((size) => (
        <AvatarGroup key={size} size={size} max={4} aria-label={`Reviewers ${size}`}>
          <Avatar name="Ada Lovelace" src={PORTRAIT} />
          <Avatar name="Grace Hopper" />
          <Avatar name="Alan Turing" />
          <Avatar name="Edsger Dijkstra" />
          <Avatar name="Barbara Liskov" />
          <Avatar name="Donald Knuth" />
          <Avatar name="Frances Allen" />
        </AvatarGroup>
      ))}
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      {(theme) => (
        <>
          <Avatar {...args} />
          <Avatar {...args} name="Grace Hopper" src={PORTRAIT} />
          <AvatarGroup max={2} aria-label={`Reviewers ${theme}`}>
            <Avatar name="Alan Turing" />
            <Avatar name="Barbara Liskov" />
            <Avatar name="Donald Knuth" />
            <Avatar name="Frances Allen" />
          </AvatarGroup>
        </>
      )}
    </ThemePair>
  ),
};
