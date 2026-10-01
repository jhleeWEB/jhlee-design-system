import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";

import { Button, Input, Toolbar, ToolbarDivider, Tooltip, TooltipProvider } from "../src";
import {
  GLYPHS,
  glyphNames,
  iconComponentName,
  icons,
  type GlyphCategory,
  type GlyphName,
} from "../src/icons";
import { ThemePair } from "./decorators/ThemePair";

/* Foundations/Icons — 자체 아이콘 세트(#64) 카탈로그.
 * 정본은 `src/icons/glyphs.ts` 한 벌이고 여기는 그 표를 그대로 늘어놓는다 — 글리프를 더하면 이 격자에 저절로 선다.
 * lucide 에서 옮긴 것은 이름 옆에 `lucide` 를, 직접 그린 것은 `drawn` 을 단다(라이선스 고지는 src/icons/LICENSE-lucide.txt).
 * 다크는 VRT 가 모든 스토리를 라이트·다크로 찍어 따로 두지 않는다 — `ThemeContrast` 는 툴 클러스터를 두 테마에 나란히 놓는다. */

const CATEGORIES: readonly { id: GlyphCategory; label: string }[] = [
  { id: "select", label: "Select" },
  { id: "navigate", label: "Navigate" },
  { id: "transform", label: "Transform" },
  { id: "draw", label: "Draw" },
  { id: "edit", label: "Edit" },
  { id: "measure", label: "Measure" },
  { id: "view", label: "View" },
  { id: "chrome", label: "Chrome" },
];

function IconTile({ name }: { name: GlyphName }) {
  const Icon = icons[name];
  const glyph = GLYPHS[name];
  return (
    <li
      data-icon-tile={name}
      className="flex flex-col items-center gap-2 rounded-md border border-border bg-card px-2 py-3"
    >
      <Icon className="size-6 text-foreground" />
      <span className="font-mono text-micro text-foreground">{name}</span>
      <span className="font-mono text-micro text-muted-foreground">{iconComponentName(name)}</span>
      <span className="font-mono text-micro text-muted-foreground">
        {"lucide" in glyph ? "lucide" : "drawn"}
      </span>
    </li>
  );
}

