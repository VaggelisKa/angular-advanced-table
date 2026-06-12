import type { ColumnDef } from '@tanstack/angular-table';

import { composeColumns, type NatTableColumnTransform } from './compose-columns';

interface Cell {
  value: number;
}

const baseColumns: ColumnDef<Cell, unknown>[] = [{ id: 'value', cell: (info) => info.getValue() }];

describe('composeColumns', () => {
  it('returns a shallow copy when no transforms are supplied', () => {
    const result = composeColumns(baseColumns);

    expect(result).toEqual(baseColumns);
    expect(result).not.toBe(baseColumns);
  });

  it('applies transforms left to right', () => {
    const order: string[] = [];
    const appendId =
      (id: string): NatTableColumnTransform<Cell> =>
      (columns) => {
        order.push(id);
        return [...columns, { id } as ColumnDef<Cell, unknown>];
      };

    const result = composeColumns(baseColumns, appendId('first'), appendId('second'));

    expect(order).toEqual(['first', 'second']);
    expect(result.map((column) => column.id)).toEqual(['value', 'first', 'second']);
  });
});
