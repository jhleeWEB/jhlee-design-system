import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import {
  AppShell,
  Badge,
  Breadcrumb,
  Button,
  CanvasScale,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  DescriptionList,
  Field,
  FieldControl,
  FieldLabel,
  Kbd,
  Legend,
  LegendItem,
  NumberInput,
  PanelToggleButton,
  Progress,
  Readout,
  ReadoutItem,
  SectionLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sidebar,
  SidebarGroup,
  SidebarItem,
  Slider,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ToastProvider,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarDivider,
  ToolbarSpacer,
  Tooltip,
  TooltipProvider,
  TopBar,
  niceScale,
  usePanelLayout,
} from "../../src";
import {
  IconAxis,
  IconDownload,
  IconDraw,
  IconEye,
  IconFileText,
  IconGrid,
  IconLayers,
  IconMap,
  IconMeasureArea,
  IconMeasureDistance,
  IconMove,
  IconOrbit,
  IconPan,
  IconRectangle,
  IconRedo,
  IconRotate,
  IconScale,
  IconSearch,
  IconSectionPlane,
  IconSelect,
  IconSettings,
  IconSnap,
  IconUndo,
  IconViewFront,
  IconViewIso,
  IconViewSide,
  IconViewTop,
  IconZoomExtents,
  IconZoomIn,
  IconZoomOut,
  IconZoomWindow,
} from "../../src/icons";

/* 제품 화면의 복제 — 3D 배치 설정기(configurator) 작업대(#71). 옛 손 레이아웃(2줄 머리 · 250px Card 인스펙터 · 스트립 접힘, #1198 · #6)을
 * DS 의 작업대 부품으로 다시 짰다: AppShell(inset — 옅은 바닥 위의 카드) · TopBar · 끌어 바꾸고 접는 인스펙터(AppShell 안의 ResizablePanels) ·
 * 레일 Sidebar · 캔버스 위 부유 툴 클러스터(Toolbar + ToggleGroup + Tooltip 단축키) · 쥔 툴의 CAD 커서(`cursor-cad-*`) ·
 * 캔버스 범례(Legend) · 축척(CanvasScale) · 실시간 판독(Readout) · 명령 팔레트(⌘K, 닫힌 채 시작).
 *
 * 도메인 어휘(필지 · FSI · 주차 · 규칙 팩)는 **이 파일의 데이터에만** 있다 — 컴포넌트는 그것을 모른다.
 * VRT 기준선이 성립하도록 결정적이다: 타이머 · 난수 · `storageKey` 가 없고, 수치는 고정 데이터에서 계산한다(숫자 서식은 en-US 고정).
 * 다크 토글은 addon-themes 툴바 전역이 맡는다 — 캔버스(흰 바탕 · 무채색 · radius 0)는 어느 테마에서도 같은 픽셀이고, 크롬만 바뀐다. */

const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const fmt1 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmt2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ── 스토리 데이터 — 필지 · 규칙 ─────────────────────────────────────────────── */
const SITE = { width: 88, depth: 54 } as const; // m
const PLOT_AREA = SITE.width * SITE.depth; // 4,752 m²
const PODIUM = { x0: 10, x1: 78, y0: 10, y1: 44, z: 9 } as const;
const TOWER_A = { x0: 14, x1: 36, y0: 14, y1: 36, storeys: 16 } as const;
const TOWER_B = { x0: 50, x1: 72, y0: 16, y1: 38 } as const;
const STOREY = 3.15;
const RULES = { fsiCap: 3.33, heightCap: 70, coverage: 41.8, coverageCap: 45 } as const;
/* 탑 A 의 연면적(고정) + 탑 B 의 층당 면적 — 층수를 바꾸면 FSI 판독이 바로 따라온다. */
const GFA_FIXED = 7_260;
const GFA_PER_STOREY_B = 404;

/* ── 툴 — 아이콘 · 단축키 · 커서가 한 줄에 있다. 커서 클래스는 정적 문자열이어야 Tailwind 가 굽는다. ── */
type ToolId =
  "select" | "move" | "rotate" | "scale" | "orbit" | "pan" | "zoom" | "measure" | "draw" | "section";

