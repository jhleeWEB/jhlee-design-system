"use client";
import { useId, useMemo, useState } from "react";

import { cn } from "../cn";
import { normalizeTone, type ToneInput } from "../lib/tone";
import { Skeleton } from "../feedback/Skeleton";
import { ScrollArea } from "../navigation/ScrollArea";
import type { CellTone } from "./Table";

/* 데이터 표 — 이 제품에서 표는 대부분 **명세서**다.
 * FSI 원장 · 세대 믹스 · 주차 명세 · 층별 집계. 그래서 일반 데이터 그리드와 요구가 다르다:
 *
 *   1. **합계 줄이 1급이다.** 명세서는 합계가 맞는지 보려고 읽는다. 그 줄이 본문과 같은
 *      모양이면 눈이 못 찾으므로 위 테두리를 두껍게 주고 배경을 바꾼다.
 *   2. **수치 칸은 예외 없이 우측 정렬 + mono + tabular-nums.** 자릿수가 어긋나면
 *      「합계가 맞는가」를 눈으로 검산할 수 없다 — 이 표의 존재 이유가 사라진다.
 *   3. **로딩 중에도 줄 높이가 같아야 한다.** 값이 도착할 때 표가 뛰면 읽던 줄을 잃는다.
 *   4. **radius 0.** 표는 캔버스 어휘다 — 인쇄되고, 격자가 정보를 나른다.
 *
 * 정렬은 한 열만 잡는다. 다중 정렬은 이 화면들에 필요했던 적이 없고, 있으면 「지금 무엇으로
 * 정렬돼 있나」를 사용자가 추적해야 한다. */

export interface Column<Row> {
  /** 이 열의 안정적인 키. 정렬 상태와 React key 에 쓴다. */
  key: string;
  header: React.ReactNode;
  /** 셀 내용. 없으면 `row[key]` 를 그대로 쓴다. */
  cell?: (row: Row, index: number) => React.ReactNode;
  /** 수치 열 — 우측 정렬 + mono + tabular-nums. */
  numeric?: boolean;
  /** 정렬에 쓸 값. 주면 그 열의 머리가 정렬 버튼이 된다. */
  sortValue?: (row: Row) => number | string;
  /** 판정색. 셀 단위로 다르면 함수로 준다. 옛 키 ok · warn · danger 는 한 마이너 동안 옮겨 준다. */
  tone?: (row: Row) => ToneInput<CellTone> | undefined;
  /** 고정 폭. 넘치면 표가 가로 스크롤된다. */
  width?: string;
  /** 합계 줄의 이 열 값. 없으면 빈 칸. */
  total?: React.ReactNode;
  /** 스크린리더용 열 설명 — 머리가 아이콘뿐일 때. */
  label?: string;
}

export interface DataTableProps<Row> {
  columns: readonly Column<Row>[];
  rows: readonly Row[];
  /** 각 행의 안정적인 키. */
  rowKey: (row: Row, index: number) => string;
  /** 표의 이름. 스크린리더가 읽고, `captionVisible` 이면 화면에도 보인다. */
  caption: string;
  captionVisible?: boolean;
  /** 선택된 행의 키. 캔버스 선택과 연동하는 자리다. */
  selectedKey?: string | undefined;
  onSelect?: ((key: string, row: Row) => void) | undefined;
  /** 합계 줄을 그린다 — `columns[].total` 이 하나라도 있으면 자동으로 켜진다. */
  totalLabel?: string;
  /** 값이 아직 없다. 줄 높이를 유지한 스켈레톤을 그린다. */
  loading?: boolean;
  loadingRows?: number;
  /** 행이 없을 때. 「없다」가 아니라 「무엇을 하면 채워지는가」를 적는다. */
  empty?: React.ReactNode;
  /** 머리를 스크롤 위에 고정한다. 긴 명세서에서 열 이름을 잃지 않는다. */
  stickyHeader?: boolean;
  className?: string;
}

type SortState = { key: string; dir: "asc" | "desc" } | null;

