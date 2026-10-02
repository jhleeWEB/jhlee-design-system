import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { DescriptionList } from "../data/DescriptionList";
import { IconFileText, IconLayers, IconMap, IconSettings } from "../icons/icons";
import { TooltipProvider } from "../overlay/Tooltip";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { SectionLabel } from "../primitives/Misc";
import { PanelToggleButton } from "../primitives/PanelToggleButton";
import { AppShell, type AppShellProps } from "./AppShell";
import { Sidebar, SidebarItem } from "./Sidebar";
import { TopBar } from "./TopBar";
import { usePanelLayout } from "./usePanelLayout";

/* 3스토리 계약(본보기 Button.stories). 축은 `variant`(flush · inset) — Variants 는 variant × 인스펙터(열림 · 닫힘) 격자다.
 * 접힘은 usePanelLayout 이 들고 `storageKey` 는 주지 않는다 — 브라우저에 남은 상태가 스토리 픽셀을 흔들면 VRT 가 결정적이지 않다.
 * 한 화면에 셸을 여럿 그리는 스토리(Variants · ThemeContrast)는 `mainAs="div"` 로 main 랜드마크를 하나도 세우지 않고, 상단바 제목을 h2 로 내리고,
 * 셸마다 `<article>` 에 넣는다 — header 는 구획 안에서 banner 가 아니게 되고, article 은 랜드마크가 아니라 인스펙터(complementary)가 최상위로 남는다. */
const variantValues = ["flush", "inset"] as const;
const PANELS = ["inspector"] as const;

function Nav({ label, inset }: { label: string; inset: boolean }) {
  return (
    // inset 에서는 사이드바도 떠 있는 카드다 — 셸은 사이드바의 모양을 정하지 않는다(폭 · 테두리는 사이드바의 몫).
    <Sidebar collapsed label={label} className={inset ? "rounded-lg border-r-0 shadow-card" : undefined}>
      <SidebarItem icon={<IconMap />} label="Site" active />
      <SidebarItem icon={<IconLayers />} label="Massing" />
      <SidebarItem icon={<IconFileText />} label="Report" />
      <div className="mt-auto">
        <SidebarItem icon={<IconSettings />} label="Settings" />
      </div>
    </Sidebar>
  );
}

function Canvas() {
  return (
    <div className="grid flex-1 place-items-center bg-muted p-6">
      <div className="grid aspect-[26/15] w-full max-w-(--size-sheet-md) place-items-center border border-canvas-line bg-canvas font-mono text-label text-canvas-ink-2">
        Site plan · 1 : 500
      </div>
    </div>
  );
}

function Inspector() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <SectionLabel>Tower B</SectionLabel>
      <DescriptionList
        rows={[
          { k: "Storeys", v: "21", numeric: true },
          { k: "Units", v: "84", numeric: true },
          { k: "Spacing", v: "12.4 m", numeric: true },
        ]}
      />
      <Badge tone="success" dot>
        All checks pass
      </Badge>
    </div>
  );
}

/** 상단바 토글과 손잡이가 같은 상태(usePanelLayout)를 본다 — 셸은 상태를 들지 않는다. */
function Shell({
  name,
  headingLevel = 1,
  initiallyClosed = false,
  ...props
}: AppShellProps & { name: string; headingLevel?: 1 | 2; initiallyClosed?: boolean }) {
  const layout = usePanelLayout(PANELS, { initial: { inspector: initiallyClosed } });
  const open = !layout.isCollapsed("inspector");
  const inspectorId = `${name}-inspector`;
  return (
    <AppShell
      className="h-(--size-sheet-md) overflow-hidden rounded-lg border border-border"
      inspectorId={inspectorId}
      inspectorOpen={open}
      onInspectorOpenChange={(next) => layout.setCollapsed("inspector", !next)}
      topBar={
        <TopBar
          size="sm"
          headingLevel={headingLevel}
          title="Residential Studio"
          eyebrow="Planning draft"
          actions={
            <>
              <Button size="sm" variant="solid" tone="primary">
                Save scheme
              </Button>
              <PanelToggleButton
                open={open}
                onOpenChange={(next) => layout.setCollapsed("inspector", !next)}
                label="inspector"
                controls={inspectorId}
              />
            </>
          }
        />
      }
      sidebar={<Nav label={`${name} navigation`} inset={props.variant === "inset"} />}
      inspector={<Inspector />}
      footer={
        <footer className="flex shrink-0 items-center gap-3 border-t border-border bg-secondary px-4 py-2 text-micro text-muted-foreground">
          <span>Pack in-mh-mumbai</span>
          <span className="ml-auto">Targets met</span>
        </footer>
      }
      {...props}
    >
      <Canvas />
    </AppShell>
  );
}

const meta = {
  title: "Navigation/AppShell",
  component: AppShell,
  // 인스펙터 폭의 한계는 앱이 정한다 — 컴포넌트 기본값(하한 0 · 상한 = 본문이 0 이 될 때까지)은 «제한 없음» 이다.
  args: {
    variant: "flush",
    resizable: true,
    inspectorLabel: "Inspector",
    inspectorMinSize: 240,
    inspectorMaxSize: 480,
  },
  argTypes: { variant: { control: "select", options: variantValues } },
  // 접힌 사이드바 항목의 툴팁은 앱 뿌리의 TooltipProvider 를 쓴다 — 스토리도 앱처럼 감싼다.
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  render: (args) => <Shell name="default" {...args} />,
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("main")).toBeInTheDocument();
    const inspector = canvas.getByRole("complementary", { name: "Inspector" });
    const handle = canvas.getByRole("separator", { name: "Resize inspector" });
    await expect(handle).toHaveAttribute("aria-controls", inspector.id);
    // 상단바 토글로 접고 다시 편다 — 접힌 칸은 inert 이고, 다음 캡처는 펼친 상태에서 시작한다.
    await userEvent.click(canvas.getByRole("button", { name: "Collapse the inspector" }));
    await expect(inspector).toHaveAttribute("data-state", "closed");
    await expect(inspector).toHaveAttribute("inert");
    await userEvent.click(canvas.getByRole("button", { name: "Show the inspector" }));
    await expect(inspector).toHaveAttribute("data-state", "open");
  },
};

const cases = variantValues.flatMap((variant) =>
  [false, true].map((closed) => ({ variant, closed, key: `${variant}-${closed ? "closed" : "open"}` })),
);

export const Variants: Story = {
  tags: ["!manifest"],
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      {cases.map(({ variant, closed, key }) => (
        <article key={key} aria-label={`Shell ${key}`} className="flex flex-col gap-2">
          <span className="font-mono text-micro font-medium tracking-caps text-muted-foreground uppercase">
            {variant} · inspector {closed ? "closed" : "open"}
          </span>
          <Shell
            name={key}
            variant={variant}
            initiallyClosed={closed}
            mainAs="div"
            headingLevel={2}
            inspectorLabel={`Inspector ${key}`}
          />
        </article>
      ))}
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      {(theme) => (
        <div className="w-full">
          <Shell
            name={`theme-${theme}`}
            {...args}
            mainAs="div"
            headingLevel={2}
            inspectorLabel={`Inspector (${theme})`}
          />
        </div>
      )}
    </ThemePair>
  ),
};