interface Tool {
  id: ToolId;
  label: string;
  key: string;
  icon: ReactNode;
  cursor: string;
}

const TOOL_GROUPS: readonly (readonly Tool[])[] = [
  [
    { id: "select", label: "Select", key: "V", icon: <IconSelect />, cursor: "cursor-cad-select" },
    { id: "move", label: "Move", key: "G", icon: <IconMove />, cursor: "cursor-cad-move" },
    { id: "rotate", label: "Rotate", key: "R", icon: <IconRotate />, cursor: "cursor-cad-rotate" },
    { id: "scale", label: "Scale", key: "S", icon: <IconScale />, cursor: "cursor-cad-scale" },
  ],
  [
    { id: "orbit", label: "Orbit", key: "O", icon: <IconOrbit />, cursor: "cursor-cad-orbit" },
    { id: "pan", label: "Pan", key: "H", icon: <IconPan />, cursor: "cursor-cad-pan" },
    {
      id: "zoom",
      label: "Zoom window",
      key: "Z",
      icon: <IconZoomWindow />,
      cursor: "cursor-cad-zoom-window",
    },
  ],
  [
    {
      id: "measure",
      label: "Measure",
      key: "M",
      icon: <IconMeasureDistance />,
      cursor: "cursor-cad-measure",
    },
    { id: "draw", label: "Draw outline", key: "L", icon: <IconDraw />, cursor: "cursor-cad-draw" },
    {
      id: "section",
      label: "Section plane",
      key: "X",
      icon: <IconSectionPlane />,
      cursor: "cursor-cad-section",
    },
  ],
];
const TOOLS: readonly Tool[] = TOOL_GROUPS.flat();
const TOOL_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t])) as Record<ToolId, Tool>;
const TOOL_BY_KEY: Readonly<Record<string, ToolId>> = Object.fromEntries(
  TOOLS.map((t) => [t.key.toLowerCase(), t.id]),
);

const VIEWS = [
  { id: "iso", label: "Isometric view", key: "0", icon: <IconViewIso /> },
  { id: "top", label: "Top view", key: "7", icon: <IconViewTop /> },
  { id: "front", label: "Front view", key: "1", icon: <IconViewFront /> },
  { id: "side", label: "Side view", key: "3", icon: <IconViewSide /> },
] as const;

/* 훅에 넘기는 id 배열은 **모듈 상수**여야 한다 — 렌더마다 새 배열이면 usePanelLayout 의 메모가 매번 무효화된다. */
const PANELS = ["inspector"] as const;
const INSPECTOR_ID = "workbench-inspector";

/* ── 3D 매싱 — 축측도. 캔버스 어휘만 쓴다(흰 바탕 · 무채색 · 선택만 크롬 선택색). ─────────────────────────── */
const PX_PER_M = 4; // 도면 좌표(viewBox) 1 m 의 길이
const VIEWBOX = { x: 0, y: -80, width: 900, height: 640 } as const;
const COS30 = Math.cos(Math.PI / 6);
const ORIGIN = { x: 391, y: 184 } as const;
const r1 = (n: number) => Math.round(n * 10) / 10;
type P3 = readonly [x: number, y: number, z: number];
function iso([x, y, z]: P3): [number, number] {
  return [r1(ORIGIN.x + (x - y) * COS30 * PX_PER_M), r1(ORIGIN.y + (x + y) * 0.5 * PX_PER_M - z * PX_PER_M)];
}
const pts = (...ps: P3[]) => ps.map((p) => iso(p).join(",")).join(" ");

interface Box {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  z0: number;
  z1: number;
}

function boxFaces({ x0, x1, y0, y1, z0, z1 }: Box) {
  return {
    top: pts([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]),
    /* 보는 쪽은 +x · +y 다 — y=y1 면이 왼쪽 아래, x=x1 면이 오른쪽 아래로 보인다. */
    left: pts([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]),
    right: pts([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]),
  };
}

