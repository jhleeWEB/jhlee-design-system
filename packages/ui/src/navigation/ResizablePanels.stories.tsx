import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanels,
  type ResizablePanelsProps,
} from "./ResizablePanels";

/* 3스토리 계약(본보기 Button.stories). 축은 `orientation`(horizontal · vertical) — Variants 는 방향 × 상태(펼침 · 한 칸 접힘) 격자다.
 * `storageKey` 는 어디에도 주지 않는다 — 브라우저에 남은 크기가 스토리 픽셀을 흔들면 VRT 가 결정적이지 않다(usePanelLayout 스토리와 같은 이유).
 * 패널 id 는 문서 안에서 유일해야 한다(손잡이의 aria-controls 가 가리킨다) — 한 화면에 여러 묶음을 그리는 스토리는 접두를 가른다. */
const orientationValues = ["horizontal", "vertical"] as const;

function Pane({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex h-full flex-col gap-1 p-4">
      <span className="text-body font-semibold text-foreground">{title}</span>
      <span className="text-label text-muted-foreground">{detail}</span>
    </div>
  );
}

/** 왼쪽(앞) 패널 · 가운데 크기 없는 캔버스 · 오른쪽(뒤) 패널 — 손잡이 둘이 각자 자기 패널을 가리킨다. */
function Workbench({
  idPrefix,
  orientation = "horizontal",
  collapsed = false,
  ...rest
}: ResizablePanelsProps & { idPrefix: string; collapsed?: boolean }) {
  const horizontal = orientation === "horizontal";
  return (
    <ResizablePanels
      orientation={orientation}
      className="h-(--size-sheet-sm) w-full overflow-hidden rounded-lg border border-border bg-card font-sans"
      {...rest}
    >
      <ResizablePanel
        id={`${idPrefix}-start`}
        defaultSize={horizontal ? 200 : 80}
        minSize={horizontal ? 120 : 48}
        maxSize={horizontal ? 320 : 160}
        collapsible
      >
        <Pane
          title={horizontal ? "Layers" : "Toolbar"}
          detail={horizontal ? "min 120 · max 320" : "min 48 · max 160"}
        />
      </ResizablePanel>
      <ResizableHandle controls={`${idPrefix}-start`} label={`Resize ${horizontal ? "layers" : "toolbar"}`} />
      <ResizablePanel id={`${idPrefix}-canvas`} className="flex-1 bg-muted">
        <Pane title="Canvas" detail="Takes the remaining space" />
      </ResizablePanel>
      <ResizableHandle
        controls={`${idPrefix}-end`}
        label={`Resize ${horizontal ? "inspector" : "console"}`}
      />
      <ResizablePanel
        id={`${idPrefix}-end`}
        defaultSize={horizontal ? 240 : 72}
        minSize={horizontal ? 160 : 48}
        collapsible
        defaultCollapsed={collapsed}
      >
        <Pane title={horizontal ? "Inspector" : "Console"} detail={collapsed ? "Collapsed" : "Collapsible"} />
      </ResizablePanel>
    </ResizablePanels>
  );
}

const meta = {
  title: "Navigation/ResizablePanels",
  component: ResizablePanels,
  args: { orientation: "horizontal" },
  argTypes: { orientation: { control: "select", options: orientationValues } },
  render: (args) => <Workbench idPrefix="default" {...args} />,
} satisfies Meta<typeof ResizablePanels>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const handle = canvas.getByRole("separator", { name: "Resize layers" });
    await expect(handle).toHaveAttribute("aria-valuenow", "200");
    await expect(handle).toHaveAttribute("aria-controls", "default-start");
    handle.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(handle).toHaveAttribute("aria-valuenow", "216");
    await userEvent.keyboard("{Home}");
    await expect(handle).toHaveAttribute("aria-valuenow", "120");
    // 다음 스토리 픽셀이 처음 크기에서 시작하도록 되돌린다(play 는 VRT 캡처 전에 돈다).
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}");
    await expect(handle).toHaveAttribute("aria-valuenow", "200");
  },
};

const cases = orientationValues.flatMap((orientation) =>
  [false, true].map((collapsed) => ({ orientation, collapsed })),
);

export const Variants: Story = {
  tags: ["!manifest"],
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      {cases.map(({ orientation, collapsed }) => (
        <div key={`${orientation}-${collapsed}`} className="flex flex-col gap-2">
          <span className="font-mono text-micro font-medium tracking-caps text-muted-foreground uppercase">
            {orientation} · {collapsed ? "end collapsed" : "open"}
          </span>
          <Workbench
            idPrefix={`${orientation}-${collapsed ? "closed" : "open"}`}
            orientation={orientation}
            collapsed={collapsed}
          />
        </div>
      ))}
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => <ThemePair>{(theme) => <Workbench idPrefix={`theme-${theme}`} {...args} />}</ThemePair>,
};
