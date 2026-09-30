import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState, type CSSProperties } from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  CardGrid,
  CardHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  MediaCard,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  SegmentedControl,
  Switch,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  toastVariants,
  Toolbar,
  ToolbarDivider,
  Tr,
} from "../src";

/* Foundations/Corners — 곡률 시트(계획 §3.6-4, #26).
 * `data-corner-candidate` 는 비교용 후보(1.84 · n=5 · 강제 원호)다 — 출하 값이 아니라 CSSOM 스윕이 건너뛴다.
 * 여기서 K(squircle = superellipse(2)) · 보정 계수(1.5) · chip 제외 · 동심원 반경을 **눈으로** 확정한다. 정확한 Apple 대응값은 없으므로
 * (Figma: iOS 곡선은 순수 초타원이 아니다) 스펙 키워드를 기준값으로 두고 1.84 · n=5 와 나란히 본다.
 * `vrt/corners.spec.ts` 가 이 스토리의 `data-corner-specimen` 견본으로 CSSOM 스윕과 픽셀 프로파일을 돈다 — 견본 이름·크기(96×96)를 바꾸면 그쪽도 바꾼다.
 * 지원 엔진(Chromium 139+)에서만 스쿼클이고 나머지는 원호다 — 그 차이가 이 시트의 내용이라 배지가 먼저 말한다. */

