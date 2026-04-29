import type { ColumnDef, RowData } from '@tanstack/angular-table';

import type { NatTableRenderMetricsStore } from './store';
import { isRenderFilterValue } from './tone';
import { RENDER_METRIC_COLUMN_ID } from './types';

/**
 * Configuration for {@link withRenderMetricsColumn}.
 */
export interface WithRenderMetricsColumnOptions {
  /** Column identifier. Defaults to `__rowRenderMetric`. */
  columnId?: string;
  /** Static header label. */
  header?: string;
  /** Optional size override. */
  size?: number;
  /** Optional min size override. */
  minSize?: number;
  /** Cell label when no metric has been recorded yet. Defaults to `'Pending'`. */
  pendingLabel?: string;
  /** Suffix appended to measurement values. Defaults to `' ms'`. */
  unitSuffix?: string;
}

const decimalFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/**
 * Returns a new column definition array with a synthetic "render" column
 * appended. The column renders the latest per-row render time from the given
 * store and installs a filter function driven by row-render tone.
 *
 * @param columns Existing table columns.
 * @param store Shared metrics store populated from `<nat-table (rowRendered)>`.
 * @param options Optional labels, sizing, and identifier overrides.
 * @returns A shallow copy of `columns` with the metrics column appended.
 */
export function withRenderMetricsColumn<TData extends RowData>(
  columns: readonly ColumnDef<TData, unknown>[],
  store: NatTableRenderMetricsStore,
  options: WithRenderMetricsColumnOptions = {},
): ColumnDef<TData, unknown>[] {
  const columnId = options.columnId ?? RENDER_METRIC_COLUMN_ID;
  const pendingLabel = options.pendingLabel ?? 'Pending';
  const unitSuffix = options.unitSuffix ?? ' ms';

  const metricsColumn: ColumnDef<TData, unknown> = {
    id: columnId,
    header: options.header ?? 'Render',
    size: options.size ?? 110,
    minSize: options.minSize ?? 80,
    meta: {
      label: options.header ?? 'Render',
      align: 'end',
    },
    enableGlobalFilter: false,
    enableHiding: false,
    enablePinning: false,
    enableSorting: false,
    filterFn: (row, _columnId, filterValue) => {
      const activeFilter = isRenderFilterValue(filterValue) ? filterValue : 'all';

      if (activeFilter === 'all') {
        return true;
      }

      const metric = store.rowMetric(row.id);

      if (!metric) {
        return true;
      }

      return metric.tone === activeFilter;
    },
    cell: (info) => {
      const metric = store.rowMetric(info.row.id);

      if (!metric) {
        return pendingLabel;
      }

      return `${decimalFormatter.format(metric.durationMs)}${unitSuffix}`;
    },
  };

  return [...columns, metricsColumn];
}
