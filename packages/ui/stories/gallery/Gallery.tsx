import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
  Alert,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Card,
  CardCollapse,
  CardGrid,
  CardHeader,
  CardWell,
  Checkbox,
  ConfirmDialog,
  DataTable,
  DescriptionList,
  DisplayHeading,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  Eyebrow,
  Input,
  Kbd,
  Lede,
  MediaCard,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadioGroup,
  RadioGroupItem,
  SectionLabel,
  ScrollArea,
  SegmentedControl,
  Separator,
  Sidebar,
  SidebarGroup,
  SidebarItem,
  Skeleton,
  SkeletonText,
  Spinner,
  StatusDot,
  Switch,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  ToastProvider,
  Tooltip,
  TooltipProvider,
  Tr,
  usePanelLayout,
  useToast,
} from "../../src";

/* 디자인 시스템 갤러리 (#1198) — `apps/ds-gallery/src/main.tsx` 를 통째 옮긴 것(계획 §2.5-e, #6).
 * 화면 내용·문자열은 그대로다. 달라진 것은 셋뿐: 진입점(createRoot)·CSS import 가 빠지고 Storybook preview 가 맡는다,
 * `document.documentElement` 를 직접 만지던 다크 토글이 addon-themes 툴바 전역으로 대체됐다(그래서 맥락 줄의 Dark 버튼이 없다),
 * 작업대 패널 접힘의 `storageKey` 를 뺐다 — 스토리는 결정론적이어야 VRT 기준선이 성립하고, 브라우저에 남은 상태가 스크린샷을 바꾸면 안 된다.
 * Phase D 에서 아래 `<Spec>` 17개를 컴포넌트별 stories 로 나누고 나면 `Pages/Gallery` 는 지운다(`Pages/Workbench` 는 영구).
 *
 * 맨 위는 **제품 화면의 복제**다 — 토큰과 컴포넌트가 실제 배치에서 어떻게 서는지가
 * 컴포넌트 목록보다 먼저 보여야 한다. 그 아래가 개별 컴포넌트 명세다.
 *
 * 구조는 참고 화면(Office Studio)에서 왔다: 옅은 바닥 위에 카드가 떠 있고, 왼쪽에 64px 레일,
 * 상단에 두 줄(제품 줄 · 맥락 줄), 아래에 상태 줄. 캔버스는 카드 안의 «웰» 에 흰 시트로 앉는다. */

const ICON = {
  site: "M2 13 8 2l6 11z",
  plan: "M2.5 2.5h11v11h-11zM2.5 6.5h11M6.5 6.5v7",
  tower: "M3 2.5h4.5v11H3zM8.5 6h4.5v7.5H8.5z",
  park: "M6.5 11.5V4.5h2.4a2.1 2.1 0 010 4.2H6.5",
  rules: "M8 2v12M4 5l4-3 4 3M3 10h10",
  out: "M8 10V2M5 5l3-3 3 3M2.5 10v3h11v-3",
} as const;

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

/* ── 도면 — 캔버스 어휘만 쓴다. 다크에서도 이 면은 바뀌지 않는다. ──────────── */
function SitePlan() {
  return (
    <svg viewBox="0 0 520 300" className="absolute inset-0 size-full" aria-label="Site plan">
      <g stroke="var(--canvas-grid)" strokeWidth={0.7}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
          <line key={`v${i}`} x1={i * 52} y1={0} x2={i * 52} y2={300} />
        ))}
        {[1, 2, 3, 4, 5].map(i => (
          <line key={`h${i}`} x1={0} y1={i * 50} x2={520} y2={i * 50} />
        ))}
      </g>
      <polygon points="58,40 452,30 466,258 72,270" fill="var(--canvas-bg)" stroke="var(--canvas-ink-2)" strokeWidth={1.4} />
      <polygon points="86,64 424,55 436,232 100,243" fill="none" stroke="var(--canvas-muted)" strokeWidth={1} strokeDasharray="6 4" />
      <rect x="104" y="82" width="312" height="132" fill="var(--canvas-muted)" opacity={0.12} stroke="var(--canvas-muted)" strokeWidth={0.8} />
      <rect x="126" y="98" width="84" height="100" fill="var(--canvas-ink-2)" opacity={0.7} />
      <rect x="266" y="92" width="84" height="100" fill="var(--chrome-selection-fill)" stroke="var(--chrome-selection-stroke)" strokeWidth={1.8} />
      <g stroke="var(--canvas-ink-2)" strokeWidth={0.9}>
        <line x1="210" y1="214" x2="266" y2="214" />
        <line x1="210" y1="206" x2="210" y2="222" />
        <line x1="266" y1="206" x2="266" y2="222" />
      </g>
      <text x="216" y="234" fontFamily="var(--mono)" fontSize={11} fill="var(--canvas-ink-2)">12.4 m</text>
      <text x="134" y="116" fontFamily="var(--mono)" fontSize={12} fill="var(--canvas-ink)">A</text>
      <text x="274" y="110" fontFamily="var(--mono)" fontSize={12} fill="var(--canvas-ink)">B</text>
    </svg>
  );
}


