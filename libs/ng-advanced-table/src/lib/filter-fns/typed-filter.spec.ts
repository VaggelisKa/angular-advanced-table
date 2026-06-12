import type { Row, RowData } from '@tanstack/angular-table';

import { natTypedFilterFn, type NatTableColumnFilterValue } from './typed-filter';

function rowWith(value: unknown): Row<RowData> {
  return { getValue: () => value } as unknown as Row<RowData>;
}

function run(cellValue: unknown, filter: NatTableColumnFilterValue): boolean {
  return natTypedFilterFn(rowWith(cellValue), 'col', filter, () => undefined);
}

describe('natTypedFilterFn', () => {
  it('passes everything when the filter value is not a typed { operator, value }', () => {
    expect(natTypedFilterFn(rowWith('anything'), 'col', 'plain', () => undefined)).toBe(true);
  });

  it('applies text operators case-insensitively', () => {
    expect(run('Gamma Service', { operator: 'contains', value: 'gamma' })).toBe(true);
    expect(run('Gamma Service', { operator: 'contains', value: 'delta' })).toBe(false);
    expect(run('Gamma', { operator: 'equals', value: 'gamma' })).toBe(true);
    expect(run('Gamma', { operator: 'startsWith', value: 'GA' })).toBe(true);
    expect(run('Gamma', { operator: 'endsWith', value: 'ma' })).toBe(true);
  });

  it('applies numeric operators', () => {
    expect(run(5, { operator: 'gt', value: 3 })).toBe(true);
    expect(run(5, { operator: 'lte', value: 5 })).toBe(true);
    expect(run(5, { operator: 'lt', value: 5 })).toBe(false);
    expect(run(5, { operator: 'between', value: [3, 7] })).toBe(true);
    expect(run(9, { operator: 'between', value: [3, 7] })).toBe(false);
    expect(run(9, { operator: 'between', value: [3, null] })).toBe(true);
  });

  it('applies set, empty, and emptiness operators', () => {
    expect(run('Halted', { operator: 'in', value: ['Halted', 'Active'] })).toBe(true);
    expect(run('Closed', { operator: 'in', value: ['Halted', 'Active'] })).toBe(false);
    expect(run('', { operator: 'isEmpty', value: null })).toBe(true);
    expect(run('x', { operator: 'isEmpty', value: null })).toBe(false);
    expect(run('x', { operator: 'notEmpty', value: null })).toBe(true);
  });

  it('covers notEquals, gte, open-lower-bound between, and the non-array in fallback', () => {
    expect(run('Gamma', { operator: 'notEquals', value: 'delta' })).toBe(true);
    expect(run('Gamma', { operator: 'notEquals', value: 'gamma' })).toBe(false);
    expect(run(5, { operator: 'gte', value: 5 })).toBe(true);
    expect(run(2, { operator: 'between', value: [null, 7] })).toBe(true);
    expect(run(9, { operator: 'between', value: [null, 7] })).toBe(false);
    expect(run('x', { operator: 'in', value: 'notArray' })).toBe(false);
  });

  it('excludes blank cells from numeric range filters instead of treating them as 0', () => {
    expect(run('', { operator: 'gte', value: 0 })).toBe(false);
    expect(run('   ', { operator: 'lte', value: 0 })).toBe(false);
    expect(run('', { operator: 'between', value: [-5, 5] })).toBe(false);
    expect(run('', { operator: 'between', value: [null, 5] })).toBe(false);
  });

  it('compares dates through the between operator', () => {
    expect(run('2026-06-03', { operator: 'between', value: ['2026-06-01', '2026-06-30'] })).toBe(
      true,
    );
    expect(run('2026-07-03', { operator: 'between', value: ['2026-06-01', '2026-06-30'] })).toBe(
      false,
    );
  });
});