function IconGallery() {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visible = glyphNames.filter(
    (n) => !needle || n.includes(needle) || iconComponentName(n).toLowerCase().includes(needle),
  );
  const lucideCount = glyphNames.filter((n) => "lucide" in GLYPHS[n]).length;
  return (
    <div className="flex flex-col gap-6 font-sans text-body text-foreground">
      <header className="flex flex-wrap items-center gap-4">
        <div className="w-(--size-panel)">
          <Input
            type="search"
            aria-label="Search icons"
            placeholder="Search icons"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <span className="tnum text-label text-muted-foreground" data-testid="icon-count">
          {visible.length} / {glyphNames.length} icons · {lucideCount} lucide ·{" "}
          {glyphNames.length - lucideCount} drawn
        </span>
      </header>
      {CATEGORIES.map(({ id, label }) => {
        const names = visible.filter((n) => GLYPHS[n].category === id);
        if (names.length === 0) return null;
        return (
          <section key={id} className="flex flex-col gap-3" aria-label={label}>
            <h2 className="m-0 text-title font-semibold">{label}</h2>
            <ul className="m-0 grid list-none grid-cols-6 gap-3 p-0">
              {names.map((n) => (
                <IconTile key={n} name={n} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/* 툴 클러스터 — 도면 작업대의 부유 툴바(캔버스 위). 묶음 사이를 ToolbarDivider 로 가르고, 지금 고른 툴은 `aria-pressed` 와
 * primary 면으로 표시한다(원칙 2 — 유채색은 «지금 고른 것» 에만). 아이콘 크기는 버튼의 `[&_svg]:size-4`(16px)가 정한다. */
const CLUSTER: readonly (readonly { name: GlyphName; label: string; shortcut?: string }[])[] = [
  [
    { name: "select", label: "Select", shortcut: "V" },
    { name: "select-window", label: "Window select", shortcut: "W" },
  ],
  [
    { name: "orbit", label: "Orbit", shortcut: "O" },
    { name: "pan", label: "Pan", shortcut: "H" },
    { name: "zoom-window", label: "Zoom window", shortcut: "Z" },
    { name: "zoom-extents", label: "Zoom extents", shortcut: "⇧Z" },
  ],
  [
    { name: "move", label: "Move", shortcut: "M" },
    { name: "rotate", label: "Rotate", shortcut: "Q" },
    { name: "scale", label: "Scale", shortcut: "S" },
  ],
  [
    { name: "line", label: "Line", shortcut: "L" },
    { name: "polyline", label: "Polyline" },
    { name: "rectangle", label: "Rectangle", shortcut: "R" },
    { name: "circle", label: "Circle", shortcut: "C" },
    { name: "polygon", label: "Polygon" },
  ],
  [
    { name: "offset", label: "Offset", shortcut: "F" },
    { name: "extrude", label: "Extrude", shortcut: "P" },
    { name: "section-plane", label: "Section plane" },
  ],
  [
    { name: "measure-distance", label: "Measure distance", shortcut: "T" },
    { name: "measure-area", label: "Measure area" },
  ],
];

const VIEWS: readonly { name: GlyphName; label: string }[] = [
  { name: "view-top", label: "Top view" },
  { name: "view-front", label: "Front view" },
  { name: "view-side", label: "Side view" },
  { name: "view-iso", label: "Isometric view" },
];

function ToolButton({
  name,
  label,
  shortcut,
  pressed,
  onSelect,
}: {
  name: GlyphName;
  label: string;
  shortcut?: string | undefined;
  pressed: boolean;
  onSelect: (name: GlyphName) => void;
}) {
  const Icon = icons[name];
  return (
    <Tooltip label={label} shortcut={shortcut}>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        aria-pressed={pressed}
        onClick={() => onSelect(name)}
        className="aria-pressed:bg-primary aria-pressed:text-primary-foreground [&_svg]:size-4"
      >
        <Icon />
      </Button>
    </Tooltip>
  );
}

function ToolCluster({ label = "Modeling tools" }: { label?: string }) {
  const [tool, setTool] = useState<GlyphName>("orbit");
  const [view, setView] = useState<GlyphName>("view-iso");
  return (
    <TooltipProvider>
      <div className="flex flex-col items-start gap-4 bg-canvas p-6">
        <Toolbar aria-label={label} onCanvas className="gap-1">
          {CLUSTER.map((group, i) => (
            <div key={i} className="contents">
              {i > 0 ? <ToolbarDivider /> : null}
              {group.map((t) => (
                <ToolButton
                  key={t.name}
                  name={t.name}
                  label={t.label}
                  shortcut={t.shortcut}
                  pressed={tool === t.name}
                  onSelect={setTool}
                />
              ))}
            </div>
          ))}
        </Toolbar>
        <Toolbar aria-label={`${label} — camera`} onCanvas className="gap-1">
          {VIEWS.map((v) => (
            <ToolButton
              key={v.name}
              name={v.name}
              label={v.label}
              pressed={view === v.name}
              onSelect={setView}
            />
          ))}
          <ToolbarDivider />
          <ToolButton name="grid" label="Grid" pressed={false} onSelect={() => {}} />
          <ToolButton name="snap" label="Snap" pressed onSelect={() => {}} />
          <ToolButton name="layers" label="Layers" pressed={false} onSelect={() => {}} />
          <ToolbarDivider />
          <ToolButton name="undo" label="Undo" shortcut="⌘Z" pressed={false} onSelect={() => {}} />
          <ToolButton name="redo" label="Redo" shortcut="⇧⌘Z" pressed={false} onSelect={() => {}} />
        </Toolbar>
      </div>
    </TooltipProvider>
  );
}

/* 크기 사다리 — 토큰 --size-icon-{sm,md,lg}(12 · 16 · 20)와 24(뷰박스 1:1). 획은 뷰박스 단위라 크기에 비례한다. */
const SIZES = [
  { label: "12 · --size-icon-sm", className: "size-(--size-icon-sm)" },
  { label: "16 · --size-icon-md", className: "size-(--size-icon-md)" },
  { label: "20 · --size-icon-lg", className: "size-(--size-icon-lg)" },
  { label: "24 · viewBox 1:1", className: "size-6" },
] as const;
const SIZE_SAMPLES: readonly GlyphName[] = [
  "orbit",
  "move",
  "measure-area",
  "view-top",
  "x",
  "alert-triangle",
];

function SizeLadder() {
  return (
    <div className="flex flex-col gap-3 font-sans text-body text-foreground">
      {SIZES.map((s) => (
        <div key={s.label} className="grid grid-cols-7 items-center gap-4">
          <span className="font-mono text-micro text-muted-foreground">{s.label}</span>
          {SIZE_SAMPLES.map((n) => {
            const Icon = icons[n];
            return <Icon key={n} className={s.className} />;
          })}
        </div>
      ))}
    </div>
  );
}

const meta = {
  title: "Foundations/Icons",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** 전체 격자 — 묶음별. 검색 칸이 이름과 컴포넌트 이름을 거른다. */
export const Default: Story = {
  render: () => <IconGallery />,
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId("icon-count")).toHaveTextContent(
      `${glyphNames.length} / ${glyphNames.length}`,
    );
    await expect(canvas.getAllByRole("listitem")).toHaveLength(glyphNames.length);
  },
};

/** 검색 — «zoom» 을 치면 줌 넷만 남는다. 상호작용 상태라 VRT 에서 뺀다. */
export const Search: Story = {
  tags: ["!vrt"],
  render: () => <IconGallery />,
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search icons" }), "zoom");
    const zoom = glyphNames.filter((n) => n.includes("zoom"));
    await expect(canvas.getAllByRole("listitem")).toHaveLength(zoom.length);
  },
};

/** 툴 클러스터 — 캔버스 위 부유 툴바 두 줄(툴 · 카메라/보기). 고른 툴은 primary 면 + aria-pressed. */
export const ToolClusterExample: Story = {
  name: "Tool cluster",
  render: () => <ToolCluster />,
  play: async ({ canvas }) => {
    const orbit = canvas.getByRole("button", { name: "Orbit" });
    await expect(orbit).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByRole("button", { name: "Move" })).toHaveAttribute("aria-pressed", "false");
  },
};

/** 크기 사다리 — 12 · 16 · 20 · 24. */
export const Sizes: Story = {
  render: () => <SizeLadder />,
};

/** 두 테마에 나란히 — 툴 클러스터와 크기 사다리. 아이콘은 currentColor 라 크롬 글자색을 따른다. */
export const ThemeContrast: Story = {
  render: () => (
    <ThemePair>
      {(theme) => (
        <div className="flex flex-col gap-4">
          <ToolCluster label={`Modeling tools (${theme})`} />
          <SizeLadder />
        </div>
      )}
    </ThemePair>
  ),
};
