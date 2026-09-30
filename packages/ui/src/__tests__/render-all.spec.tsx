/*
 * 공개 컴포넌트 전부에 공통 계약(`__arch__/component-contract.tsx`)을 돌린다(계획 §2.4 D-3, C3).
 *
 * 대상은 배럴(index.ts)의 PascalCase 값 export 에서 `./legacy` 재export(격리·동결, #10)를 뺀 것이다. 스토리가 있는 컴포넌트는 그 `Default` 가
 * 픽스처이고(STORY_SUBJECTS), 없는 것은 여기 FIXTURES 의 최소 props 다 — Phase D 가 스토리를 만들면 그 컴포넌트는 STORY_SUBJECTS 로 옮긴다.
 *
 * 래칫: 오늘 깨지는 «컴포넌트 → 검사 id» 를 KNOWN_CONTRACT_FAILURES 가 든다. 없는 실패가 나면 새 위반이고, 목록에 있는데 통과하면 «지워라».
 * 첫 실행 실측(2026-09-30). 픽스처가 없는 공개 컴포넌트는 실패다 — 새 컴포넌트는 스토리(권장)나 픽스처와 함께 온다.
 */
import { LuCircle } from "react-icons/lu";
import { describe, expect, it } from "vitest";

import { CONTRACT_CHECKS, runContract, storySubject, type CheckId, type ContractSubject, type Probe } from "../__arch__/component-contract";
import * as barrel from "../index";
import * as legacy from "../legacy/index";
import * as ButtonStories from "../primitives/Button.stories";

/** 오늘 깨지는 검사 — 알파벳순, 줄어들기만 한다. */
const KNOWN_CONTRACT_FAILURES: Readonly<Record<string, readonly CheckId[]>> = {
  Alert: ["axes", "slot-locked"],
  BackButton: ["slot-locked"],
  Badge: ["axes", "slot-locked"],
  Breadcrumb: ["slot-locked"],
  Button: ["axes", "slot-locked"],
  ButtonGroup: ["slot-locked"],
  CanvasScale: ["slot-locked"],
  Card: ["axes", "slot-locked"],
  CardCollapse: ["slot-locked"],
  CardGrid: ["slot-locked"],
  CardHeader: ["slot-locked"],
  CardWell: ["slot-locked"],
  Checkbox: ["slot-locked"],
  DataTable: ["ref", "rest"],
  DescriptionList: ["slot-locked"],
  DisplayHeading: ["slot-locked"],
  Drawer: ["className", "ref", "rest"],
  DrawerBody: ["slot-locked"],
  DrawerClose: ["className", "slot-locked"],
  DrawerContent: ["axes", "slot-locked"],
  DrawerHeader: ["slot-locked"],
  DrawerTrigger: ["className", "slot", "slot-locked"],
  DropdownMenu: ["className", "ref", "rest"],
  DropdownMenuCheckboxItem: ["slot", "slot-locked"],
  DropdownMenuContent: ["slot-locked"],
  DropdownMenuGroup: ["className", "slot", "slot-locked"],
  DropdownMenuItem: ["axes", "slot", "slot-locked"],
  DropdownMenuLabel: ["slot", "slot-locked"],
  DropdownMenuRadioGroup: ["className", "slot", "slot-locked"],
  DropdownMenuRadioItem: ["slot", "slot-locked"],
  DropdownMenuSeparator: ["slot", "slot-locked"],
  DropdownMenuSub: ["className", "ref", "rest", "slot", "slot-locked"],
  DropdownMenuSubContent: ["slot", "slot-locked"],
  DropdownMenuSubTrigger: ["slot", "slot-locked"],
  DropdownMenuTrigger: ["className", "slot", "slot-locked"],
  EmptyState: ["axes", "slot-locked"],
  Eyebrow: ["slot-locked"],
  Input: ["axes", "slot-locked"],
  Kbd: ["slot-locked"],
  Lede: ["slot-locked"],
  MediaCard: ["axes", "slot-locked"],
  Modal: ["className", "ref", "rest"],
  ModalBody: ["slot-locked"],
  ModalClose: ["className", "slot-locked"],
  ModalContent: ["axes", "slot-locked"],
  ModalFooter: ["slot-locked"],
  ModalHeader: ["slot-locked"],
  ModalTrigger: ["className", "slot", "slot-locked"],
  PanelToggleButton: ["slot-locked"],
  Popover: ["className", "ref", "rest"],
  PopoverAnchor: ["className", "slot", "slot-locked"],
  PopoverClose: ["className", "slot", "slot-locked"],
  PopoverContent: ["slot-locked"],
  PopoverTrigger: ["className", "slot", "slot-locked"],
  Progress: ["axes", "slot-locked"],
  RadioGroup: ["className", "slot", "slot-locked"],
  RadioGroupItem: ["slot-locked"],
  SectionLabel: ["slot-locked"],
  SegmentedControl: ["ref", "rest"],
  Separator: ["slot-locked"],
  Sidebar: ["slot-locked"],
  SidebarGroup: ["slot-locked"],
  SidebarItem: ["slot-locked"],
  Skeleton: ["slot-locked"],
  SkeletonText: ["slot-locked"],
  Spinner: ["axes", "slot-locked"],
  StatusDot: ["ref", "rest"],
  Switch: ["slot-locked"],
  Table: ["slot-locked"],
  Tbody: ["className", "slot", "slot-locked"],
  Td: ["slot", "slot-locked"],
  Textarea: ["slot-locked"],
  Th: ["slot", "slot-locked"],
  Thead: ["slot", "slot-locked"],
  ToastProvider: ["className", "ref", "rest"],
  Toolbar: ["slot-locked"],
  ToolbarDivider: ["ref", "rest", "slot", "slot-locked"],
  ToolbarSpacer: ["className", "ref", "rest", "slot", "slot-locked"],
  Tooltip: ["className", "ref", "rest"],
  TooltipProvider: ["className", "ref", "rest"],
  Tr: ["slot", "slot-locked"],
};