const STEPS = [
  { step: "sm", token: "--radius-sm", base: 6, scaled: false, role: "Badge · chip · skeleton — no factor (6px stays 6px)" },
  { step: "md", token: "--radius-md", base: 8, scaled: true, role: "Button · input · select · segmented track" },
  { step: "lg", token: "--radius-lg", base: 12, scaled: true, role: "Card · popover · toast · dropdown · toolbar" },
  { step: "xl", token: "--radius-xl", base: 16, scaled: true, role: "Modal · drawer" },
  { step: "full", token: "--radius-full", base: 9999, scaled: false, role: "Switch · status dot · pill — always round" },
] as const;
type Step = (typeof STEPS)[number]["step"];
/* 정적 문자열이어야 Tailwind 가 굽는다 — 템플릿으로 조립하면 클래스가 CSS 에 없다. */
const ROUNDED: Record<Step, string> = { sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg", xl: "rounded-xl", full: "rounded-full" };

/** `CSS.supports("corner-shape", "squircle")` — 마운트 뒤에만 안다(스토리는 브라우저에서만 그려지지만 첫 렌더는 SSR 과 같은 모양을 지킨다). */
function useCornerSupport(): boolean | null {
  /* 첫 렌더에서 바로 안다 — 스토리는 브라우저에서만 그려진다. 지연 초기화라 effect 안 setState 가 아니다. */
  const [supported] = useState<boolean | null>(() => (typeof CSS === "undefined" ? null : CSS.supports("corner-shape", "squircle")));
  return supported;
}

function SupportBadge() {
  const supported = useCornerSupport();
  if (supported === null) return <Badge tone="neutral">corner-shape: checking…</Badge>;
  return supported ? (
    <Badge tone="success" dot>
      corner-shape: squircle supported — rendering squircle × 1.5
    </Badge>
  ) : (
    <Badge tone="neutral" dot>
      corner-shape not supported — round fallback (allowed)
    </Badge>
  );
}

function Specimen({ step, label, style }: { step: Step; label: string; style?: CSSProperties }) {
  return (
    <figure className="m-0 flex flex-col items-start gap-2">
      <div data-corner-specimen={step} className={`size-24 bg-primary ${ROUNDED[step]}`} style={style} />
      <figcaption className="font-mono text-micro text-muted-foreground">{label}</figcaption>
    </figure>
  );
}

function CornerLadder() {
  const [computed, setComputed] = useState<Record<string, string>>({});
  const [killed, setKilled] = useState(false);
  const measure = () => {
    const next: Record<string, string> = {};
    for (const el of document.querySelectorAll<HTMLElement>("[data-corner-specimen]")) {
      const cs = getComputedStyle(el);
      next[el.dataset.cornerSpecimen ?? ""] = `${cs.borderTopLeftRadius} · ${cs.getPropertyValue("corner-top-left-shape") || "—"}`;
    }
    setComputed(next);
  };
  useEffect(() => {
    /* 킬 스위치는 html[data-corner] 다 — 스토리 밖(문서 루트)의 속성이라 스토리를 떠날 때 되돌린다.
       측정은 다음 프레임에 — 스타일 재계산이 끝난 뒤의 값이어야 하고, effect 본문의 동기 setState 는 연쇄 렌더다. */
    if (killed) document.documentElement.dataset.corner = "round";
    else delete document.documentElement.dataset.corner;
    const frame = requestAnimationFrame(measure);
    return () => {
      cancelAnimationFrame(frame);
      delete document.documentElement.dataset.corner;
    };
  }, [killed]);

  return (
    <div className="flex flex-col gap-8 font-sans text-body text-foreground">
      <div className="flex flex-wrap items-center gap-3">
        <SupportBadge />
        <span className="flex items-center gap-3 text-body">
          <Switch aria-label="Kill switch — data-corner=round on html" checked={killed} onCheckedChange={setKilled} />
          Kill switch (<code className="font-mono text-label">html[data-corner=round]</code>)
        </span>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-title font-semibold">Ladder — 96 × 96 specimens</h2>
        <div className="flex flex-wrap items-end gap-8">
          {STEPS.map(s => (
            <Specimen key={s.step} step={s.step} label={`${s.token} · ${computed[s.step] ?? ""}`} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-title font-semibold">K and factor candidates (lg)</h2>
        <p className="m-0 text-body text-muted-foreground">
          Left is the shipped value. The others exist only to compare by eye — 1.84 matches the diagonal midpoint of a circle, n=5 is the popular
          “Apple” guess; both make 30px controls look like pills.
        </p>
        <div className="flex flex-wrap items-end gap-8">
          <figure className="m-0 flex flex-col items-start gap-2">
            <div className="size-24 rounded-lg bg-primary" />
            <figcaption className="font-mono text-micro text-muted-foreground">squircle · 12 × 1.5 (shipped)</figcaption>
          </figure>
          <figure className="m-0 flex flex-col items-start gap-2">
            <div data-corner-candidate="k-1.84" className="size-24 rounded-lg bg-primary" style={{ borderRadius: "calc(12px * 1.84)" }} />
            <figcaption className="font-mono text-micro text-muted-foreground">squircle · 12 × 1.84</figcaption>
          </figure>
          <figure className="m-0 flex flex-col items-start gap-2">
            <div data-corner-candidate="n-5" className="size-24 rounded-lg bg-primary" style={{ "--corner-shape": "superellipse(2.32)" } as CSSProperties} />
            <figcaption className="font-mono text-micro text-muted-foreground">superellipse(2.32) (n=5) · 12 × 1.5</figcaption>
          </figure>
          <figure className="m-0 flex flex-col items-start gap-2">
            <div data-corner-candidate="round-k" className="size-24 rounded-lg bg-primary" style={{ "--corner-shape": "round" } as CSSProperties} />
            <figcaption className="font-mono text-micro text-muted-foreground">round · 12 × 1.5 (what a fallback engine would show at k=1.5 — it does not)</figcaption>
          </figure>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-title font-semibold">Concentric — inner = outer token − padding</h2>
        <ConcentricSpecimens />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-title font-semibold">Ladder table</h2>
        <Table>
          <Thead>
            <Tr>
              <Th>Token</Th>
              <Th>Perceived (px)</Th>
              <Th>Computed here</Th>
              <Th>Role</Th>
            </Tr>
          </Thead>
          <Tbody>
            {STEPS.map(s => (
              <Tr key={s.step}>
                <Td className="font-mono">{s.token}</Td>
                <Td className="font-mono">
                  {s.base}
                  {s.scaled ? " × k" : ""}
                </Td>
                <Td className="font-mono">{computed[s.step] ?? ""}</Td>
                <Td>{s.role}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </section>
    </div>
  );
}

function ConcentricSpecimens() {
  const [view, setView] = useState<"plan" | "model">("plan");
  return (
    <div className="flex flex-wrap items-start gap-8">
      <figure className="m-0 flex flex-col items-start gap-2">
        <SegmentedControl
          label="View mode"
          value={view}
          onChange={setView}
          options={[
            { value: "plan", label: "Plan" },
            { value: "model", label: "Model" },
          ]}
        />
        <figcaption className="font-mono text-micro text-muted-foreground">segmented · md track − p-0.5 → calc(var(--radius-md) − spacing × 0.5)</figcaption>
      </figure>
      <figure className="m-0 flex flex-col items-start gap-2">
        <div data-corner-specimen="concentric-outer" className="rounded-lg bg-primary-track p-1">
          <div data-corner-specimen="concentric-inner" className="h-ctl w-rail rounded-[calc(var(--radius-lg)-var(--spacing))] bg-card shadow-chip" />
        </div>
        <figcaption className="font-mono text-micro text-muted-foreground">bare pair · lg − p-1 → calc(var(--radius-lg) − spacing)</figcaption>
      </figure>
      <figure className="m-0 flex flex-col items-start gap-2">
        <div className="rounded-lg border border-border bg-card p-2 shadow-pop">
          <div className="rounded-md bg-muted px-3 py-2">item · rounded-md (shipped: 8 × k)</div>
          <div className="rounded-[calc(var(--radius-lg)-var(--spacing)*2)] bg-muted px-3 py-2">item · lg − p-2 (concentric: 4px on fallback engines)</div>
        </div>
        <figcaption className="font-mono text-micro text-muted-foreground">dropdown item candidates inside a lg surface with p-2</figcaption>
      </figure>
    </div>
  );
}

function CornerComponents() {
  const [view, setView] = useState<"plan" | "model">("plan");
  return (
    <div className="flex flex-col gap-8 font-sans text-body text-foreground">
      <section className="flex flex-wrap items-center gap-3">
        <Button variant="solid" tone="primary" className="focus-ring">
          Generate (focus ring)
        </Button>
        <Button variant="outline" tone="neutral">
          Cancel
        </Button>
        <Button variant="outline" tone="destructive" className="focus-ring">
          Delete (focus ring)
        </Button>
        <SegmentedControl
          label="View mode"
          value={view}
          onChange={setView}
          options={[
            { value: "plan", label: "Plan" },
            { value: "model", label: "Model" },
          ]}
        />
      </section>

      {/* 열린 드롭다운은 오른쪽으로 편다 — 아래로 펴면 뷰포트 끝에서 위로 뒤집혀 다른 견본을 가린다(스크린샷 실측). */}
      <section className="flex h-ctl-lg items-start gap-3">
        <DropdownMenu open>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Menu (open)</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start">
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem shortcut="⌘S">Save revision</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem tone="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      <section className="grid grid-cols-2 gap-6">
        <Card elevation="raised" pad="md">
          <CardHeader title="Raised card" meta="shadow-card" />
          <p className="m-0 text-muted-foreground">Shadow follows the curve; no hairline doubles the border.</p>
        </Card>
        <Card elevation="flat" pad="md">
          <CardHeader title="Flat card" meta="1px border" />
          <p className="m-0 text-muted-foreground">Border follows the curve.</p>
        </Card>
      </section>

      <section className="bg-canvas p-6">
        <Toolbar onCanvas>
          <Button variant="ghost" size="sm">
            Select
          </Button>
          <Button variant="ghost" size="sm">
            Move
          </Button>
          <ToolbarDivider />
          <Button variant="solid" tone="primary" size="sm">
            Generate
          </Button>
        </Toolbar>
      </section>

      <CardGrid min="220px">
        <MediaCard
          elevation="raised"
          selected
          eyebrow="Candidate 01"
          title="Raised · selected"
          description="Selection ring is a box-shadow — it follows the curve."
          media={<div className="size-full bg-muted" />}
          onSelect={() => undefined}
        />
        <MediaCard
          elevation="flat"
          selected
          eyebrow="Candidate 02"
          title="Flat · selected"
          description="1px border + ring-1."
          media={<div className="size-full bg-muted" />}
          onSelect={() => undefined}
        />
      </CardGrid>

      <section className="flex flex-col gap-3">
        <Alert tone="info" title="Heads up">
          A 3px left band on a curved corner — STP 253 fixed this case; Chromium draws it in one stroke.
        </Alert>
        <Alert tone="success" title="Saved">
          Border colour at 35% alpha over the soft surface.
        </Alert>
        <div className={toastVariants({ tone: "success" })}>
          <div className="min-w-0 flex-1">
            <div className="font-semibold">Toast surface</div>
            <div className="text-muted-foreground">shadow-pop with its inset hairline — one line, not two.</div>
          </div>
        </div>
      </section>

    </div>
  );
}

function CornerModal() {
  /* 모달은 포털에만 그려진다 — 크롤러(stories.vrt.spec · corners.spec)가 기다리는 `#storybook-root > *` 가 비지 않게 보이지 않는 앵커를 둔다. */
  return (
    <>
      <span className="sr-only">Modal open</span>
      <Modal open>
      <ModalContent size="sm">
        <ModalHeader title="Discard changes?" description="The corner is 16px × k with shadow-modal and its inset hairline." />
        <ModalBody>
          <p className="m-0 text-muted-foreground">The scrim clips nothing; the surface curve carries border, shadow and the hairline together.</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline">Keep editing</Button>
          <Button variant="solid" tone="destructive">
            Discard
          </Button>
        </ModalFooter>
      </ModalContent>
      </Modal>
    </>
  );
}

/* 스토리 id 는 export 이름에서 나온다(`foundations-corners--ladder`) — vrt/corners.spec.ts 가 그 id 로 연다. */
const meta = {
  title: "Foundations/Corners",
  component: CornerLadder,
  tags: ["!manifest"],
} satisfies Meta<typeof CornerLadder>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 사다리 견본 · K 후보 · 동심원 · 표 · 지원 배지 · 킬 스위치. */
export const Ladder: Story = {};
/** 실컴포넌트 — 포커스 링 · 카드 · 캔버스 위 툴바 · 선택된 MediaCard · Alert · 토스트 면 · 열린 드롭다운. */
export const Components: Story = { render: () => <CornerComponents /> };
/** 열린 모달 — xl 반경 + shadow-modal 헤어라인. */
export const ModalOpen: Story = { render: () => <CornerModal />, parameters: { layout: "fullscreen" } };
