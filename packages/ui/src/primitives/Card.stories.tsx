import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import { Card, CardCollapse, CardHeader, CardWell } from "./Card";

/* 3스토리 계약(본보기 Button.stories). Card 모듈의 부품(CardHeader · CardWell · CardCollapse)과 접기 두 모양은 Variants 에 함께 그린다. */
const elevationValues = ["raised", "flat", "flush"] as const;
const padValues = ["none", "sm", "md", "lg"] as const;

const meta = {
  title: "Primitives/Card",
  component: Card,
  args: {
    elevation: "raised",
    pad: "none",
    header: <CardHeader title="2D Plan" meta="18.00 × 12.00 m" />,
    children: <p className="m-0 px-4 pb-4 text-body text-muted-foreground">Twelve floors, two cores.</p>,
    className: "w-80",
  },
  argTypes: {
    elevation: { control: "select", options: elevationValues },
    pad: { control: "select", options: padValues },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("2D Plan")).toBeVisible();
  },
};

/* 접기는 제어 컴포넌트다 — 스토리 안에서 상태를 들고 있어야 버튼이 산다. */
function HeaderCollapse() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <Card
      className="w-80"
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      collapsedLabel="programme"
      header={<CardHeader title="Programme" meta="3 rules" />}
    >
      <p className="m-0 px-4 pb-4 text-body text-muted-foreground">Collapsed to its header.</p>
    </Card>
  );
}

function StripCollapse() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div className="flex h-40 gap-3">
      <Card
        className="w-60"
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        collapseTo="strip"
        collapsedLabel="parameters"
        header={<CardHeader variant="panel" title="Parameters" />}
      >
        <p className="m-0 p-4 text-body text-muted-foreground">Strip body.</p>
      </Card>
      <Card className="flex-1" header={<CardHeader variant="panel" title="Viewer" />}>
        <CardWell />
      </Card>
    </div>
  );
}

function OuterCollapse() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Card className="w-80" collapsed={collapsed} onCollapsedChange={setCollapsed} collapsedLabel="brief">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-control font-semibold text-foreground">Brief</span>
        <CardCollapse />
      </div>
      <p className="m-0 px-4 pb-4 text-body text-muted-foreground">CardCollapse outside the header.</p>
    </Card>
  );
}

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <div className="flex flex-col gap-8">
      <Matrix
        rows={elevationValues}
        cols={padValues}
        rowLabel="elevation"
        colLabel="pad"
        cell={(elevation, pad) => (
          <Card {...args} elevation={elevation} pad={pad} header={undefined} className="w-40">
            <span className="text-body text-foreground">{`${elevation} · ${pad}`}</span>
          </Card>
        )}
      />
      <div className="flex flex-wrap items-start gap-6">
        <Card {...args} header={<CardHeader variant="panel" title="Panel header" headingLevel={3} />} />
        <Card {...args} header={<CardHeader title="Viewer" />} className="h-40 w-80">
          <CardWell />
        </Card>
      </div>
      <div className="flex flex-wrap items-start gap-6">
        <HeaderCollapse />
        <OuterCollapse />
      </div>
      <StripCollapse />
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      <Card {...args} />
      <Card {...args} elevation="flat" header={<CardHeader variant="panel" title="Panel" />} />
    </ThemePair>
  ),
};
