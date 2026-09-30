import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen } from "storybook/test";

import { ThemeSides } from "../../stories/helpers/ThemeSides";
import { Button } from "../primitives/Button";
import { Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader } from "./Modal";

/* 3스토리 계약(본보기 Button.stories). 오버레이는 **열린 채로** 그린다 — 닫힌 트리거만 찍으면 VRT 가 상자를 보지 못한다.
 * 상자는 포털로 `document.body` 에 나가므로 `#storybook-root` 에는 보이지 않는 앵커를 둔다(VRT 크롤러가 `#storybook-root > *` 를 기다린다).
 * `!autodocs` — 문서 페이지에 열린 모달 여럿이 뜨면 포커스 트랩과 스크림이 페이지를 덮는다. */
const sizeValues = ["sm", "md", "lg", "xl", "full"] as const;

const meta = {
  title: "Overlay/Modal",
  component: ModalContent,
  tags: ["!autodocs"],
  args: { size: "md" },
  argTypes: { size: { control: "select", options: sizeValues } },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ModalContent>;

export default meta;
type Story = StoryObj<typeof meta>;

function Sheet() {
  return (
    <>
      <ModalHeader title="Export drawings" description="Choose the sheets to include in the PDF set." />
      <ModalBody>
        <p className="m-0 text-muted-foreground">Sheets are exported at their plotted scale.</p>
      </ModalBody>
      <ModalFooter>
        <ModalClose asChild>
          <Button variant="outline">Cancel</Button>
        </ModalClose>
        <Button variant="solid" tone="primary">
          Export
        </Button>
      </ModalFooter>
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <>
      <span className="sr-only">Modal open</span>
      <Modal open>
        <ModalContent {...args}>
          <Sheet />
        </ModalContent>
      </Modal>
    </>
  ),
  play: async () => {
    const dialog = await screen.findByRole("dialog", { name: "Export drawings" });
    await expect(dialog).toHaveAttribute("data-size", "md");
  },
};

/* 크기마다 상자 하나. 가운데 고정(fixed)이면 다섯이 겹치므로 흐름 안(relative)으로 내려 차례로 쌓는다 — 폭·높이는 그대로 size 축의 것이다.
 * `modal={false}` 는 스크림·포커스 트랩을 끄려는 것이다(다섯 개가 서로의 바깥을 aria-hidden 으로 가린다). */
export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <>
      <span className="sr-only">Modal sizes</span>
      {sizeValues.map((size) => (
        <Modal key={size} open modal={false}>
          <ModalContent
            {...args}
            size={size}
            aria-describedby={undefined}
            className="relative top-auto left-auto mx-auto my-6 translate-x-0 translate-y-0"
          >
            <ModalHeader title={`size · ${size}`} />
            <ModalBody>
              <p className="m-0 text-muted-foreground">
                The width is the fluid viewport width capped by the size.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="solid" tone="primary">
                Done
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ))}
    </>
  ),
};

/* 같은 상자를 라이트·다크로 — 포털이 칸을 벗어나므로 상자에 `data-theme` 을 직접 단다. 둘이 겹치지 않게 좌우 4분점에 둔다. */
export const ThemeContrast: Story = {
  // color-contrast: ThemeSides 칸 머리글(text-muted-foreground 4.33:1)이 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #20 · #24) — Button ThemeContrast 와 같은 면제
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  args: { size: "sm" },
  render: (args) => (
    <ThemeSides>
      {(theme) => (
        <Modal open modal={false}>
          <ModalContent {...args} data-theme={theme} className={theme === "light" ? "left-1/4" : "left-3/4"}>
            <Sheet />
          </ModalContent>
        </Modal>
      )}
    </ThemeSides>
  ),
};