const {
  Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger,
  Alert, Badge, BackButton, Breadcrumb, ButtonGroup, CanvasScale, Card, CardCollapse, CardGrid, CardHeader, CardWell, Checkbox,
  ConfirmDialog, DataTable, DescriptionList, DisplayHeading, Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerHeader, DrawerTrigger,
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
  EmptyState, Eyebrow, Input, Kbd, Lede, MediaCard, Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTrigger,
  PanelToggleButton, Popover, PopoverAnchor, PopoverClose, PopoverContent, PopoverTrigger, Progress, RadioGroup, RadioGroupItem, ScrollArea,
  SectionLabel, SegmentedControl, Separator, Sidebar, SidebarGroup, SidebarItem, Skeleton, SkeletonText, Spinner, StatusDot, Switch, Table,
  Tbody, Td, Textarea, Th, Thead, ToastProvider, Toolbar, ToolbarDivider, ToolbarSpacer, Tooltip, TooltipProvider, Tr,
} = barrel;

/** 스토리가 있는 컴포넌트 — `Default` 가 픽스처다. */
const STORY_SUBJECTS: Readonly<Record<string, ContractSubject>> = {
  Button: storySubject(ButtonStories, { slot: "button", axes: ["variant", "tone", "size"] }),
};

/* 최소 props 픽스처. 부품(Content·Item…)은 열린 부모 안에 두어 포털까지 렌더한다. 탐침(p)은 검사 대상 컴포넌트에만 펼친다. */
const openMenu = (child: (p: Probe) => React.ReactNode): ContractSubject["render"] => p => (
  <DropdownMenu open>
    <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
    <DropdownMenuContent>{child(p)}</DropdownMenuContent>
  </DropdownMenu>
);
const openModal = (child: (p: Probe) => React.ReactNode): ContractSubject["render"] => p => (
  <Modal open>
    <ModalContent aria-describedby={undefined}>
      <ModalHeader title="Title" />
      {child(p)}
    </ModalContent>
  </Modal>
);
const openDrawer = (child: (p: Probe) => React.ReactNode): ContractSubject["render"] => p => (
  <Drawer open>
    <DrawerContent aria-describedby={undefined}>
      <DrawerHeader title="Title" />
      {child(p)}
    </DrawerContent>
  </Drawer>
);
const inAccordion = (child: (p: Probe) => React.ReactNode): ContractSubject["render"] => p => (
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
const rows = [{ id: "a", name: "Alpha", n: 1 }];

const FIXTURES: Readonly<Record<string, ContractSubject>> = {
  Accordion: { slot: "accordion", render: p => (
    <Accordion type="single" defaultValue="a" {...p}>
      <AccordionItem value="a"><AccordionHeader><AccordionTrigger>Section</AccordionTrigger></AccordionHeader><AccordionContent>Body</AccordionContent></AccordionItem>
    </Accordion>
  ) },
  AccordionItem: { slot: "accordion-item", render: inAccordion(p => <AccordionItem value="b" {...p}><AccordionHeader><AccordionTrigger>B</AccordionTrigger></AccordionHeader><AccordionContent>B body</AccordionContent></AccordionItem>) },
  AccordionHeader: { slot: "accordion-header", render: inAccordion(p => <AccordionItem value="b"><AccordionHeader {...p}><AccordionTrigger>B</AccordionTrigger></AccordionHeader><AccordionContent>B body</AccordionContent></AccordionItem>) },
  AccordionTrigger: { slot: "accordion-trigger", render: inAccordion(p => <AccordionItem value="b"><AccordionHeader><AccordionTrigger {...p}>B</AccordionTrigger></AccordionHeader><AccordionContent>B body</AccordionContent></AccordionItem>) },
  AccordionContent: { slot: "accordion-content", render: inAccordion(p => <AccordionItem value="b"><AccordionHeader><AccordionTrigger>B</AccordionTrigger></AccordionHeader><AccordionContent {...p}>B body</AccordionContent></AccordionItem>) },
  Alert: { slot: "alert", axes: ["tone"], render: p => <Alert tone="info" title="Heads up" {...p}>Body</Alert> },
  BackButton: { slot: "button", render: p => <BackButton {...p}>Back</BackButton> },
  Badge: { slot: "badge", axes: ["tone"], render: p => <Badge tone="success" {...p}>Pass</Badge> },
  Breadcrumb: { slot: "breadcrumb", render: p => <Breadcrumb items={[{ label: "Home", href: "#" }, { label: "Here" }]} {...p} /> },
  ButtonGroup: { slot: "button-group", render: p => <ButtonGroup {...p}><barrel.Button>One</barrel.Button><barrel.Button>Two</barrel.Button></ButtonGroup> },
  CanvasScale: { slot: "canvas-scale", render: p => <CanvasScale lengthPx={80} label="10 m" {...p} /> },
  Card: { slot: "card", axes: ["elevation"], render: p => <Card elevation="raised" header={<CardHeader title="Card" />} {...p}>Body</Card> },
  CardCollapse: { slot: "card-collapse", render: p => <Card collapsed={false} onCollapsedChange={() => {}} header={<CardHeader title="Card" collapseButton={false} />}><CardCollapse {...p} /></Card> },
  CardGrid: { slot: "card-grid", render: p => <CardGrid {...p}><MediaCard title="One" /></CardGrid> },
  CardHeader: { slot: "card-header", axes: ["variant"], render: p => <Card><CardHeader title="Card" {...p} /></Card> },
  CardWell: { slot: "card-well", render: p => <Card><CardWell {...p}>Well</CardWell></Card> },
  Checkbox: { slot: "checkbox", render: p => <Checkbox aria-label="Agree" {...p} /> },
  ConfirmDialog: { slot: "confirm-dialog", render: p => <ConfirmDialog open onOpenChange={() => {}} title="Delete?" description="This cannot be undone." confirmLabel="Delete" onConfirm={() => {}} {...p} /> },
  DataTable: { slot: "data-table", render: p => <DataTable columns={[{ key: "name", header: "Name" }, { key: "n", header: "N", numeric: true }]} rows={rows} rowKey={r => r.id} caption="Rows" {...p} /> },
  DescriptionList: { slot: "description-list", render: p => <DescriptionList rows={[{ k: "Area", v: "120 m²", numeric: true }]} {...p} /> },
  DisplayHeading: { slot: "display-heading", render: p => <DisplayHeading {...p}>Heading</DisplayHeading> },
  Drawer: { slot: "drawer", render: p => <Drawer open {...p}><DrawerContent aria-describedby={undefined}><DrawerHeader title="Title" /></DrawerContent></Drawer> },
  DrawerBody: { slot: "drawer-body", render: openDrawer(p => <DrawerBody {...p}>Body</DrawerBody>) },
  DrawerClose: { slot: "dialog-close", render: openDrawer(p => <DrawerClose {...p}>Close</DrawerClose>) },
  DrawerContent: { slot: "drawer", axes: ["side", "size"], render: p => <Drawer open><DrawerContent aria-describedby={undefined} {...p}><DrawerHeader title="Title" /></DrawerContent></Drawer> },
  DrawerHeader: { slot: "drawer-header", render: openDrawer(p => <DrawerHeader title="Second" {...p} />) },
  DrawerTrigger: { slot: "dialog-trigger", render: p => <Drawer><DrawerTrigger {...p}>Open</DrawerTrigger></Drawer> },
  DropdownMenu: { slot: "menu", render: p => <DropdownMenu open {...p}><DropdownMenuTrigger>Menu</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>One</DropdownMenuItem></DropdownMenuContent></DropdownMenu> },
  DropdownMenuCheckboxItem: { slot: "menu-checkbox-item", render: openMenu(p => <DropdownMenuCheckboxItem checked {...p}>Grid</DropdownMenuCheckboxItem>) },
  DropdownMenuContent: { slot: "menu", render: p => <DropdownMenu open><DropdownMenuTrigger>Menu</DropdownMenuTrigger><DropdownMenuContent {...p}><DropdownMenuItem>One</DropdownMenuItem></DropdownMenuContent></DropdownMenu> },
  DropdownMenuGroup: { slot: "menu-group", render: openMenu(p => <DropdownMenuGroup {...p}><DropdownMenuItem>One</DropdownMenuItem></DropdownMenuGroup>) },
  DropdownMenuItem: { slot: "menu-item", axes: ["tone"], render: openMenu(p => <DropdownMenuItem tone="destructive" {...p}>Delete</DropdownMenuItem>) },
  DropdownMenuLabel: { slot: "menu-label", render: openMenu(p => <><DropdownMenuLabel {...p}>Section</DropdownMenuLabel><DropdownMenuItem>One</DropdownMenuItem></>) },
  DropdownMenuRadioGroup: { slot: "menu-radio-group", render: openMenu(p => <DropdownMenuRadioGroup value="a" {...p}><DropdownMenuRadioItem value="a">A</DropdownMenuRadioItem></DropdownMenuRadioGroup>) },
  DropdownMenuRadioItem: { slot: "menu-radio-item", render: openMenu(p => <DropdownMenuRadioGroup value="a"><DropdownMenuRadioItem value="a" {...p}>A</DropdownMenuRadioItem></DropdownMenuRadioGroup>) },
  DropdownMenuSeparator: { slot: "menu-separator", render: openMenu(p => <DropdownMenuSeparator {...p} />) },
  DropdownMenuSub: { slot: "menu-sub", render: openMenu(p => <DropdownMenuSub open {...p}><DropdownMenuSubTrigger>More</DropdownMenuSubTrigger><DropdownMenuSubContent><DropdownMenuItem>Deep</DropdownMenuItem></DropdownMenuSubContent></DropdownMenuSub>) },
  DropdownMenuSubContent: { slot: "menu-sub-content", render: openMenu(p => <DropdownMenuSub open><DropdownMenuSubTrigger>More</DropdownMenuSubTrigger><DropdownMenuSubContent {...p}><DropdownMenuItem>Deep</DropdownMenuItem></DropdownMenuSubContent></DropdownMenuSub>) },
  DropdownMenuSubTrigger: { slot: "menu-sub-trigger", render: openMenu(p => <DropdownMenuSub><DropdownMenuSubTrigger {...p}>More</DropdownMenuSubTrigger><DropdownMenuSubContent><DropdownMenuItem>Deep</DropdownMenuItem></DropdownMenuSubContent></DropdownMenuSub>) },
  DropdownMenuTrigger: { slot: "menu-trigger", render: p => <DropdownMenu><DropdownMenuTrigger {...p}>Menu</DropdownMenuTrigger></DropdownMenu> },
  EmptyState: { slot: "empty-state", axes: ["size"], render: p => <EmptyState title="Nothing yet" description="Add a site to begin." {...p} /> },
  Eyebrow: { slot: "eyebrow", render: p => <Eyebrow {...p}>Step</Eyebrow> },
  Input: { slot: "input", axes: ["size"], render: p => <Input aria-label="Area" size="md" {...p} /> },
  Kbd: { slot: "kbd", render: p => <Kbd {...p}>⌘K</Kbd> },
  Lede: { slot: "lede", render: p => <Lede {...p}>Lede</Lede> },
  MediaCard: { slot: "media-card", axes: ["orientation"], render: p => <MediaCard title="Site" description="Desc" {...p} /> },
  Modal: { slot: "modal", render: p => <Modal open {...p}><ModalContent aria-describedby={undefined}><ModalHeader title="Title" /></ModalContent></Modal> },
  ModalBody: { slot: "modal-body", render: openModal(p => <ModalBody {...p}>Body</ModalBody>) },
  ModalClose: { slot: "dialog-close", render: openModal(p => <ModalClose {...p}>Close</ModalClose>) },
  ModalContent: { slot: "modal", axes: ["size"], render: p => <Modal open><ModalContent aria-describedby={undefined} {...p}><ModalHeader title="Title" /></ModalContent></Modal> },
  ModalFooter: { slot: "modal-footer", render: openModal(p => <ModalFooter {...p}>Footer</ModalFooter>) },
  ModalHeader: { slot: "modal-header", render: openModal(p => <ModalHeader title="Second" {...p} />) },
  ModalTrigger: { slot: "dialog-trigger", render: p => <Modal><ModalTrigger {...p}>Open</ModalTrigger></Modal> },
  PanelToggleButton: { slot: "button", render: p => <PanelToggleButton open onOpenChange={() => {}} label="inspector" {...p} /> },
  Popover: { slot: "popover", render: p => <Popover open {...p}><PopoverTrigger>Open</PopoverTrigger><PopoverContent aria-label="Details">Body</PopoverContent></Popover> },
  PopoverAnchor: { slot: "popover-anchor", render: p => <Popover open><PopoverAnchor {...p}>Anchor</PopoverAnchor><PopoverTrigger>Open</PopoverTrigger><PopoverContent aria-label="Details">Body</PopoverContent></Popover> },
  PopoverClose: { slot: "popover-close", render: p => <Popover open><PopoverTrigger>Open</PopoverTrigger><PopoverContent aria-label="Details"><PopoverClose {...p}>Close</PopoverClose></PopoverContent></Popover> },
  PopoverContent: { slot: "popover", render: p => <Popover open><PopoverTrigger>Open</PopoverTrigger><PopoverContent aria-label="Details" {...p}>Body</PopoverContent></Popover> },
  PopoverTrigger: { slot: "popover-trigger", render: p => <Popover><PopoverTrigger {...p}>Open</PopoverTrigger></Popover> },
  Progress: { slot: "progress", axes: ["tone"], render: p => <Progress value={40} tone="primary" aria-label="FSI" {...p} /> },
  RadioGroup: { slot: "radio-group", render: p => <RadioGroup aria-label="Choice" defaultValue="a" {...p}><RadioGroupItem value="a" aria-label="A" /></RadioGroup> },
  RadioGroupItem: { slot: "radio", render: p => <RadioGroup aria-label="Choice" defaultValue="a"><RadioGroupItem value="a" aria-label="A" {...p} /></RadioGroup> },
  ScrollArea: { slot: "scroll-area", render: p => <ScrollArea {...p}><div>Content</div></ScrollArea> },
  SectionLabel: { slot: "section-label", render: p => <SectionLabel {...p}>Section</SectionLabel> },
  SegmentedControl: { slot: "segmented", render: p => <SegmentedControl options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} value="a" onChange={() => {}} label="View" {...p} /> },
  Separator: { slot: "separator", render: p => <Separator {...p} /> },
  Sidebar: { slot: "sidebar", render: p => <Sidebar {...p}><SidebarItem icon={<LuCircle />} label="Home" /></Sidebar> },
  SidebarGroup: { slot: "sidebar-group", render: p => <Sidebar><SidebarGroup label="Group" {...p}><SidebarItem icon={<LuCircle />} label="Home" /></SidebarGroup></Sidebar> },
  SidebarItem: { slot: "sidebar-item", render: p => <Sidebar><SidebarItem icon={<LuCircle />} label="Home" {...p} /></Sidebar> },
  Skeleton: { slot: "skeleton", render: p => <Skeleton w={80} {...p} /> },
  SkeletonText: { slot: "skeleton-text", render: p => <SkeletonText {...p} /> },
  Spinner: { slot: "spinner", axes: ["size", "tone"], render: p => <Spinner size="md" tone="primary" label="Loading" {...p} /> },
  StatusDot: { slot: "status-dot", render: p => <StatusDot tone="success" label="Pass" {...p} /> },
  Switch: { slot: "switch", render: p => <Switch aria-label="Dark" {...p} /> },
  Table: { slot: "table", render: p => <Table {...p}><Thead><Tr><Th>Name</Th></Tr></Thead><Tbody><Tr><Td>Alpha</Td></Tr></Tbody></Table> },
  Tbody: { slot: "tbody", render: p => <Table><Tbody {...p}><Tr><Td>Alpha</Td></Tr></Tbody></Table> },
  Td: { slot: "td", render: p => <Table><Tbody><Tr><Td {...p}>Alpha</Td></Tr></Tbody></Table> },
  Textarea: { slot: "textarea", render: p => <Textarea aria-label="Notes" {...p} /> },
  Th: { slot: "th", render: p => <Table><Thead><Tr><Th {...p}>Name</Th></Tr></Thead></Table> },
  Thead: { slot: "thead", render: p => <Table><Thead {...p}><Tr><Th>Name</Th></Tr></Thead></Table> },
  ToastProvider: { slot: "toast-viewport", render: p => <ToastProvider {...p}><span>App</span></ToastProvider> },
  Toolbar: { slot: "toolbar", render: p => <Toolbar aria-label="Tools" {...p}><barrel.Button>One</barrel.Button><ToolbarDivider /><ToolbarSpacer /><barrel.Button>Two</barrel.Button></Toolbar> },
  ToolbarDivider: { slot: "toolbar-divider", render: p => <Toolbar aria-label="Tools"><barrel.Button>One</barrel.Button><ToolbarDivider {...p} /></Toolbar> },
  ToolbarSpacer: { slot: "toolbar-spacer", render: p => <Toolbar aria-label="Tools"><barrel.Button>One</barrel.Button><ToolbarSpacer {...p} /></Toolbar> },
  Tooltip: { slot: "tooltip", render: p => <TooltipProvider><Tooltip label="Hint" open {...p}><barrel.Button>Hover</barrel.Button></Tooltip></TooltipProvider> },
  TooltipProvider: { slot: "tooltip", render: p => <TooltipProvider {...p}><Tooltip label="Hint" open><barrel.Button>Hover</barrel.Button></Tooltip></TooltipProvider> },
  Tr: { slot: "tr", render: p => <Table><Tbody><Tr {...p}><Td>Alpha</Td></Tr></Tbody></Table> },
};

