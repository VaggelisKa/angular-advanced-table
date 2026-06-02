import type { ColumnDef, RowData } from '@tanstack/angular-table';

import {
  formatNatTableUtilsNumber,
  injectNatTableUtilsIntl,
  mergeRenderMetricsColumnIntl,
  type NatTableRenderMetricsColumnIntl,
} from './intl';
import type { NatTableRenderMetricsStore } from './store';
import { isRenderFilterValue } from './tone';
import { RENDER_METRIC_COLUMN_ID } from './types';

/**
 * Configuration for {@link withRenderMetricsColumn}.
 */
export interface WithRenderMetricsColumnOptions extends NatTableRenderMetricsColumnIntl {
  /** Column identifier. Defaults to `__rowRenderMetric`. */
  columnId?: string;
  /** Optional TanStack size override. */
  size?: number;
  /** Optional TanStack min-size override. */
  minSize?: number;
  /** Optional TanStack max-size override. */
  maxSize?: number;
}

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
  const utilsIntl = injectNatTableUtilsIntl();
  const columnIntl = mergeRenderMetricsColumnIntl(utilsIntl.renderMetrics?.column, options);
  const columnId = options.columnId ?? RENDER_METRIC_COLUMN_ID;
  const pendingLabel = columnIntl.pendingLabel ?? 'Pending';
  const unitSuffix = columnIntl.unitSuffix ?? ' ms';
  const header = columnIntl.header ?? 'Render';

  const metricsColumn: ColumnDef<TData, unknown> = {
    id: columnId,
    header,
    size: options.size ?? 110,
    minSize: options.minSize ?? 80,
    maxSize: options.maxSize,
    meta: {
      label: header,
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

      const durationMsText = formatNatTableUtilsNumber(utilsIntl, metric.durationMs, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });

      return (
        columnIntl.duration?.({
          durationMsValue: metric.durationMs,
          durationMsText,
        }) ?? `${durationMsText}${unitSuffix}`
      );
    },
  };

  return [...columns, metricsColumn];
}
