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
  /**
   * Whether clicks and Enter/Space that start in the selection cell (beside the checkbox) may
   * emit `rowActivate`. Defaults to `false`: the checkbox is well under the 24 px WCAG 2.5.8
   * target, so the padding around it must not be a second, larger row target.
   */
  readonly rowActivation?: boolean;
  /** `aria-label` override for the select-all checkbox. Defaults to the locale label. */
  readonly selectAllAriaLabel?: string;
  /** `aria-label` override for a per-row checkbox. Defaults to the locale formatter. */
  readonly selectRowAriaLabel?: (row: Row<TData>) => string;
};
