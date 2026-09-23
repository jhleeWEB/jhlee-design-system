import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useDesignSystem } from "./design-system";
import { Card, CardHeader, CardWell, type CardProps } from "./primitives/Card";
import { Badge } from "./primitives/Badge";
import { Button } from "./primitives/Button";
import { ScrollArea } from "./navigation/ScrollArea";
import { Accordion, AccordionItem, AccordionHeader, AccordionTrigger, AccordionContent } from "./navigation/Accordion";

function canRestorePanelFocus(element: HTMLElement) {
  if (element.closest('[inert], [hidden], [aria-hidden="true"]') || element.matches(':disabled')) return false;
  // 겹쳐 보관하는 뷰어의 버튼보다 현재 화면의 복원 버튼을 고른다.
  for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
    const style = getComputedStyle(ancestor);
    if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") return false;
  }
  return true;
}

/**
 * 3열 작업대 셸 — 좌 파라미터 · 중 뷰어 · 우 검사.
 *
 * 이 배치가 공유되는 이유는 취향이 아니라 작업 흐름이다. 설계 도구를 쓰는 사람은 왼쪽에서
 * 다이얼을 돌리고, 가운데서 결과를 보고, 오른쪽에서 왜 그렇게 됐는지 캔다. 셋이 동시에
 * 보여야 한 번의 조작이 무엇을 바꿨는지 읽힌다.
 *
 * 여기 있는 것은 전부 **DataCenter 화면에서 이미 돌던 구조**다. FulfillmentCenter 와
 * Kaufland 가 같은 것을 각자 다시 그리고 있어서(각각 flex/grid, `<details>`/`aria-expanded`)
 * 소유자를 하나로 옮겼다. 도메인 색과 배치 객체 종류는 여기 두지 않는다 — 앱이 얹는다.
 */
export function AppShell({
  topbar,
  parameters,
  viewer,
  inspect,
  inspectOpen = true,
  inspectId,
  inspectCollapseTo = "hidden",
}: {
  topbar: ReactNode;
  parameters: ReactNode;
  viewer: ReactNode;
  /** 좁은 화면에서 숨는다. **검사 패널에만 있는 정보는 두지 않는다** — 판정은 HUD 에도 나와야 한다. */
  inspect?: ReactNode;
  /** 검사 패널의 열림 상태. 닫힌 열의 폭은 inspectCollapseTo에 따른다. */
  inspectOpen?: boolean;
  /** 외부 접기 버튼의 aria-controls와 연결한다. */
  inspectId?: string;
  /** DS 검사 카드를 닫아도 복원 막대와 간격을 남긴다. 기본값은 기존 열 숨김이다. */
  inspectCollapseTo?: "hidden" | "strip";
}) {
  const ds = useDesignSystem();
  const open = inspectOpen && inspect !== undefined;
  const strip = ds && inspect !== undefined && inspectCollapseTo === "strip";
  const generatedId = useId();
  const contentId = inspectId ?? generatedId;
  const shellRef = useRef<HTMLDivElement>(null);
  const inspectRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    // 막대 모드에서는 내부 Card가 본문 접근성과 복원 버튼 포커스를 함께 소유한다.
    if (strip || open || !inspectRef.current?.contains(document.activeElement)) return;
    const trigger = Array.from(shellRef.current?.querySelectorAll<HTMLElement>('[aria-controls]') ?? [])
      .find(element => element.getAttribute('aria-controls') === contentId && !inspectRef.current?.contains(element) && canRestorePanelFocus(element));
    (trigger ?? shellRef.current)?.focus();
  }, [open, contentId, strip]);
  return (
    <div ref={shellRef} className="app-shell" data-design-system={ds || undefined} tabIndex={-1}>
      {topbar}
      <div className={`workspace${open ? "" : " inspect-closed"}`} data-inspect-collapse={ds ? (strip ? "strip" : "hidden") : undefined}>
        {parameters}
        {viewer}
        {ds ? inspect !== undefined && <div ref={inspectRef} id={contentId} className="ds-inspect-slot" data-open={open} inert={!open && !strip} aria-hidden={!open && !strip}>{inspect}</div> : open ? inspect : null}
      </div>
    </div>
  );
}

/** 상단 바. `children` 은 왼쪽 정렬 뒤 오른쪽으로 밀린다. */
export function TopBar({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children?: ReactNode;
}) {
  const ds = useDesignSystem();
  return (
    <header className="topbar" data-design-system={ds || undefined}>
      <h1>{title}</h1>
      {eyebrow === undefined ? null : <span className="eyebrow">{eyebrow}</span>}
      <span className="topbar-spacer" />
      {children}
    </header>
  );
}

