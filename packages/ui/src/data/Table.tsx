import { cn } from "../cn";
import { normalizeTone, type ToneInput } from "../lib/tone";
import { ScrollArea } from "../navigation/ScrollArea";

/** 표 칸의 판정 톤 — 셀은 «통과 · 주의 · 실패» 만 말한다. */
export type CellTone = "success" | "warning" | "destructive";

/* 표 — 이 제품에서 표는 대부분 **수치**다(FSI 원장 · 세대 믹스 · 주차 명세).
 * 그래서 숫자 칸은 우측 정렬 + mono + tabular-nums 가 기본이고, `<Td numeric>` 하나로 셋이 온다.
 *
 * radius 0 인 이유: 표는 캔버스 쪽 어휘다. 인쇄되고, 격자가 정보를 나른다. */
export function Table({ className, ...rest }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <ScrollArea className="min-w-0 w-full max-w-full" orientation="horizontal">
      <table
        data-slot="table"
        className={cn("w-full border-collapse text-body text-foreground", className)}
        {...rest}
      />
    </ScrollArea>
  );
}

export function Thead({ className, ...rest }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-muted", className)} {...rest} />;
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
        "border-b border-border last:border-b-0",
        "aria-selected:bg-accent",
        "[tbody_&:hover]:bg-muted [tbody_&[aria-selected=true]:hover]:bg-accent",
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
        "border-b border-border px-4 py-3 text-left align-bottom",
        "font-mono text-micro font-normal uppercase tracking-caps text-muted-foreground",
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
  /** 판정이 붙는 칸 — 음수 잔액처럼. 색만이 아니라 부호가 이미 말하므로 색은 보조다. 옛 키 ok · warn · danger 는 한 마이너 동안 옮겨 준다. */
  tone?: ToneInput<CellTone>;
}) {
  const resolved = normalizeTone(tone);
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle",
        numeric && "tnum text-right",
        resolved === "success" && "text-success",
        resolved === "warning" && "text-warning",
        resolved === "destructive" && "text-destructive",
        className,
      )}
      {...rest}
    />
  );
}