function Mass({ box, storey, podium = false }: { box: Box; storey?: number; podium?: boolean }) {
  const f = boxFaces(box);
  const levels: number[] = [];
  if (storey) for (let z = box.z0 + storey; z < box.z1 - 0.01; z += storey) levels.push(r1(z));
  return (
    <g>
      <polygon
        points={f.left}
        fill="var(--canvas-ink-2)"
        fillOpacity={podium ? 0.16 : 0.42}
        stroke="var(--canvas-ink-2)"
        strokeWidth={0.8}
      />
      <polygon
        points={f.right}
        fill="var(--canvas-ink-2)"
        fillOpacity={podium ? 0.26 : 0.62}
        stroke="var(--canvas-ink-2)"
        strokeWidth={0.8}
      />
      <g stroke="var(--canvas-bg)" strokeOpacity={0.45} strokeWidth={0.6} fill="none">
        {levels.map((z) => (
          <polyline key={z} points={pts([box.x0, box.y1, z], [box.x1, box.y1, z], [box.x1, box.y0, z])} />
        ))}
      </g>
      <polygon points={f.top} fill="var(--canvas-surface)" stroke="var(--canvas-ink-2)" strokeWidth={0.8} />
    </g>
  );
}

function MassingView({ towerHeight, setback }: { towerHeight: number; setback: number }) {
  const towerA: Box = { ...TOWER_A, z0: PODIUM.z, z1: PODIUM.z + TOWER_A.storeys * STOREY };
  const towerB: Box = { ...TOWER_B, z0: PODIUM.z, z1: PODIUM.z + towerHeight };
  const selection = boxFaces(towerB);
  const handles: P3[] = [
    [towerB.x0, towerB.y0, towerB.z1],
    [towerB.x1, towerB.y0, towerB.z1],
    [towerB.x1, towerB.y1, towerB.z1],
    [towerB.x0, towerB.y1, towerB.z1],
    [towerB.x1, towerB.y1, towerB.z0],
  ];
  const grid: number[] = [];
  for (let v = -16; v <= 104; v += 8) grid.push(v);
  /* 높이 치수는 오른쪽 면 바깥(+x)에 세운다 — 앞 모서리에 겹치면 층선과 섞여 읽히지 않는다. */
  const [hx, hy] = iso([towerB.x1 + 8, towerB.y0, 0]);
  const [, hy2] = iso([towerB.x1 + 8, towerB.y0, towerB.z1]);
  const [sx0, sy0] = iso([TOWER_A.x1, 52, 0]);
  const [sx1, sy1] = iso([TOWER_B.x0, 52, 0]);
  const [ax, ay] = iso([towerA.x0, towerA.y0, towerA.z1]);
  const [bx, by] = iso([towerB.x0, towerB.y0, towerB.z1]);
  return (
    <svg
      viewBox={`${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.width} ${VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 size-full"
      role="img"
      aria-label="Massing model, Tower B selected"
    >
      <g stroke="var(--canvas-grid)" strokeWidth={0.7} fill="none">
        {grid.map((v) => (
          <g key={v}>
            {v <= 104 ? <polyline points={pts([v, -16, 0], [v, 70, 0])} /> : null}
            {v <= 70 ? <polyline points={pts([-16, v, 0], [104, v, 0])} /> : null}
          </g>
        ))}
      </g>
      {/* 필지 경계와 이격선 — 이격선은 인스펙터의 슬라이더를 따라 움직인다. */}
      <polygon
        points={pts([0, 0, 0], [SITE.width, 0, 0], [SITE.width, SITE.depth, 0], [0, SITE.depth, 0])}
        fill="var(--canvas-bg)"
        fillOpacity={0.6}
        stroke="var(--canvas-ink-2)"
        strokeWidth={1.4}
      />
      <polygon
        points={pts(
          [setback, setback, 0],
          [SITE.width - setback, setback, 0],
          [SITE.width - setback, SITE.depth - setback, 0],
          [setback, SITE.depth - setback, 0],
        )}
        fill="none"
        stroke="var(--canvas-muted)"
        strokeWidth={1}
        strokeDasharray="6 4"
      />
      <Mass box={{ ...PODIUM, z0: 0, z1: PODIUM.z }} podium />
      <Mass box={towerA} storey={STOREY} />
      <Mass box={towerB} storey={STOREY} />
      {/* 선택 — 크롬의 선택색은 도면 위에서도 «지금 고른 것» 하나만 말한다. */}
      <polygon
        points={selection.top}
        fill="var(--chrome-selection-fill)"
        stroke="var(--chrome-selection-stroke)"
        strokeWidth={1.8}
      />
      <g fill="none" stroke="var(--chrome-selection-stroke)" strokeWidth={1.4}>
        <polygon points={selection.left} />
        <polygon points={selection.right} />
      </g>
      <g fill="var(--canvas-bg)" stroke="var(--chrome-selection-stroke)" strokeWidth={1.4}>
        {handles.map((p) => {
          const [x, y] = iso(p);
          return <rect key={p.join()} x={x - 3} y={y - 3} width={6} height={6} />;
        })}
      </g>
      {/* 치수 — 탑 사이 간격과 탑 B 의 높이 */}
      <g stroke="var(--canvas-ink-2)" strokeWidth={0.9}>
        <line x1={sx0} y1={sy0} x2={sx1} y2={sy1} />
        <line x1={sx0} y1={sy0 - 6} x2={sx0} y2={sy0 + 6} />
        <line x1={sx1} y1={sy1 - 6} x2={sx1} y2={sy1 + 6} />
        <line x1={hx} y1={hy} x2={hx} y2={hy2} />
        <line x1={hx - 6} y1={hy} x2={hx + 6} y2={hy} />
        <line x1={hx - 6} y1={hy2} x2={hx + 6} y2={hy2} />
      </g>
      <g fontFamily="var(--font-stack-mono)" fontSize={11} fill="var(--canvas-ink-2)">
        <text x={r1((sx0 + sx1) / 2 - 18)} y={r1((sy0 + sy1) / 2 + 18)}>
          {fmt1.format(TOWER_B.x0 - TOWER_A.x1)} m
        </text>
        <text x={hx + 10} y={r1((hy + hy2) / 2)}>
          {fmt1.format(PODIUM.z + towerHeight)} m
        </text>
      </g>
      <g fontFamily="var(--font-stack-mono)" fontSize={12} fill="var(--canvas-ink)">
        <text x={ax - 4} y={ay - 10}>
          A
        </text>
        <text x={bx - 4} y={by - 10}>
          B
        </text>
      </g>
    </svg>
  );
}

/* ── 캔버스 위 부유 크롬 ─────────────────────────────────────────────────────── */
/* 툴 칸은 테두리 없는 칸으로 선다 — outline 의 켜진 칸(옅은 주색 바탕 · 주색 테두리)만 남기고 꺼진 칸의 상자를 걷는다. */
const CLUSTER_ITEM = "border-transparent bg-transparent";

function ToolCluster({ tool, onToolChange }: { tool: ToolId; onToolChange: (tool: ToolId) => void }) {
  return (
    <Toolbar
      onCanvas
      aria-label="Tools"
      aria-orientation="vertical"
      className="absolute top-3 left-3 flex-col p-1"
    >
      <ToggleGroup
        type="single"
        variant="outline"
        orientation="vertical"
        aria-label="Active tool"
        value={tool}
        // 같은 칸을 다시 눌러 빈 값이 되면 무시한다 — 작업대에는 언제나 툴 하나가 쥐어져 있다.
        onValueChange={(v: string) => {
          if (v) onToolChange(v as ToolId);
        }}
        className="flex-col"
      >
        {TOOL_GROUPS.map((group, gi) => [
          gi > 0 ? <ToolbarDivider key={`divider-${gi}`} className="mx-0 my-1 h-px w-ctl" /> : null,
          ...group.map((t) => (
            <Tooltip key={t.id} label={t.label} shortcut={t.key} side="right">
              <ToggleGroupItem value={t.id} icon={t.icon} aria-label={t.label} className={CLUSTER_ITEM} />
            </Tooltip>
          )),
        ])}
      </ToggleGroup>
    </Toolbar>
  );
}

function ViewCluster() {
  return (
    <Toolbar onCanvas aria-label="View cube" className="absolute top-3 right-3 flex-col p-1">
      <ToggleGroup
        type="single"
        variant="outline"
        orientation="vertical"
        aria-label="Camera"
        defaultValue="iso"
        className="flex-col"
      >
        {VIEWS.map((v) => (
          <Tooltip key={v.id} label={v.label} shortcut={v.key} side="left">
            <ToggleGroupItem value={v.id} icon={v.icon} aria-label={v.label} className={CLUSTER_ITEM} />
          </Tooltip>
        ))}
      </ToggleGroup>
    </Toolbar>
  );
}

function ZoomCluster() {
  return (
    <Toolbar onCanvas aria-label="Zoom" className="absolute right-3 bottom-3 gap-1 p-1">
      <Tooltip label="Zoom out" shortcut="−">
        <Button variant="ghost" size="icon" aria-label="Zoom out">
          <IconZoomOut />
        </Button>
      </Tooltip>
      <span className="w-12 text-center tnum text-label text-muted-foreground">100 %</span>
      <Tooltip label="Zoom in" shortcut="+">
        <Button variant="ghost" size="icon" aria-label="Zoom in">
          <IconZoomIn />
        </Button>
      </Tooltip>
      <ToolbarDivider />
      <Tooltip label="Zoom to fit" shortcut="⇧2">
        <Button variant="ghost" size="icon" aria-label="Zoom to fit">
          <IconZoomExtents />
        </Button>
      </Tooltip>
    </Toolbar>
  );
}

/* ── 인스펙터 ───────────────────────────────────────────────────────────────── */
interface Massing {
  storeys: number;
  floorHeight: number;
  setback: number;
}

const RULE_ROWS = [
  { id: "FSI-01", name: "Floor space index", tone: "success", verdict: "Pass" },
  { id: "HT-02", name: "Height limit", tone: "destructive", verdict: "Fail" },
  { id: "SB-03", name: "Side setbacks", tone: "success", verdict: "Pass" },
  { id: "PK-04", name: "Parking provision", tone: "destructive", verdict: "Fail" },
] as const;

const LAYERS = ["Towers", "Podium", "Setback", "Site boundary", "Grid"] as const;

function Inspector({
  massing,
  onMassingChange,
  height,
}: {
  massing: Massing;
  onMassingChange: (next: Massing) => void;
  height: number;
}) {
  const overHeight = height > RULES.heightCap;
  return (
    /* 스크롤은 AppShell 이 인스펙터를 감싼 ScrollArea 가 맡는다(#87) — 여기서 overflow 를 적으면 브라우저 기본 막대가 다시 나온다. */
    <div className="flex flex-col">
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <SectionLabel>Selection</SectionLabel>
          <span className="text-title font-semibold text-foreground">Tower B</span>
          <span className="tnum text-label text-muted-foreground">
            Point tower · {massing.storeys} storeys · {fmt1.format(height)} m
          </span>
        </div>
        <Badge tone={overHeight ? "destructive" : "success"} dot>
          {overHeight ? "Height fail" : "Height pass"}
        </Badge>
      </div>
      <Tabs defaultValue="properties">
        <TabsList variant="underline" aria-label="Inspector sections" className="px-4">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="layers">Layers</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="flex flex-col gap-4 p-4">
          <Field>
            <FieldLabel>Typology</FieldLabel>
            <Select defaultValue="point">
              <FieldControl>
                <SelectTrigger size="sm">
                  <SelectValue />
                </SelectTrigger>
              </FieldControl>
              <SelectContent>
                <SelectItem value="point">Point tower</SelectItem>
                <SelectItem value="slab">Slab block</SelectItem>
                <SelectItem value="l-block">L-block</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>Storeys</FieldLabel>
              <FieldControl>
                <NumberInput
                  size="sm"
                  min={1}
                  max={40}
                  unit="fl"
                  value={massing.storeys}
                  onValueChange={(storeys) => onMassingChange({ ...massing, storeys })}
                />
              </FieldControl>
            </Field>
            <Field>
              <FieldLabel>Floor height</FieldLabel>
              <FieldControl>
                <NumberInput
                  size="sm"
                  min={2.8}
                  max={4.5}
                  step={0.05}
                  unit="m"
                  value={massing.floorHeight}
                  onValueChange={(floorHeight) => onMassingChange({ ...massing, floorHeight })}
                />
              </FieldControl>
            </Field>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-label font-medium text-foreground-2">Setback</span>
            <Slider
              aria-label="Setback"
              size="sm"
              min={3}
              max={12}
              step={0.5}
              value={[massing.setback]}
              onValueChange={([setback = massing.setback]) => onMassingChange({ ...massing, setback })}
              showValue
              formatValue={(v) => `${fmt1.format(v)} m`}
            />
          </div>

          <Collapsible defaultOpen>
            <CollapsibleTrigger>Geometry</CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <DescriptionList
                rows={[
                  { k: "Footprint", v: "22.0 × 22.0 m", numeric: true },
                  { k: "Floor plate", v: "484 m²", numeric: true },
                  { k: "Tower spacing", v: `${fmt1.format(TOWER_B.x0 - TOWER_A.x1)} m`, numeric: true },
                  { k: "Height", v: `${fmt1.format(height)} m`, numeric: true },
                ]}
              />
            </CollapsibleContent>
          </Collapsible>
          <Collapsible>
            <CollapsibleTrigger>Placement</CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <DescriptionList
                rows={[
                  { k: "Origin X", v: "50.00 m", numeric: true },
                  { k: "Origin Y", v: "16.00 m", numeric: true },
                  { k: "Rotation", v: "0°", numeric: true },
                ]}
              />
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>

        <TabsContent value="rules" className="flex flex-col gap-4 p-4">
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-body">
            {RULE_ROWS.map((r) => (
              <li key={r.id} className="flex items-center gap-3">
                <span className="w-12 font-mono text-label text-muted-foreground">{r.id}</span>
                <span className="min-w-0 flex-1 truncate text-foreground-2">{r.name}</span>
                <Badge tone={r.tone} dot>
                  {r.verdict}
                </Badge>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2">
            <SectionLabel>Parking</SectionLabel>
            <Progress value={82} tone="destructive" aria-label="Parking bays provided" />
            <div className="flex items-center justify-between text-label">
              <span className="tnum text-muted-foreground">218 of 266 bays</span>
              <span className="tnum font-medium text-destructive">−48 short</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="layers" className="flex flex-col gap-1 p-4">
          {LAYERS.map((layer) => (
            <div key={layer} className="flex items-center gap-3 text-body text-foreground-2">
              <span className="min-w-0 flex-1 truncate">{layer}</span>
              <Button variant="ghost" size="icon-sm" aria-label={`Hide ${layer.toLowerCase()}`}>
                <IconEye />
              </Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ── 명령 팔레트 — ⌘K. 스토리는 닫힌 채 시작한다(VRT 는 작업대만 찍는다). ───────────────────── */
function Palette({
  open,
  onOpenChange,
  onTool,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTool: (tool: ToolId) => void;
}) {
  const run = (fn?: () => void) => () => {
    fn?.();
    onOpenChange(false);
  };
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command label="Commands">
        <CommandInput placeholder="Search tools and actions…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Tools">
            {TOOLS.map((t) => (
              <CommandItem key={t.id} value={t.label} shortcut={t.key} onSelect={run(() => onTool(t.id))}>
                {t.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem value="Save scheme" shortcut="⌘S" onSelect={run()}>
              Save scheme
            </CommandItem>
            <CommandItem value="Export model" shortcut="⌘E" onSelect={run()}>
              Export model
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

/* ── 제품 화면 복제 ────────────────────────────────────────────────────────── */
export function Workbench() {
  const [tool, setTool] = useState<ToolId>("select");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [massing, setMassing] = useState<Massing>({ storeys: 20, floorHeight: STOREY, setback: 6 });
  /* 제품에서는 접힘 · 폭을 남기겠지만(`storageKey`) 스토리에서는 뺀다 — 브라우저에 남은 상태가 VRT 픽셀을 흔들면 안 된다. */
  const panels = usePanelLayout(PANELS);
  const inspectorOpen = !panels.isCollapsed("inspector");
  const setInspectorOpen = (open: boolean) => panels.setCollapsed("inspector", !open);

  const towerHeight = massing.storeys * massing.floorHeight;
  const height = PODIUM.z + towerHeight;
  const gfa = GFA_FIXED + GFA_PER_STOREY_B * massing.storeys;
  const fsi = gfa / PLOT_AREA;
  const overFsi = fsi > RULES.fsiCap;
  const overHeight = height > RULES.heightCap;
  /* 축척 막대는 화면 px 로 그린다 — 도면이 칸에 맞춰(meet) 줄어든 배율을 재서 m/px 를 낸다. 페인트 전(useLayoutEffect)에 재므로
     첫 프레임부터 맞는 길이다(VRT 가 고정 뷰포트에서 같은 값을 얻는다). */
  const stageRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () =>
      setFit(Math.min(el.clientWidth / VIEWBOX.width, el.clientHeight / VIEWBOX.height) || 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const scale = niceScale(1 / (PX_PER_M * fit));

  /* 단축키 — ⌘K 는 팔레트, 글자 하나는 툴. 입력 칸 · 대화상자 안의 타이핑은 건드리지 않는다. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (
        e.target instanceof Element &&
        e.target.closest("input, textarea, [contenteditable], [role=dialog]")
      )
        return;
      const next = TOOL_BY_KEY[e.key.toLowerCase()];
      if (next) setTool(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <AppShell
        variant="inset"
        className="h-screen"
        resizable
        inspectorId={INSPECTOR_ID}
        inspectorMinSize={280}
        inspectorMaxSize={440}
        inspectorOpen={inspectorOpen}
        onInspectorOpenChange={setInspectorOpen}
        topBar={
          <TopBar
            size="sm"
            title="Residential Studio"
            eyebrow="Planning draft"
            leading={
              <span
                aria-hidden="true"
                className="grid size-8 place-items-center rounded-md bg-primary font-mono text-micro font-medium text-primary-foreground"
              >
                BO
              </span>
            }
            breadcrumb={
              <Breadcrumb
                items={[
                  { label: "Projects", href: "#projects" },
                  { label: "Dahisar plot", href: "#dahisar" },
                  { label: "Scheme C" },
                ]}
              />
            }
            actions={
              <>
                <Button variant="ghost" size="sm" onClick={() => setPaletteOpen(true)}>
                  <IconSearch />
                  Search
                  <Kbd>⌘K</Kbd>
                </Button>
                <Button size="sm">
                  <IconDownload />
                  Export
                </Button>
                <Button size="sm" variant="solid" tone="primary">
                  Save scheme
                </Button>
                <PanelToggleButton
                  open={inspectorOpen}
                  onOpenChange={setInspectorOpen}
                  label="inspector"
                  controls={INSPECTOR_ID}
                />
              </>
            }
          />
        }
        sidebar={
          <Sidebar collapsed label="Workspace" className="rounded-lg border-r-0 shadow-card">
            <SidebarItem icon={<IconMap />} label="Site" shortcut="1" />
            <SidebarItem icon={<IconLayers />} label="Massing" shortcut="2" active />
            <SidebarItem icon={<IconRectangle />} label="Floor plates" shortcut="3" />
            <SidebarGroup label="Checks">
              <SidebarItem icon={<IconMeasureArea />} label="Areas" shortcut="4" />
              <SidebarItem icon={<IconFileText />} label="Regulations" shortcut="5" />
            </SidebarGroup>
            <div className="mt-auto">
              <SidebarItem icon={<IconSettings />} label="Settings" />
            </div>
          </Sidebar>
        }
        inspector={<Inspector massing={massing} onMassingChange={setMassing} height={height} />}
        footer={
          <footer className="flex shrink-0 items-center gap-3 border-t border-border bg-secondary px-4 py-1 text-micro text-muted-foreground">
            <Badge tone={overFsi ? "destructive" : "success"} dot>
              {overFsi ? "FSI over cap" : "FSI within cap"}
            </Badge>
            <Badge tone="destructive" dot>
              {overHeight ? "2 rules fail" : "1 rule fails"}
            </Badge>
            <span>Pack in-mh-mumbai · DCPR 2034</span>
            <span className="ml-auto tnum">X 61.20 m · Y 27.40 m · Z {fmt2.format(height)} m</span>
            <span>Snap on</span>
            <span className="tnum">1 : 500</span>
          </footer>
        }
      >
        <Toolbar aria-label="View options" className="gap-2 px-3 py-2">
          <ToggleGroup type="single" size="sm" aria-label="View mode" defaultValue="model">
            <ToggleGroupItem value="plan">2D plan</ToggleGroupItem>
            <ToggleGroupItem value="model">3D model</ToggleGroupItem>
            <ToggleGroupItem value="section">Section</ToggleGroupItem>
          </ToggleGroup>
          <ToolbarSpacer />
          <ToggleGroup
            type="multiple"
            variant="outline"
            size="sm"
            aria-label="Overlays"
            defaultValue={["grid", "snap"]}
          >
            <Tooltip label="Grid" shortcut="⇧G">
              <ToggleGroupItem value="grid" icon={<IconGrid />} aria-label="Grid" />
            </Tooltip>
            <Tooltip label="Snap" shortcut="⇧S">
              <ToggleGroupItem value="snap" icon={<IconSnap />} aria-label="Snap" />
            </Tooltip>
            <Tooltip label="Axes" shortcut="⇧A">
              <ToggleGroupItem value="axes" icon={<IconAxis />} aria-label="Axes" />
            </Tooltip>
          </ToggleGroup>
          <ToolbarDivider />
          <Tooltip label="Undo" shortcut="⌘Z">
            <Button variant="ghost" size="icon-sm" aria-label="Undo">
              <IconUndo />
            </Button>
          </Tooltip>
          <Tooltip label="Redo" shortcut="⇧⌘Z">
            <Button variant="ghost" size="icon-sm" aria-label="Redo">
              <IconRedo />
            </Button>
          </Tooltip>
        </Toolbar>

        {/* 캔버스 — 흰 바탕 고정 · radius 0. 커서는 쥔 툴의 CAD 커서다(VRT 는 커서를 찍지 못하므로 data-tool 이 상태를 드러낸다). */}
        <div
          ref={stageRef}
          data-slot="workbench-canvas"
          data-tool={tool}
          className={`relative min-h-0 flex-1 overflow-hidden bg-canvas ${TOOL_BY_ID[tool].cursor}`}
        >
          <MassingView towerHeight={towerHeight} setback={massing.setback} />
          <ToolCluster tool={tool} onToolChange={setTool} />
          <Readout
            variant="floating"
            size="sm"
            aria-label="Scheme metrics"
            className="absolute top-3 right-20 left-20"
          >
            <ReadoutItem label="GFA" value={fmt.format(gfa)} unit="m²" />
            <ReadoutItem
              label="FSI"
              value={fmt2.format(fsi)}
              tone={overFsi ? "destructive" : "success"}
              status={overFsi ? `Over ${RULES.fsiCap}` : `Within ${RULES.fsiCap}`}
            />
            <ReadoutItem
              label="Height"
              value={fmt1.format(height)}
              unit="m"
              tone={overHeight ? "destructive" : "success"}
              status={overHeight ? `Over ${RULES.heightCap} m` : `Within ${RULES.heightCap} m`}
            />
            <ReadoutItem
              label="Coverage"
              value={fmt1.format(RULES.coverage)}
              unit="%"
              tone="success"
              status={`Within ${RULES.coverageCap} %`}
            />
          </Readout>
          <ViewCluster />
          <div className="absolute bottom-3 left-3 flex items-end gap-3">
            <Legend orientation="horizontal" aria-label="Massing legend">
              <LegendItem swatch="ink-2">Tower</LegendItem>
              <LegendItem swatch="muted">Podium</LegendItem>
              <LegendItem swatch="muted" pattern="line">
                Setback
              </LegendItem>
              <LegendItem swatch="line-strong" pattern="outline">
                Site
              </LegendItem>
            </Legend>
            <CanvasScale lengthPx={scale.px} label={`${scale.lengthM} m`} />
          </div>
          <ZoomCluster />
        </div>
      </AppShell>
      <Palette open={paletteOpen} onOpenChange={setPaletteOpen} onTool={setTool} />
    </>
  );
}

/* 원 갤러리 앱의 루트 — 툴팁 · 토스트 프로바이더는 앱 최상단에 한 번 있어야 하고, 스토리에서는 그 자리를 이것이 맡는다. */
export function WorkbenchProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <ToastProvider position="bottom-right">{children}</ToastProvider>
    </TooltipProvider>
  );
}
