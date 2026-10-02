/**
 * Share of the item width a `flow`-layout field takes, as the string written
 * to its `--sys-nat-table-list-field-share` bridge. `'full'` marks a field
 * that takes a whole line; a fraction (e.g. `0.3333`) is its weight divided by
 * the total weight of the fields sharing one line.
 */
const SHARE_PRECISION = 10_000;

const isFullSpan = (span: unknown): span is 'full' => span === 'full';

/** Numeric weights normalize to a finite positive number; anything else counts as `1`. */
const resolveWeight = (span: unknown): number => (typeof span === 'number' && Number.isFinite(span) && span > 0 ? span : 1);

/**
 * Resolves each visible column's `flow`-layout share from `meta.listFieldSpan`.
 *
 * Shares are rounded *down* to four decimals so the slots of one line never
 * sum past 100% through floating-point noise, which would wrap the last field
 * on every item. Full-width fields are excluded from the weight total: they
 * sit on their own line, so they neither take nor give line width.
 *
 * Returns the per-column share map plus `slots`, the number of fields that
 * share one line (the CSS subtracts `slots - 1` column gaps from the line).
 */
export const resolveListFieldShares = (
  columns: readonly { readonly id: string; readonly columnDef: { readonly meta?: { readonly listFieldSpan?: unknown } } }[]
): { readonly shares: ReadonlyMap<string, string>; readonly slots: number } => {
  const weighted = columns.filter((column) => !isFullSpan(column.columnDef.meta?.listFieldSpan));
  const totalWeight = weighted.reduce((sum, column) => sum + resolveWeight(column.columnDef.meta?.listFieldSpan), 0);
  const shares = new Map<string, string>();

  for (const column of columns) {
    const span = column.columnDef.meta?.listFieldSpan;

    if (isFullSpan(span)) {
      shares.set(column.id, 'full');
    } else {
      const share = Math.floor((resolveWeight(span) / totalWeight) * SHARE_PRECISION) / SHARE_PRECISION;

      shares.set(column.id, String(share));
    }
  }

  return { shares, slots: weighted.length };
};
