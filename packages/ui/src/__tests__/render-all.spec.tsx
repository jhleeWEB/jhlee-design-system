/// <reference types="node" />
/*
 * 공개 컴포넌트 전부가 공통 계약(`__arch__/component-contract.tsx`)을 어딘가에서 한 번 돈다(계획 §2.4 D-3, C3 → D7 #48).
 *
 * 대상은 배럴(index.ts)의 PascalCase 값 export 전부다(`./legacy` 별칭은 3.0.0 에서 지웠다, #49). 덮는 길은 둘뿐이고 겹치지 않는다:
 *  1. 컴포넌트 옆 `Name.spec.tsx` 가 `Name.stories` 를 계약에 넘긴다(`describeComponentContract` · `storySubject`) — 스토리 메타의
 *     `component` 가 그 spec 이 덮는 컴포넌트다. Phase D(D1–D5)가 스토리를 가진 컴포넌트를 전부 이리로 옮겼다.
 *  2. 스토리의 `component` 가 아닌 부품(Content·Item·Trigger…)은 여기 FIXTURES 의 최소 props 로 돈다.
 * 한때 여기 있던 STORY_SUBJECTS(스토리 Default 를 다시 돌리던 것)는 폴더 spec 과 같은 검사를 두 번 돌려 지웠다(#48).
 * 부품의 실패를 붙들던 KNOWN_CONTRACT_FAILURES 도 0 이 되어 지웠다 — 부품 픽스처는 실패 0 이 계약이다.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { useEffect, useRef } from "react";
import { describe, expect, it } from "vitest";

import { runContract, type ContractSubject, type Probe } from "../__arch__/component-contract";
import { IconCircle } from "../icons/icons";
import * as barrel from "../index";

const {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
  ButtonGroup,
  Card,
  CardCollapse,
  CardGrid,
  CardHeader,
  CardWell,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxTrigger,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
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
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Eyebrow,
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Lede,
  Legend,
  LegendItem,
  MediaCard,
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTrigger,
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  Readout,
  ReadoutItem,
  SectionLabel,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Separator,
  Sidebar,
  SidebarGroup,
  SidebarItem,
  SkeletonText,
  StatusDot,
  Switch,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarDivider,
  ToolbarSpacer,
  Tooltip,
  TooltipProvider,
  Tr,
} = barrel;

/* 최소 props 픽스처. 부품(Content·Item…)은 열린 부모 안에 두어 포털까지 렌더한다. 탐침(p)은 검사 대상 컴포넌트에만 펼친다. */
const openMenu =
  (child: (p: Probe) => React.ReactNode): ContractSubject["render"] =>
  (p) => (
    <DropdownMenu open>
      <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
      <DropdownMenuContent>{child(p)}</DropdownMenuContent>
    </DropdownMenu>
  );
const openModal =
  (child: (p: Probe) => React.ReactNode): ContractSubject["render"] =>
  (p) => (
    <Modal open>
      <ModalContent aria-describedby={undefined}>
        <ModalHeader title="Title" />
        {child(p)}
      </ModalContent>
    </Modal>
  );
const openDrawer =
  (child: (p: Probe) => React.ReactNode): ContractSubject["render"] =>
  (p) => (
    <Drawer open>
      <DrawerContent aria-describedby={undefined}>
        <DrawerHeader title="Title" />
        {child(p)}
      </DrawerContent>
    </Drawer>
  );
const openSelect =
  (child: (p: Probe) => React.ReactNode): ContractSubject["render"] =>
  (p) => (
    <Select open defaultValue="a">
      <SelectTrigger aria-label="Choice">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{child(p)}</SelectContent>
    </Select>
  );
