import { useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardCollapse,
  CardHeader,
  CardWell,
  DescriptionList,
  DisplayHeading,
  Eyebrow,
  Input,
  Lede,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  SectionLabel,
  SegmentedControl,
  Separator,
  Sidebar,
  SidebarGroup,
  SidebarItem,
  StatusDot,
  Switch,
  ToastProvider,
  Tooltip,
  TooltipProvider,
  usePanelLayout,
} from "../../src";

/* 제품 화면의 복제 (#1198) — `apps/ds-gallery/src/main.tsx` 의 작업대 절을 옮긴 것(계획 §2.5-e, #6).
 * 화면 내용·문자열은 원본 그대로다. 달라진 것은 셋뿐: 진입점(createRoot)·CSS import 가 빠지고 Storybook preview 가 맡는다,
 * `document.documentElement` 를 직접 만지던 다크 토글이 addon-themes 툴바 전역으로 대체됐다(그래서 맥락 줄의 Dark 버튼이 없다),
 * 작업대 패널 접힘의 `storageKey` 를 뺐다 — 스토리는 결정론적이어야 VRT 기준선이 성립하고, 브라우저에 남은 상태가 스크린샷을 바꾸면 안 된다.
 * 같은 파일에 있던 컴포넌트 명세(`<Spec>` 17절, `Pages/Gallery`)는 Phase D 가 컴포넌트별 스토리로 나눈 뒤 지웠다(#48) — 이것은 영구다.
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
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

/* ── 도면 — 캔버스 어휘만 쓴다. 다크에서도 이 면은 바뀌지 않는다. ──────────── */
function SitePlan() {
  return (
    <svg viewBox="0 0 520 300" className="absolute inset-0 size-full" aria-label="Site plan">
      <g stroke="var(--canvas-grid)" strokeWidth={0.7}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <line key={`v${i}`} x1={i * 52} y1={0} x2={i * 52} y2={300} />
        ))}
        {[1, 2, 3, 4, 5].map((i) => (
          <line key={`h${i}`} x1={0} y1={i * 50} x2={520} y2={i * 50} />
        ))}
      </g>
      <polygon
        points="58,40 452,30 466,258 72,270"
        fill="var(--canvas-bg)"
        stroke="var(--canvas-ink-2)"
        strokeWidth={1.4}
      />
      <polygon
        points="86,64 424,55 436,232 100,243"
        fill="none"
        stroke="var(--canvas-muted)"
        strokeWidth={1}
        strokeDasharray="6 4"
      />
      <rect
        x="104"
        y="82"
        width="312"
        height="132"
        fill="var(--canvas-muted)"
        opacity={0.12}
        stroke="var(--canvas-muted)"
        strokeWidth={0.8}
      />
      <rect x="126" y="98" width="84" height="100" fill="var(--canvas-ink-2)" opacity={0.7} />
      <rect
        x="266"
        y="92"
        width="84"
        height="100"
        fill="var(--chrome-selection-fill)"
        stroke="var(--chrome-selection-stroke)"
        strokeWidth={1.8}
      />
      <g stroke="var(--canvas-ink-2)" strokeWidth={0.9}>
        <line x1="210" y1="214" x2="266" y2="214" />
        <line x1="210" y1="206" x2="210" y2="222" />
        <line x1="266" y1="206" x2="266" y2="222" />
      </g>
      <text x="216" y="234" fontFamily="var(--font-stack-mono)" fontSize={11} fill="var(--canvas-ink-2)">
        12.4 m
      </text>
      <text x="134" y="116" fontFamily="var(--font-stack-mono)" fontSize={12} fill="var(--canvas-ink)">
        A
      </text>
      <text x="274" y="110" fontFamily="var(--font-stack-mono)" fontSize={12} fill="var(--canvas-ink)">
        B
      </text>
    </svg>
  );
}

/* 훅에 넘기는 id 배열은 **모듈 상수**여야 한다. 렌더마다 새 배열을 만들면 내부 useMemo 가
   매번 무효화되어 접힘 상태가 튄다. */
