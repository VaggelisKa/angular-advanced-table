import type { CellContext, ColumnDef, FilterFn, RowData } from '@tanstack/angular-table';

import {
  NAT_TABLE_UTILS_ENGLISH_LOCALE,
  formatNatTableUtilsNumber,
  injectNatTableUtilsIntl,
  mergeRenderMetricsColumnIntl,
  resolveNatTableUtilsIntl
} from 'ng-advanced-table/locale';
import type { NatTableRenderMetricsColumnIntl } from 'ng-advanced-table/locale';

import type { NatTableRenderMetricsStore } from './store';
import { isRenderFilterValue } from './tone';
import { RENDER_METRIC_COLUMN_ID } from '../common/type';

/**
 * Configuration for {@link withRenderMetricsColumn}.
 */
type WithRenderMetricsColumnOptions = {
  /** Locale id used when resolving provider defaults at helper-call time. */
  readonly locale?: string;
  /** Column identifier. Defaults to `__rowRenderMetric`. */
  readonly columnId?: string;
  /** Optional TanStack size override. */
  readonly size?: number;
  /** Optional TanStack min-size override. */
  readonly minSize?: number;
  /** Optional TanStack max-size override. */
  readonly maxSize?: number;
} & NatTableRenderMetricsColumnIntl;

/**
 * Builds the metrics column filter predicate that keeps rows whose latest
 * render tone matches the active filter value.
 *
 * @param store Shared metrics store used to look up per-row tone.
 */
const createMetricsFilterFn = <TData extends RowData>(store: NatTableRenderMetricsStore): FilterFn<TData> => {
  return (row, _columnId, filterValue) => {
    const activeFilter = isRenderFilterValue(filterValue) ? filterValue : 'all';

    if (activeFilter === 'all') {
      return true;
    }

    const metric = store.rowMetric(row.id);

    if (!metric) {
      return true;
    }

    return metric.tone === activeFilter;
  };
}

/** Resolved render-metrics intl bundle used when rendering metric cells. */
type ResolvedUtilsIntl = ReturnType<typeof resolveNatTableUtilsIntl>;
/** Resolved render-metrics column intl used when rendering metric cells. */
type ResolvedColumnIntl = ReturnType<typeof mergeRenderMetricsColumnIntl>;

/** Resolved configuration passed to the metrics column cell renderer. */
type MetricsCellConfig = {
  readonly store: NatTableRenderMetricsStore;
  readonly utilsIntl: ResolvedUtilsIntl;
  readonly columnIntl: ResolvedColumnIntl;
  readonly locale: string;
  readonly pendingLabel: string;
  readonly unitSuffix: string;
};

/**
 * Builds the metrics column cell renderer that formats the latest per-row
 * render duration, falling back to the pending label when no metric exists.
 */
const createMetricsCell = <TData extends RowData>(config: MetricsCellConfig): ((info: CellContext<TData, unknown>) => unknown) => {
  const { store, utilsIntl, columnIntl, locale, pendingLabel, unitSuffix } = config;

  return (info) => {
    const metric = store.rowMetric(info.row.id);

    if (!metric) {
      return pendingLabel;
    }

    const durationMsText = formatNatTableUtilsNumber(
      utilsIntl,
      metric.durationMs,
      {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      },
      locale
    );

    return (
      columnIntl.duration?.({
        durationMsValue: metric.durationMs,
        durationMsText
      }) ?? `${durationMsText}${unitSuffix}`
    );
  };
}

/**
 * Returns a new column definition array with a synthetic "render" column
 * appended. The column renders the latest per-row render time from the given
 * store and installs a filter function driven by row-render tone.
 *
 * @param columns Existing table columns.
 * @param store Shared metrics store populated from `<nat-table (rowRendered)>`.
 * @param options Optional labels, sizing, and identifier overrides.
 *
 * Call this helper from an Angular injection context to apply
 * `provideNatTableUtilsIntl(...)` defaults. Pass `options.locale` or rebuild
 * columns from a computed value when the table locale changes. Calls outside DI
 * still work, but use built-in defaults plus the explicit `options` passed
 * here.
 *
 * @returns A shallow copy of `columns` with the metrics column appended.
 */
export const withRenderMetricsColumn = <TData extends RowData>(
  columns: readonly ColumnDef<TData, unknown>[],
  store: NatTableRenderMetricsStore,
  options: WithRenderMetricsColumnOptions = {}
): ColumnDef<TData, unknown>[] => {
  const utilsIntlConfig = injectNatTableUtilsIntl();
  const locale = options.locale ?? NAT_TABLE_UTILS_ENGLISH_LOCALE;
  const utilsIntl = resolveNatTableUtilsIntl(utilsIntlConfig, locale);
  const columnIntl = mergeRenderMetricsColumnIntl(utilsIntl.renderMetrics?.column, options);
  const columnId = options.columnId ?? RENDER_METRIC_COLUMN_ID;
  const pendingLabel = columnIntl.pendingLabel ?? '';
  const unitSuffix = columnIntl.unitSuffix ?? '';
  const header = columnIntl.header ?? '';

  const metricsColumn: ColumnDef<TData, unknown> = {
    id: columnId,
    header,
    size: options.size ?? 110,
    minSize: options.minSize ?? 80,
    maxSize: options.maxSize,
    meta: {
      label: header,
      align: 'end'
    },
    enableGlobalFilter: false,
    enableHiding: false,
    enablePinning: false,
    enableSorting: false,
    filterFn: createMetricsFilterFn(store),
    cell: createMetricsCell({ store, utilsIntl, columnIntl, locale, pendingLabel, unitSuffix })
  };

  return [...columns, metricsColumn];
}
