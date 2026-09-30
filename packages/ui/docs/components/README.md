# 컴포넌트 문서

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다._

| 이름 | 종류 | 경계 | 부품 | 설명 |
|---|---|---|---|---|
| [Accordion](Accordion.md) | component | client | AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger |  |
| [Alert](Alert.md) | component | server ok |  |  |
| [AppShell](AppShell.md) | component | client |  | 레거시 셸 `AppShell`. |
| [BackButton](BackButton.md) | component | server ok |  | 뒤로가기의 동작은 라우터가 소유하고 모양·아이콘은 모든 페이지에서 공유한다. |
| [Badge](Badge.md) | component | server ok |  |  |
| [Breadcrumb](Breadcrumb.md) | component | client |  |  |
| [Button](Button.md) | component | client | ButtonGroup |  |
| [CanvasScale](CanvasScale.md) | component | server ok |  | SVG 도면 안과 HTML 위 오버레이에서 같은 모양을 쓰며 위치와 현재 축척은 소비자가 정한다. |
| [Card](Card.md) | component | client | CardCollapse, CardHeader, CardWell |  |
| [CardGrid](CardGrid.md) | component | client |  |  |
| [Checkbox](Checkbox.md) | component | client |  |  |
| [ConfirmDialog](ConfirmDialog.md) | component | client |  |  |
| [DataTable](DataTable.md) | component | client |  | 명세서 표 — 한 열 정렬 · 행 선택 · 합계 줄 · 줄 높이를 지키는 로딩 |
| [DescriptionList](DescriptionList.md) | component | server ok |  | 이름-값 목록(`<dl>` 격자) — 이름은 왼쪽에서 말줄임, 값은 오른쪽 정렬. |
| [DesignSystemProvider](DesignSystemProvider.md) | component | client |  | 레거시 셸·컨트롤을 DS 프리미티브로 그리게 하는 Provider `DesignSystemProvider`. |
| [DisplayHeading](DisplayHeading.md) | component | server ok |  |  |
| [Drawer](Drawer.md) | component | client | DrawerBody, DrawerClose, DrawerContent, DrawerHeader, DrawerTrigger |  |
| [DropdownMenu](DropdownMenu.md) | component | client | DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger |  |
| [EmptyState](EmptyState.md) | component | server ok |  |  |
| [Eyebrow](Eyebrow.md) | component | server ok |  |  |
| [Field](Field.md) | component | client |  | 레거시 셸 `Field`. |
| [Hud](Hud.md) | component | client | HudCell | 레거시 셸 `Hud`. |
| [Input](Input.md) | component | client |  |  |
| [Kbd](Kbd.md) | component | client |  |  |
| [KeyValue](KeyValue.md) | component | client |  | 레거시 셸 `KeyValue`. |
| [Lede](Lede.md) | component | server ok |  |  |
| [Legend](Legend.md) | component | client |  | 레거시 셸 `Legend`. |
| [MediaCard](MediaCard.md) | component | client |  |  |
| [Modal](Modal.md) | component | client | ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTrigger |  |
| [Panel](Panel.md) | component | client | PanelGroup | 레거시 셸 `Panel`. |
| [PanelToggleButton](PanelToggleButton.md) | component | client |  |  |
| [Popover](Popover.md) | component | client | PopoverAnchor, PopoverClose, PopoverContent, PopoverTrigger |  |
| [Progress](Progress.md) | component | client |  |  |
| [RadioGroup](RadioGroup.md) | component | client | RadioGroupItem |  |
| [ScrollArea](ScrollArea.md) | component | client |  |  |
| [SectionLabel](SectionLabel.md) | component | client |  |  |
| [Segmented](Segmented.md) | component | client |  | 레거시 컨트롤 `Segmented`. |
| [SegmentedControl](SegmentedControl.md) | component | client |  |  |
| [Select](Select.md) | component | client |  | 레거시 컨트롤 `Select`. |
| [Separator](Separator.md) | component | client |  |  |
| [Sidebar](Sidebar.md) | component | client | SidebarGroup, SidebarItem |  |
| [Skeleton](Skeleton.md) | component | server ok | SkeletonText |  |
| [Slider](Slider.md) | component | client |  | 레거시 컨트롤 `Slider`. |
| [Spinner](Spinner.md) | component | server ok |  |  |
| [StatusBadge](StatusBadge.md) | component | client |  | 레거시 셸 `StatusBadge`. |
| [StatusDot](StatusDot.md) | component | server ok |  |  |
| [Switch](Switch.md) | component | client |  |  |
| [Table](Table.md) | component | server ok |  | 수치 표의 뿌리 — 가로 스크롤 영역 안의 `<table>` |
| [Tabs](Tabs.md) | component | client |  | 레거시 셸 `Tabs`. |
| [Tbody](Tbody.md) | component | server ok |  | 표 본문 구역(`<tbody>`) — 행의 호버 면이 붙는 범위다. |
| [Td](Td.md) | component | server ok |  | 표 본문 칸(`<td>`) — `numeric` · `tone` 축은 `tableCellVariants` 가 소유하고 `data-tone`(해석된 값)으로 찍힌다. |
| [Textarea](Textarea.md) | component | client |  |  |
| [Th](Th.md) | component | server ok |  | 열 머리 칸(`<th>`) — mono 대문자 라벨 |
| [Thead](Thead.md) | component | server ok |  | 표 머리 구역(`<thead>`) — 옅은 면으로 본문과 가른다. |
| [ToastProvider](ToastProvider.md) | component | client |  |  |
| [Toggle](Toggle.md) | component | client |  | 레거시 컨트롤 `Toggle`. |
| [Toolbar](Toolbar.md) | component | server ok | ToolbarDivider, ToolbarSpacer |  |
| [Tooltip](Tooltip.md) | component | client | TooltipProvider |  |
| [TopBar](TopBar.md) | component | client |  | 레거시 셸 `TopBar`. |
| [Tr](Tr.md) | component | server ok |  | 표 행(`<tr>`) — 본문 안에서만 호버 면이 붙는다. |
| [usePanelLayout](usePanelLayout.md) | hook | client |  |  |
| [useSidebarCollapse](useSidebarCollapse.md) | hook | client |  |  |
| [useToast](useToast.md) | hook | client |  |  |
| [ViewerPanel](ViewerPanel.md) | component | client |  | 레거시 셸 `ViewerPanel`. |
