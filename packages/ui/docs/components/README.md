# 컴포넌트 문서

_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다._

| 이름 | 종류 | 경계 | 부품 | 설명 |
|---|---|---|---|---|
| [Accordion](Accordion.md) | component | client | AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger | 접이식 구획 묶음 — `type="single"` 은 하나만, `"multiple"` 은 여럿을 연다 |
| [Alert](Alert.md) | component | server ok |  | 인라인 경고 — 흐름 안에 남는 알림 |
| [BackButton](BackButton.md) | component | server ok |  | 뒤로가기의 동작은 라우터가 소유하고 모양·아이콘은 모든 페이지에서 공유한다. |
| [Badge](Badge.md) | component | server ok |  | 배지 — 상태를 **글자와 함께** 말한다 |
| [Breadcrumb](Breadcrumb.md) | component | client |  | 경로 — 「지금 무엇을 보고 있나」 |
| [Button](Button.md) | component | client | ButtonGroup | 버튼 — 크롬의 동작 |
| [CanvasScale](CanvasScale.md) | component | server ok |  | SVG 도면 안과 HTML 위 오버레이에서 같은 모양을 쓰며 위치와 현재 축척은 소비자가 정한다. |
| [Card](Card.md) | component | client | CardCollapse, CardHeader, CardWell | 카드 — 이 제품의 기본 구획 |
| [CardGrid](CardGrid.md) | component | client |  | 카드 격자 — `auto-fit` 으로 항목이 남는 폭을 나눠 갖는다. |
| [Checkbox](Checkbox.md) | component | client |  | 체크박스 — 여러 개를 독립적으로 켠다 |
| [ConfirmDialog](ConfirmDialog.md) | component | client |  | 확인 대화 — 되돌릴 수 없는 동작 앞에서 묻는다 |
| [DataTable](DataTable.md) | component | client |  | 명세서 표 — 한 열 정렬 · 행 선택 · 합계 줄 · 줄 높이를 지키는 로딩 |
| [DescriptionList](DescriptionList.md) | component | server ok |  | 이름-값 목록(`<dl>` 격자) — 이름은 왼쪽에서 말줄임, 값은 오른쪽 정렬. |
| [DisplayHeading](DisplayHeading.md) | component | server ok |  | 들머리 제목 — 한 패널에 하나만. |
| [Drawer](Drawer.md) | component | client | DrawerBody, DrawerClose, DrawerContent, DrawerHeader, DrawerTrigger | 서랍의 루트 — 열림 상태와 모달성(`modal={false}` 면 비모달)을 든다 |
| [DropdownMenu](DropdownMenu.md) | component | client | DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger | 메뉴의 루트 — 열림 상태(`open` · `defaultOpen` · `onOpenChange`)만 든다 |
| [EmptyState](EmptyState.md) | component | server ok |  | 빈 상태 — 비어 있다는 사실보다 채우는 방법을 말한다. |
| [Eyebrow](Eyebrow.md) | component | server ok |  | 들머리 눈썹 — 대문자 mono 한 줄 |
| [Field](Field.md) | component | client | FieldControl, FieldDescription, FieldError, FieldLabel | 필드의 루트 — 라벨 · 컨트롤 · 설명 · 오류가 쓸 id 를 만들어 나눠 준다 |
| [Input](Input.md) | component | client |  | 입력 — 글자와 수치 |
| [Kbd](Kbd.md) | component | client |  | 단축키 표기 — `⌘K` 같은 키 이름을 mono 칩으로. |
| [Lede](Lede.md) | component | server ok |  | 들머리 아래 한 문단 — 읽히도록 폭을 제한한다. |
| [MediaCard](MediaCard.md) | component | client |  | 내용 카드 — 고를 수 있는 후보 한 개(썸네일 · 제목 · 메타 · 조치) |
| [Modal](Modal.md) | component | client | ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTrigger | 모달의 루트 — 열림 상태(`open` · `defaultOpen` · `onOpenChange`)와 모달성만 든다 |
| [PanelToggleButton](PanelToggleButton.md) | component | client |  | 패널 여닫기 아이콘 버튼 — 열려 있으면 «접기», 닫혀 있으면 «보이기» 아이콘과 이름을 단다. |
| [Popover](Popover.md) | component | client | PopoverAnchor, PopoverClose, PopoverContent, PopoverTrigger | 팝오버의 루트 — 열림 상태(`open` · `defaultOpen` · `onOpenChange`)만 든다 |
| [Progress](Progress.md) | component | client |  | 진행 막대 — 값이 있을 때만 쓴다 |
| [RadioGroup](RadioGroup.md) | component | client | RadioGroupItem | 라디오 묶음 — 여럿 중 하나를 고른다 |
| [ScrollArea](ScrollArea.md) | component | client |  | 스크롤 영역 — 스크롤하거나 막대를 끄는 동안만 얇은 스크롤바가 보인다. |
| [SectionLabel](SectionLabel.md) | component | client |  | 미세 라벨 — 구획의 이름(대문자 mono). |
| [SegmentedControl](SegmentedControl.md) | component | client |  | 배타적 뷰 전환 — 트랙 위의 흰 pill 이 지금 고른 값이다(radiogroup · roving tabindex). |
| [Select](Select.md) | component | client | SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue | 선택의 루트 — 값(`value` · `defaultValue` · `onValueChange`)과 열림(`open` · `onOpenChange`)을 든다 |
| [Separator](Separator.md) | component | client |  | 구분선 — 크롬의 헤어라인 |
| [Sidebar](Sidebar.md) | component | client | SidebarGroup, SidebarItem | 사이드바 — 접힌 rail(아이콘)과 펼친 panel(아이콘 + 라벨) 두 모습을 갖는 내비게이션 랜드마크. |
| [Skeleton](Skeleton.md) | component | server ok | SkeletonText | 스켈레톤 바 — 곧 올 내용과 같은 높이의 자리 |
| [Spinner](Spinner.md) | component | server ok |  | 스피너 — «돌고 있다» 만 말한다 |
| [StatusDot](StatusDot.md) | component | server ok |  | 상태 점 — 글자를 넣을 수 없는 좁은 자리에서만 |
| [Switch](Switch.md) | component | client |  | 스위치 — **즉시 적용되는** 켬/끔 |
| [Table](Table.md) | component | server ok |  | 수치 표의 뿌리 — 가로 스크롤 영역 안의 `<table>` |
| [Tabs](Tabs.md) | component | client | TabsContent, TabsList, TabsTrigger | 탭의 루트 — 값(`value` · `defaultValue` · `onValueChange`)과 방향(`orientation`) · 활성화 방식(`activationMode`)을 든다. |
| [Tbody](Tbody.md) | component | server ok |  | 표 본문 구역(`<tbody>`) — 행의 호버 면이 붙는 범위다. |
| [Td](Td.md) | component | server ok |  | 표 본문 칸(`<td>`) — `numeric` · `tone` 축은 `tableCellVariants` 가 소유하고 `data-tone`(해석된 값)으로 찍힌다. |
| [Textarea](Textarea.md) | component | client |  | 여러 줄 입력 — Input 의 `md` 모양에 높이만 풀었다(세로 크기 조절). |
| [Th](Th.md) | component | server ok |  | 열 머리 칸(`<th>`) — mono 대문자 라벨 |
| [Thead](Thead.md) | component | server ok |  | 표 머리 구역(`<thead>`) — 옅은 면으로 본문과 가른다. |
| [ToastProvider](ToastProvider.md) | component | client |  | 토스트 큐와 뷰포트 — 앱 루트에 한 번 둔다 |
| [Toolbar](Toolbar.md) | component | server ok | ToolbarDivider, ToolbarSpacer | 툴바 — 캔버스 위 또는 그 바로 위의 한 줄 |
| [Tooltip](Tooltip.md) | component | client | TooltipProvider | 툴팁 — 트리거(`children`) 위에 말풍선(`label`)을 띄운다 |
| [Tr](Tr.md) | component | server ok |  | 표 행(`<tr>`) — 본문 안에서만 호버 면이 붙는다. |
| [usePanelLayout](usePanelLayout.md) | hook | client |  | 여러 패널의 접힘 상태를 한 곳에서 든다 |
| [useSidebarCollapse](useSidebarCollapse.md) | hook | client |  | 접기/펴기 상태를 쓰는 쪽에서 들고 있기 위한 훅 |
| [useToast](useToast.md) | hook | client |  | 가장 가까운 `ToastProvider` 의 큐 — 밖에서 부르면 던진다. |
