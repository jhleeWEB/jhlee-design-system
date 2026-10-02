import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import {
  InspectorAmount,
  InspectorAngle,
  InspectorPanel,
  InspectorRow,
} from "../../stories/helpers/Inspector";
import { Switch } from "./Choice";
import { Fieldset, type FieldsetProps } from "./Fieldset";
import { Slider } from "./Slider";

/* 3스토리 계약(본보기 Button.stories). 축(cva)이 없는 컴포넌트라 Variants 는 설명 유무 · 비활성 · 내용의 밀도(한 행 · 여러 행 · 안에 다시 묶음)와
 * 인스펙터 폭의 양 끝(280 · 440px)을 나란히 둔다. Default 는 사용자 앱 인스펙터의 복제다 — 설정 항목마다 상자 하나를 세우고 위아래로 쌓는다(#84). */

/** 사용자 앱 인스펙터의 묶음 넷 — 첫 상자가 스토리 args(계약 탐침 포함)를 받는다. */
function InspectorStack(args: Partial<FieldsetProps>) {
  return (
    <>
      <Fieldset legend="North" {...args}>
        <InspectorAngle />
      </Fieldset>
      <Fieldset legend="Road widths">
        <InspectorRow label="Edit road widths" description="Set a width per edge in Plan">
          <Switch />
        </InspectorRow>
      </Fieldset>
      <Fieldset legend="Deductions">
        <InspectorRow label="Road widening">
          <InspectorAmount unit="m²" />
        </InspectorRow>
        <InspectorRow label="Reservations">
          <InspectorAmount unit="m²" />
        </InspectorRow>
      </Fieldset>
      <Fieldset legend="Height cap">
        <InspectorRow label="Cap">
          <InspectorAmount unit="m" value="45" />
        </InspectorRow>
      </Fieldset>
    </>
  );
}

const meta = {
  title: "Primitives/Fieldset",
  component: Fieldset,
  args: { legend: "North" },
  render: (args) => (
    <InspectorPanel>
      <InspectorStack {...args} />
    </InspectorPanel>
  ),
} satisfies Meta<typeof Fieldset>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    // legend 가 묶음의 이름이다 — role group 을 legend 글자로 찾고, 행의 라벨 · 설명이 스위치에 이어졌는지 본다.
    const roads = canvas.getByRole("group", { name: "Road widths" });
    const toggle = canvas.getByRole("switch", { name: "Edit road widths" });
    await expect(roads).toContainElement(toggle);
    await expect(toggle).toHaveAccessibleDescription("Set a width per edge in Plan");
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
    await expect(canvas.getByRole("slider", { name: "Angle" })).toHaveAttribute("aria-valuetext", "0°");
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <div className="flex flex-wrap items-start gap-6">
        <InspectorPanel className="w-(--size-panel)">
          <Fieldset legend="Without description">
            <InspectorRow label="Snap to grid">
              <Switch defaultChecked />
            </InspectorRow>
          </Fieldset>
          <Fieldset legend="With description" description="Applies to every edge of the boundary.">
            <InspectorRow label="Setback">
              <InspectorAmount unit="m" />
            </InspectorRow>
          </Fieldset>
          <Fieldset legend="Disabled" description="Draw the boundary first." disabled>
            <InspectorRow label="Edit road widths" description="Set a width per edge in Plan">
              <Switch />
            </InspectorRow>
            <InspectorRow label="Road widening">
              <InspectorAmount unit="m²" />
            </InspectorRow>
            {/* disabled 를 주지 않았다 — 손잡이 · 값 표기가 Fieldset 의 컨텍스트로 꺼진다(#90). */}
            <Slider
              aria-label="Rotation"
              defaultValue={[30]}
              max={359}
              showValue
              formatValue={(v) => `${v}°`}
            />
          </Fieldset>
        </InspectorPanel>
        <InspectorPanel className="w-(--size-panel)">
          <Fieldset legend="Dense rows">
            <InspectorRow label="Floors">
              <InspectorAmount unit="fl" />
            </InspectorRow>
            <InspectorRow label="Floor height">
              <InspectorAmount unit="m" />
            </InspectorRow>
            <InspectorRow label="Core width">
              <InspectorAmount unit="m" />
            </InspectorRow>
            <InspectorRow label="Show grid">
              <Switch size="sm" defaultChecked />
            </InspectorRow>
          </Fieldset>
          <Fieldset legend="Nested groups">
            <Fieldset legend="Front">
              <InspectorRow label="Setback">
                <InspectorAmount unit="m" />
              </InspectorRow>
            </Fieldset>
            <Fieldset legend="Rear">
              <InspectorRow label="Setback">
                <InspectorAmount unit="m" />
              </InspectorRow>
            </Fieldset>
          </Fieldset>
        </InspectorPanel>
      </div>
      {/* 인스펙터 폭의 양 끝 — 280px 에서도 행이 줄바꿈 없이 양 끝으로 서고, 440px 에서도 legend 자리 · 상자 사이 간격이 같다. */}
      <div className="flex flex-wrap items-start gap-6">
        <InspectorPanel className="w-70">
          <InspectorStack legend="North · 280px" />
        </InspectorPanel>
        <InspectorPanel className="w-110">
          <InspectorStack legend="North · 440px" />
        </InspectorPanel>
      </div>
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      <InspectorPanel>
        <InspectorStack {...args} />
      </InspectorPanel>
    </ThemePair>
  ),
};