/**
 * 상태 배지 — 색과 **텍스트를 함께** 낸다.
 *
 * 룰셋이 잠정인데 화면 어디에도 그 사실이 없으면 잠정값에서 나온 결과가 확정처럼 읽힌다.
 * 색만으로 알리면 흑백 인쇄와 색각 이상에서 그 경고가 사라진다.
 */
export function StatusBadge({ label }: { label: string }) {
  const ds = useDesignSystem();
  if (ds) return <Badge tone="warn" provisional dot className="max-w-full whitespace-normal break-words">{label}</Badge>;
  return (
    <span className="rule-status">
      <i className="status-dot" aria-hidden="true" />
      {label}
    </span>
  );
}

export function Panel({
  title,
  eyebrow,
  variant = "control",
  actions,
  titleHidden = false,
  scrollable = true,
  children,
  ...collapse
}: {
  title: string;
  eyebrow?: string;
  /** `inspect` 는 우측 검사 패널 — 좁은 화면에서 숨는 쪽이다. */
  variant?: "control" | "inspect";
  /** 머리 오른쪽의 버튼들(닫기 등). */
  actions?: ReactNode;
  /**
   * 제목을 화면에서 뺀다 — **이름은 남는다**(`aside[aria-label]`). 그 칸이 무엇인지 자리와 내용으로 이미 아는
   * 패널에서 제목 줄은 한 줄을 통째로 쓰면서 아무것도 말하지 않는다. 머리에 들 것이 하나도 없으면 머리 자체를
   * 그리지 않는다 — 빈 막대를 남기면 자리를 돌려준 것이 아니다.
   */
  titleHidden?: boolean;
  /** 고정 바닥과 별도 스크롤 본문을 가진 패널은 직접 스크롤 영역을 배치한다. */
  scrollable?: boolean;
  children: ReactNode;
} & Pick<CardProps, "collapsed" | "onCollapsedChange" | "collapseTo" | "collapsedLabel" | "collapsedSignal" | "side">) {
  const ds = useDesignSystem();
  const head = !titleHidden || eyebrow !== undefined || actions !== undefined;
  if (ds) return (
    <Card className={`panel panel-${variant}`} role="complementary" aria-label={title} data-design-system {...collapse}>
      {head ? <CardHeader variant="panel" headingLevel={2} className="panel-head" title={titleHidden ? undefined : title} meta={eyebrow}>
        {actions === undefined ? null : <span className="panel-actions">{actions}</span>}
      </CardHeader> : null}
      {scrollable ? <ScrollArea className="ds-panel-scroll" orientation="vertical">{children}</ScrollArea> : children}
    </Card>
  );
  return (
    <aside className={`panel panel-${variant}`} aria-label={title}>
      {head ? (
        <div className="panel-head">
          {titleHidden ? null : <h2>{title}</h2>}
          {eyebrow === undefined ? null : <span className="eyebrow">{eyebrow}</span>}
          {actions === undefined ? null : <span className="panel-actions">{actions}</span>}
        </div>
      ) : null}
      {children}
    </aside>
  );
}

/**
 * 접히는 파라미터 그룹.
 *
 * `echo` 는 그룹 머리에 **그 그룹이 지금 만들어내는 값**을 되비친다. 접힌 상태에서도 무엇이
 * 걸려 있는지 보이고, 다이얼을 움직였을 때 눈이 따라갈 자리가 생긴다.
 */
