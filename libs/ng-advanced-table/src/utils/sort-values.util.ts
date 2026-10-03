import type { Row, RowData } from '@tanstack/angular-table';

const NOT_READ: unique symbol = Symbol('notRead');

/** Memoizes `read(index)` per row index, calling it at most once per index. */
export const lazyByIndex = (length: number, read: (index: number) => unknown): ((index: number) => unknown) => {
  const cache: unknown[] = new Array<unknown>(length).fill(NOT_READ);

  return (index) => {
    let value = cache[index];

    if (value === NOT_READ) {
      value = read(index);
      cache[index] = value;
    }

    return value;
  };
};

/** Every row's value for `id`, read once, in row order. */
export const readValues = <TData extends RowData>(rows: readonly Row<TData>[], id: string): unknown[] => {
  const values = new Array<unknown>(rows.length);

  for (let index = 0; index < rows.length; index++) {
    values[index] = rows[index].getValue(id);
  }

  return values;
};
