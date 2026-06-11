import type { SortingFn } from '@tanstack/angular-table';
import type { RowData } from '@tanstack/angular-table';

/**
 * Locale-aware string `sortingFn` backed by `Intl.Collator`. Attach it to a
 * column's `sortingFn` for correct ordering of accented / locale-specific text
 * (e.g. Swedish `å` sorts after `z`).
 *
 * Intended for string-ish values; numeric columns should sort numerically.
 *
 * The collator locale is fixed when the factory is called, so it does not track
 * a `<nat-table [locale]>` change at runtime. Re-create the column `sortingFn`
 * if you need collation to follow a changing locale.
 */
export function localeSortingFn<TData extends RowData>(
  locale?: string,
  options?: Intl.CollatorOptions,
): SortingFn<TData> {
  const collator = new Intl.Collator(locale, options);

  return (rowA, rowB, columnId) =>
    collator.compare(String(rowA.getValue(columnId) ?? ''), String(rowB.getValue(columnId) ?? ''));
}
