import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, within } from "storybook/test";

import { ThemePair } from "./decorators/ThemePair";

/* Foundations/Roles — 역할 → 토큰 견본(#80). 컴포넌트마다 글자 크기 · 굵기 · 모서리가 달라 보인다는 피드백에서, 역할마다 토큰 한 벌을 정하고
 * 여기 한 장에 모았다 — 새 컴포넌트는 «이 글자는 어느 역할인가 · 이 상자는 어느 역할인가» 를 먼저 묻고 이 시트의 클래스를 그대로 쓴다.
 * 정본 표는 packages/ui/tokens/README.md «역할 → 토큰» 이고, 이 시트는 그 표의 견본이다(표를 고치면 여기도 고친다).
 * 라이트 · 다크를 나란히 그린다(ThemePair) — VRT 가 전역 테마로 한 번 더 찍는다. 견본은 컴포넌트가 아니라 **규칙 그 자체**(역할의 클래스)다. */

interface TypeRole {
  readonly role: string;
  readonly tokens: string;
  /** 정적 문자열이어야 Tailwind 가 굽는다 — 템플릿으로 조립하면 클래스가 CSS 에 없다. */
  readonly className: string;
  readonly sample: string;
  readonly examples: string;
}

const TYPE_ROLES: readonly TypeRole[] = [
  {
    role: "Control text",
    tokens: "text-control · font-medium",
    className: "text-control font-medium text-foreground",
    sample: "Generate",
    examples:
      "Button · ToggleGroupItem · SegmentedControl · TabsTrigger · Pagination · Breadcrumb · Collapsible",
  },
  {
    role: "Input value",
    tokens: "text-control · font-normal",
    className: "text-control text-foreground",
    sample: "Point tower",
    examples: "Input · Textarea · NumberInput · Select · Combobox · DatePicker trigger",
  },
  {
    role: "List & menu item",
    tokens: "text-body · font-normal",
    className: "text-body text-foreground",
    sample: "Duplicate sheet",
    examples: "Dropdown · Context · Select · Command · Combobox item · Sidebar item",
  },
  {
    role: "Surface title",
    tokens: "text-body · font-semibold",
    className: "text-body font-semibold text-foreground",
    sample: "Geometry",
    examples: "Card · Toast · Alert · Accordion · MediaCard · Popover and HoverCard head",
  },
  {
    role: "Dialog & screen title",
    tokens: "text-title · font-semibold",
    className: "text-title font-semibold text-foreground",
    sample: "Discard changes?",
    examples: "Modal · Drawer · AlertDialog · TopBar · EmptyState",
  },
  {
    role: "Field label",
    tokens: "text-label · font-medium",
    className: "text-label font-medium text-foreground",
    sample: "Floor height",
    examples: "FieldLabel · Slider label",
  },
  {
    role: "Supporting text",
    tokens: "text-body · font-normal · muted",
    className: "text-body text-muted-foreground",
    sample: "Shown to the reviewer.",
    examples: "Descriptions · help text · FieldDescription · FieldError",
  },
  {
    role: "Meta & section label",
    tokens: "text-micro · font-medium · mono · uppercase · tracking-caps",
    className: "font-mono text-micro font-medium tracking-caps text-muted-foreground uppercase",
    sample: "Selection",
    examples: "Eyebrow · SectionLabel · table head · menu group label",
  },
];

interface RadiusRole {
  readonly role: string;
  readonly token: string;
  readonly specimen: ReactNode;
  readonly examples: string;
}

const box = "border border-solid border-primary-line bg-accent";