/* 우클릭 메뉴에는 `open` prop 이 없다 — 영역이 마운트되면 contextmenu 를 한 번 보내 연다(ContextMenu.stories 의 OpenedArea 와 같은 길). */
function RightClicked({ children }: { children: React.ReactNode }) {
  const area = useRef<HTMLDivElement>(null);
  useEffect(() => {
    area.current?.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
  }, []);
  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        <div ref={area}>Area</div>
      </ContextMenuTrigger>
      {children}
    </ContextMenu>
  );
}
const openContextMenu =
  (child: (p: Probe) => React.ReactNode): ContractSubject["render"] =>
  (p) => (
    <RightClicked>
      <ContextMenuContent>{child(p)}</ContextMenuContent>
    </RightClicked>
  );
const inCommand =
  (child: (p: Probe) => React.ReactNode): ContractSubject["render"] =>
  (p) => (
    <Command>
      <CommandInput />
      <CommandList>{child(p)}</CommandList>
    </Command>
  );
const openCombobox =
  (child: (p: Probe) => React.ReactNode): ContractSubject["render"] =>
  (p) => (
    <Combobox open defaultValue="a">
      <ComboboxTrigger aria-label="Sheet">A</ComboboxTrigger>
      <ComboboxContent>{child(p)}</ComboboxContent>
    </Combobox>
  );
const inCollapsible =
  (child: (p: Probe) => React.ReactNode): ContractSubject["render"] =>
  (p) => <Collapsible defaultOpen>{child(p)}</Collapsible>;
const inTabs =
  (child: (p: Probe) => React.ReactNode): ContractSubject["render"] =>
  (p) => <Tabs defaultValue="a">{child(p)}</Tabs>;
const inAccordion =
  (child: (p: Probe) => React.ReactNode): ContractSubject["render"] =>
  (p) => (
    <Accordion type="single" defaultValue="a">
      <AccordionItem value="a">
        <AccordionHeader>
          <AccordionTrigger>Section</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>Body</AccordionContent>
      </AccordionItem>
      {child(p)}
    </Accordion>
  );

