import type { CellContext, Column, Row, RowData } from '@tanstack/angular-table';

import type { NatTableColumnReorderResult } from './column-render.type';

/** Semantic tone that can be applied to a rendered body cell. */
export type NatTableCellTone = 'positive' | 'negative' | 'neutral' | 'warning';

/** Horizontal direction used by built-in and custom column-reorder controls. */
export type NatTableColumnMoveDirection = 'left' | 'right';

/** Context passed to column export value callbacks. */
type NatTableColumnExportValueContext<TData extends RowData = RowData, TValue = unknown> = {
  /** Row being exported. */
  readonly row: Row<TData>;
  /** Column being exported. */
  readonly column: Column<TData, TValue>;
  /** Raw value resolved from the row and column before export-specific normalization. */
  readonly value: TValue;
};

/** Export behavior attached to a table column definition. */
type NatTableColumnExportOptions<TData extends RowData = RowData, TValue = unknown> = {
  /** Whether the column participates in table export. Accessor columns opt in by default. */
  readonly enabled?: boolean;
  /** Header text used by export formats. Defaults to column labels and identifiers. */
  readonly header?: string;
  /** Maps a row/column value into an export value. Defaults to the raw accessor value. */
  readonly value?: (context: NatTableColumnExportValueContext<TData, TValue>) => unknown;
};

/**
 * Extra metadata understood by `<nat-table>` when attached to a TanStack
 * column definition or optional companion UI.
 */
export type NatTableColumnMeta<TData extends RowData = RowData, TValue = unknown> = {
  /** Accessible label used by companion controls when the header is not a string. */
  readonly label?: string;
  /** Visually hidden header label for utility columns where a visible title would be redundant. */
  readonly hiddenHeaderLabel?: string;
  /** Horizontal alignment for header and body cells in the column. */
  readonly align?: 'start' | 'end';
  /** Marks the body cell for this column as the row header announced by screen readers. */
  readonly rowHeader?: boolean;
  /** Per-column override for the reorder surface enabler (drag, keyboard, Move buttons). When unset, falls back to the surface `enableReordering`: surface on → reorderable unless set to `false`; surface off → not reorderable unless set to `true`. */
  readonly reorderable?: boolean;
  /** Optional callback that maps a cell to a semantic tone class. */
  readonly cellTone?: (context: CellContext<TData, TValue>) => NatTableCellTone | null;
  /** Optional body-cell height in pixels or any CSS length. Does not affect header cells. */
  readonly cellHeight?: number | string;
  /**
   * Maximum body-cell content lines before truncation. Defaults to 2; set to `Infinity` to disable.
   * Invalid explicit values fall back to 2 lines.
   */
  readonly cellMaxLines?: number;
  /** Optional header-only width in pixels. Does not affect body cells. */
  readonly headerSize?: number | string;
  /** Optional header-only minimum width in pixels. Does not affect body cells. */
  readonly headerMinSize?: number | string;
  /** Optional header-only maximum width in pixels. Does not affect body cells. */
  readonly headerMaxSize?: number | string;
  /** Optional table export behavior for this column. */
  readonly export?: NatTableColumnExportOptions<TData, TValue>;
};

declare module '@tanstack/table-core' {
  // Module augmentation must use `interface` (declaration merging); the empty
  // body intentionally inherits every NatTableColumnMeta field.
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
  interface ColumnMeta<TData extends RowData, TValue> extends NatTableColumnMeta<TData, TValue> {}

  // Module augmentation must use `interface`; `TData` is required to match the
  // upstream signature even though this augmentation does not reference it.
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    /** Current table locale id exposed to companion header controls. */
    readonly natTableLocaleId?: string;
    /** Returns whether a visible column can move within its current pinned region. */
    readonly natTableCanMoveColumn?: (columnId: string, direction: NatTableColumnMoveDirection) => boolean;
    /** Moves a visible column within its current pinned region. Returns the reorder result, or null if no move occurred. */
    readonly natTableMoveColumn?: (columnId: string, direction: NatTableColumnMoveDirection) => NatTableColumnReorderResult | null;
    /** Whether the surface enables sorting; per-column enableSorting overrides. */
    readonly natTableSortingEnabled?: boolean;
    /** Whether the surface enables pinning; per-column enablePinning overrides. */
    readonly natTablePinningEnabled?: boolean;
  }
}
