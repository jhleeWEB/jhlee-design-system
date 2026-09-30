import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { CardGrid, MediaCard } from "./MediaCard";

/* 3스토리 계약(본보기 Button.stories). MediaCard 모듈은 CardGrid 도 내보낸다 — Variants 에 함께 그린다.
 * 썸네일은 캔버스다(흰 바탕 고정 · 무채색) — 테마가 바뀌어도 그대로여야 한다(ThemeContrast). */
const orientationValues = ["vertical", "horizontal"] as const;
const elevationValues = ["raised", "flat", "flush"] as const;

function PlanThumb() {
  return (
    <svg
      viewBox="0 0 120 80"
      aria-hidden="true"
      className="block size-full bg-canvas text-canvas-line-strong"
    >
      <rect x="16" y="12" width="88" height="56" fill="none" stroke="currentColor" />
      <rect x="28" y="22" width="30" height="36" fill="none" stroke="currentColor" />
      <rect x="64" y="22" width="30" height="20" fill="none" stroke="currentColor" />
    </svg>
  );
}

const meta = {
  title: "Primitives/MediaCard",
  component: MediaCard,
  args: {
    title: "Candidate 03",
    eyebrow: "Dahisar",
    description: "Twelve floors, two cores, east setback kept clear.",
    meta: <Badge tone="success">Pass</Badge>,
    media: <PlanThumb />,
    orientation: "vertical",
    elevation: "raised",
    className: "w-60",
  },
  argTypes: {
    orientation: { control: "select", options: orientationValues },
    elevation: { control: "select", options: elevationValues },
    selected: { control: "boolean" },
  },
} satisfies Meta<typeof MediaCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // color-contrast: 판정 톤 글자(success 등)가 옅은 면 위에서 4.5:1 미달 — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Candidate 03" })).toBeVisible();
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  // color-contrast: Matrix 머리(text-micro muted-foreground)와 판정 톤 배지 글자 — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <div className="flex flex-col gap-8">
      <Matrix
        rows={elevationValues}
        cols={["idle", "selected", "selectable"] as const}
        rowLabel="elevation"
        colLabel="state"
        cell={(elevation, state) => (
          <MediaCard
            {...args}
            title={`${elevation} · ${state}`}
            elevation={elevation}
            selected={state === "selected"}
            onSelect={state === "idle" ? undefined : fn()}
          />
        )}
      />
      <MediaCard
        {...args}
        orientation="horizontal"
        className="w-120"
        actions={
          <Button size="sm" variant="outline">
            Open
          </Button>
        }
      />
      <CardGrid min="180px" className="w-160">
        {["01", "02", "03", "04"].map((n) => (
          <MediaCard
            key={n}
            {...args}
            className={undefined}
            title={`Candidate ${n}`}
            description={undefined}
          />
        ))}
      </CardGrid>
    </div>
  ),
};

export const ThemeContrast: Story = {
  // color-contrast: ThemePair 머리(text-micro muted-foreground, 라이트) — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #23)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <ThemePair>
      <MediaCard {...args} />
      <MediaCard {...args} elevation="flat" selected onSelect={fn()} title="Candidate 04" />
    </ThemePair>
  ),
};
