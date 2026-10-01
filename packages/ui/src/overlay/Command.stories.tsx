import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Matrix } from "../../stories/helpers/Matrix";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./Command";

/* 3스토리 계약(본보기 Button.stories). 축은 루트의 `surface`(card · plain) — Variants 는 surface × 상태(전부 · 검색 중 · 결과 없음) 격자다.
 * 검색 상태는 `defaultSearch` 로 고정한다(타이핑을 기다리면 VRT 가 첫 상태만 본다). `Dialog` 는 명령 팔레트(CommandDialog)를 열린 채로 그린다 —
 * 상자는 포털로 뜨므로 `#storybook-root` 에는 보이지 않는 앵커를 둔다(Modal 스토리와 같은 이유). */
const surfaceValues = ["card", "plain"] as const;
const stateValues = ["all", "searching", "empty"] as const;
const searchFor = { all: "", searching: "se", empty: "zzz" } as const;

function Entries({ onSelect }: { onSelect?: (value: string) => void }) {
  const select = onSelect ? { onSelect } : {};
  return (
    <>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup heading="Sheets">
        <CommandItem value="Plan" keywords={["A-101"]} {...select}>
          Plan
        </CommandItem>
        <CommandItem value="Section" keywords={["A-301"]} {...select}>
          Section
        </CommandItem>
        <CommandItem value="Elevation" disabled {...select}>
          Elevation
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Actions">
        <CommandItem value="Save revision" shortcut="⌘S" {...select}>
          Save revision
        </CommandItem>
        <CommandItem value="Export as PDF" keywords={["print"]} shortcut="⌘P" {...select}>
          Export as PDF
        </CommandItem>
        <CommandItem value="Delete sheet" tone="destructive" {...select}>
          Delete sheet
        </CommandItem>
      </CommandGroup>
    </>
  );
}

const meta = {
  title: "Overlay/Command",
  component: Command,
  args: { surface: "card", label: "Commands" },
  argTypes: { surface: { control: "select", options: surfaceValues } },
  render: (args) => (
    <div className="w-dialog-sm">
      <Command {...args}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <Entries />
        </CommandList>
      </Command>
    </div>
  ),
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole("combobox", { name: "Commands" });
    const plan = canvas.getByRole("option", { name: "Plan" });
    await expect(input).toHaveAttribute("aria-activedescendant", plan.id);
    await userEvent.type(input, "print");
    await expect(canvas.getByRole("option", { name: /^Export as PDF/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(canvas.queryByRole("option", { name: "Plan" })).toBeNull();
    await userEvent.clear(input);
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  render: (args) => (
    <Matrix
      rows={surfaceValues}
      cols={stateValues}
      rowLabel="surface"
      colLabel="state"
      cell={(surface, state) => (
        <div className="w-popover-max rounded-lg bg-muted p-2">
          <Command {...args} surface={surface} label={`${surface} ${state}`} defaultSearch={searchFor[state]}>
            <CommandInput placeholder="Search…" />
            <CommandList>
              <Entries />
            </CommandList>
          </Command>
        </div>
      )}
    />
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      {(theme) => (
        <div className="w-popover-max">
          <Command {...args} label={`Commands ${theme}`}>
            <CommandInput placeholder="Type a command or search…" />
            <CommandList>
              <Entries />
            </CommandList>
          </Command>
        </div>
      )}
    </ThemePair>
  ),
};

/* 명령 팔레트 — 스크림 위 화면 위쪽 1/5 자리. 안의 Command 는 면 없이(`plain`) 대화상자 면을 쓴다. */
export const Dialog: Story = {
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <>
      <span className="sr-only">Command palette open</span>
      <CommandDialog open>
        <Command label={args.label ?? "Commands"}>
          <CommandInput placeholder="Type a command or search…" />
          <CommandList>
            <Entries />
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  ),
};
