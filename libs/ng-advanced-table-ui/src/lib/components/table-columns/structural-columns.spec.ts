import type { CellContext, ColumnDef } from '@tanstack/angular-table';

import { withActionsColumn, withRowNumberColumn } from './structural-columns';

interface Cell {
  value: number;
}

const baseColumns: ColumnDef<Cell, unknown>[] = [{ id: 'value', cell: (info) => info.getValue() }];

describe('structural column factories', () => {
  it('prepends a row-number column whose cell is the 1-based row index', () => {
    const result = withRowNumberColumn(baseColumns);

    expect(result.map((column) => column.id)).toEqual(['__natRowNumber', 'value']);

    const cell = result[0].cell as (context: CellContext<Cell, unknown>) => unknown;

    expect(cell({ row: { index: 0 } } as CellContext<Cell, unknown>)).toBe(1);
    expect(cell({ row: { index: 4 } } as CellContext<Cell, unknown>)).toBe(5);
  });

  it('applies custom row-number options and derives meta.label from a non-default header', () => {
    const result = withRowNumberColumn(baseColumns, { columnId: 'idx', header: 'No.', size: 40 });

    expect(result[0].id).toBe('idx');
    expect(result[0].size).toBe(40);
    // header !== '#' branch: meta.label tracks the custom header (drives the accessible name).
    expect(result[0].meta?.label).toBe('No.');
  });

  it('applies custom actions-column options', () => {
    const result = withActionsColumn(baseColumns, () => 'menu', {
      columnId: 'ops',
      header: 'Operations',
      size: 120,
    });

    const column = result.at(-1);
    expect(column?.id).toBe('ops');
    expect(column?.size).toBe(120);
    expect(column?.meta?.label).toBe('Operations');
  });

  it('appends an actions column rendered through the callback', () => {
    const result = withActionsColumn(baseColumns, () => 'menu');

    expect(result.map((column) => column.id)).toEqual(['value', '__natActions']);

    const cell = result.at(-1)?.cell as (context: CellContext<Cell, unknown>) => unknown;

    expect(cell({} as CellContext<Cell, unknown>)).toBe('menu');
  });
});
