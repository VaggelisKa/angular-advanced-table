import type { Row, RowData } from '@tanstack/angular-table';

/** Options for {@link withNatTableSelectionColumn}. */
export type NatTableSelectionColumnOptions<TData extends RowData = RowData> = {
  /** Column id. Defaults to `__natSelect`. */
  readonly columnId?: string;
  /** Accessible label for the column. Defaults to the locale `selection.columnLabel`. */
  readonly label?: string;
  /** Column width in pixels. Defaults to 48. */
  readonly size?: number;
  /** Whether the column may be pinned. Defaults to true (pin it left via state). */
  readonly enablePinning?: boolean;
  /** `aria-label` override for the select-all checkbox. Defaults to the locale label. */
  readonly selectAllAriaLabel?: string;
  /** `aria-label` override for a per-row checkbox. Defaults to the locale formatter. */
  readonly selectRowAriaLabel?: (row: Row<TData>) => string;
};
