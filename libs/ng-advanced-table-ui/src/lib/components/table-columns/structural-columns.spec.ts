import type { CellContext, ColumnDef } from '@tanstack/angular-table';

import { withActionsColumn, withRowNumberColumn } from './structural-columns';

interface Cell {
  value: number;
}

const baseColumns: ColumnDef<Cell, unknown>[] = [{ id: 'value', cell: (info) => info.getValue() }];

/**
 * Builds a minimal cell context whose table resolves the given rows as the
 * pre-pagination row model. `index` mimics TanStack's original-data index,
 * which intentionally differs from the model position once filters apply.
 */
function rowNumberCellContext(
  modelRows: { id: string; index: number }[],
  focusedRow: { id: string; index: number },
): CellContext<Cell, unknown> {
  return {
    row: focusedRow,
    table: { getPrePaginationRowModel: () => ({ rows: modelRows }) },
  } as unknown as CellContext<Cell, unknown>;
}

describe('structural column factories', () => {
  it('prepends a row-number column whose cell is the 1-based position in the row model', () => {
    const result = withRowNumberColumn(baseColumns);

    expect(result.map((column) => column.id)).toEqual(['__natRowNumber', 'value']);

    const cell = result[0].cell as (context: CellContext<Cell, unknown>) => unknown;
    const rows = [
      { id: 'a', index: 0 },
      { id: 'b', index: 1 },
      { id: 'c', index: 2 },
    ];

    expect(cell(rowNumberCellContext(rows, rows[0]))).toBe(1);
    expect(cell(rowNumberCellContext(rows, rows[2]))).toBe(3);
  });

  it('numbers rows by their filtered position, not their original data index', () => {
    const result = withRowNumberColumn(baseColumns);
    const cell = result[0].cell as (context: CellContext<Cell, unknown>) => unknown;

    // A filter kept only the rows originally at data indices 4 and 1.
    const rows = [
      { id: 'row-4', index: 4 },
      { id: 'row-1', index: 1 },
    ];

    expect(cell(rowNumberCellContext(rows, rows[0]))).toBe(1);
    expect(cell(rowNumberCellContext(rows, rows[1]))).toBe(2);
  });

  it('falls back to the 1-based original index when the row is missing from the model', () => {
    const result = withRowNumberColumn(baseColumns);
    const cell = result[0].cell as (context: CellContext<Cell, unknown>) => unknown;

    expect(cell(rowNumberCellContext([], { id: 'detached', index: 4 }))).toBe(5);
  });

  it('ships no hardcoded copy: the default header is the structural "#" with no meta label', () => {
    const result = withRowNumberColumn(baseColumns);

    expect(result[0].header).toBe('#');
    expect(result[0].meta?.label).toBeUndefined();
  });

  it('applies custom row-number options and derives meta.label from a non-default header', () => {
    const result = withRowNumberColumn(baseColumns, { columnId: 'idx', header: 'No.', size: 40 });

    expect(result[0].id).toBe('idx');
    expect(result[0].size).toBe(40);
    // header !== '#' branch: meta.label tracks the custom header (drives the accessible name).
    expect(result[0].meta?.label).toBe('No.');
  });

  it('prefers an explicit label option over the header-derived label', () => {
    const result = withRowNumberColumn(baseColumns, { header: 'No.', label: 'Row number' });

    expect(result[0].meta?.label).toBe('Row number');
  });

  it('appends an actions column rendered through the callback', () => {
    const result = withActionsColumn(baseColumns, () => 'menu', { header: 'Actions' });

    expect(result.map((column) => column.id)).toEqual(['value', '__natActions']);
    expect(result.at(-1)?.meta?.label).toBe('Actions');

    const cell = result.at(-1)?.cell as (context: CellContext<Cell, unknown>) => unknown;

    expect(cell({} as CellContext<Cell, unknown>)).toBe('menu');
  });

  it('applies custom actions-column options', () => {
    const result = withActionsColumn(baseColumns, () => 'menu', {
      columnId: 'ops',
      header: 'Operations',
      label: 'Row operations',
      size: 120,
    });

    const column = result.at(-1);
    expect(column?.id).toBe('ops');
    expect(column?.size).toBe(120);
    expect(column?.header).toBe('Operations');
    expect(column?.meta?.label).toBe('Row operations');
  });
});