/* 카드 썸네일 — 후보마다 다른 배치가 보여야 카드가 «고르는 것» 으로 읽힌다. */
function PlanThumb({ seed }: { seed: number }) {
  const towers = [
    [[22, 30, 26, 44], [56, 26, 26, 44]],
    [[20, 24, 22, 52], [46, 34, 22, 40], [72, 24, 18, 52]],
    [[26, 28, 48, 20], [26, 54, 48, 22]],
  ][seed % 3]!;
  return (
    <svg viewBox="0 0 110 74" className="absolute inset-0 size-full bg-canvas" aria-hidden="true">
      <polygon points="8,8 102,5 105,69 11,72" fill="var(--canvas-surface)" stroke="var(--canvas-ink-2)" strokeWidth={1} />
      <polygon points="15,15 95,12 98,62 18,65" fill="none" stroke="var(--canvas-muted)" strokeWidth={0.7} strokeDasharray="3 2.5" />
      {towers.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill="var(--canvas-ink-2)" opacity={0.72} />
      ))}
    </svg>
  );
}

interface TowerRow {
  tower: string;
  storeys: number;
  units: number;
  builtUp: number;
  parking: number;
  verdict: "pass" | "tbv" | "fail";
}

const TOWER_ROWS: readonly TowerRow[] = [
  { tower: "A", storeys: 21, units: 84, builtUp: 18204, parking: 96, verdict: "pass" },
  { tower: "B", storeys: 21, units: 84, builtUp: 18914, parking: 88, verdict: "tbv" },
  { tower: "Podium", storeys: 2, units: 0, builtUp: 4860, parking: 34, verdict: "fail" },
  { tower: "Basement", storeys: 2, units: 0, builtUp: 0, parking: 48, verdict: "pass" },
];

const num = (n: number) => n.toLocaleString("en-US");

/* 훅에 넘기는 id 배열은 **모듈 상수**여야 한다. 렌더마다 새 배열을 만들면 내부 useMemo 가
   매번 무효화되어 접힘 상태가 튄다. */
const PANELS = ["brief", "plan", "model", "inspect"] as const;
/* 「Focus canvas」 가 접는 것은 **곁 패널**이다 — 캔버스까지 접으면 이름과 하는 일이 달라진다. */
const SIDE_PANELS = ["brief", "inspect"] as const;
/* 명세 절에서 쓰는 «세로로 쌓인» 칸들. 저장하지 않는다 — 데모다. */
const STACK_PANELS = ["ledger", "notes"] as const;

/* 3D 매싱 — 축측도. 도면과 같은 캔버스 어휘를 쓴다(흰 바탕·무채색). */
function MassingView() {
  const box = (x: number, y: number, w: number, h: number, d: number) => {
    const k = 0.42;
    const top = `${x},${y} ${x + w},${y} ${x + w + d * k},${y - d * k} ${x + d * k},${y - d * k}`;
    const front = `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`;
    const sideFace = `${x + w},${y} ${x + w + d * k},${y - d * k} ${x + w + d * k},${y + h - d * k} ${x + w},${y + h}`;
    return { top, front, side: sideFace };
  };
  const towers = [box(96, 132, 58, 96, 54), box(206, 118, 58, 110, 54)];
  const podium = box(70, 228, 228, 26, 78);
  return (
    <svg viewBox="0 0 420 300" className="absolute inset-0 size-full" aria-label="Massing view">
      <g stroke="var(--canvas-line)" strokeWidth={0.7}>
        {[0, 1, 2, 3, 4].map(i => (
          <line key={i} x1={40 + i * 24} y1={276} x2={130 + i * 24} y2={238} />
        ))}
      </g>
      {[podium, ...towers].map((b, i) => (
        <g key={i}>
          <polygon points={b.front} fill="var(--canvas-ink-2)" opacity={i === 0 ? 0.24 : 0.58} stroke="var(--canvas-ink-2)" strokeWidth={0.8} />
          <polygon points={b.side} fill="var(--canvas-ink-2)" opacity={i === 0 ? 0.34 : 0.78} stroke="var(--canvas-ink-2)" strokeWidth={0.8} />
          <polygon points={b.top} fill="var(--canvas-surface)" stroke="var(--canvas-ink-2)" strokeWidth={0.8} />
        </g>
      ))}
      <text x="112" y="176" fontFamily="var(--mono)" fontSize={11} fill="var(--canvas-bg)">A</text>
      <text x="222" y="164" fontFamily="var(--mono)" fontSize={11} fill="var(--canvas-bg)">B</text>
    </svg>
  );
}

