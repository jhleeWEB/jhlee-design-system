import { cn } from "../cn";
import { ScrollArea } from "../navigation/ScrollArea";
import { tableCellVariants, type CellTone } from "./Table.variants";

export type { CellTone } from "./Table.variants";

/* 표 — 이 제품에서 표는 대부분 **수치**다(원장 · 믹스 · 명세).
 * 그래서 숫자 칸은 우측 정렬 + mono + tabular-nums 가 기본이고, `<Td numeric>` 하나로 셋이 온다.
 *
 * radius 0 인 이유: 표는 캔버스 쪽 어휘다. 인쇄되고, 격자가 정보를 나른다.
 *
 * `data-slot` 은 `{...rest}` **뒤**에 둔다 — 앞에 두면 소비자가 넘긴 `data-slot` 이 선언을 덮어 소비자 CSS·테스트의 손잡이가 사라진다(C3 계약). */

/** `Table` 의 props — `<table>` 의 속성 전부. 가로로 넘치면 `ScrollArea` 가 스크롤을 맡는다. */
export type TableProps = React.ComponentProps<"table">;

/** 수치 표의 뿌리 — 가로 스크롤 영역 안의 `<table>`. `className`·`ref` 는 `<table>` 에 닿는다. */
export function Table({ className, ...rest }: TableProps) {
  return (
    <ScrollArea className="w-full max-w-full min-w-0" orientation="horizontal">
      <table
        className={cn("w-full border-collapse text-body text-foreground", className)}
        {...rest}
        data-slot="table"
      />
    </ScrollArea>
  );
}

/** 표 머리 구역(`<thead>`) — 옅은 면으로 본문과 가른다. */
export function Thead({ className, ...rest }: React.ComponentProps<"thead">) {
  return <thead className={cn("bg-muted", className)} {...rest} data-slot="table-header" />;
}

/** 표 본문 구역(`<tbody>`) — 행의 호버 면이 붙는 범위다. */
export function Tbody({ className, ...rest }: React.ComponentProps<"tbody">) {
  return <tbody className={cn(className)} {...rest} data-slot="table-body" />;
}

/** `Tr` 의 props. */
export interface TrProps extends React.ComponentProps<"tr"> {
  /**
   * 선택된 행 — `aria-selected` 로 나가고 강조 면(`bg-accent`)이 붙는다.
   * @default false
   */
  selected?: boolean;
}

/** 표 행(`<tr>`) — 본문 안에서만 호버 면이 붙는다. */
export function Tr({ className, selected, ...rest }: TrProps) {
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
      data-slot="table-row"
    />
  );
}

/** `Th` 의 props. */
export interface ThProps extends React.ComponentProps<"th"> {
  /**
   * 수치 열의 머리 — 본문 칸(`Td numeric`)과 같은 우측 정렬.
   * @default false
   */
  numeric?: boolean;
}

/** 열 머리 칸(`<th>`) — mono 대문자 라벨. `scope` 의 기본은 `col` 이다. */
export function Th({ className, numeric, ...rest }: ThProps) {
  return (
    <th
      scope={rest.scope ?? "col"}
      className={cn(
        "border-b border-border px-4 py-3 text-left align-bottom",
        "font-mono text-micro font-medium tracking-caps text-muted-foreground uppercase",
        numeric && "text-right",
        className,
      )}
      {...rest}
      data-slot="table-head"
      data-numeric={numeric ? "" : undefined}
    />
  );
}

/** `Td` 의 props. */
export interface TdProps extends Omit<React.ComponentProps<"td">, "tone"> {
  /**
   * 수치 칸 — 우측 정렬 + mono + tabular-nums(원칙 3).
   * @default false
   */
  numeric?: boolean;
  /**
   * 판정이 붙는 칸 — 음수 잔액처럼. 색만이 아니라 부호가 이미 말하므로 색은 보조다.
   *  - `neutral` — 판정 없음(본문 글자색)
   *  - `success` — 통과
   *  - `warning` — 주의
   *  - `destructive` — 실패
   */
  tone?: CellTone | undefined;
}

/** 표 본문 칸(`<td>`) — `numeric` · `tone` 축은 `tableCellVariants` 가 소유하고 `data-tone`(해석된 값)으로 찍힌다. */
export function Td({ className, numeric, tone, ...rest }: TdProps) {
  const resolved = tone ?? "neutral";
  return (
    <td
      className={cn("px-4 py-3", tableCellVariants({ numeric, tone: resolved }), className)}
      {...rest}
      data-slot="table-cell"
      /* `satisfies` 로 문자열 유니언임을 적는다 — 식별자만 넘기면 불리언 data 속성 래칫(boolean-string-data-attr)이 구별하지 못한다. */
      data-tone={resolved satisfies CellTone}
      data-numeric={numeric ? "" : undefined}
    />
  );
}
