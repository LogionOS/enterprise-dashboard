"use client";

import * as React from "react";

export type Column<Row> = {
  key: string;
  header: React.ReactNode;
  cell: (row: Row) => React.ReactNode;
  sort?: (a: Row, b: Row) => number;
  width?: string;
  className?: string;
};

type Props<Row> = {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  emptyState?: React.ReactNode;
  onRowClick?: (row: Row) => void;
  initialSortKey?: string;
  initialSortDir?: "asc" | "desc";
  caption?: string;
};

export function Table<Row>({
  columns,
  rows,
  rowKey,
  emptyState,
  onRowClick,
  initialSortKey,
  initialSortDir = "asc",
  caption,
}: Props<Row>) {
  const [sortKey, setSortKey] = React.useState<string | undefined>(initialSortKey);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">(initialSortDir);

  const sortedRows = React.useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey && c.sort);
    if (!col?.sort) return rows;
    const copy = [...rows];
    copy.sort(col.sort);
    if (sortDir === "desc") copy.reverse();
    return copy;
  }, [rows, sortKey, sortDir, columns]);

  function handleSort(key: string) {
    const col = columns.find((c) => c.key === key);
    if (!col?.sort) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full border-collapse text-left text-sm" data-testid="ui-table">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/50">
            {columns.map((c) => {
              const isSorted = sortKey === c.key;
              const sortable = !!c.sort;
              return (
                <th
                  key={c.key}
                  style={{ width: c.width }}
                  scope="col"
                  className={[
                    "px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400",
                    sortable ? "cursor-pointer select-none hover:text-zinc-200" : "",
                    c.className ?? "",
                  ].join(" ")}
                  aria-sort={
                    isSorted
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : sortable
                        ? "none"
                        : undefined
                  }
                  onClick={sortable ? () => handleSort(c.key) : undefined}
                  data-sort-key={c.key}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.header}
                    {sortable && isSorted ? (
                      <span aria-hidden>{sortDir === "asc" ? "?" : "?"}</span>
                    ) : null}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-8 text-center text-sm text-zinc-500"
              >
                {emptyState ?? "Nothing to show."}
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => (
              <tr
                key={rowKey(row)}
                className={[
                  "border-b border-zinc-900 last:border-0",
                  onRowClick ? "cursor-pointer hover:bg-zinc-900/60" : "",
                ].join(" ")}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={[
                      "px-3 py-2 align-middle text-zinc-200",
                      c.className ?? "",
                    ].join(" ")}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
