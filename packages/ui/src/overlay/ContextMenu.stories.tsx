import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, type ReactNode } from "react";
import { expect, screen } from "storybook/test";

import { ThemeSides } from "../../stories/helpers/ThemeSides";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./ContextMenu";

/* 3스토리 계약(본보기 Button.stories). 우클릭 메뉴는 **열린 채로** 그린다 — Radix ContextMenu 에는 `open` prop 이 없어서
 * 영역이 마운트되면 그 안의 고정 좌표(왼쪽 위에서 24px)로 `contextmenu` 이벤트를 한 번 보낸다. 실제 우클릭과 같은 길(Trigger 의 onContextMenu)이다.
 * `modal={false}` — 모달 메뉴는 바깥을 aria-hidden 으로 가린다. ThemeContrast 처럼 두 메뉴를 함께 열면 서로의 바깥이 되어 하나가 닫히므로
 *   바깥 포커스·포인터로 닫히지 않게도 막는다(스토리 전용). 모달성은 픽셀을 바꾸지 않는다(DropdownMenu 스토리와 같은 이유).
 * `!autodocs` — 문서 페이지에 열린 메뉴 여럿이 뜨면 포커스가 페이지를 떠난다. */
const toneValues = ["neutral", "destructive"] as const;

const meta = {
  title: "Overlay/ContextMenu",
  component: ContextMenuContent,
  tags: ["!autodocs"],
  args: {},
} satisfies Meta<typeof ContextMenuContent>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 우클릭 영역 — 마운트되면 왼쪽 위 24px 자리에 contextmenu 를 보내 메뉴를 연다. */
function OpenedArea({ label, children }: { label: string; children: ReactNode }) {
  const area = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = area.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    node.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: box.left + 24,
        clientY: box.top + 24,
      }),
    );
  }, []);
  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        <div
          ref={area}
          className="flex h-64 w-80 items-end border border-dashed border-border-strong p-3 text-label text-muted-foreground"
        >
          {label}
        </div>
      </ContextMenuTrigger>
      {children}
    </ContextMenu>
  );
}

/* 두 메뉴를 함께 열어 둘 때 서로의 바깥 포커스·포인터로 닫히지 않게 — 스토리 전용. */
const stayOpen = {
  onFocusOutside: (event: Event) => event.preventDefault(),
  onPointerDownOutside: (event: Event) => event.preventDefault(),
};

export const Default: Story = {
  render: (args) => (
    <OpenedArea label="Right-click the sheet">
      <ContextMenuContent {...args}>
        <ContextMenuItem shortcut="⌘C">Copy</ContextMenuItem>
        <ContextMenuItem shortcut="⌘D">Duplicate</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem tone="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </OpenedArea>
  ),
  play: async () => {
    const menu = await screen.findByRole("menu");
    await expect(menu).toHaveAttribute("data-slot", "context-menu");
    await expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveAttribute(
      "data-tone",
      "destructive",
    );
  },
};

/* 부품 전부 — 톤 두 값(neutral · destructive), 단축키, 비활성, 체크 · 라디오 항목, 머리글, 구분선, 하위 메뉴 트리거. DropdownMenu Variants 와 같은 목록이다. */
export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <OpenedArea label="All parts">
      <ContextMenuContent {...args}>
        <ContextMenuLabel>tone</ContextMenuLabel>
        <ContextMenuGroup>
          {toneValues.map((tone) => (
            <ContextMenuItem key={tone} tone={tone}>
              {tone}
            </ContextMenuItem>
          ))}
          <ContextMenuItem shortcut="⌘D">With shortcut</ContextMenuItem>
          <ContextMenuItem disabled>Unavailable</ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuLabel>view</ContextMenuLabel>
        <ContextMenuCheckboxItem checked>Grid</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked={false}>Dimensions</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value="plan">
          <ContextMenuRadioItem value="plan">Plan</ContextMenuRadioItem>
          <ContextMenuRadioItem value="section">Section</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Export as</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>PDF</ContextMenuItem>
            <ContextMenuItem>DXF</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </OpenedArea>
  ),
};

/* 같은 메뉴를 라이트·다크로 — 포털이 칸을 벗어나므로 상자에 `data-theme` 을 직접 단다. */
export const ThemeContrast: Story = {
  render: (args) => (
    <ThemeSides>
      {(theme) => (
        <OpenedArea label={`Right-click · ${theme}`}>
          <ContextMenuContent {...args} {...stayOpen} data-theme={theme}>
            <ContextMenuItem shortcut="⌘C">Copy</ContextMenuItem>
            <ContextMenuItem shortcut="⌘D">Duplicate</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem tone="destructive">Delete</ContextMenuItem>
          </ContextMenuContent>
        </OpenedArea>
      )}
    </ThemeSides>
  ),
};