export function PanelGroup({
  title,
  echo,
  open = true,
  children,
}: {
  title: string;
  echo?: ReactNode;
  open?: boolean;
  children: ReactNode;
}) {
  const ds = useDesignSystem();
  const [expanded, setExpanded] = useState(open);
  useEffect(() => setExpanded(open), [open]);
  if (ds) return (
    <Accordion type="single" collapsible value={expanded ? "section" : ""} onValueChange={value => setExpanded(value === "section")}>
      <AccordionItem value="section" className="ds-panel-group">
        <AccordionHeader>
          <AccordionTrigger title={`${expanded ? "Collapse" : "Expand"} ${title}`} aria-label={title}>
            <span className="ds-panel-group-title">{title}</span>
            {echo === undefined ? null : <span className="ds-panel-group-meta" title={typeof echo === "string" ? echo : undefined}>{echo}</span>}
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent contentClassName="group-body">{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
  return (
    <details className="group" open={open}>
      <summary>
        {title}
        {echo === undefined ? null : <span className="echo">{echo}</span>}
      </summary>
      <div className="group-body">{children}</div>
    </details>
  );
}

/**
 * 라벨 + 값 + 계약 경로.
 *
 * `path` 를 화면에 적는 이유는 **화면 이름과 계약 이름이 갈리면 근거를 되짚을 수 없기**
 * 때문이다. "이격거리"가 `site.setbackM` 이라는 사실이 화면에 있어야 값이 이상할 때 어느
 * 필드를 봐야 하는지 바로 안다.
 */
export function Field({
  label,
  value,
  path,
  children,
}: {
  label: string;
  value?: ReactNode;
  path?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="field">
      <div className="label">
        <span>{label}</span>
        {value === undefined ? null : <span className="val">{value}</span>}
      </div>
      {children}
      {path === undefined ? null : <span className="path">{path}</span>}
    </div>
  );
}

/** 뷰어 칸 — 머리(뷰 전환 등)와 캔버스를 세로로 나눈다. */
export function ViewerPanel({ head, children }: { head?: ReactNode; children: ReactNode }) {
  const ds = useDesignSystem();
  if (ds) return (
    <Card className="viewer-panel" role="region" aria-label="Viewer" data-design-system>
      {head === undefined ? null : <CardHeader className="viewer-head">{head}</CardHeader>}
      <CardWell className="viewer">{children}</CardWell>
    </Card>
  );
  return (
    <section className="viewer-panel" aria-label="Viewer">
      {head === undefined ? null : <div className="viewer-head">{head}</div>}
      <div className="viewer">{children}</div>
    </section>
  );
}

/** 판정 — 이 셋 말고 색을 늘리지 않는다(디자인 원칙 2). */
export type Verdict = "ok" | "warn" | "danger";

/**
 * 캔버스 위 지표 한 칸.
 *
 * `verdict` 가 색을 붙이지만 **색이 유일한 신호가 되지 않게** 라벨과 단위를 항상 함께 낸다.
 */
export function HudCell({
  k,
  v,
  u,
  verdict,
}: {
  k: string;
  v: ReactNode;
  u?: string;
  verdict?: Verdict;
}) {
  return (
    <div className="hud-cell" data-verdict={verdict}>
      <div className="k">{k}</div>
      <div className="v">
        {v}
        {u === undefined ? null : <span className="u"> {u}</span>}
      </div>
    </div>
  );
}

/** 캔버스 위 지표 줄. `role="status"` 로 값이 바뀌면 스크린리더가 읽는다. */
export function Hud({ children }: { children: ReactNode }) {
  const ds = useDesignSystem();
  if (ds) return <Card className="hud" role="status" data-design-system>{children}</Card>;
  return (
    <div className="hud" role="status">
      {children}
    </div>
  );
}

export function Legend({ items }: { items: readonly { color: string; label: string }[] }) {
  return (
    <div className="legend">
      {items.map((item) => (
        <div key={item.label}>
          <i style={{ background: item.color }} aria-hidden="true" />
          {item.label}
        </div>
      ))}
    </div>
  );
}

/** 이름–값 목록. 수치는 mono + tabular-nums 로 흐른다(디자인 원칙 3). */
export function KeyValue({ rows }: { rows: readonly { k: string; v: ReactNode }[] }) {
  return (
    <dl className="kv">
      {rows.map((row) => (
        <div key={row.k}>
          <dt>{row.k}</dt>
          <dd>{row.v}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * 패널 전환 탭.
 *
 * `Segmented` 와 갈라 두는 이유는 접근성 의미가 다르기 때문이다. 이쪽은 **보이는 패널을
 * 바꾸므로** `tablist`/`tab`/`aria-selected` 가 맞고, 값 하나를 고르는 것은 `Segmented`다.
 * 하나로 합치면 둘 중 한쪽의 의미가 틀어진다.
 */
export function Tabs<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const ds = useDesignSystem();
  return (
    <div className="tabs" role="tablist" aria-label={label} data-design-system={ds || undefined} onKeyDown={event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const index = options.findIndex(option => option.value === value);
      const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + options.length) % options.length;
      const option = options[next];
      if (!option) return;
      onChange(option.value);
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
    }}>
      {options.map((option) => (
        ds ? <Button
          key={option.value} type="button" role="tab" size="sm" variant="ghost"
          aria-selected={option.value === value} tabIndex={option.value === value ? 0 : -1}
          onClick={() => onChange(option.value)}>{option.label}</Button> : <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          tabIndex={option.value === value ? 0 : -1}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
