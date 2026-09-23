import { cn } from "../cn";
import { ScrollArea } from "../navigation/ScrollArea";

/* 표 — 이 제품에서 표는 대부분 **수치**다(FSI 원장 · 세대 믹스 · 주차 명세).
 * 그래서 숫자 칸은 우측 정렬 + mono + tabular-nums 가 기본이고, `<Td numeric>` 하나로 셋이 온다.
 *
 * radius 0 인 이유: 표는 캔버스 쪽 어휘다. 인쇄되고, 격자가 정보를 나른다. */
export function Table({ className, ...rest }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <ScrollArea className="min-w-0 w-full max-w-full" orientation="horizontal">
      <table
        data-slot="table"
        className={cn("w-full border-collapse text-body text-ink", className)}
        {...rest}
      />
    </ScrollArea>
  );
}

export function Thead({ className, ...rest }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-surface-2", className)} {...rest} />;
}

export function Tbody({ className, ...rest }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...rest} />;
}

export function Tr({
  className,
  selected,
  ...rest
}: React.HTMLAttributes<HTMLTableRowElement> & { selected?: boolean }) {
  return (
    <tr
      aria-selected={selected}
      className={cn(
        "border-b border-line last:border-b-0",
        "aria-selected:bg-accent-soft",
        "[tbody_&:hover]:bg-surface-2 [tbody_&[aria-selected=true]:hover]:bg-accent-soft",
        className,
      )}
      {...rest}
    />
  );
}

export function Th({
  className,
  numeric,
  ...rest
}: React.ThHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <th
      scope={rest.scope ?? "col"}
      className={cn(
        "border-b border-line px-4 py-3 text-left align-bottom",
        "font-mono text-micro font-normal uppercase tracking-caps text-muted",
        numeric && "text-right",
        className,
      )}
      {...rest}
    />
  );
}

export function Td({
  className,
  numeric,
  tone,
  ...rest
}: React.TdHTMLAttributes<HTMLTableCellElement> & {
  numeric?: boolean;
  /** 판정이 붙는 칸 — 음수 잔액처럼. 색만이 아니라 부호가 이미 말하므로 색은 보조다. */
  tone?: "ok" | "warn" | "danger";
}) {
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle",
        numeric && "tnum text-right",
        tone === "ok" && "text-ok",
        tone === "warn" && "text-warn",
        tone === "danger" && "text-danger",
        className,
      )}
      {...rest}
    />
  );
}
