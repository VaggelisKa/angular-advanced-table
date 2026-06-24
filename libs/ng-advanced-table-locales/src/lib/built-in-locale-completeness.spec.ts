/* eslint-disable complexity */
import { NAT_TABLE_BUILT_IN_UI_LOCALES } from '../ui/lib/ui-built-in-locales';
import type {
  NatTableAccessibilityColumnVisibilityActionContext,
  NatTableAccessibilityColumnVisibilitySummaryContext,
  NatTableAccessibilityHeaderActionPinContext,
  NatTableAccessibilityHeaderActionSortContext,
  NatTableAccessibilityPageSizeOptionContext,
  NatTableAccessibilityPagerContext,
  NatTableAccessibilityScrollControlPositionContext,
  NatTableUiNumberFormatter
} from '../ui/lib/ui-types';
import { NAT_TABLE_BUILT_IN_UTILS_LOCALES } from '../utils/lib/utils-built-in-locales';
import type {
  NatTableRenderMetricsDurationContext,
  NatTableRenderMetricsRowCountContext,
  NatTableUtilsNumberFormatter,
  RowRenderTone
} from '../utils/lib/utils-types';

const expectNonEmptyText = (value: unknown, label: string): void => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
};

const expectDefined = <TValue>(value: TValue | undefined, label: string): TValue => {
  if (value === undefined) {
    throw new Error(`${label} must be defined.`);
  }

  return value;
};

const expectFormattedText = <TContext>(
  formatter: ((context: TContext) => string) | undefined,
  context: TContext,
  label: string
): void => {
  if (typeof formatter !== 'function') {
    throw new Error(`${label} must be a formatter function.`);
  }

  expectNonEmptyText(formatter(context), label);
};

const expectUiNumberFormatter = (formatter: NatTableUiNumberFormatter | undefined, localeId: string, label: string): void => {
  if (typeof formatter !== 'function') {
    throw new Error(`${label} must be a number formatter function.`);
  }

  expectNonEmptyText(formatter(1234.5, { maximumFractionDigits: 1 }, localeId), label);
};

const expectUtilsNumberFormatter = (formatter: NatTableUtilsNumberFormatter | undefined, localeId: string, label: string): void => {
  if (typeof formatter !== 'function') {
    throw new Error(`${label} must be a number formatter function.`);
  }

  expectNonEmptyText(formatter(1234.5, { maximumFractionDigits: 1 }, localeId), label);
};

const pageSizeContext: NatTableAccessibilityPageSizeOptionContext = {
  pageSizeValue: 25,
  pageSizeText: '25',
  selectionState: 'not-selected'
};

const pagerContext: NatTableAccessibilityPagerContext = {
  pageValue: 2,
  pageText: '2',
  pageCountValue: 5,
  pageCountText: '5'
};

const scrollPositionContext: NatTableAccessibilityScrollControlPositionContext = {
  scrollLeftValue: 50,
  scrollLeftText: '50',
  maxScrollLeftValue: 200,
  maxScrollLeftText: '200',
  percentageValue: 25,
  percentageText: '25'
};

const columnVisibilitySummaryContext: NatTableAccessibilityColumnVisibilitySummaryContext = {
  visibleColumnCountValue: 3,
  visibleColumnCountText: '3',
  totalColumnCountValue: 5,
  totalColumnCountText: '5'
};

const visibleColumnContext: NatTableAccessibilityColumnVisibilityActionContext = {
  columnLabel: 'Service',
  visibilityState: 'visible',
  toggleAction: 'hide'
};

const sortedHeaderContext: NatTableAccessibilityHeaderActionSortContext = {
  label: 'Service',
  sortState: 'ascending',
  sortPriority: 1,
  sortCount: 2
};

const unpinnedHeaderContext: NatTableAccessibilityHeaderActionPinContext = {
  label: 'Service',
  pinState: 'unpinned',
  toggleAction: 'pin',
  pinSide: 'left',
  pinnedSide: null
};

const sampledRowsContext: NatTableRenderMetricsRowCountContext = {
  rowCountValue: 3,
  rowCountText: '3'
};

const durationContext: NatTableRenderMetricsDurationContext = {
  durationMsValue: 12.3,
  durationMsText: '12.3'
};