/* ── 제품 화면 복제 ────────────────────────────────────────────────────────── */
export function Workbench() {
  const [view, setView] = useState<"plan" | "model">("plan");
  const [deck, setDeck] = useState(true);
  /* 제품에서는 접힘 상태를 localStorage 에 남기지만(`storageKey`), 스토리에서는 뺀다 — 머리 주석 참조. */
  const panels = usePanelLayout(PANELS);

  return (
    <div className="flex h-[640px] min-h-0 flex-col bg-background">
      {/* 제품 줄 */}
      <header className="flex shrink-0 items-center gap-3 px-4 pt-3">
        <div className="grid size-7 place-items-center rounded-[7px] bg-primary font-mono text-micro font-medium text-primary-foreground">
          BO
        </div>
        <span className="text-title font-semibold tracking-[-0.01em] text-foreground">Residential Studio</span>
        <span className="font-mono text-micro uppercase tracking-caps text-muted-foreground">BuildOS / India</span>
        <span className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm">Regulation lab ↗</Button>
          <Button size="sm">Open</Button>
          <Button size="sm" variant="solid" tone="primary">Save scheme ↓</Button>
        </span>
      </header>

      {/* 맥락 줄 */}
      <div className="flex shrink-0 items-center gap-3 px-4 py-2.5">
        <span className="truncate text-label text-muted-foreground">
          Dahisar · 4,812 m² plot · FSI 3.33 · 2 towers · 168 units
        </span>
        <span className="ml-auto flex items-center gap-2">
          <SegmentedControl
            label="View mode"
            size="sm"
            value={view}
            onChange={setView}
            options={[
              { value: "plan", label: "2D plan" },
              { value: "model", label: "3D model" },
            ]}
          />
          <Separator orientation="vertical" className="h-4" />
          {panels.anyCollapsed ? (
            <Button variant="ghost" size="sm" onClick={panels.expandAll}>Expand all</Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => SIDE_PANELS.forEach(id => panels.setCollapsed(id, true))}
            >
              Focus canvas
            </Button>
          )}
        </span>
      </div>

      {/* 본문 — 레일 + 떠 있는 카드 셋 */}
      <div className="flex min-h-0 flex-1 gap-shell px-4 pb-3">
        <Sidebar collapsed className="w-rail shrink-0 rounded-lg bg-transparent p-1.5">
          <SidebarItem icon={<Icon d={ICON.site} />} label="Site" shortcut="1" />
          <SidebarItem icon={<Icon d={ICON.plan} />} label="Plan" shortcut="2" active />
          <SidebarItem icon={<Icon d={ICON.tower} />} label="Towers" shortcut="3" />
          <SidebarGroup label="Checks">
            <SidebarItem icon={<Icon d={ICON.park} />} label="Parking" shortcut="4" />
            <SidebarItem icon={<Icon d={ICON.rules} />} label="Regulations" shortcut="5" />
          </SidebarGroup>
          <div className="mt-auto">
            <SidebarItem icon={<Icon d={ICON.out} />} label="Export" shortcut="⌘E" />
          </div>
        </Sidebar>

        {/* 브리프 — 읽는 줄이 있는 패널. 이 제품이 «설정 화면» 이 아니라는 것을 여기서 말한다. */}
        <Card
          className="w-[290px] shrink-0 overflow-y-auto overscroll-contain"
          collapsed={panels.isCollapsed("brief")}
          onCollapsedChange={v => panels.setCollapsed("brief", v)}
          collapseTo="strip"
          collapsedLabel="Planning brief"
          collapsedSignal={<StatusDot tone="warning" label="3 to be verified" />}
          side="left"
        >
          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-2">
                <Eyebrow step="01" className="flex-1">Planning brief</Eyebrow>
                <CardCollapse />
              </div>
              <DisplayHeading>Make the plot work.</DisplayHeading>
              <Lede>
                Set the programme, the deal model and the tower count. Every candidate is judged
                against the same jurisdiction pack.
              </Lede>
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              <SectionLabel>Programme</SectionLabel>
              <label className="flex items-center justify-between gap-3 text-body text-foreground-2">
                Storeys
                <Input numeric defaultValue="21" suffix="fl" className="w-[92px]" />
              </label>
              <label className="flex items-center justify-between gap-3 text-body text-foreground-2">
                Carpet target
                <Input numeric defaultValue="38,420" suffix="m²" className="w-[118px]" />
              </label>
              <label className="flex items-center justify-between gap-3 text-body text-foreground-2">
                Podium deck
                <Switch checked={deck} onCheckedChange={setDeck} />
              </label>
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              <SectionLabel>FSI ledger</SectionLabel>
              <DescriptionList
                rows={[
                  { k: "Permitted", v: "38,420 m²", numeric: true },
                  { k: "Consumed", v: "37,118 m²", numeric: true },
                  { k: "Balance", v: "1,302 m²", numeric: true, provisional: true },
                ]}
              />
              <div className="flex flex-wrap gap-1.5">
                <Badge tone="success" dot>FSI-01 pass</Badge>
                <Badge tone="warning" dot>3 TBV</Badge>
              </div>
            </div>

            <Button variant="solid" tone="primary" size="lg" className="w-full">
              Generate schemes →
            </Button>
            <Button size="lg" className="w-full">Compare schemes</Button>
            <p className="text-label leading-relaxed text-muted-foreground">
              Generate returns one checked scheme. Compare explores alternatives and takes longer.
            </p>
          </div>
        </Card>

        {/* 2D — 캔버스가 «웰» 안의 흰 시트로 앉는다 */}
        <Card
          className="min-w-0 flex-1"
          collapsed={panels.isCollapsed("plan")}
          onCollapsedChange={v => panels.setCollapsed("plan", v)}
          collapseTo="strip"
          collapsedLabel="2D plan"
          side="left"
        >
          <CardHeader title="2D Plan" meta="88.0 × 54.0 m" />
          <CardWell className="grid place-items-center p-6">
            <div className="relative aspect-[26/15] w-full max-w-[560px] border border-canvas-line bg-canvas shadow-chip">
              <SitePlan />
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <div className="on-canvas flex items-center gap-1 rounded-lg border border-border p-1 shadow-pop">
                <Tooltip label="Zoom to fit" shortcut="⇧2">
                  <Button size="icon-sm" variant="ghost" aria-label="Zoom to fit"><Icon d={ICON.plan} /></Button>
                </Tooltip>
                <Separator orientation="vertical" className="mx-0.5 h-4" />
                <span className="tnum px-2 text-label text-muted-foreground">1 : 500</span>
                <Separator orientation="vertical" className="mx-0.5 h-4" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="sm" variant="ghost">Legend</Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="end" className="w-auto">
                    <SectionLabel className="mb-2.5">Categories</SectionLabel>
                    <ul className="flex flex-col gap-2 text-body text-foreground-2">
                      {[["Tower", "var(--canvas-ink-2)"], ["Podium", "var(--canvas-muted)"], ["Setback", "var(--canvas-muted)"]].map(([l, c]) => (
                        <li key={l} className="flex items-center gap-2">
                          <i className="size-2.5 shrink-0 border border-canvas-line" style={{ background: c }} />
                          {l}
                        </li>
                      ))}
                    </ul>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardWell>
        </Card>

        {/* 3D — 뷰 둘이 나란히 서므로 하나를 접으면 다른 하나가 그 폭을 가져간다.
            접기의 이득이 실제로 보이는 자리다. */}
        <Card
          className="min-w-0 flex-1"
          collapsed={panels.isCollapsed("model")}
          onCollapsedChange={v => panels.setCollapsed("model", v)}
          collapseTo="strip"
          collapsedLabel="3D model"
          side="right"
        >
          <CardHeader title="3D Model" meta="B+2P+21" />
          <CardWell className="grid place-items-center p-6">
            <div className="relative aspect-[7/5] w-full max-w-[420px] border border-canvas-line bg-canvas shadow-chip">
              <MassingView />
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <div className="on-canvas flex items-center gap-1 rounded-lg border border-border p-1 shadow-pop">
                <Button size="sm" variant="ghost">Orbit</Button>
                <Separator orientation="vertical" className="mx-0.5 h-4" />
                <Button size="sm" variant="ghost">Cutaway</Button>
              </div>
            </div>
          </CardWell>
        </Card>

        {/* 검사 — 수치와 판정 */}
        <Card
          className="w-[250px] shrink-0 overflow-y-auto overscroll-contain"
          collapsed={panels.isCollapsed("inspect")}
          onCollapsedChange={v => panels.setCollapsed("inspect", v)}
          collapseTo="strip"
          collapsedLabel="Inspect"
          collapsedSignal={<StatusDot tone="destructive" label="PK-04 fail" />}
          side="right"
        >
          <CardHeader title="Inspect" meta="Tower B" />
          <div className="flex flex-col gap-4 px-4 pb-4">
            <div className="rounded-md border border-success/30 bg-success-soft px-3 py-2 text-label text-foreground-2">
              <b className="text-foreground">Scheme COMPLETE</b> · 0 rules unmet
              <div className="mt-1 tnum text-muted-foreground">95.2 / 100 · 168 units · access checked</div>
            </div>
            <div className="flex flex-col gap-2.5">
              <SectionLabel>Tower B</SectionLabel>
              <DescriptionList
                rows={[
                  { k: "Storeys", v: "21", numeric: true },
                  { k: "Units", v: "84", numeric: true },
                  { k: "Built-up", v: "18,914 m²", numeric: true },
                  { k: "Spacing", v: "12.4 m", numeric: true },
                ]}
              />
            </div>
            <div className="flex flex-col gap-2">
              <SectionLabel>Parking</SectionLabel>
              <Progress value={82} />
              <div className="flex items-center justify-between text-label">
                <span className="text-muted-foreground">218 of 266 bays</span>
                <span className="tnum font-medium text-destructive">−48</span>
              </div>
              <Badge tone="destructive" dot>PK-04 fail</Badge>
            </div>
          </div>
        </Card>
      </div>

      <footer className="flex shrink-0 items-center gap-3 border-t border-border bg-secondary px-4 py-1.5 text-micro text-muted-foreground">
        <span>Pack in-mh-mumbai · DCPR 2034</span>
        <span className="ml-auto">Targets met · Planning draft</span>
      </footer>
    </div>
  );
}

