import Table from "cli-table3";

/**
 * Create a cli-table3 instance with sensible defaults.
 */
export function createTable(options: {
  head: string[];
  colWidths?: number[];
}): Table.Table {
  return new Table({
    head: options.head,
    ...(options.colWidths ? { colWidths: options.colWidths } : {}),
    style: { compact: true, "padding-left": 1, "padding-right": 1 },
  });
}

/**
 * Print a table to stdout.
 */
export function printTable(table: Table.Table): void {
  console.log(table.toString());
}