describe('built-in companion UI locale completeness', () => {
  it('ships required consumer-facing labels and formatter hooks in every built-in UI locale', () => {
    const localeEntries = Object.entries(NAT_TABLE_BUILT_IN_UI_LOCALES);

    expect(localeEntries.length).toBeGreaterThan(0);

    for (const [localeId, locale] of localeEntries) {
      expectNonEmptyText(locale.search?.label, `${localeId}: search.label`);
      expectNonEmptyText(locale.search?.placeholder, `${localeId}: search.placeholder`);
      expectNonEmptyText(locale.columnVisibility?.label, `${localeId}: columnVisibility.label`);
      expectNonEmptyText(locale.columnVisibility?.groupAriaLabel, `${localeId}: columnVisibility.groupAriaLabel`);
      expectFormattedText(
        locale.columnVisibility?.accessibilityLabels?.visibilitySummary,
        columnVisibilitySummaryContext,
        `${localeId}: columnVisibility.accessibilityLabels.visibilitySummary`
      );
      expectFormattedText(
        locale.columnVisibility?.accessibilityLabels?.toggleColumnAriaLabel,
        visibleColumnContext,
        `${localeId}: columnVisibility.accessibilityLabels.toggleColumnAriaLabel`
      );
      expectFormattedText(
        locale.columnVisibility?.accessibilityLabels?.columnState,
        { visibilityState: 'visible' },
        `${localeId}: columnVisibility.accessibilityLabels.columnState`
      );

      expectNonEmptyText(locale.pageSize?.groupAriaLabel, `${localeId}: pageSize.groupAriaLabel`);
      expectFormattedText(
        locale.pageSize?.accessibilityLabels?.pageSizeOptionText,
        pageSizeContext,
        `${localeId}: pageSize.accessibilityLabels.pageSizeOptionText`
      );
      expectFormattedText(
        locale.pageSize?.accessibilityLabels?.pageSizeOptionAriaLabel,
        pageSizeContext,
        `${localeId}: pageSize.accessibilityLabels.pageSizeOptionAriaLabel`
      );

      expectNonEmptyText(locale.pager?.groupAriaLabel, `${localeId}: pager.groupAriaLabel`);
      expectNonEmptyText(locale.pager?.accessibilityLabels?.previousPageAriaLabel, `${localeId}: pager.accessibilityLabels.previousPageAriaLabel`);
      expectNonEmptyText(locale.pager?.accessibilityLabels?.nextPageAriaLabel, `${localeId}: pager.accessibilityLabels.nextPageAriaLabel`);
      expectFormattedText(
        locale.pager?.accessibilityLabels?.pageIndicator,
        pagerContext,
        `${localeId}: pager.accessibilityLabels.pageIndicator`
      );

      expectNonEmptyText(locale.scrollControl?.groupAriaLabel, `${localeId}: scrollControl.groupAriaLabel`);
      expectNonEmptyText(
        locale.scrollControl?.accessibilityLabels?.scrollLeftAriaLabel,
        `${localeId}: scrollControl.accessibilityLabels.scrollLeftAriaLabel`
      );
      expectNonEmptyText(
        locale.scrollControl?.accessibilityLabels?.scrollRightAriaLabel,
        `${localeId}: scrollControl.accessibilityLabels.scrollRightAriaLabel`
      );
      expectNonEmptyText(
        locale.scrollControl?.accessibilityLabels?.scrollPositionAriaLabel,
        `${localeId}: scrollControl.accessibilityLabels.scrollPositionAriaLabel`
      );
      expectFormattedText(
        locale.scrollControl?.accessibilityLabels?.scrollPositionText,
        scrollPositionContext,
        `${localeId}: scrollControl.accessibilityLabels.scrollPositionText`
      );

      expectFormattedText(
        locale.headerActions?.accessibilityLabels?.sortButton,
        sortedHeaderContext,
        `${localeId}: headerActions.accessibilityLabels.sortButton`
      );
      expectFormattedText(
        locale.headerActions?.accessibilityLabels?.menuButton,
        { label: 'Service' },
        `${localeId}: headerActions.accessibilityLabels.menuButton`
      );
      expectFormattedText(
        locale.headerActions?.accessibilityLabels?.menuLabel,
        { label: 'Service' },
        `${localeId}: headerActions.accessibilityLabels.menuLabel`
      );
      expectFormattedText(
        locale.headerActions?.accessibilityLabels?.pinButton,
        unpinnedHeaderContext,
        `${localeId}: headerActions.accessibilityLabels.pinButton`
      );
      expectFormattedText(
        locale.headerActions?.accessibilityLabels?.pinButtonText,
        unpinnedHeaderContext,
        `${localeId}: headerActions.accessibilityLabels.pinButtonText`
      );
      expectFormattedText(
        locale.headerActions?.accessibilityLabels?.moveButton,
        { label: 'Service', direction: 'right' },
        `${localeId}: headerActions.accessibilityLabels.moveButton`
      );
      expectFormattedText(
        locale.headerActions?.accessibilityLabels?.moveButtonText,
        { label: 'Service', direction: 'right' },
        `${localeId}: headerActions.accessibilityLabels.moveButtonText`
      );

      expectNonEmptyText(locale.toolbar?.toolbarLabel, `${localeId}: toolbar.toolbarLabel`);
      expectNonEmptyText(locale.selection?.columnLabel, `${localeId}: selection.columnLabel`);
      expectNonEmptyText(locale.selection?.accessibilityLabels?.selectAllAriaLabel, `${localeId}: selection.accessibilityLabels.selectAllAriaLabel`);
      expectFormattedText(
        locale.selection?.accessibilityLabels?.selectRowAriaLabel,
        { rowId: 'row-1' },
        `${localeId}: selection.accessibilityLabels.selectRowAriaLabel`
      );
      expectUiNumberFormatter(locale.formatNumber, localeId, `${localeId}: formatNumber`);
    }
  });
});

