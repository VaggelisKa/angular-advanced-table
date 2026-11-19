import type {
  CellData,
  ColumnVisibilityState,
  RowData,
  TableFeatures,
  Cell as TanStackCell,
  CellContext as TanStackCellContext,
  Column as TanStackColumn,
  ColumnDef as TanStackColumnDef,
  ColumnDefBase as TanStackColumnDefBase,
  FilterFn as TanStackFilterFn,
  Header as TanStackHeader,
  HeaderContext as TanStackHeaderContext,
  HeaderGroup as TanStackHeaderGroup,
  Row as TanStackRow,
  RowModel as TanStackRowModel,
  SortFn as TanStackSortFn,
  Table as TanStackTable,
  columnFilteringFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  filterFns,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns
} from '@tanstack/angular-table';

/**
 * The fixed TanStack Table v9 feature set every table, static table, and list
 * is built with. v9 only exposes the APIs of registered features, so this is
 * the library's whole TanStack surface. The full `filterFns`/`sortFns`
 * registries stay registered so string names and `'auto'` resolve as in v8.
 */
export type NatTableFeatures = {
  readonly columnFilteringFeature: typeof columnFilteringFeature;
  readonly globalFilteringFeature: typeof globalFilteringFeature;
  readonly rowSortingFeature: typeof rowSortingFeature;
  readonly rowPaginationFeature: typeof rowPaginationFeature;
  readonly columnVisibilityFeature: typeof columnVisibilityFeature;
  readonly columnOrderingFeature: typeof columnOrderingFeature;
  readonly columnPinningFeature: typeof columnPinningFeature;
  readonly columnSizingFeature: typeof columnSizingFeature;
  readonly columnResizingFeature: typeof columnResizingFeature;
  readonly rowSelectionFeature: typeof rowSelectionFeature;
  readonly filteredRowModel: NonNullable<TableFeatures['filteredRowModel']>;
  readonly sortedRowModel: NonNullable<TableFeatures['sortedRowModel']>;
  readonly paginatedRowModel: NonNullable<TableFeatures['paginatedRowModel']>;
  readonly filterFns: typeof filterFns;
  readonly sortFns: typeof sortFns;
};

// Library-owned names for TanStack's types with the feature set applied, so
// consumer code keeps the v8 generic shape (`ColumnDef<Order>`) under v9.
// The core barrel exports these over TanStack's own names.

export type Row<TData extends RowData = RowData> = TanStackRow<NatTableFeatures, TData>;

export type Column<TData extends RowData = RowData, TValue = unknown> = TanStackColumn<NatTableFeatures, TData, TValue>;

export type Cell<TData extends RowData = RowData, TValue extends CellData = CellData> = TanStackCell<NatTableFeatures, TData, TValue>;

export type Table<TData extends RowData = RowData> = TanStackTable<NatTableFeatures, TData>;

export type ColumnDef<TData extends RowData = RowData, TValue extends CellData = CellData> = TanStackColumnDef<
  NatTableFeatures,
  TData,
  TValue
>;

export type ColumnDefBase<TData extends RowData = RowData, TValue extends CellData = CellData> = TanStackColumnDefBase<
  NatTableFeatures,
  TData,
  TValue
>;

export type Header<TData extends RowData = RowData, TValue extends CellData = CellData> = TanStackHeader<
  NatTableFeatures,
  TData,
  TValue
>;

export type HeaderGroup<TData extends RowData = RowData> = TanStackHeaderGroup<NatTableFeatures, TData>;

export type CellContext<TData extends RowData = RowData, TValue extends CellData = CellData> = TanStackCellContext<
  NatTableFeatures,
  TData,
  TValue
>;

export type HeaderContext<TData extends RowData = RowData, TValue extends CellData = CellData> = TanStackHeaderContext<
  NatTableFeatures,
  TData,
  TValue
>;

export type RowModel<TData extends RowData = RowData> = TanStackRowModel<NatTableFeatures, TData>;

export type FilterFn<TData extends RowData = RowData> = TanStackFilterFn<NatTableFeatures, TData>;

export type SortFn<TData extends RowData = RowData> = TanStackSortFn<NatTableFeatures, TData>;

/** v8 name of {@link SortFn}, kept so existing column files compile. */
export type SortingFn<TData extends RowData = RowData> = SortFn<TData>;

/** v8 name of TanStack's `ColumnVisibilityState`, kept so existing state code compiles. */
export type VisibilityState = ColumnVisibilityState;
