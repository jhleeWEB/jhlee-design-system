import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

/* 3스토리 계약(본보기 Button.stories). 축은 목록의 `variant`(segmented · underline) — Variants 는 variant × 상태(보통 · 한 칸 비활성) 격자다.
 * 한 화면의 탭 줄마다 `aria-label` 을 갈라 둔다(tablist 이름이 겹치면 스크린리더가 줄을 구분하지 못한다). */
const variantValues = ["segmented", "underline"] as const;
const stateValues = ["enabled", "trigger disabled"] as const;
const views = [
  { value: "plan", label: "Plan", body: "Floor plate at level 1." },
  { value: "model", label: "Model", body: "Massing in three dimensions." },
  { value: "section", label: "Section", body: "Cut through the core." },
] as const;

/* 탭 줄과 패널 — 패널을 늘 함께 그린다: Radix 칸은 `aria-controls` 로 패널 id 를 가리키므로 패널이 없으면 axe(aria-valid-attr-value)가 잡는다. */
function Views({
  name,
  disabled,
  variant,
}: {
  name: string;
  disabled?: string | undefined;
  variant?: (typeof variantValues)[number];
}) {
  return (
    <>
      <TabsList aria-label={name} {...(variant ? { variant } : {})}>
        {views.map((view) => (
          <TabsTrigger key={view.value} value={view.value} disabled={view.value === disabled}>
            {view.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {views.map((view) => (
        <TabsContent key={view.value} value={view.value} className="text-body text-foreground-2">
          {view.body}
        </TabsContent>
      ))}
    </>
  );
}

const meta = {
  title: "Navigation/Tabs",
  component: Tabs,
  args: { defaultValue: "plan" },
  render: (args) => (
    <Tabs {...args}>
      <Views name="Drawing" />
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const model = canvas.getByRole("tab", { name: "Model" });
    await userEvent.click(model);
    await expect(model).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tabpanel", { name: "Model" })).toHaveTextContent("Massing");
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "Section" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("tab", { name: "Plan" }));
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <Matrix
      rows={variantValues}
      cols={stateValues}
      rowLabel="variant"
      colLabel="state"
      cell={(variant, state) => (
        <Tabs {...args}>
          <Views
            name={`${variant} ${state}`}
            variant={variant}
            disabled={state === "trigger disabled" ? "section" : undefined}
          />
        </Tabs>
      )}
    />
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      {variantValues.map((variant) => (
        <Tabs key={variant} {...args}>
          <Views name={`Drawing ${variant}`} variant={variant} />
        </Tabs>
      ))}
    </ThemePair>
  ),
};