describe('built-in utils locale completeness', () => {
  it('ships required render-metrics labels and formatter hooks in every built-in utils locale', () => {
    const localeEntries = Object.entries(NAT_TABLE_BUILT_IN_UTILS_LOCALES);
    const expectedFilterValues = ['all', 'fast', 'watch', 'slow'];
    const renderTones: readonly (RowRenderTone | 'idle')[] = ['idle', 'fast', 'watch', 'slow'];

    expect(localeEntries.length).toBeGreaterThan(0);

    for (const [localeId, locale] of localeEntries) {
      const renderMetrics = expectDefined(locale.renderMetrics, `${localeId}: renderMetrics`);
      const filter = expectDefined(renderMetrics.filter, `${localeId}: renderMetrics.filter`);
      const panel = expectDefined(renderMetrics.panel, `${localeId}: renderMetrics.panel`);
      const column = expectDefined(renderMetrics.column, `${localeId}: renderMetrics.column`);
      const filterOptions = expectDefined(filter.options, `${localeId}: renderMetrics.filter.options`);

      expectNonEmptyText(filter.heading, `${localeId}: renderMetrics.filter.heading`);
      expectNonEmptyText(filter.groupAriaLabel, `${localeId}: renderMetrics.filter.groupAriaLabel`);
      expectNonEmptyText(filter.idleCaption, `${localeId}: renderMetrics.filter.idleCaption`);
      expectFormattedText(filter.rowSampleCaption, sampledRowsContext, `${localeId}: renderMetrics.filter.rowSampleCaption`);
      expect(filterOptions.map((option) => option.value)).toStrictEqual(expectedFilterValues);

      for (const option of filterOptions) {
        expectNonEmptyText(option.label, `${localeId}: renderMetrics.filter.options.${option.value}.label`);
        expectNonEmptyText(option.description, `${localeId}: renderMetrics.filter.options.${option.value}.description`);
      }

      expectNonEmptyText(panel.ariaLabel, `${localeId}: renderMetrics.panel.ariaLabel`);

      if (typeof panel.toneLabel !== 'function') {
        throw new Error(`${localeId}: renderMetrics.panel.toneLabel must be a formatter function.`);
      }

      for (const tone of renderTones) {
        expectNonEmptyText(panel.toneLabel(tone), `${localeId}: renderMetrics.panel.toneLabel.${tone}`);
      }

      expectNonEmptyText(panel.idleSummary, `${localeId}: renderMetrics.panel.idleSummary`);
      expectFormattedText(panel.rowSampleSummary, sampledRowsContext, `${localeId}: renderMetrics.panel.rowSampleSummary`);
      expectFormattedText(panel.duration, durationContext, `${localeId}: renderMetrics.panel.duration`);

      expectNonEmptyText(column.header, `${localeId}: renderMetrics.column.header`);
      expectNonEmptyText(column.pendingLabel, `${localeId}: renderMetrics.column.pendingLabel`);

      if (typeof column.duration !== 'function' && (typeof column.unitSuffix !== 'string' || column.unitSuffix.trim().length === 0)) {
        throw new Error(`${localeId}: renderMetrics.column.duration or unitSuffix must provide non-empty duration copy.`);
      }

      if (column.duration) {
        expectNonEmptyText(column.duration(durationContext), `${localeId}: renderMetrics.column.duration`);
      }

      expectUtilsNumberFormatter(locale.formatNumber, localeId, `${localeId}: formatNumber`);
    }
  });
});
