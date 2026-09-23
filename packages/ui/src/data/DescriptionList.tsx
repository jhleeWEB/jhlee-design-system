import { cn } from "../cn";

/* 이름-값 목록 — 검사 패널의 기본 문장. 기존 `KeyValue`(shell.tsx)가 같은 일을 하지만
 * 그쪽은 `<table>` 이라 값이 길면 칸이 밀린다. 이쪽은 `<dl>` 격자라 좁은 패널에서 접힌다. */
export interface Row {
  k: React.ReactNode;
  v: React.ReactNode;
  /** 수치인가 — mono + tabular-nums + 우측 정렬. */
  numeric?: boolean;
  /** 「아직 확정이 아니다」. 값 옆에 점선 밑줄이 붙는다. */
  provisional?: boolean;
}

export function DescriptionList({
  rows,
  className,
  ...rest
}: { rows: readonly Row[] } & React.HTMLAttributes<HTMLDListElement>) {
  return (
    <dl
      data-slot="description-list"
      className={cn("grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 text-body", className)}
      {...rest}
    >
      {rows.map((row, i) => (
        <div key={i} className="contents">
          <dt className="min-w-0 truncate text-muted">{row.k}</dt>
          <dd
            className={cn(
              "m-0 min-w-0 text-right text-ink",
              row.numeric && "tnum",
              row.provisional && "underline decoration-dashed decoration-from-font underline-offset-2",
            )}
            title={row.provisional ? "To be verified" : undefined}
          >
            {row.v}
          </dd>
        </div>
      ))}
    </dl>
  );
}