const RADIUS_ROLES: readonly RadiusRole[] = [
  {
    role: "Small mark (16px or less)",
    token: "rounded-xs · 4px",
    specimen: <div className={`size-4 rounded-xs ${box}`} />,
    examples: "Checkbox",
  },
  {
    role: "Chip",
    token: "rounded-sm · 6px",
    specimen: <div className={`h-5 w-12 rounded-sm ${box}`} />,
    examples: "Badge · Kbd · Skeleton",
  },
  {
    role: "Control & menu item",
    token: "rounded-md · 8px",
    specimen: <div className={`h-ctl w-24 rounded-md ${box}`} />,
    examples: "Button · Input · Select · segmented track · menu item · Calendar day",
  },
  {
    role: "Surface (in flow or floating)",
    token: "rounded-lg · 12px",
    specimen: <div className={`h-16 w-24 rounded-lg ${box}`} />,
    examples: "Card · Alert · Toast · Popover · menu · Command · Tooltip · Toolbar · Legend · Readout",
  },
  {
    role: "Covers the screen",
    token: "rounded-xl · 16px",
    specimen: <div className={`h-16 w-24 rounded-xl ${box}`} />,
    examples: "Modal · Drawer · AlertDialog",
  },
  {
    role: "Circle & pill",
    token: "rounded-full",
    specimen: <div className={`h-5 w-9 rounded-full ${box}`} />,
    examples: "Radio · Switch · Slider · Progress · StatusDot · Avatar",
  },
  {
    role: "Concentric inner",
    token: "calc(var(--radius-md) - var(--spacing)) · 4px",
    specimen: (
      <div className="inline-flex items-center rounded-md bg-primary-track p-1">
        <div className="h-7 w-16 rounded-[calc(var(--radius-md)-var(--spacing))] bg-card shadow-chip" />
      </div>
    ),
    examples: "Tabs · ToggleGroup · SegmentedControl item inside the track",
  },
];

function Row({
  sample,
  title,
  tokens,
  examples,
}: {
  sample: ReactNode;
  title: string;
  tokens: string;
  examples: string;
}) {
  return (
    <li data-role={title} className="flex items-center gap-4 border-t border-border py-3">
      <div className="flex w-40 shrink-0 items-center">{sample}</div>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-label font-medium text-foreground">{title}</span>
        <code className="font-mono text-micro text-foreground-2">{tokens}</code>
        <span className="text-label text-muted-foreground">{examples}</span>
      </div>
    </li>
  );
}

function TypeSheet() {
  return (
    <ul className="m-0 flex w-full list-none flex-col p-0 font-sans">
      {TYPE_ROLES.map((r) => (
        <Row
          key={r.role}
          title={r.role}
          tokens={r.tokens}
          examples={r.examples}
          sample={<span className={r.className}>{r.sample}</span>}
        />
      ))}
    </ul>
  );
}

function RadiusSheet() {
  return (
    <ul className="m-0 flex w-full list-none flex-col p-0 font-sans">
      {RADIUS_ROLES.map((r) => (
        <Row key={r.role} title={r.role} tokens={r.token} examples={r.examples} sample={r.specimen} />
      ))}
    </ul>
  );
}

const meta = {
  title: "Foundations/Roles",
  tags: ["!manifest"],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** 글자 역할 여덟 — 굵기는 normal · medium · semibold 셋만 쓴다. */
export const Type: Story = {
  render: () => (
    <ThemePair>
      <TypeSheet />
    </ThemePair>
  ),
  play: async ({ canvasElement }) => {
    const rows = within(canvasElement).getAllByRole("listitem");
    await expect(rows).toHaveLength(TYPE_ROLES.length * 2);
    /* 견본의 굵기는 셋뿐이다 — 700(bold)이 끼면 규칙이 깨진 것이다. */
    for (const row of rows) {
      const sample = row.querySelector("span");
      await expect(["400", "500", "600"]).toContain(sample ? getComputedStyle(sample).fontWeight : "");
    }
  },
};

/** 모서리 역할 일곱 — 사다리 xs · sm · md · lg · xl · full 과 동심원. */
export const Radius: Story = {
  render: () => (
    <ThemePair>
      <RadiusSheet />
    </ThemePair>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole("listitem")).toHaveLength(RADIUS_ROLES.length * 2);
  },
};
