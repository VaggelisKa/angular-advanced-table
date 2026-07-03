import type {
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState
} from '@tanstack/angular-table';

/**
 * Serializable view state exposed by {@link NatTable} and emitted through
 * `stateChange`.
 */
export type NatTableUserState = {
  /** Active single-column sort order. */
  readonly sorting: SortingState;
  /** Current global search query. */
  readonly globalFilter: string;
  /** Active column filters keyed by TanStack column id. */
  readonly columnFilters: ColumnFiltersState;
  /** Pagination cursor and page size. */
  readonly pagination: PaginationState;
  /** Visibility map for hideable columns. */
  readonly columnVisibility: VisibilityState;
  /** Leaf-column order, restored when columns are unpinned. */
  readonly columnOrder: ColumnOrderState;
  /** Left and right pinned column ids. */
  readonly columnPinning: ColumnPinningState;
  /** Per-column pixel widths keyed by column id, set by interactive resizing. */
  readonly columnSizing: ColumnSizingState;
  /** Selected row ids keyed by `getRowId`, a string/number `row.id`, or the namespaced positional fallback. */
  readonly rowSelection: RowSelectionState;
};

export type NatTableMode = 'auto' | 'manual';

export type NatTableModeConfiguration = {
  readonly pagination?: NatTableMode;
  readonly sorting?: NatTableMode;
  readonly filtering?: NatTableMode;
};

/** Alias to NatTableUserState for UI component consumption. */
export type NatTableUiState = NatTableUserState;
