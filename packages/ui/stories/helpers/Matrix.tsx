import type { ReactNode } from "react";

/* `Variants` 스토리의 몸통 — 두 축의 전 조합을 격자로. 행·열 라벨은 mono 로 두어 값과 구분한다.
 * 축 값 배열은 스토리 파일이 든다(`*Values`) — cva 설정은 값 목록을 내보내지 않으므로 여기서 다시 적고,
 * Phase D 에 컴포넌트가 `*Values` 를 export 하면 그것을 쓴다. */
export function Matrix<R extends string, C extends string>({
  rows,
  cols,
  rowLabel,
  colLabel,
  cell,
}: {
  rows: readonly R[];
  cols: readonly C[];
  rowLabel: string;
  colLabel: string;
  cell: (row: R, col: C) => ReactNode;
}) {
  return (
    <table className="border-separate border-spacing-3 font-sans text-body text-foreground">
      <thead>
        <tr>
          <th
            scope="col"
            className="text-left font-mono text-micro font-medium tracking-caps text-muted-foreground uppercase"
          >
            {rowLabel} \ {colLabel}
          </th>
          {cols.map((col) => (
            <th
              key={col}
              scope="col"
              className="text-left font-mono text-micro font-normal text-muted-foreground"
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row}>
            <th scope="row" className="text-left font-mono text-micro font-normal text-muted-foreground">
              {row}
            </th>
            {cols.map((col) => (
              <td key={col} className="align-top">
                {cell(row, col)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
