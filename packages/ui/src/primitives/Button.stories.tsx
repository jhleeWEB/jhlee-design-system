import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { Button } from "./Button";

/* 3스토리 계약의 본보기(계획 §2.5-e). export 이름은 고정이다 — `stories-contract.spec` 이 검사한다.
 *  - Default: 단일 개념. 매니페스트·docs·jsdom 계약 테스트가 같은 픽스처로 쓴다.
 *  - Variants: 전 조합 격자. 매니페스트 입력이 아니다(`!manifest`).
 *  - ThemeContrast: 같은 args 를 라이트·다크 서브트리에 나란히. */
const variantValues = ["solid", "outline", "ghost", "link"] as const;
const toneValues = ["neutral", "primary", "destructive"] as const;
const sizeValues = ["sm", "md", "lg"] as const;

const meta = {
  title: "Primitives/Button",
  component: Button,
  args: { children: "Generate", variant: "outline", tone: "neutral", size: "md" },
  argTypes: {
    variant: { control: "select", options: variantValues },
    tone: { control: "select", options: toneValues },
    size: { control: "select", options: [...sizeValues, "icon-sm", "icon", "icon-lg"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: "solid", tone: "primary" },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Generate" });
    await expect(button).toBeEnabled();
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: args => (
    <div className="flex flex-col gap-6">
      {sizeValues.map(size => (
        <Matrix
          key={size}
          rows={variantValues}
          cols={toneValues}
          rowLabel="variant"
          colLabel={`tone · ${size}`}
          cell={(variant, tone) => <Button {...args} variant={variant} tone={tone} size={size} />}
        />
      ))}
      <div className="flex items-start gap-3">
        <Button {...args} loading>Solving</Button>
        <Button {...args} disabled>Unavailable</Button>
      </div>
    </div>
  ),
};

export const ThemeContrast: Story = {
  args: { variant: "solid", tone: "primary" },
  render: args => (
    <ThemePair>
      <Button {...args} />
      <Button {...args} variant="outline" tone="neutral" />
      <Button {...args} variant="ghost" tone="destructive" />
    </ThemePair>
  ),
};