/* ── 컴포넌트 명세 ────────────────────────────────────────────────────────── */
function Spec({ name, note, children }: { name: string; note: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-border px-6 py-6">
      <div className="flex flex-wrap items-baseline gap-3">
        <h3 className="text-title font-semibold text-foreground">{name}</h3>
        <p className="min-w-0 flex-1 text-body text-muted-foreground">{note}</p>
      </div>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </section>
  );
}

function ToastRow() {
  const { toast } = useToast();
  return (
    <>
      <Button onClick={() => toast({ tone: "success", title: "Scheme generated", description: "2 towers · 168 units · balance 1,302 m²" })}>Success</Button>
      <Button onClick={() => toast({ tone: "warning", title: "Candidate 4 needs review", description: "Parking short by 48 bays — PK-04 fail", action: { label: "Inspect", altText: "Inspect candidate 4", onSelect: () => {} } })}>With action</Button>
      <Button onClick={() => toast({ tone: "destructive", title: "Export failed", description: "The jurisdiction pack has 3 unresolved placeholders.", duration: 0 })}>Sticky failure</Button>
      <Button variant="ghost" onClick={() => { for (let i = 1; i <= 5; i++) toast({ title: `Queued job ${i}` }); }}>Overflow the queue</Button>
    </>
  );
}

