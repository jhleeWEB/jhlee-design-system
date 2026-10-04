import { cn, type VariantProps } from "../cn";
import { ScrollArea } from "../navigation/ScrollArea";
import { tableCaptionVariants, tableCellVariants, tableHeadVariants, type CellTone } from "./Table.variants";

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

/* 합계 구역. 명세서는 «합계가 맞는가» 를 보려고 읽는다 — 그 줄이 본문과 같은 모양이면 눈이 못 찾으므로 위 경계를 두껍게, 면을 옅게, 글자를 굵게 한다.
   `DataTable` 의 합계 줄과 같은 모양이다(#108) — 합성 표에서 합계 줄이 둘 이상이어도 같은 어휘로 선다. 안의 `Tr` 은 호버 면이 없다(호버는 tbody 안에서만 붙는다). */
/** 표 합계 구역(`<tfoot>`) — 두꺼운 위 경계 · 옅은 면 · 굵은 글자. 합계 줄(`Tr`)을 하나 이상 담는다. */
export function Tfoot({ className, ...rest }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      className={cn("border-t-2 border-border-strong bg-muted font-medium", className)}
      {...rest}
      data-slot="table-footer"
    />
  );
}

type CaptionSide = NonNullable<VariantProps<typeof tableCaptionVariants>["side"]>;

/** `TableCaption` 의 props — `<caption>` 속성 전부(ref 포함) + `side` · `visuallyHidden`. */
export interface TableCaptionProps extends React.ComponentProps<"caption"> {
  /**
   * 캡션이 서는 쪽.
   *  - `top` — 표 위
   *  - `bottom` — 표 아래(출처 · 주석)
   * @default "top"
   */
  side?: CaptionSide | undefined;
  /**
   * 화면에서 숨기고 스크린리더만 읽는다 — 보이는 제목이 따로 있을 때도 표의 이름은 남긴다.
   * @default false
   */
  visuallyHidden?: boolean;
}

/** 표의 이름(`<caption>`) — 스크린리더가 표에 들어설 때 읽는다. `Table` 의 **첫 자식**으로 둔다(HTML 규칙). */
export function TableCaption({ className, side, visuallyHidden = false, ...rest }: TableCaptionProps) {
  const resolvedSide = side ?? "top";
  return (
    <caption
      className={cn(tableCaptionVariants({ side: resolvedSide, visuallyHidden }), className)}
      {...rest}
      data-slot="table-caption"
      data-side={resolvedSide satisfies CaptionSide}
      data-visually-hidden={visuallyHidden ? "" : undefined}
    />
  );
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

type HeadVariant = NonNullable<VariantProps<typeof tableHeadVariants>["variant"]>;

/** `Th` 의 props. */
export interface ThProps extends React.ComponentProps<"th"> {
  /**
   * 글자 역할.
   *  - `label` — 메타 라벨(mono 대문자 · 흐린 글자 · 아래 구분선). 열 머리
   *  - `text` — 본문 글자(`text-body font-medium`). `scope="row"` 인 줄 머리 — 줄의 이름을 본문처럼 읽힌다
   * @default "label"
   */
  variant?: HeadVariant | undefined;
  /**
   * 수치 열의 머리 — 본문 칸(`Td numeric`)과 같은 우측 정렬.
   * @default false
   */
  numeric?: boolean;
}

/** 머리 칸(`<th>`) — 열 머리는 mono 대문자 라벨, 줄 머리는 `variant="text"` 로 본문 글자. `scope` 의 기본은 `col` 이다. */
export function Th({ className, variant, numeric, ...rest }: ThProps) {
  const resolved = variant ?? "label";
  return (
    <th
      scope={rest.scope ?? "col"}
      className={cn(tableHeadVariants({ variant: resolved, numeric }), className)}
      {...rest}
      data-slot="table-head"
      data-variant={resolved satisfies HeadVariant}
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
