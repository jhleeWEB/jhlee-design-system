import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { InspectorAmount, InspectorAngle, InspectorRow } from "../../stories/helpers/Inspector";
import { Matrix } from "../../stories/helpers/Matrix";
import { cn } from "../cn";
import { Switch } from "../primitives/Choice";
import { Fieldset } from "../primitives/Fieldset";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
  type AccordionVariant,
} from "./Accordion";

/* 3스토리 계약(본보기 Button.stories). 축은 `variant` 하나 — Variants 는 모양(separated · contained · flush) × 모드 · 상태(single · multiple ·
 * 비활성) 격자다. 네 번째 `Inspector` 는 flush 구획 안에 Fieldset 을 쌓은 인스펙터 복제다(#84 — 두 컴포넌트를 나란히 써도 여백 · 모서리 ·
 * 글자 역할이 맞는가). */
const variantValues = ["separated", "contained", "flush"] as const satisfies readonly AccordionVariant[];
const modeValues = ["single", "multiple", "disabled"] as const;
/* 놓이는 면 — `flush` 는 패널(카드 면) 안에 가장자리까지 붙여 쓰는 모양이라 구분선(`border`)이 카드 면 위에서 읽힌다. 바닥(`background`) 위에
   그대로 두면 구분선이 바닥과 거의 같은 색이라 사라져 보여, 카탈로그에서도 쓰는 자리처럼 카드 면에 얹는다. */
const surface: Record<AccordionVariant, string> = {
  separated: "",
  contained: "",
  flush: "rounded-lg bg-card shadow-card",
};

const sections = [
  { value: "site", title: "Site", body: "Boundary, setbacks and access." },
  { value: "massing", title: "Massing", body: "Floors, cores and unit mix." },
  { value: "review", title: "Review", body: "Checks that passed and those that did not." },
] as const;

/* 열린 본문은 트리거 이름을 단 region 랜드마크다 — 한 화면에 여러 Accordion 을 둘 때는 `scope` 로 이름을 갈라야 landmark-unique 를 지킨다.
   `hiddenScope` 는 같은 일을 화면에 보이지 않게 한다 — ThemeContrast · Variants 격자가 같은 제목을 여러 번 그려야 해서(#55). */
function Sections({ disabled, hiddenScope }: { disabled?: string; hiddenScope?: string }) {
  return (
    <>
      {sections.map((section) => (
        <AccordionItem key={section.value} value={section.value} disabled={section.value === disabled}>
          <AccordionHeader>
            <AccordionTrigger>
              {section.title}
              {hiddenScope ? <span className="sr-only"> · {hiddenScope}</span> : null}
            </AccordionTrigger>
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
  args: { type: "single", defaultValue: "site", collapsible: true, variant: "separated" },
  argTypes: { variant: { control: "select", options: variantValues } },
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
    <Matrix
      rows={variantValues}
      cols={modeValues}
      rowLabel="variant"
      colLabel="mode"
      cell={(variant, mode) => (
        <div className={cn("w-64", surface[variant])}>
          {mode === "multiple" ? (
            <Accordion type="multiple" variant={variant} defaultValue={["site", "review"]}>
              <Sections hiddenScope={`${variant} ${mode}`} />
            </Accordion>
          ) : (
            <Accordion
              type="single"
              variant={variant}
              collapsible
              {...(mode === "single" ? { defaultValue: "site" } : {})}
            >
              <Sections
                hiddenScope={`${variant} ${mode}`}
                {...(mode === "disabled" ? { disabled: "review" } : {})}
              />
            </Accordion>
          )}
        </div>
      )}
    />
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      {(theme) => (
        <div className="flex w-64 flex-col gap-6">
          {variantValues.map((variant) => (
            <div key={variant} className={surface[variant]}>
              <Accordion {...args} variant={variant}>
                <Sections hiddenScope={`${theme} ${variant}`} />
              </Accordion>
            </div>
          ))}
        </div>
      )}
    </ThemePair>
  ),
};

/** 인스펙터 복제 — `flush` 구획(패널 가장자리까지 닿는 구분선 · 제목 줄)마다 Fieldset 을 12px 간격으로 쌓는다. 패널은 여백 없이 구획을 담는다. */
export const Inspector: Story = {
  tags: ["!manifest"],
  render: () => (
    <div className="w-(--size-inspector) rounded-lg bg-card shadow-card">
      <Accordion type="multiple" variant="flush" defaultValue={["site", "massing"]}>
        <AccordionItem value="site">
          <AccordionHeader>
            <AccordionTrigger>Site</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent contentClassName="flex flex-col gap-3">
            <Fieldset legend="North">
              <InspectorAngle />
            </Fieldset>
            <Fieldset legend="Road widths">
              <InspectorRow label="Edit road widths" description="Set a width per edge in Plan">
                <Switch />
              </InspectorRow>
            </Fieldset>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="massing">
          <AccordionHeader>
            <AccordionTrigger>Massing</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent contentClassName="flex flex-col gap-3">
            <Fieldset legend="Floors">
              <InspectorRow label="Count">
                <InspectorAmount unit="fl" value="12" />
              </InspectorRow>
              <InspectorRow label="Floor height">
                <InspectorAmount unit="m" value="3" />
              </InspectorRow>
            </Fieldset>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="review">
          <AccordionHeader>
            <AccordionTrigger>Review</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Checks that passed and those that did not.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Review" })).toHaveAttribute("data-variant", "flush");
    await expect(canvas.getByRole("group", { name: "North" })).toBeVisible();
  },
};