const PANELS = ["brief", "plan", "model", "inspect"] as const;
/* 「Focus canvas」 가 접는 것은 **곁 패널**이다 — 캔버스까지 접으면 이름과 하는 일이 달라진다. */
const SIDE_PANELS = ["brief", "inspect"] as const;

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
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={40 + i * 24} y1={276} x2={130 + i * 24} y2={238} />
        ))}
      </g>
      {[podium, ...towers].map((b, i) => (
        <g key={i}>
          <polygon
            points={b.front}
            fill="var(--canvas-ink-2)"
            opacity={i === 0 ? 0.24 : 0.58}
            stroke="var(--canvas-ink-2)"
            strokeWidth={0.8}
          />
          <polygon
            points={b.side}
            fill="var(--canvas-ink-2)"
            opacity={i === 0 ? 0.34 : 0.78}
            stroke="var(--canvas-ink-2)"
            strokeWidth={0.8}
          />
          <polygon
            points={b.top}
            fill="var(--canvas-surface)"
            stroke="var(--canvas-ink-2)"
            strokeWidth={0.8}
          />
        </g>
      ))}
      <text x="112" y="176" fontFamily="var(--font-stack-mono)" fontSize={11} fill="var(--canvas-bg)">
        A
      </text>
      <text x="222" y="164" fontFamily="var(--font-stack-mono)" fontSize={11} fill="var(--canvas-bg)">
        B
      </text>
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
        <span className="text-title font-semibold tracking-[-0.01em] text-foreground">
          Residential Studio
        </span>
        <span className="font-mono text-micro tracking-caps text-muted-foreground uppercase">
          BuildOS / India
        </span>
        <span className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm">
            Regulation lab ↗
          </Button>
          <Button size="sm">Open</Button>
          <Button size="sm" variant="solid" tone="primary">
            Save scheme ↓
          </Button>
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
            <Button variant="ghost" size="sm" onClick={panels.expandAll}>
              Expand all
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => SIDE_PANELS.forEach((id) => panels.setCollapsed(id, true))}
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
          onCollapsedChange={(v) => panels.setCollapsed("brief", v)}
          collapseTo="strip"
          collapsedLabel="Planning brief"
          collapsedSignal={<StatusDot tone="warning" label="3 to be verified" />}
          side="left"
        >
          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-2">
                <Eyebrow step="01" className="flex-1">
                  Planning brief
                </Eyebrow>
                <CardCollapse />
              </div>
              <DisplayHeading>Make the plot work.</DisplayHeading>
              <Lede>
                Set the programme, the deal model and the tower count. Every candidate is judged against the
                same jurisdiction pack.
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
                <Badge tone="success" dot>
                  FSI-01 pass
                </Badge>
                <Badge tone="warning" dot>
                  3 TBV
                </Badge>
              </div>
            </div>

            <Button variant="solid" tone="primary" size="lg" className="w-full">
              Generate schemes →
            </Button>
            <Button size="lg" className="w-full">
              Compare schemes
            </Button>
            <p className="text-label leading-relaxed text-muted-foreground">
              Generate returns one checked scheme. Compare explores alternatives and takes longer.
            </p>
          </div>
        </Card>

        {/* 2D — 캔버스가 «웰» 안의 흰 시트로 앉는다 */}
        <Card
          className="min-w-0 flex-1"
          collapsed={panels.isCollapsed("plan")}
          onCollapsedChange={(v) => panels.setCollapsed("plan", v)}
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
              <div className="flex items-center gap-1 rounded-lg border border-border p-1 shadow-pop on-canvas">
                <Tooltip label="Zoom to fit" shortcut="⇧2">
                  <Button size="icon-sm" variant="ghost" aria-label="Zoom to fit">
                    <Icon d={ICON.plan} />
                  </Button>
                </Tooltip>
                <Separator orientation="vertical" className="mx-0.5 h-4" />
                <span className="px-2 tnum text-label text-muted-foreground">1 : 500</span>
                <Separator orientation="vertical" className="mx-0.5 h-4" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="sm" variant="ghost">
                      Legend
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="end" className="w-auto">
                    <SectionLabel className="mb-2.5">Categories</SectionLabel>
                    <ul className="flex flex-col gap-2 text-body text-foreground-2">
                      {[
                        ["Tower", "var(--canvas-ink-2)"],
                        ["Podium", "var(--canvas-muted)"],
                        ["Setback", "var(--canvas-muted)"],
                      ].map(([l, c]) => (
                        <li key={l} className="flex items-center gap-2">
                          <i
                            className="size-2.5 shrink-0 border border-canvas-line"
                            style={{ background: c }}
                          />
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
          onCollapsedChange={(v) => panels.setCollapsed("model", v)}
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
              <div className="flex items-center gap-1 rounded-lg border border-border p-1 shadow-pop on-canvas">
                <Button size="sm" variant="ghost">
                  Orbit
                </Button>
                <Separator orientation="vertical" className="mx-0.5 h-4" />
                <Button size="sm" variant="ghost">
                  Cutaway
                </Button>
              </div>
            </div>
          </CardWell>
        </Card>

        {/* 검사 — 수치와 판정 */}
        <Card
          className="w-[250px] shrink-0 overflow-y-auto overscroll-contain"
          collapsed={panels.isCollapsed("inspect")}
          onCollapsedChange={(v) => panels.setCollapsed("inspect", v)}
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
              <Badge tone="destructive" dot>
                PK-04 fail
              </Badge>
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

/* 원 갤러리 앱의 루트 — 툴팁·토스트 프로바이더는 앱 최상단에 한 번 있어야 하고, 스토리에서는 그 자리를 이것이 맡는다. */
export function WorkbenchProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <ToastProvider position="bottom-right">{children}</ToastProvider>
    </TooltipProvider>
  );
}
