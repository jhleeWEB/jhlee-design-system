import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";

import {
  Alert,
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

/* Foundations/Radius — 반경 사다리 시트.
 * 모서리는 일반 `border-radius` 원호다. 스쿼클 시트(Foundations/Corners, #26)는 2026-09-30 사용자 결정으로 폐기했다(#36) — Chromium 에서
 * 초타원의 안쪽 윤곽 간격 때문에 1px 테두리가 모서리에서 두꺼워 보였다. 이 시트는 사다리 견본 · 동심원 · 실컴포넌트만 보인다.
 * 역할 → 단(어느 컴포넌트가 어느 반경인가)의 정본 견본은 Foundations/Roles 다(#80). */

const STEPS = [
  { step: "xs", token: "--radius-xs", base: 4, role: "Checkbox — small marks up to 16px" },
  { step: "sm", token: "--radius-sm", base: 6, role: "Badge · chip · kbd · skeleton" },
  {
    step: "md",
    token: "--radius-md",
    base: 8,
    role: "Button · input · select · segmented track · menu item",
  },
  {
    step: "lg",
    token: "--radius-lg",
    base: 12,
    role: "Card · alert · toast · popover · menu · tooltip · legend",
  },
  { step: "xl", token: "--radius-xl", base: 16, role: "Modal · drawer" },
  { step: "full", token: "--radius-full", base: 9999, role: "Radio · switch · status dot · pill" },
] as const;
type Step = (typeof STEPS)[number]["step"];
/* 정적 문자열이어야 Tailwind 가 굽는다 — 템플릿으로 조립하면 클래스가 CSS 에 없다. */
const ROUNDED: Record<Step, string> = {
  xs: "rounded-xs",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

function Specimen({ step, label }: { step: Step; label: string }) {
  return (
    <figure className="m-0 flex flex-col items-start gap-2">
      <div data-radius-specimen={step} className={`size-24 bg-primary ${ROUNDED[step]}`} />
      <figcaption className="font-mono text-micro text-muted-foreground">{label}</figcaption>
    </figure>
  );
}

function CornerLadder() {
  const [computed, setComputed] = useState<Record<string, string>>({});
  useEffect(() => {
    /* 측정은 다음 프레임에 — 스타일 재계산이 끝난 뒤의 값이어야 하고, effect 본문의 동기 setState 는 연쇄 렌더다. */
    const frame = requestAnimationFrame(() => {
      const next: Record<string, string> = {};
      for (const el of document.querySelectorAll<HTMLElement>("[data-radius-specimen]"))
        next[el.dataset.radiusSpecimen ?? ""] = getComputedStyle(el).borderTopLeftRadius;
      setComputed(next);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex flex-col gap-8 font-sans text-body text-foreground">
      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-title font-semibold">Ladder — 96 × 96 specimens</h2>
        <div className="flex flex-wrap items-end gap-8">
          {STEPS.map((s) => (
            <Specimen key={s.step} step={s.step} label={`${s.token} · ${computed[s.step] ?? ""}`} />
          ))}
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
              <Th>Value (px)</Th>
              <Th>Computed here</Th>
              <Th>Role</Th>
            </Tr>
          </Thead>
          <Tbody>
            {STEPS.map((s) => (
              <Tr key={s.step}>
                <Td className="font-mono">{s.token}</Td>
                <Td className="font-mono">{s.base}</Td>
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
        <figcaption className="font-mono text-micro text-muted-foreground">
          segmented · md track − p-1 → calc(var(--radius-md) − spacing)
        </figcaption>
      </figure>
      <figure className="m-0 flex flex-col items-start gap-2">
        <div className="rounded-lg bg-primary-track p-1">
          <div className="h-ctl w-rail rounded-[calc(var(--radius-lg)-var(--spacing))] bg-card shadow-chip" />
        </div>
        <figcaption className="font-mono text-micro text-muted-foreground">
          bare pair · lg − p-1 → calc(var(--radius-lg) − spacing)
        </figcaption>
      </figure>
      <figure className="m-0 flex flex-col items-start gap-2">
        <div className="rounded-lg border border-border bg-card p-2 shadow-pop">
          <div className="rounded-md bg-muted px-3 py-2">item · rounded-md (8px)</div>
          <div className="rounded-[calc(var(--radius-lg)-var(--spacing)*2)] bg-muted px-3 py-2">
            item · lg − p-2 (concentric: 4px)
          </div>
        </div>
        <figcaption className="font-mono text-micro text-muted-foreground">
          dropdown item candidates inside a lg surface with p-2
        </figcaption>
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
          <p className="m-0 text-muted-foreground">
            Shadow follows the curve; no hairline doubles the border.
          </p>
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
          Tinted surface, border and text — no side band.
        </Alert>
        <Alert tone="success" title="Saved">
          The border is the tone at 25% over its soft surface.
        </Alert>
        <div className={toastVariants({ tone: "success" })}>
          <div className="min-w-0 flex-1">
            <div className="font-semibold">Toast surface</div>
            <div className="text-muted-foreground">
              shadow-pop with its inset hairline — one line, not two.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CornerModal() {
  /* 모달은 포털에만 그려진다 — 크롤러(stories.vrt.spec)가 기다리는 `#storybook-root > *` 가 비지 않게 보이지 않는 앵커를 둔다. */
  return (
    <>
      <span className="sr-only">Modal open</span>
      <Modal open>
        <ModalContent size="sm">
          <ModalHeader
            title="Discard changes?"
            description="The corner is 16px with shadow-modal and its inset hairline."
          />
          <ModalBody>
            <p className="m-0 text-muted-foreground">
              The scrim clips nothing; the surface curve carries border, shadow and the hairline together.
            </p>
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

const meta = {
  title: "Foundations/Radius",
  component: CornerLadder,
  tags: ["!manifest"],
} satisfies Meta<typeof CornerLadder>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 사다리 견본 · 동심원 · 표. */
export const Ladder: Story = {};
/** 실컴포넌트 — 포커스 링 · 카드 · 캔버스 위 툴바 · 선택된 MediaCard · Alert · 토스트 면 · 열린 드롭다운. */
export const Components: Story = {
  render: () => <CornerComponents />,
  // aria-hidden-focus: 열린 드롭다운의 Radix 포커스 가드(aria-hidden 트리 안 tabindex 0)는 Radix 의 것이다
  parameters: {
    a11y: {
      config: {
        rules: [{ id: "aria-hidden-focus", enabled: false }],
      },
    },
  },
};
/** 열린 모달 — xl 반경 + shadow-modal 헤어라인. */
export const ModalOpen: Story = { render: () => <CornerModal />, parameters: { layout: "fullscreen" } };
