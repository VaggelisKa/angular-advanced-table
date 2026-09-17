export {
  NAT_DA_LOCALE_ID,
  NAT_EN_LOCALE_ID,
  NAT_FI_LOCALE_ID,
  NAT_NB_LOCALE_ID,
  NAT_NO_LOCALE_ID,
  NAT_SV_LOCALE_ID
} from './locale-id.const';

// per-locale dictionaries, one file per language
export { NAT_DA_CONTROLS_LOCALE_LABELS, NAT_DA_LOCALE_LABELS, NAT_DA_RENDER_METRICS_LOCALE_LABELS } from './locale-da.const';

export { NAT_FI_CONTROLS_LOCALE_LABELS, NAT_FI_LOCALE_LABELS, NAT_FI_RENDER_METRICS_LOCALE_LABELS } from './locale-fi.const';

export { NAT_NB_CONTROLS_LOCALE_LABELS, NAT_NB_LOCALE_LABELS, NAT_NB_RENDER_METRICS_LOCALE_LABELS } from './locale-nb.const';

export { NAT_SV_CONTROLS_LOCALE_LABELS, NAT_SV_LOCALE_LABELS, NAT_SV_RENDER_METRICS_LOCALE_LABELS } from './locale-sv.const';

// accessibility boundary (core grid)
export { NAT_EN_LOCALE_LABELS, NAT_TABLE_BUILT_IN_LOCALES } from './accessibility.const';

export type {
  NatTableAccessibilityColumnReorderAnnouncementContext,
  NatTableAccessibilityColumnResizeAnnouncementContext,
  NatTableAccessibilityColumnVisibilityAnnouncementChange,
  NatTableAccessibilityColumnVisibilityAnnouncementContext,
  NatTableAccessibilityFilteringAnnouncementContext,
  NatTableAccessibilityPaginationAnnouncementContext,
  NatTableAccessibilityRowPlaceholderContext,
  NatTableAccessibilitySelectionAnnouncementContext,
  NatTableAccessibilitySortingAnnouncementContext,
  NatTableAccessibilitySubHeaderContext,
  NatTableAccessibilitySummaryContext,
  NatTableAccessibilityText,
  NatTableIntl,
  NatTableIntlConfig,
  NatTableIntlProviderFactory,
  NatTableIntlProviderConfig,
  NatTableIntlProviderSource,
  NatTableIntlStaticProviderConfig,
  NatTableLocalesMap,
  NatTableLocalesProviderConfig,
  NatTableLocalesProviderFactory,
  NatTableLocalesProviderSource,
  NatTableNumberFormatter
} from './accessibility.type';

// controls boundary (companion components controls)
export { NAT_EN_CONTROLS_LOCALE_LABELS, NAT_TABLE_BUILT_IN_CONTROLS_LOCALES } from './controls.const';

export type {
  NatTableAccessibilityColumnVisibilityActionContext,
  NatTableAccessibilityColumnVisibilityLabels,
  NatTableAccessibilityColumnVisibilityStateContext,
  NatTableAccessibilityColumnVisibilitySummaryContext,
  NatTableAccessibilityHeaderActionLabels,
  NatTableAccessibilityHeaderActionMenuContext,
  NatTableAccessibilityHeaderActionMoveContext,
  NatTableAccessibilityHeaderActionPinContext,
  NatTableAccessibilityHeaderActionSortContext,
  NatTableAccessibilityPagerContext,
  NatTableAccessibilityPagerLabels,
  NatTableAccessibilityPageSizeLabels,
  NatTableAccessibilityPageSizeOptionContext,
  NatTableAccessibilityScrollControlLabels,
  NatTableAccessibilityScrollControlPositionContext,
  NatTableAccessibilitySelectionLabels,
  NatTableAccessibilitySelectionRowContext,
  NatTableColumnMoveDirection,
  NatTableColumnVisibilityIntl,
  NatTableHeaderActionsIntl,
  NatTablePageSizeIntl,
  NatTablePagerIntl,
  NatTableScrollControlIntl,
  NatTableSelectionIntl,
  NatTableControlsIntl,
  NatTableControlsIntlConfig,
  NatTableControlsIntlStaticProviderConfig,
  NatTableControlsLocalesMap,
  NatTableControlsNumberFormatter
} from './controls.type';

export type {
  NatTableControlsIntlProviderConfig,
  NatTableControlsIntlProviderFactory,
  NatTableControlsIntlProviderSource,
  NatTableControlsLocalesProviderConfig,
  NatTableControlsLocalesProviderFactory,
  NatTableControlsLocalesProviderSource
} from './controls-provider.type';

// render-metrics boundary
export {
  NAT_EN_RENDER_METRICS_LOCALE_LABELS,
  NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES,
  RENDER_METRICS_FILTER_OPTIONS
} from './render-metrics.const';

export type {
  NatTableRenderMetricsColumnIntl,
  NatTableRenderMetricsDurationContext,
  NatTableRenderMetricsFilterIntl,
  NatTableRenderMetricsWidgetsIntl,
  NatTableRenderMetricsPanelIntl,
  NatTableRenderMetricsRowCountContext,
  NatTableRenderMetricsIntl,
  NatTableRenderMetricsIntlConfig,
  NatTableRenderMetricsIntlProviderFactory,
  NatTableRenderMetricsIntlProviderConfig,
  NatTableRenderMetricsIntlProviderSource,
  NatTableRenderMetricsIntlStaticProviderConfig,
  NatTableRenderMetricsLocalesMap,
  NatTableRenderMetricsLocalesProviderConfig,
  NatTableRenderMetricsLocalesProviderFactory,
  NatTableRenderMetricsLocalesProviderSource,
  NatTableRenderMetricsNumberFormatter,
  RowRenderFilterOption,
  RowRenderTone
} from './render-metrics.type';
