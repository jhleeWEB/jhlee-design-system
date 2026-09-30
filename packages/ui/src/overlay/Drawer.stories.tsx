import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen } from "storybook/test";

import { ThemeSides } from "../../stories/helpers/ThemeSides";
import { Button } from "../primitives/Button";
import { Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerHeader } from "./Drawer";

/* 3스토리 계약(본보기 Button.stories). 서랍은 **열린 채로** 그린다 — 포털로 나가므로 `#storybook-root` 에는 보이지 않는 앵커를 둔다.
 * `!autodocs` — 문서 페이지에 열린 서랍 여럿이 뜨면 포커스 트랩과 스크림이 페이지를 덮는다. */
const sideValues = ["right", "left", "bottom"] as const;
const sizeValues = ["sm", "md", "lg"] as const;

const meta = {
  title: "Overlay/Drawer",
  component: DrawerContent,
  tags: ["!autodocs"],
  args: { side: "right", size: "md" },
  argTypes: {
    side: { control: "select", options: sideValues },
    size: { control: "select", options: sizeValues },
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof DrawerContent>;

export default meta;
type Story = StoryObj<typeof meta>;

function Layers() {
  return (
    <>
      <DrawerHeader title="Layers" description="Toggle what the plan shows." />
      <DrawerBody>
        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-muted-foreground">
          <li>Walls</li>
          <li>Openings</li>
          <li>Dimensions</li>
        </ul>
        <DrawerClose asChild>
          <Button variant="outline" className="mt-4">
            Done
          </Button>
        </DrawerClose>
      </DrawerBody>
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <>
      <span className="sr-only">Drawer open</span>
      <Drawer open>
        <DrawerContent {...args}>
          <Layers />
        </DrawerContent>
      </Drawer>
    </>
  ),
  play: async () => {
    const drawer = await screen.findByRole("dialog", { name: "Layers" });
    await expect(drawer).toHaveAttribute("data-side", "right");
    await expect(drawer).toHaveAttribute("data-size", "md");
  },
};

/* side × size 아홉 조합. 가장자리 고정(fixed)이면 아홉이 겹치므로 흐름 안(relative · inset-auto)으로 내려 차례로 쌓는다 —
 * 폭(좌우)과 높이(아래)는 그대로 축의 것이고, 좌우 서랍의 전체 높이(h-dvh)만 `h-auto` 로 접는다(아홉 × 뷰포트 높이를 피한다).
 * `modal={false}` 는 스크림·포커스 트랩을 끄려는 것이다(아홉 개가 서로의 바깥을 aria-hidden 으로 가린다). */
export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <>
      <span className="sr-only">Drawer sides and sizes</span>
      {sideValues.map((side) =>
        sizeValues.map((size) => (
          <Drawer key={`${side}-${size}`} open modal={false}>
            <DrawerContent
              {...args}
              side={side}
              size={size}
              aria-describedby={undefined}
              className={side === "bottom" ? "relative inset-auto my-6" : "relative inset-auto my-6 h-auto"}
            >
              <DrawerHeader title={`side · ${side} · size · ${size}`} />
              <DrawerBody>
                <p className="m-0 text-muted-foreground">Panel body.</p>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        )),
      )}
    </>
  ),
};

/* 같은 서랍을 라이트·다크로 — 포털이 칸을 벗어나므로 패널에 `data-theme` 을 직접 단다. 라이트는 왼쪽, 다크는 오른쪽 가장자리. */
export const ThemeContrast: Story = {
  // color-contrast: ThemeSides 칸 머리글(text-muted-foreground 4.33:1)이 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #20 · #24) — Button ThemeContrast 와 같은 면제
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  args: { size: "sm" },
  render: (args) => (
    <ThemeSides>
      {(theme) => (
        <Drawer open modal={false}>
          <DrawerContent {...args} side={theme === "light" ? "left" : "right"} data-theme={theme}>
            <Layers />
          </DrawerContent>
        </Drawer>
      )}
    </ThemeSides>
  ),
};