const isComponent = (v: unknown): boolean => typeof v === "function" || (typeof v === "object" && v !== null && "$$typeof" in v);
const LEGACY = new Set(Object.keys(legacy));
const PUBLIC_COMPONENTS = Object.entries(barrel)
  .filter(([name, value]) => /^[A-Z]/.test(name) && !/^[A-Z0-9_]+$/.test(name) && isComponent(value) && !LEGACY.has(name))
  .map(([name]) => name)
  .sort();

describe("공개 컴포넌트 공통 계약(render-all)", () => {
  it("배럴의 공개 컴포넌트마다 스토리 Default 나 픽스처가 있다", () => {
    const missing = PUBLIC_COMPONENTS.filter(name => !(name in STORY_SUBJECTS) && !(name in FIXTURES));
    expect(missing, "새 컴포넌트는 stories(권장)나 FIXTURES 와 함께 온다").toEqual([]);
    const stale = [...Object.keys(STORY_SUBJECTS), ...Object.keys(FIXTURES)].filter(name => !PUBLIC_COMPONENTS.includes(name));
    expect(stale, "배럴에 없는 픽스처").toEqual([]);
  });

  it("KNOWN_CONTRACT_FAILURES 는 배럴의 컴포넌트·실제 검사 id 만 담고 알파벳순이다", () => {
    const names = Object.keys(KNOWN_CONTRACT_FAILURES);
    expect(names).toEqual([...names].sort());
    expect(names.filter(n => !PUBLIC_COMPONENTS.includes(n))).toEqual([]);
    for (const ids of Object.values(KNOWN_CONTRACT_FAILURES)) {
      expect(ids.filter(id => !CONTRACT_CHECKS.includes(id))).toEqual([]);
      expect([...ids]).toEqual([...ids].sort());
    }
  });

  it.each(PUBLIC_COMPONENTS)("%s — 실패한 검사는 KNOWN_CONTRACT_FAILURES 와 정확히 같다", async name => {
    const subject = STORY_SUBJECTS[name] ?? FIXTURES[name];
    if (!subject) return;
    const failures = await runContract(subject);
    if (process.env.CONTRACT_DUMP) console.log("CONTRACT_DUMP " + JSON.stringify({ name, failures }));
    const failedIds = [...new Set(failures.map(f => f.id))].sort();
    const known = [...(KNOWN_CONTRACT_FAILURES[name] ?? [])].sort();
    const fresh = failures.filter(f => !known.includes(f.id)).map(f => `${f.id}: ${f.reason}`);
    expect(fresh, "새 계약 위반").toEqual([]);
    const fixed = known.filter(id => !failedIds.includes(id));
    expect(fixed, "통과하게 된 검사 — KNOWN_CONTRACT_FAILURES 에서 지워라").toEqual([]);
  });
});