const FIXTURES: Readonly<Record<string, ContractSubject>> = {
  AccordionItem: {
    slot: "accordion-item",
    render: inAccordion((p) => (
      <AccordionItem value="b" {...p}>
        <AccordionHeader>
          <AccordionTrigger>B</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>B body</AccordionContent>
      </AccordionItem>
    )),
  },
  AccordionHeader: {
    slot: "accordion-header",
    render: inAccordion((p) => (
      <AccordionItem value="b">
        <AccordionHeader {...p}>
          <AccordionTrigger>B</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>B body</AccordionContent>
      </AccordionItem>
    )),
  },
  AccordionTrigger: {
    slot: "accordion-trigger",
    render: inAccordion((p) => (
      <AccordionItem value="b">
        <AccordionHeader>
          <AccordionTrigger {...p}>B</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>B body</AccordionContent>
      </AccordionItem>
    )),
  },
  AccordionContent: {
    slot: "accordion-content",
    render: inAccordion((p) => (
      <AccordionItem value="b">
        <AccordionHeader>
          <AccordionTrigger>B</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent {...p}>B body</AccordionContent>
      </AccordionItem>
    )),
  },
  ButtonGroup: {
    slot: "button-group",
    render: (p) => (
      <ButtonGroup {...p}>
        <barrel.Button>One</barrel.Button>
        <barrel.Button>Two</barrel.Button>
      </ButtonGroup>
    ),
  },
  CardCollapse: {
    slot: "card-collapse",
    render: (p) => (
      <Card
        collapsed={false}
        onCollapsedChange={() => {}}
        header={<CardHeader title="Card" collapseButton={false} />}
      >
        <CardCollapse {...p} />
      </Card>
    ),
  },
  CardGrid: {
    slot: "card-grid",
    render: (p) => (
      <CardGrid {...p}>
        <MediaCard title="One" />
      </CardGrid>
    ),
  },
  CardHeader: {
    slot: "card-header",
    axes: ["variant"],
    render: (p) => (
      <Card>
        <CardHeader title="Card" {...p} />
      </Card>
    ),
  },
  CardWell: {
    slot: "card-well",
    render: (p) => (
      <Card>
        <CardWell {...p}>Well</CardWell>
      </Card>
    ),
  },
  CollapsibleContent: {
    slot: "collapsible-content",
    render: inCollapsible((p) => (
      <>
        <CollapsibleTrigger>More</CollapsibleTrigger>
        <CollapsibleContent {...p}>Body</CollapsibleContent>
      </>
    )),
  },
  CollapsibleTrigger: {
    slot: "collapsible-trigger",
    axes: ["variant"],
    render: inCollapsible((p) => (
      <>
        <CollapsibleTrigger variant="inline" {...p}>
          More
        </CollapsibleTrigger>
        <CollapsibleContent>Body</CollapsibleContent>
      </>
    )),
  },
  Combobox: {
    // 자기 DOM 이 없는 루트(Radix Popover.Root 위) — 열린 상자로 slot · axe 를 본다.
    slot: "combobox-content",
    noDom: true,
    render: (p) => (
      <Combobox open defaultValue="a" {...p}>
        <ComboboxTrigger aria-label="Sheet">A</ComboboxTrigger>
        <ComboboxContent>
          <ComboboxItem value="a">A</ComboboxItem>
        </ComboboxContent>
      </Combobox>
    ),
  },
  ComboboxContent: {
    slot: "combobox-content",
    render: (p) => (
      <Combobox open defaultValue="a">
        <ComboboxTrigger aria-label="Sheet">A</ComboboxTrigger>
        <ComboboxContent {...p}>
          <ComboboxItem value="a">A</ComboboxItem>
        </ComboboxContent>
      </Combobox>
    ),
  },
  ComboboxItem: {
    slot: "combobox-item",
    axes: ["tone"],
    render: openCombobox((p) => (
      <ComboboxItem value="a" {...p}>
        A
      </ComboboxItem>
    )),
  },
  CommandDialog: {
    slot: "command-dialog",
    render: (p) => (
      <CommandDialog open {...p}>
        <Command>
          <CommandInput />
          <CommandList>
            <CommandItem>Plan</CommandItem>
          </CommandList>
        </Command>
      </CommandDialog>
    ),
  },
  CommandEmpty: {
    slot: "command-empty",
    render: inCommand((p) => <CommandEmpty {...p}>No results found.</CommandEmpty>),
  },
  CommandGroup: {
    slot: "command-group",
    render: inCommand((p) => (
      <CommandGroup heading="Sheets" {...p}>
        <CommandItem>Plan</CommandItem>
      </CommandGroup>
    )),
  },
  CommandInput: {
    slot: "command-input",
    render: (p) => (
      <Command>
        <CommandInput {...p} />
        <CommandList>
          <CommandItem>Plan</CommandItem>
        </CommandList>
      </Command>
    ),
  },
  CommandItem: {
    slot: "command-item",
    axes: ["tone"],
    render: inCommand((p) => (
      <CommandItem tone="destructive" {...p}>
        Delete
      </CommandItem>
    )),
  },
  CommandList: {
    slot: "command-list",
    render: (p) => (
      <Command>
        <CommandInput />
        <CommandList {...p}>
          <CommandItem>Plan</CommandItem>
        </CommandList>
      </Command>
    ),
  },
  CommandSeparator: {
    slot: "command-separator",
    render: inCommand((p) => (
      <>
        <CommandItem>Plan</CommandItem>
        <CommandSeparator {...p} />
        <CommandItem>Section</CommandItem>
      </>
    )),
  },
  ContextMenu: {
    slot: "context-menu",
    noDom: true,
    render: (p) => (
      <RightClicked {...p}>
        <ContextMenuContent>
          <ContextMenuItem>One</ContextMenuItem>
        </ContextMenuContent>
      </RightClicked>
    ),
  },
  ContextMenuCheckboxItem: {
    slot: "context-menu-checkbox-item",
    render: openContextMenu((p) => (
      <ContextMenuCheckboxItem checked {...p}>
        Grid
      </ContextMenuCheckboxItem>
    )),
  },
  ContextMenuGroup: {
    slot: "context-menu-group",
    render: openContextMenu((p) => (
      <ContextMenuGroup {...p}>
        <ContextMenuItem>One</ContextMenuItem>
      </ContextMenuGroup>
    )),
  },
  ContextMenuItem: {
    slot: "context-menu-item",
    axes: ["tone"],
    render: openContextMenu((p) => (
      <ContextMenuItem tone="destructive" {...p}>
        Delete
      </ContextMenuItem>
    )),
  },
  ContextMenuLabel: {
    slot: "context-menu-label",
    render: openContextMenu((p) => (
      <>
        <ContextMenuLabel {...p}>Section</ContextMenuLabel>
        <ContextMenuItem>One</ContextMenuItem>
      </>
    )),
  },
  ContextMenuRadioGroup: {
    slot: "context-menu-radio-group",
    render: openContextMenu((p) => (
      <ContextMenuRadioGroup value="a" {...p}>
        <ContextMenuRadioItem value="a">A</ContextMenuRadioItem>
      </ContextMenuRadioGroup>
    )),
  },
  ContextMenuRadioItem: {
    slot: "context-menu-radio-item",
    render: openContextMenu((p) => (
      <ContextMenuRadioGroup value="a">
        <ContextMenuRadioItem value="a" {...p}>
          A
        </ContextMenuRadioItem>
      </ContextMenuRadioGroup>
    )),
  },
  ContextMenuSeparator: {
    slot: "context-menu-separator",
    render: openContextMenu((p) => <ContextMenuSeparator {...p} />),
  },
  ContextMenuSub: {
    slot: "context-menu-sub-content",
    noDom: true,
    render: openContextMenu((p) => (
      <ContextMenuSub open {...p}>
        <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem>Deep</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
    )),
  },
  ContextMenuSubContent: {
    slot: "context-menu-sub-content",
    render: openContextMenu((p) => (
      <ContextMenuSub open>
        <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
        <ContextMenuSubContent {...p}>
          <ContextMenuItem>Deep</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
    )),
  },
  ContextMenuSubTrigger: {
    slot: "context-menu-sub-trigger",
    render: openContextMenu((p) => (
      <ContextMenuSub>
        <ContextMenuSubTrigger {...p}>More</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem>Deep</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
    )),
  },
  ContextMenuTrigger: {
    slot: "context-menu-trigger",
    render: (p) => (
      <ContextMenu>
        <ContextMenuTrigger {...p}>Area</ContextMenuTrigger>
      </ContextMenu>
    ),
  },
  Drawer: {
    slot: "drawer",
    noDom: true,
    render: (p) => (
      <Drawer open {...p}>
        <DrawerContent aria-describedby={undefined}>
          <DrawerHeader title="Title" />
        </DrawerContent>
      </Drawer>
    ),
  },
  DrawerBody: { slot: "drawer-body", render: openDrawer((p) => <DrawerBody {...p}>Body</DrawerBody>) },
  DrawerClose: { slot: "dialog-close", render: openDrawer((p) => <DrawerClose {...p}>Close</DrawerClose>) },
  DrawerHeader: { slot: "drawer-header", render: openDrawer((p) => <DrawerHeader title="Second" {...p} />) },
  DrawerTrigger: {
    slot: "dialog-trigger",
    render: (p) => (
      <Drawer>
        <DrawerTrigger {...p}>Open</DrawerTrigger>
      </Drawer>
    ),
  },
  DropdownMenu: {
    slot: "menu",
    noDom: true,
    render: (p) => (
      <DropdownMenu open {...p}>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  DropdownMenuCheckboxItem: {
    slot: "menu-checkbox-item",
    render: openMenu((p) => (
      <DropdownMenuCheckboxItem checked {...p}>
        Grid
      </DropdownMenuCheckboxItem>
    )),
  },
  DropdownMenuGroup: {
    slot: "menu-group",
    render: openMenu((p) => (
      <DropdownMenuGroup {...p}>
        <DropdownMenuItem>One</DropdownMenuItem>
      </DropdownMenuGroup>
    )),
  },
  DropdownMenuItem: {
    slot: "menu-item",
    axes: ["tone"],
    render: openMenu((p) => (
      <DropdownMenuItem tone="destructive" {...p}>
        Delete
      </DropdownMenuItem>
    )),
  },
  DropdownMenuLabel: {
    slot: "menu-label",
    render: openMenu((p) => (
      <>
        <DropdownMenuLabel {...p}>Section</DropdownMenuLabel>
        <DropdownMenuItem>One</DropdownMenuItem>
      </>
    )),
  },
  DropdownMenuRadioGroup: {
    slot: "menu-radio-group",
    render: openMenu((p) => (
      <DropdownMenuRadioGroup value="a" {...p}>
        <DropdownMenuRadioItem value="a">A</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    )),
  },
  DropdownMenuRadioItem: {
    slot: "menu-radio-item",
    render: openMenu((p) => (
      <DropdownMenuRadioGroup value="a">
        <DropdownMenuRadioItem value="a" {...p}>
          A
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    )),
  },
  DropdownMenuSeparator: {
    slot: "menu-separator",
    render: openMenu((p) => <DropdownMenuSeparator {...p} />),
  },
  DropdownMenuSub: {
    slot: "menu-sub-content",
    noDom: true,
    render: openMenu((p) => (
      <DropdownMenuSub open {...p}>
        <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem>Deep</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    )),
  },
  DropdownMenuSubContent: {
    slot: "menu-sub-content",
    render: openMenu((p) => (
      <DropdownMenuSub open>
        <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
        <DropdownMenuSubContent {...p}>
          <DropdownMenuItem>Deep</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    )),
  },
  DropdownMenuSubTrigger: {
    slot: "menu-sub-trigger",
    render: openMenu((p) => (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger {...p}>More</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem>Deep</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    )),
  },
  DropdownMenuTrigger: {
    slot: "menu-trigger",
    render: (p) => (
      <DropdownMenu>
        <DropdownMenuTrigger {...p}>Menu</DropdownMenuTrigger>
      </DropdownMenu>
    ),
  },
  Eyebrow: { slot: "eyebrow", render: (p) => <Eyebrow {...p}>Step</Eyebrow> },
  FieldControl: {
    // 자기 DOM 이 없는 Slot 이다 — 탐침은 자식 Input 에 닿고 data-slot 은 자식의 것이 남는다.
    slot: "input",
    render: (p) => (
      <Field>
        <FieldLabel>Name</FieldLabel>
        <FieldControl {...p}>
          <barrel.Input />
        </FieldControl>
      </Field>
    ),
  },
  FieldDescription: {
    slot: "field-description",
    render: (p) => (
      <Field>
        <FieldLabel>Name</FieldLabel>
        <FieldControl>
          <barrel.Input />
        </FieldControl>
        <FieldDescription {...p}>Help</FieldDescription>
      </Field>
    ),
  },
  FieldError: {
    slot: "field-error",
    render: (p) => (
      <Field>
        <FieldLabel>Name</FieldLabel>
        <FieldControl>
          <barrel.Input />
        </FieldControl>
        <FieldError {...p}>Required</FieldError>
      </Field>
    ),
  },
  FieldLabel: {
    slot: "field-label",
    render: (p) => (
      <Field>
        <FieldLabel {...p}>Name</FieldLabel>
        <FieldControl>
          <barrel.Input />
        </FieldControl>
      </Field>
    ),
  },
  HoverCard: {
    slot: "hover-card",
    noDom: true,
    render: (p) => (
      <HoverCard open {...p}>
        <HoverCardTrigger href="#a">A</HoverCardTrigger>
        <HoverCardContent>Body</HoverCardContent>
      </HoverCard>
    ),
  },
  HoverCardTrigger: {
    slot: "hover-card-trigger",
    render: (p) => (
      <HoverCard>
        <HoverCardTrigger href="#a" {...p}>
          A
        </HoverCardTrigger>
      </HoverCard>
    ),
  },
  Lede: { slot: "lede", render: (p) => <Lede {...p}>Lede</Lede> },
  LegendItem: {
    slot: "legend-item",
    render: (p) => (
      <Legend>
        <LegendItem swatch="muted" pattern="hatch" {...p}>
          Core
        </LegendItem>
      </Legend>
    ),
  },
  Modal: {
    slot: "modal",
    noDom: true,
    render: (p) => (
      <Modal open {...p}>
        <ModalContent aria-describedby={undefined}>
          <ModalHeader title="Title" />
        </ModalContent>
      </Modal>
    ),
  },
  ModalBody: { slot: "modal-body", render: openModal((p) => <ModalBody {...p}>Body</ModalBody>) },
  ModalClose: { slot: "dialog-close", render: openModal((p) => <ModalClose {...p}>Close</ModalClose>) },
  ModalFooter: { slot: "modal-footer", render: openModal((p) => <ModalFooter {...p}>Footer</ModalFooter>) },
  ModalHeader: { slot: "modal-header", render: openModal((p) => <ModalHeader title="Second" {...p} />) },
  ModalTrigger: {
    slot: "dialog-trigger",
    render: (p) => (
      <Modal>
        <ModalTrigger {...p}>Open</ModalTrigger>
      </Modal>
    ),
  },
  Popover: {
    slot: "popover",
    noDom: true,
    render: (p) => (
      <Popover open {...p}>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent aria-label="Details">Body</PopoverContent>
      </Popover>
    ),
  },
  PopoverAnchor: {
    slot: "popover-anchor",
    render: (p) => (
      <Popover open>
        <PopoverAnchor {...p}>Anchor</PopoverAnchor>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent aria-label="Details">Body</PopoverContent>
      </Popover>
    ),
  },
  PopoverClose: {
    slot: "popover-close",
    render: (p) => (
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent aria-label="Details">
          <PopoverClose {...p}>Close</PopoverClose>
        </PopoverContent>
      </Popover>
    ),
  },
  PopoverTrigger: {
    slot: "popover-trigger",
    render: (p) => (
      <Popover>
        <PopoverTrigger {...p}>Open</PopoverTrigger>
      </Popover>
    ),
  },
  RadioGroup: {
    slot: "radio-group",
    render: (p) => (
      <RadioGroup aria-label="Choice" defaultValue="a" {...p}>
        <RadioGroupItem value="a" aria-label="A" />
      </RadioGroup>
    ),
  },
  RadioGroupItem: {
    slot: "radio",
    render: (p) => (
      <RadioGroup aria-label="Choice" defaultValue="a">
        <RadioGroupItem value="a" aria-label="A" {...p} />
      </RadioGroup>
    ),
  },
  ReadoutItem: {
    slot: "readout-item",
    render: (p) => (
      <Readout>
        <ReadoutItem label="Height" value="68.4" unit="m" tone="destructive" status="Over limit" {...p} />
      </Readout>
    ),
  },
  SectionLabel: { slot: "section-label", render: (p) => <SectionLabel {...p}>Section</SectionLabel> },
  Select: {
    // 자기 DOM 이 없는 Radix Root — 열린 상자(포털)로 slot · axe 를 본다. 열린 Select 의 aria-hidden-focus 는 Select.stories 머리 주석.
    slot: "select-content",
    noDom: true,
    axeOff: ["aria-hidden-focus"],
    render: (p) => (
      <Select open defaultValue="a" {...p}>
        <SelectTrigger aria-label="Choice">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
  SelectContent: {
    slot: "select-content",
    axeOff: ["aria-hidden-focus"],
    render: (p) => (
      <Select open defaultValue="a">
        <SelectTrigger aria-label="Choice">
          <SelectValue />
        </SelectTrigger>
        <SelectContent {...p}>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
  SelectGroup: {
    slot: "select-group",
    axeOff: ["aria-hidden-focus"],
    render: openSelect((p) => (
      <SelectGroup {...p}>
        <SelectItem value="a">A</SelectItem>
      </SelectGroup>
    )),
  },
  SelectItem: {
    slot: "select-item",
    axeOff: ["aria-hidden-focus"],
    render: openSelect((p) => (
      <SelectItem value="a" {...p}>
        A
      </SelectItem>
    )),
  },
  SelectLabel: {
    slot: "select-label",
    axeOff: ["aria-hidden-focus"],
    render: openSelect((p) => (
      <SelectGroup>
        <SelectLabel {...p}>Group</SelectLabel>
        <SelectItem value="a">A</SelectItem>
      </SelectGroup>
    )),
  },
  SelectSeparator: {
    slot: "select-separator",
    axeOff: ["aria-hidden-focus"],
    render: openSelect((p) => (
      <>
        <SelectItem value="a">A</SelectItem>
        <SelectSeparator {...p} />
        <SelectItem value="b">B</SelectItem>
      </>
    )),
  },
  SelectValue: {
    slot: "select-value",
    render: (p) => (
      <Select defaultValue="a">
        <SelectTrigger aria-label="Choice">
          <SelectValue {...p} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
  Separator: { slot: "separator", render: (p) => <Separator {...p} /> },
  SidebarGroup: {
    slot: "sidebar-group",
    render: (p) => (
      <Sidebar>
        <SidebarGroup label="Group" {...p}>
          <SidebarItem icon={<IconCircle />} label="Home" />
        </SidebarGroup>
      </Sidebar>
    ),
  },
  SidebarItem: {
    slot: "sidebar-item",
    render: (p) => (
      <Sidebar>
        <SidebarItem icon={<IconCircle />} label="Home" {...p} />
      </Sidebar>
    ),
  },
  SkeletonText: { slot: "skeleton-text", render: (p) => <SkeletonText {...p} /> },
  StatusDot: { slot: "status-dot", render: (p) => <StatusDot tone="success" label="Pass" {...p} /> },
  Switch: { slot: "switch", render: (p) => <Switch aria-label="Dark" {...p} /> },
  TabsContent: {
    slot: "tabs-content",
    render: inTabs((p) => (
      <>
        <TabsList aria-label="Views">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a" {...p}>
          A body
        </TabsContent>
      </>
    )),
  },
  TabsList: {
    slot: "tabs-list",
    axes: ["variant"],
    render: inTabs((p) => (
      <>
        <TabsList aria-label="Views" {...p}>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A body</TabsContent>
      </>
    )),
  },
  TabsTrigger: {
    slot: "tabs-trigger",
    axes: ["variant"],
    render: inTabs((p) => (
      <>
        <TabsList aria-label="Views" variant="underline">
          <TabsTrigger value="a" {...p}>
            A
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a">A body</TabsContent>
      </>
    )),
  },
  Tbody: {
    slot: "table-body",
    render: (p) => (
      <Table>
        <Tbody {...p}>
          <Tr>
            <Td>Alpha</Td>
          </Tr>
        </Tbody>
      </Table>
    ),
  },
  Td: {
    slot: "table-cell",
    axes: ["tone"],
    render: (p) => (
      <Table>
        <Tbody>
          <Tr>
            <Td {...p}>Alpha</Td>
          </Tr>
        </Tbody>
      </Table>
    ),
  },
  Textarea: { slot: "textarea", render: (p) => <Textarea aria-label="Notes" {...p} /> },
  Th: {
    slot: "table-head",
    render: (p) => (
      <Table>
        <Thead>
          <Tr>
            <Th {...p}>Name</Th>
          </Tr>
        </Thead>
      </Table>
    ),
  },
  Thead: {
    slot: "table-header",
    render: (p) => (
      <Table>
        <Thead {...p}>
          <Tr>
            <Th>Name</Th>
          </Tr>
        </Thead>
      </Table>
    ),
  },
  ToggleGroupItem: {
    slot: "toggle-group-item",
    axes: ["variant", "size"],
    render: (p) => (
      <ToggleGroup type="single" aria-label="View" defaultValue="a">
        <ToggleGroupItem value="a" {...p}>
          A
        </ToggleGroupItem>
      </ToggleGroup>
    ),
  },
  ToolbarDivider: {
    slot: "toolbar-divider",
    render: (p) => (
      <Toolbar aria-label="Tools">
        <barrel.Button>One</barrel.Button>
        <ToolbarDivider {...p} />
      </Toolbar>
    ),
  },
  ToolbarSpacer: {
    slot: "toolbar-spacer",
    render: (p) => (
      <Toolbar aria-label="Tools">
        <barrel.Button>One</barrel.Button>
        <ToolbarSpacer {...p} />
      </Toolbar>
    ),
  },
  TooltipProvider: {
    slot: "tooltip",
    noDom: true,
    render: (p) => (
      <TooltipProvider {...p}>
        <Tooltip label="Hint" open>
          <barrel.Button>Hover</barrel.Button>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  Tr: {
    slot: "table-row",
    render: (p) => (
      <Table>
        <Tbody>
          <Tr {...p}>
            <Td>Alpha</Td>
          </Tr>
        </Tbody>
      </Table>
    ),
  },
};

const isComponent = (v: unknown): boolean =>
  typeof v === "function" || (typeof v === "object" && v !== null && "$$typeof" in v);
const PUBLIC_COMPONENTS = Object.entries(barrel)
  .filter(([name, value]) => /^[A-Z]/.test(name) && !/^[A-Z0-9_]+$/.test(name) && isComponent(value))
  .map(([name]) => name)
  .sort();

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** 컴포넌트 옆 spec(`__tests__`·`__arch__` 밖의 `*.spec.tsx`)이 계약에 넘기는 스토리의 메타 `component` → 그 spec 경로. */
function coveredBySpec(dir = SRC, out = new Map<string, string>()): Map<string, string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "__tests__" && entry.name !== "__arch__") coveredBySpec(p, out);
      continue;
    }
    if (!entry.name.endsWith(".spec.tsx")) continue;
    const text = readFileSync(p, "utf8");
    if (!/\b(describeComponentContract|storySubject)\(/.test(text)) continue;
    for (const m of text.matchAll(/from "\.\/(\w+)\.stories"/g)) {
      const stories = readFileSync(join(dirname(p), `${m[1]!}.stories.tsx`), "utf8");
      const component = /^\s*component: (\w+)[<,]/m.exec(stories)?.[1];
      if (component) out.set(component, relative(SRC, p));
    }
  }
  return out;
}
const SPEC_COVERED = coveredBySpec();

describe("공개 컴포넌트 공통 계약(render-all)", () => {
  it("폴더 spec 을 찾는다", () => {
    expect(SPEC_COVERED.size).toBeGreaterThan(20);
    expect(SPEC_COVERED.get("Button")).toBe("primitives/Button.spec.tsx");
  });

  it("배럴의 공개 컴포넌트마다 폴더 spec 이나 부품 픽스처가 있다 — 둘 다는 아니다", () => {
    const missing = PUBLIC_COMPONENTS.filter((name) => !SPEC_COVERED.has(name) && !(name in FIXTURES));
    expect(missing, "새 컴포넌트는 stories + 옆 spec(describeComponentContract)과 함께 온다").toEqual([]);
    const doubled = Object.keys(FIXTURES).filter((name) => SPEC_COVERED.has(name));
    expect(doubled, "폴더 spec 이 덮는 컴포넌트의 픽스처는 지운다").toEqual([]);
    const stale = [...SPEC_COVERED.keys(), ...Object.keys(FIXTURES)].filter(
      (name) => !PUBLIC_COMPONENTS.includes(name),
    );
    expect(stale, "배럴에 없는 픽스처·스토리 component").toEqual([]);
  });

  it.each(Object.keys(FIXTURES).sort())("%s — 부품 픽스처가 계약을 전부 통과한다", async (name) => {
    const failures = await runContract(FIXTURES[name]!);
    expect(failures.map((f) => `${f.id}: ${f.reason}`)).toEqual([]);
  });
});