/* 셀 안의 편집·이동 동작이 행 선택까지 일으키면 앱의 캔버스 선택이 의도치 않게 바뀐다. */
const ROW_CONTROL =
  'a[href], button, input, label, select, textarea, summary, [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="switch"], [contenteditable]:not([contenteditable="false"]), [tabindex]:not([tabindex="-1"])';

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  caption,
  captionVisible,
  selectedKey,
  onSelect,
  totalLabel = "Total",
  loading,
  loadingRows = 4,
  empty,
  stickyHeader,
  className,
}: DataTableProps<Row>) {
  const [sort, setSort] = useState<SortState>(null);
  const selectionGroup = useId();

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) return rows;
    const read = column.sortValue;
    const sign = sort.dir === "asc" ? 1 : -1;
    /* 원본 배열을 건드리지 않는다 — 호출처가 같은 배열을 다른 곳에서도 쓴다. */
    return [...rows].sort((a, b) => {
      const av = read(a);
      const bv = read(b);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * sign;
      return String(av).localeCompare(String(bv)) * sign;
    });
  }, [rows, sort, columns]);

  const hasTotals = columns.some((c) => c.total !== undefined);

  function toggleSort(key: string) {
    setSort((current) => {
      if (!current || current.key !== key) return { key, dir: "asc" };
      if (current.dir === "asc") return { key, dir: "desc" };
      /* 세 번째 누르면 정렬을 **푼다**. 원래 순서가 의미를 갖는 표(층 순서·동 순서)에서
         그 순서로 돌아갈 방법이 없으면 사용자가 새로고침을 하게 된다. */
      return null;
    });
  }

  const cellPad = "px-3 py-2";

  return (
    <div
      data-slot="data-table"
      className={cn("flex min-h-0 w-full max-w-full min-w-0 flex-col overflow-hidden", className)}
    >
      <ScrollArea className="min-h-0 flex-auto" orientation="both">
        <table className="w-full border-collapse text-body text-foreground">
          <caption
            className={cn(
              "text-left",
              captionVisible
                ? "px-3 pb-2 text-label text-muted-foreground"
                : "sr-only absolute size-px overflow-hidden",
            )}
          >
            {caption}
          </caption>
          <thead className={cn("bg-muted", stickyHeader && "sticky top-0 z-raised")}>
            <tr>
              {columns.map((column) => {
                const active = sort?.key === column.key;
                const ariaSort = !column.sortValue
                  ? undefined
                  : active
                    ? sort.dir === "asc"
                      ? ("ascending" as const)
                      : ("descending" as const)
                    : ("none" as const);
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={ariaSort}
                    style={column.width === undefined ? undefined : { width: column.width }}
                    className={cn(
                      "border-b border-border align-bottom",
                      "font-mono text-micro font-normal tracking-caps text-muted-foreground uppercase",
                      column.numeric ? "text-right" : "text-left",
                      column.sortValue ? "p-0" : cellPad,
                    )}
                  >
                    {column.sortValue ? (
                      <button
                        data-slot="table-sort"
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        aria-label={column.label ?? undefined}
                        className={cn(
                          "font-inherit appearance-none border-0 bg-transparent text-inherit",
                          "flex w-full cursor-pointer items-end gap-1",
                          cellPad,
                          column.numeric ? "justify-end" : "justify-start",
                          "hover:text-foreground focus-visible:focus-ring focus-visible:outline-none",
                          active && "text-foreground",
                        )}
                      >
                        {column.header}
                        {/* 화살표는 **정렬된 열에만** 나온다. 모든 열에 흐린 화살표를 두면
                          「무엇으로 정렬돼 있나」가 한눈에 안 보인다. */}
                        {active ? (
                          <svg viewBox="0 0 10 10" aria-hidden="true" className="size-2.5 shrink-0">
                            <path
                              d={sort.dir === "asc" ? "M5 1.5L8.5 7h-7z" : "M5 8.5L1.5 3h7z"}
                              fill="currentColor"
                            />
                          </svg>
                        ) : null}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {loading
              ? Array.from({ length: loadingRows }, (_, i) => (
                  <tr key={`sk-${i}`} className="border-b border-border last:border-b-0">
                    {columns.map((column) => (
                      <td key={column.key} className={cellPad}>
                        {/* 값이 올 자리와 **같은 높이**. 다르면 도착하는 순간 표가 뛴다. */}
                        <Skeleton
                          h={14}
                          w={column.numeric ? "60%" : "80%"}
                          className={column.numeric ? "ml-auto" : ""}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              : sorted.map((row, index) => {
                  const key = rowKey(row, index);
                  const selected = selectedKey !== undefined && key === selectedKey;
                  return (
                    <tr
                      key={key}
                      data-selected={onSelect ? selected : undefined}
                      onClick={
                        onSelect
                          ? (event) => {
                              if (
                                event.defaultPrevented ||
                                (event.target instanceof Element && event.target.closest(ROW_CONTROL))
                              )
                                return;
                              onSelect(key, row);
                            }
                          : undefined
                      }
                      className={cn(
                        "border-b border-border last:border-b-0",
                        onSelect && "cursor-pointer hover:bg-muted",
                        selected && "bg-accent hover:bg-accent",
                      )}
                    >
                      {columns.map((column, columnIndex) => {
                        const tone = normalizeTone(column.tone?.(row));
                        const content = column.cell
                          ? column.cell(row, index)
                          : ((row as Record<string, unknown>)[column.key] as React.ReactNode);
                        return (
                          <td
                            key={column.key}
                            className={cn(
                              cellPad,
                              "align-middle",
                              column.numeric && "text-right tnum",
                              tone === "success" && "text-success",
                              tone === "warning" && "text-warning",
                              tone === "destructive" && "text-destructive",
                            )}
                          >
                            {onSelect && columnIndex === 0 ? (
                              <div className={cn("flex items-center gap-2", column.numeric && "justify-end")}>
                                {/* 선택은 네이티브 radio가 맡고 임의 셀 내용은 형제로 남겨 중첩 버튼을 만들지 않는다. */}
                                <input
                                  data-slot="table-row-select"
                                  type="radio"
                                  name={selectionGroup}
                                  value={key}
                                  checked={selected}
                                  aria-label={`Select row ${key}`}
                                  onChange={() => onSelect(key, row)}
                                  className="m-0 size-4 shrink-0 cursor-pointer accent-primary focus-visible:focus-ring focus-visible:outline-none"
                                />
                                {content}
                              </div>
                            ) : (
                              content
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

            {!loading && sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  {empty ?? (
                    <div className="px-3 py-8 text-center text-body text-muted-foreground">No rows.</div>
                  )}
                </td>
              </tr>
            ) : null}
          </tbody>

          {hasTotals && !loading && sorted.length > 0 ? (
            <tfoot>
              <tr className="border-t-2 border-border-strong bg-muted font-medium">
                {columns.map((column, i) => (
                  <td key={column.key} className={cn(cellPad, column.numeric && "text-right tnum")}>
                    {column.total ?? (i === 0 ? totalLabel : null)}
                  </td>
                ))}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </ScrollArea>
    </div>
  );
}
