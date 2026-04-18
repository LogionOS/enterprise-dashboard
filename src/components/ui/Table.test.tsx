import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Table, type Column } from "./Table";

type Row = { id: string; name: string; age: number };

const rows: Row[] = [
  { id: "a", name: "Alice", age: 30 },
  { id: "b", name: "Bob", age: 25 },
  { id: "c", name: "Carol", age: 40 },
];

const columns: Column<Row>[] = [
  {
    key: "name",
    header: "Name",
    cell: (r) => r.name,
    sort: (a, b) => a.name.localeCompare(b.name),
  },
  {
    key: "age",
    header: "Age",
    cell: (r) => r.age,
    sort: (a, b) => a.age - b.age,
  },
];

describe("Table", () => {
  it("sorts by a column when its header is clicked", async () => {
    render(<Table<Row> columns={columns} rows={rows} rowKey={(r) => r.id} />);
    const tbody = screen.getByTestId("ui-table").querySelector("tbody")!;
    // Default order reflects the source data.
    let cells = within(tbody).getAllByRole("cell");
    expect(cells[0]).toHaveTextContent("Alice");

    await userEvent.click(screen.getByText("Age"));
    cells = within(tbody).getAllByRole("cell");
    expect(cells[0]).toHaveTextContent("Bob");

    await userEvent.click(screen.getByText("Age"));
    cells = within(tbody).getAllByRole("cell");
    expect(cells[0]).toHaveTextContent("Carol");
  });

  it("shows the empty state when rows is empty", () => {
    render(
      <Table<Row>
        columns={columns}
        rows={[]}
        rowKey={(r) => r.id}
        emptyState="no rows"
      />,
    );
    expect(screen.getByText("no rows")).toBeInTheDocument();
  });
});
