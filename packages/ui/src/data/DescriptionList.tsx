import { cn } from "../cn";

/* 이름-값 목록 — 검사 패널의 기본 문장. 기존 `KeyValue`(shell.tsx)가 같은 일을 하지만
 * 그쪽은 `<table>` 이라 값이 길면 칸이 밀린다. 이쪽은 `<dl>` 격자라 좁은 패널에서 접힌다. */

/** 이름-값 한 줄. */
export interface Row {
  /** 이름(`<dt>`). 넘치면 말줄임한다. */
  k: React.ReactNode;
  /** 값(`<dd>`). 우측 정렬. */
  v: React.ReactNode;
  /**
   * 수치인가 — mono + tabular-nums(원칙 3).
   * @default false
   */
  numeric?: boolean;
  /**
   * 「아직 확정이 아니다」. 값에 점선 밑줄이 붙고 `provisionalLabel` 이 툴팁(`title`)으로 붙는다.
   * @default false
   */
  provisional?: boolean;
}

/** `DescriptionList` 의 props — `<dl>` 의 속성 전부와 줄 목록. */
export interface DescriptionListProps extends React.ComponentProps<"dl"> {
  /** 이름-값 줄들. 순서대로 그린다. */
  rows: readonly Row[];
  /**
   * 잠정 값(`provisional`)의 툴팁 문구. 제품 어휘(예: 검증 대기)는 앱이 넘긴다 — 디자인 시스템은 도메인을 모른다.
   * @default "Provisional"
   */
  provisionalLabel?: string;
}

/** 이름-값 목록(`<dl>` 격자) — 이름은 왼쪽에서 말줄임, 값은 오른쪽 정렬. */
export function DescriptionList({
  rows,
  provisionalLabel = "Provisional",
  className,
  ...rest
}: DescriptionListProps) {
  return (
    <dl
      className={cn("m-0 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 text-body", className)}
      {...rest}
      data-slot="description-list"
    >
      {rows.map((row, i) => (
        <div key={i} className="contents">
          <dt data-slot="description-list-term" className="min-w-0 truncate text-muted-foreground">
            {row.k}
          </dt>
          <dd
            data-slot="description-list-detail"
            data-provisional={row.provisional ? "" : undefined}
            className={cn(
              "m-0 min-w-0 text-right text-foreground",
              row.numeric && "tnum",
              row.provisional && "underline decoration-dashed decoration-from-font underline-offset-2",
            )}
            title={row.provisional ? provisionalLabel : undefined}
          >
            {row.v}
          </dd>
        </div>
      ))}
    </dl>
  );
}