export function Gallery() {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [checked, setChecked] = useState(true);
  const [regime, setRegime] = useState("fsi");
  const [picked, setPicked] = useState<string | undefined>("B");
  const stack = usePanelLayout(STACK_PANELS, { initial: { notes: true } });

  return (
    <div className="min-h-dvh bg-background font-sans text-body text-foreground">
      <Workbench />

      <div className="mx-auto max-w-[1180px] px-4 pb-16">
        <Card className="mt-6">
          <div className="flex flex-col gap-2 px-6 pb-2 pt-6">
            <Eyebrow step="02">Component reference</Eyebrow>
            <DisplayHeading as="h2">Every piece, one surface.</DisplayHeading>
            <Lede className="max-w-[56ch]">
              The screen above is built from exactly these. Toggle Dark in the context row — the
              chrome inverts and the drawing stays white, because print and colour-blind safety
              live on that surface.
            </Lede>
          </div>

          <Spec name="Button" note="variant × tone × size. asChild renders any element with the button's clothes.">
            <Button variant="solid" tone="primary">Generate</Button>
            <Button>Reload</Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="solid" tone="destructive">Delete parcel</Button>
            <Button tone="destructive">Clear</Button>
            <Button loading>Solving</Button>
            <Button disabled>Unavailable</Button>
            <Button variant="link" tone="primary" asChild><a href="#ref">As a link</a></Button>
            <ButtonGroup>
              <Button size="sm">Plan</Button>
              <Button size="sm">Model</Button>
              <Button size="sm">Split</Button>
            </ButtonGroup>
          </Spec>

          <Spec name="Input" note="Numeric fields carry mono + tabular-nums so digits never shift under a slider.">
            <Input placeholder="Scheme name" className="w-[190px]" />
            <Input numeric defaultValue="21" suffix="fl" className="w-[110px]" />
            <Input numeric defaultValue="38,420" suffix="m²" className="w-[140px]" />
            <Input invalid numeric defaultValue="-48" suffix="bays" className="w-[140px]" />
            <Input disabled placeholder="Locked" className="w-[140px]" />
          </Spec>

          <Spec name="Choice" note="Checkbox is independent, radio is one-of, switch applies immediately.">
            <label className="flex items-center gap-2 text-body"><Checkbox checked={checked} onCheckedChange={v => setChecked(v === true)} />Keep reservations</label>
            <RadioGroup value={regime} onValueChange={setRegime} className="flex gap-4">
              <label className="flex items-center gap-2 text-body"><RadioGroupItem value="fsi" /> FSI regime</label>
              <label className="flex items-center gap-2 text-body"><RadioGroupItem value="setback" /> Setback regime</label>
            </RadioGroup>
            <label className="flex items-center gap-2 text-body"><Switch defaultChecked />Podium deck</label>
          </Spec>

          <Spec name="ScrollArea" note="6px overlay scrollbars reserve no space. Scroll to reveal; after 500ms at rest, they fade out over 200ms.">
            <ScrollArea className="h-[160px] w-full max-w-[400px] rounded-md border border-border" viewportProps={{ "aria-label": "Scroll area example", tabIndex: 0 }}>
              <div className="min-w-[540px] divide-y divide-border">
                {Array.from({ length: 12 }, (_, index) => (
                  <div key={index} className="flex justify-between gap-8 px-4 py-3">
                    <span>Floor {index + 1}</span>
                    <span className="text-muted-foreground">Residential · 4 homes · 320 m²</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Spec>

          <Spec name="Badge" note="State is never colour alone — a badge always carries its word. Dashed means to-be-verified.">
            <Badge>Draft</Badge>
            <Badge tone="success" dot>FSI-01 pass</Badge>
            <Badge tone="warning" dot>3 unresolved</Badge>
            <Badge tone="destructive" dot>PK-04 fail</Badge>
            <Badge tone="primary" provisional>TBV</Badge>
            <span className="flex items-center gap-2 text-body text-muted-foreground"><StatusDot tone="destructive" label="Failing" /> StatusDot needs a name</span>
            <Kbd>⌘K</Kbd>
          </Spec>

          <Spec name="Loading" note="Spinner says running; progress says how far; skeleton holds the exact height the value will take.">
            <Spinner />
            <Spinner size="lg" tone="primary" label="Solving" />
            <div className="w-[190px]"><Progress value={68} /></div>
            <div className="w-[190px]"><Progress value={104} tone="destructive" /></div>
            <div className="w-[190px]"><Progress value={null} /></div>
            <Button onClick={() => { setLoading(true); window.setTimeout(() => setLoading(false), 2400); }}>Toggle skeleton</Button>
            <Card elevation="flat" pad="md" className="w-[240px]">
              {loading ? <SkeletonText lines={3} /> : (
                <DescriptionList rows={[
                  { k: "Permitted", v: "38,420 m²", numeric: true },
                  { k: "Consumed", v: "37,118 m²", numeric: true },
                  { k: "Balance", v: "1,302 m²", numeric: true, provisional: true },
                ]} />
              )}
            </Card>
            {loading ? <Skeleton shape="circle" h={28} /> : <StatusDot tone="success" label="Ready" />}
          </Spec>

          <Spec name="Toast" note="One queue, auto-dismiss, a live region, and a cap that closes the oldest.">
            <ToastRow />
          </Spec>

          <Spec name="Alert" note="Stays in the flow. An icon rides along so the meaning survives greyscale.">
            <div className="flex w-full flex-col gap-3">
              <Alert tone="info" title="Placeholder values in this pack">11 figures are marked TBV. The balance below is not a determination.</Alert>
              <Alert tone="warning" title="Height limit reached" action={<Button size="sm">Show rule</Button>}>Full-storey height is 65.8 m against a 65 m limit — ALL-HT-04.</Alert>
              <Alert tone="destructive" title="Parking short by 48 bays">PK-04 fails. Increase basement levels or reduce the unit count.</Alert>
            </div>
          </Spec>

          <Spec name="Overlay" note="One backdrop replaces five hand-rolled families. Focus trap, scroll lock and portal come with it.">
            <Modal>
              <ModalTrigger asChild><Button>Open modal</Button></ModalTrigger>
              <ModalContent size="md">
                <ModalHeader title="Apply scheme 03" description="Two towers · 21 storeys · a podium deck replaces the current layout." />
                <ModalBody>
                  <div className="flex flex-col gap-4">
                    <label className="flex items-center justify-between gap-4 text-body">Keep existing reservations<Switch defaultChecked /></label>
                    <label className="flex items-center justify-between gap-4 text-body">Revision label<Input defaultValue="r-03" className="w-[130px]" /></label>
                    <Alert tone="warning" title="This replaces the saved layout" />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost">Cancel</Button>
                  <Button variant="solid" tone="primary">Apply scheme</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            <Button tone="destructive" onClick={() => setConfirm(true)}>Confirm dialog</Button>
            <Button onClick={() => setDrawer(true)}>Drawer</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button>Menu</Button></DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Scheme</DropdownMenuLabel>
                <DropdownMenuItem shortcut="⌘D">Duplicate</DropdownMenuItem>
                <DropdownMenuItem shortcut="⌘E">Export RVT</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem tone="destructive" shortcut="⌫">Delete scheme</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Tooltip label="Tooltips flip the surface — dark on light" shortcut="?">
              <Button variant="ghost">Hover me</Button>
            </Tooltip>
          </Spec>

          <Spec name="DataTable" note="These tables are schedules. The total row is first-class, numeric cells are right-aligned mono, and only one column sorts at a time.">
            <Card elevation="flat" className="w-full overflow-hidden">
              <DataTable
                caption="Tower schedule"
                className="max-h-[180px]"
                rows={TOWER_ROWS}
                rowKey={r => r.tower}
                selectedKey={picked}
                onSelect={key => setPicked(key)}
                stickyHeader
                columns={[
                  { key: "tower", header: "Tower", sortValue: r => r.tower, total: "Total" },
                  { key: "storeys", header: "Storeys", numeric: true, sortValue: r => r.storeys, cell: r => r.storeys || "—" },
                  { key: "units", header: "Units", numeric: true, sortValue: r => r.units, cell: r => r.units || "—", total: num(168) },
                  { key: "builtUp", header: "Built-up", numeric: true, sortValue: r => r.builtUp, cell: r => `${num(r.builtUp)} m²`, total: `${num(41978)} m²` },
                  { key: "parking", header: "Bays", numeric: true, sortValue: r => r.parking, total: num(266) },
                  {
                    key: "verdict",
                    header: "Verdict",
                    cell: r =>
                      r.verdict === "pass" ? <Badge tone="success" dot>pass</Badge>
                      : r.verdict === "tbv" ? <Badge tone="warning" dot>2 TBV</Badge>
                      : <Badge tone="destructive" dot>PK-04</Badge>,
                  },
                ]}
              />
            </Card>
            <p className="w-full text-label text-muted-foreground">
              Click a header to sort; a third click clears it so the original order (floor order, tower order)
              is always reachable. Click a row to select — it drives the canvas selection.
            </p>
            <Card elevation="flat" className="w-full overflow-hidden">
              <DataTable
                caption="Tower schedule, loading"
                captionVisible
                loading
                loadingRows={3}
                rows={[] as readonly TowerRow[]}
                rowKey={r => r.tower}
                columns={[
                  { key: "tower", header: "Tower" },
                  { key: "storeys", header: "Storeys", numeric: true },
                  { key: "builtUp", header: "Built-up", numeric: true },
                  { key: "verdict", header: "Verdict" },
                ]}
              />
            </Card>
          </Spec>

          <Spec name="Table (primitive)" note="For hand-assembled tables. Radius stays 0 — a table is canvas vocabulary.">
            <Card elevation="flat" className="w-full overflow-hidden">
              <Table>
                <Thead><Tr><Th>Tower</Th><Th numeric>Storeys</Th><Th numeric>Units</Th><Th numeric>Built-up</Th><Th>Verdict</Th></Tr></Thead>
                <Tbody>
                  <Tr><Td>A</Td><Td numeric>21</Td><Td numeric>84</Td><Td numeric>18,204</Td><Td><Badge tone="success" dot>pass</Badge></Td></Tr>
                  <Tr selected><Td>B</Td><Td numeric>21</Td><Td numeric>84</Td><Td numeric>18,914</Td><Td><Badge tone="warning" dot>2 TBV</Badge></Td></Tr>
                  <Tr><Td>Podium</Td><Td numeric>2</Td><Td numeric>—</Td><Td numeric tone="destructive">−48</Td><Td><Badge tone="destructive" dot>PK-04</Badge></Td></Tr>
                </Tbody>
              </Table>
            </Card>
          </Spec>

          <Spec name="MediaCard — vertical" note="Thumbnail on top, for picking between several. Selection changes colour, not border width — width would shift the whole grid by a pixel.">
            <CardGrid min="212px" className="w-full">
              {[0, 1, 2].map(i => (
                <MediaCard
                  key={i}
                  media={<PlanThumb seed={i} />}
                  mediaOverlay={<Badge tone={i === 1 ? "warning" : "success"} dot>{i === 1 ? "2 TBV" : "pass"}</Badge>}
                  eyebrow={`Candidate 0${i + 1}`}
                  title={["Twin tower, north podium", "Triple slab, split core", "Paired slab, deck above"][i]}
                  description={["Two towers on a shared podium; the north edge keeps the fire loop.", "Three slabs share one core bank; spacing is tightest at the west corner.", "Two long slabs with amenity on the deck; parking runs under both."][i]}
                  meta={<>
                    <span className="tnum text-label text-muted-foreground">{[168, 186, 154][i]} units</span>
                    <span className="text-foreground-disabled">·</span>
                    <span className="tnum text-label text-muted-foreground">FSI {[3.28, 3.33, 3.02][i]!.toFixed(2)}</span>
                  </>}
                  selected={picked === `c${i}`}
                  onSelect={() => setPicked(`c${i}`)}
                  actions={<Button size="sm" variant={picked === `c${i}` ? "solid" : "outline"} tone={picked === `c${i}` ? "primary" : "neutral"}>{picked === `c${i}` ? "Applied" : "Apply"}</Button>}
                />
              ))}
            </CardGrid>
          </Spec>

          <Spec name="MediaCard — horizontal" note="Thumbnail beside, when a list has to stay short — the parcel pool, saved revisions.">
            <div className="flex w-full flex-col gap-3">
              <MediaCard
                orientation="horizontal"
                media={<PlanThumb seed={0} />}
                eyebrow="in-mh-mumbai · DCPR 2034"
                title="Dahisar East, plot 44/2"
                description="4,812 m² · redevelopment · FSI 3.33 with premium and TDR."
                meta={<><Badge tone="success" dot>pack verified</Badge><Badge tone="primary" provisional>TDR TBV</Badge></>}
                actions={<><Button size="sm">Open</Button><Button size="sm" variant="ghost">Duplicate</Button></>}
                onSelect={() => setPicked("plot-44")}
                selected={picked === "plot-44"}
              />
              <MediaCard
                orientation="horizontal"
                elevation="flat"
                media={<PlanThumb seed={2} />}
                mediaWidth="96px"
                title="Keshavnagar, plot 12"
                description="2,140 m² · outright · UDCPR 2020."
                meta={<Badge tone="warning" dot>3 TBV</Badge>}
                actions={<Button size="sm" variant="ghost">Open</Button>}
              />
            </div>
          </Spec>

          <Spec name="MediaCard — no thumbnail" note="With no media the slot disappears entirely. A grey placeholder reads as “not loaded yet”, which is a different thing from “there is none”.">
            <CardGrid min="228px" className="w-full">
              <MediaCard
                eyebrow="Revision r-03"
                title="Podium deck added"
                description="Half of the first tower floor converted to amenity, per the podium rule."
                meta={<span className="tnum text-label text-muted-foreground">2026-09-21 · jhlee</span>}
                actions={<Button size="sm" variant="ghost">Restore</Button>}
              />
              <MediaCard
                elevation="flat"
                eyebrow="Revision r-02"
                title="Tower B moved 1.4 m east"
                description="Spacing check passed at 12.4 m after the move."
                meta={<Badge tone="success" dot>pass</Badge>}
                actions={<Button size="sm" variant="ghost">Restore</Button>}
              />
              <MediaCard
                elevation="flush"
                eyebrow="Revision r-01"
                title="Initial massing"
                description="Two towers, no podium, 21 storeys each."
                meta={<span className="tnum text-label text-muted-foreground">2026-09-18 · jhlee</span>}
              />
            </CardGrid>
          </Spec>

          <Spec name="Accordion" note="Compose Root, Item, Header, Trigger and Content. Single or multiple sections, controlled or uncontrolled. Arrow keys move between headers; drafts stay mounted when closed.">
            <div className="flex w-full flex-wrap gap-4">
              <Accordion type="single" collapsible defaultValue="programme" className="min-w-[240px] flex-1 space-y-2">
                <AccordionItem value="programme">
                  <AccordionHeader><AccordionTrigger>Programme</AccordionTrigger></AccordionHeader>
                  <AccordionContent>
                    <label className="flex flex-col gap-2">Scheme name<Input aria-label="Accordion draft" defaultValue="Tower A" /></label>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="checks">
                  <AccordionHeader><AccordionTrigger>Checks</AccordionTrigger></AccordionHeader>
                  <AccordionContent>One section opens at a time. Close and reopen the programme to keep editing the same draft.</AccordionContent>
                </AccordionItem>
              </Accordion>
              <Accordion type="multiple" defaultValue={["height", "parking"]} className="min-w-[240px] flex-1 space-y-2">
                <AccordionItem value="height">
                  <AccordionHeader><AccordionTrigger>Height</AccordionTrigger></AccordionHeader>
                  <AccordionContent>21 residential floors · 2.95 m per floor</AccordionContent>
                </AccordionItem>
                <AccordionItem value="parking">
                  <AccordionHeader><AccordionTrigger>Parking</AccordionTrigger></AccordionHeader>
                  <AccordionContent>Multiple sections can stay open together.</AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </Spec>

          <Spec name="Collapse" note="Cards and view panels share a 200ms transition. Side by side collapses to a vertical tab; stacked collapses to the header. Reduced motion switches instantly.">
            <div className="flex w-full flex-col gap-2">
              <Card
                elevation="flat"
                collapsed={stack.isCollapsed("ledger")}
                onCollapsedChange={v => stack.setCollapsed("ledger", v)}
                collapseTo="header"
                collapsedLabel="FSI ledger"
                header={<CardHeader title="FSI ledger" meta="3 rows" />}
              >
                <div className="px-4 pb-4">
                  <DescriptionList rows={[
                    { k: "Permitted", v: "38,420 m²", numeric: true },
                    { k: "Consumed", v: "37,118 m²", numeric: true },
                    { k: "Balance", v: "1,302 m²", numeric: true, provisional: true },
                  ]} />
                </div>
              </Card>
              <Card
                elevation="flat"
                collapsed={stack.isCollapsed("notes")}
                onCollapsedChange={v => stack.setCollapsed("notes", v)}
                collapseTo="header"
                collapsedLabel="Pack notes"
                header={<CardHeader title="Pack notes" meta="in-mh-mumbai" />}
              >
                <div className="px-4 pb-4">
                  <Alert tone="info" title="3 placeholders in this pack">
                    Values with a dashed underline have not been verified against the source.
                  </Alert>
                </div>
              </Card>
              <p className="text-label leading-relaxed text-muted-foreground">
                Collapsing never removes the way back — a collapsed card keeps its header row or its
                vertical tab, and that strip is the control that restores it. Content is hidden, never
                unmounted, so scroll position and half-typed values survive the round trip.
                The workbench above uses the vertical-tab shape; press <b>Focus canvas</b> to see it.
              </p>
            </div>
          </Spec>

          <Spec name="Empty state" note="It names the next action rather than the absence.">
            <Card elevation="flat" className="w-full">
              <EmptyState
                icon={<Icon d={ICON.site} />}
                title="No parcel selected"
                description="Pick a parcel from the pool or draw one, then the programme and layout become available."
                action={<Button variant="solid" tone="primary">Choose a parcel</Button>}
              />
            </Card>
          </Spec>

          <div id="ref" className="border-t border-border px-6 py-5">
            <Breadcrumb items={[{ label: "Design system", onSelect: () => {} }, { label: "Component reference" }]} />
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Delete this parcel?"
        description="Saved schemes and the stored programme for this parcel are removed too. This cannot be undone."
        confirmLabel="Delete parcel"
        onConfirm={() => setConfirm(false)}
      />

      <Drawer open={drawer} onOpenChange={setDrawer}>
        <DrawerContent side="right" size="md">
          <DrawerHeader title="Jurisdiction pack" description="in-mh-mumbai · DCPR 2034" />
          <DrawerBody>
            <div className="flex flex-col gap-4">
              <SectionLabel>Figures</SectionLabel>
              <DescriptionList rows={[
                { k: "Base FSI", v: "1.33", numeric: true },
                { k: "Premium FSI", v: "1.00", numeric: true, provisional: true },
                { k: "TDR", v: "0.65", numeric: true, provisional: true },
                { k: "Front setback", v: "6.0 m", numeric: true },
                { k: "Carpet definition", v: "MOFA" },
              ]} />
              <Alert tone="info" title="3 placeholders in this pack">
                Values with a dashed underline have not been verified against the source.
              </Alert>
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

/* 원 갤러리의 루트 — 툴팁·토스트 프로바이더는 앱 최상단에 한 번 있어야 하고, 스토리마다 그 자리를 이것이 맡는다. */
export function GalleryProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <ToastProvider position="bottom-right">{children}</ToastProvider>
    </TooltipProvider>
  );
}
