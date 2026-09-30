import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from "./Accordion";

/* 3스토리 계약(본보기 Button.stories). 축(cva)이 없는 컴포넌트라 Variants 는 모드(single · multiple)와 상태(열림 · 닫힘 · 비활성)를 나란히 둔다. */
const sections = [
  { value: "site", title: "Site", body: "Boundary, setbacks and access." },
  { value: "massing", title: "Massing", body: "Floors, cores and unit mix." },
  { value: "review", title: "Review", body: "Checks that passed and those that did not." },
] as const;

/* 열린 본문은 트리거 이름을 단 region 랜드마크다 — 한 화면에 여러 Accordion 을 둘 때는 `scope` 로 이름을 갈라야 landmark-unique 를 지킨다. */
function Sections({ disabled, scope }: { disabled?: string; scope?: string }) {
  return (
    <>
      {sections.map((section) => (
        <AccordionItem key={section.value} value={section.value} disabled={section.value === disabled}>
          <AccordionHeader>
            <AccordionTrigger>{scope ? `${section.title} · ${scope}` : section.title}</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>{section.body}</AccordionContent>
        </AccordionItem>
      ))}
    </>
  );
}

const meta = {
  title: "Navigation/Accordion",
  component: Accordion,
  args: { type: "single", defaultValue: "site", collapsible: true },
  render: (args) => (
    <div className="w-(--size-panel)">
      <Accordion {...args}>
        <Sections />
      </Accordion>
    </div>
  ),
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const massing = canvas.getByRole("button", { name: "Massing" });
    await expect(massing).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(massing);
    await expect(massing).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("button", { name: "Site" })).toHaveAttribute("aria-expanded", "false");
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: () => (
    <div className="grid grid-cols-3 items-start gap-6">
      <Accordion type="single" defaultValue="site" collapsible className="w-full">
        <Sections scope="single" />
      </Accordion>
      <Accordion type="multiple" defaultValue={["site", "review"]} className="w-full">
        <Sections scope="multiple" />
      </Accordion>
      <Accordion type="single" className="w-full">
        <Sections scope="disabled" disabled="review" />
      </Accordion>
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
      <Accordion {...args} className="w-full">
        <Sections />
      </Accordion>
    </ThemePair>
  ),
};
