import type { Meta, StoryObj } from "@storybook/react-vite";
import { LuBold, LuGrid3X3, LuItalic, LuMagnet, LuRuler, LuUnderline } from "react-icons/lu";
import { expect, fn, userEvent } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { ICON } from "../lib/icons";
import { ToggleGroup, ToggleGroupItem } from "./ToggleGroup";

/* 3스토리 계약(본보기 Button.stories). 축은 `variant` · `size` — Variants 는 두 축의 격자에 글자 칸 · 아이콘 전용 칸 · 비활성 칸을 함께 그린다.
 * Default 는 단일(`type="single"`, radiogroup), ThemeContrast 는 단일과 다중(`type="multiple"`, toolbar · aria-pressed)을 함께 본다. */
const variantValues = ["segmented", "outline"] as const;
const sizeValues = ["sm", "md"] as const;

const meta = {
  title: "Primitives/ToggleGroup",
  component: ToggleGroup,
  args: { type: "single", "aria-label": "View", defaultValue: "plan", variant: "segmented", size: "md" },
  argTypes: {
    variant: { control: "select", options: variantValues },
    size: { control: "select", options: sizeValues },
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="plan">Plan</ToggleGroupItem>
      <ToggleGroupItem value="section">Section</ToggleGroupItem>
      <ToggleGroupItem value="model">Model</ToggleGroupItem>
    </ToggleGroup>
  ),
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onValueChange: fn() },
  play: async ({ canvas, args }) => {
    const group = canvas.getByRole("radiogroup", { name: "View" });
    await expect(group).toHaveAttribute("data-slot", "toggle-group");
    await expect(canvas.getByRole("radio", { name: "Plan" })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(canvas.getByRole("radio", { name: "Section" }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith("section");
    // VRT 가 처음 값을 그리도록 되돌린다.
    await userEvent.click(canvas.getByRole("radio", { name: "Plan" }));
    await expect(canvas.getByRole("radio", { name: "Plan" })).toHaveAttribute("aria-checked", "true");
    (document.activeElement as HTMLElement | null)?.blur();
  },
};

/** 서식 토글 — 아이콘 전용 칸은 `icon` + `aria-label`(타입에서 필수). */
function FormatItems({ disabled = false }: { disabled?: boolean }) {
  return (
    <>
      <ToggleGroupItem value="bold" icon={<LuBold {...ICON} />} aria-label="Bold" />
      <ToggleGroupItem value="italic" icon={<LuItalic {...ICON} />} aria-label="Italic" />
      <ToggleGroupItem
        value="underline"
        icon={<LuUnderline {...ICON} />}
        aria-label="Underline"
        disabled={disabled}
      />
    </>
  );
}

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <Matrix
      rows={variantValues}
      cols={sizeValues}
      rowLabel="variant"
      colLabel="size"
      cell={(variant, size) => (
        <div className="flex flex-col items-start gap-3">
          <ToggleGroup
            {...args}
            type="single"
            defaultValue="plan"
            variant={variant}
            size={size}
            aria-label={`${variant} ${size} text`}
          >
            <ToggleGroupItem value="plan">Plan</ToggleGroupItem>
            <ToggleGroupItem value="section">Section</ToggleGroupItem>
            <ToggleGroupItem value="model" disabled>
              Model
            </ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            type="multiple"
            defaultValue={["bold", "underline"]}
            variant={variant}
            size={size}
            aria-label={`${variant} ${size} format`}
          >
            <FormatItems disabled />
          </ToggleGroup>
          <ToggleGroup
            type="multiple"
            defaultValue={["grid"]}
            variant={variant}
            size={size}
            aria-label={`${variant} ${size} aids`}
          >
            <ToggleGroupItem value="grid" icon={<LuGrid3X3 {...ICON} />}>
              Grid
            </ToggleGroupItem>
            <ToggleGroupItem value="snap" icon={<LuMagnet {...ICON} />}>
              Snap
            </ToggleGroupItem>
            <ToggleGroupItem value="measure" icon={<LuRuler {...ICON} />}>
              Measure
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}
    />
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      {(theme) => (
        <div className="flex flex-col items-start gap-3">
          <ToggleGroup {...args} aria-label={`View ${theme}`}>
            <ToggleGroupItem value="plan">Plan</ToggleGroupItem>
            <ToggleGroupItem value="section">Section</ToggleGroupItem>
            <ToggleGroupItem value="model">Model</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            type="multiple"
            variant="outline"
            defaultValue={["bold"]}
            aria-label={`Format ${theme}`}
          >
            <FormatItems />
          </ToggleGroup>
        </div>
      )}
    </ThemePair>
  ),
};
