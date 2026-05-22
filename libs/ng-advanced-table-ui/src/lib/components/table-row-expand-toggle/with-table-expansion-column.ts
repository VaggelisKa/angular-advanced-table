import {
  flexRenderComponent,
  type ColumnDef,
  type Row,
  type RowData,
} from '@tanstack/angular-table';

import {
  NatTableRowExpandToggle,
  type NatTableRowExpansionLabels,
} from './table-row-expand-toggle';

export type NatTableExpansionColumnPosition = 'start' | 'end';

export interface NatTableExpansionColumnOptions<TData extends RowData = RowData> {
  /** Column id used by TanStack state. Defaults to `nat-row-expand`. */
  id?: string;
  /** Header content for the generated column. Defaults to `Details`. */
  header?: ColumnDef<TData, unknown>['header'];
  /** Stable human-readable column label for accessibility and companion UI. */
  label?: string;
  /** Where to place the generated column. Defaults to `start`. */
  position?: NatTableExpansionColumnPosition;
  /** Optional TanStack size override. */
  size?: number;
  /** Optional TanStack min-size override. */
  minSize?: number;
  /** Optional TanStack max-size override. */
  maxSize?: number;
  /** Whether consumers can hide this column through column-visibility UI. Defaults to `false`. */
  enableHiding?: boolean;
  /** Whether consumers can pin this column. Defaults to `false`. */
  enablePinning?: boolean;
  /** Localized button labels and visible toggle text. */
  labels?: NatTableRowExpansionLabels<TData>;
}

const DEFAULT_EXPANSION_COLUMN_ID = 'nat-row-expand';
const DEFAULT_EXPANSION_COLUMN_HEADER = 'Details';

/**
 * Adds a standard accessible expansion toggle column to a TanStack column list.
 *
 * Pair it with `NatTable.expandedRow` and, optionally, `NatTable.canExpandRow`.
 * The generated cell button calls the row expansion API internally, so common
 * expandable rows do not require each consumer to hand-roll a toggle cell.
 */
export function withNatTableExpansionColumn<TData extends RowData>(
  columns: readonly ColumnDef<TData, unknown>[],
  options: NatTableExpansionColumnOptions<TData> = {},
): ColumnDef<TData, unknown>[] {
  const expansionColumn = createExpansionColumn(options);

  return options.position === 'end' ? [...columns, expansionColumn] : [expansionColumn, ...columns];
}

function createExpansionColumn<TData extends RowData>(
  options: NatTableExpansionColumnOptions<TData>,
): ColumnDef<TData, unknown> {
  const header = options.header ?? DEFAULT_EXPANSION_COLUMN_HEADER;
  const label =
    options.label ??
    (typeof header === 'string' && header.trim() ? header : DEFAULT_EXPANSION_COLUMN_HEADER);

  return {
    id: options.id ?? DEFAULT_EXPANSION_COLUMN_ID,
    header,
    size: options.size ?? 112,
    minSize: options.minSize ?? 72,
    maxSize: options.maxSize,
    meta: {
      label,
    },
    enableSorting: false,
    enableGlobalFilter: false,
    enableColumnFilter: false,
    enableHiding: options.enableHiding ?? false,
    enablePinning: options.enablePinning ?? false,
    cell: (context) =>
      flexRenderComponent(NatTableRowExpandToggle, {
        inputs: {
          row: context.row as Row<RowData>,
          labels: (options.labels ?? {}) as NatTableRowExpansionLabels<RowData>,
        },
      }),
  };
}
