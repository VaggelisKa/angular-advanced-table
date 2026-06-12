import type { Row, RowData } from '@tanstack/angular-table';

import { localeSortingFn } from './locale-sort';

function rowWith(value: unknown): Row<RowData> {
  return { getValue: () => value } as unknown as Row<RowData>;
}

describe('localeSortingFn', () => {
  it('orders strings using the locale collator', () => {
    const sort = localeSortingFn('en-US');

    expect(sort(rowWith('apple'), rowWith('banana'), 'col')).toBeLessThan(0);
    expect(sort(rowWith('banana'), rowWith('apple'), 'col')).toBeGreaterThan(0);
    expect(sort(rowWith('apple'), rowWith('apple'), 'col')).toBe(0);
  });

  it('honors locale-specific collation order', () => {
    const sort = localeSortingFn('sv-SE');

    // In Swedish, "å" collates after "z".
    expect(sort(rowWith('z'), rowWith('å'), 'col')).toBeLessThan(0);
  });
});
