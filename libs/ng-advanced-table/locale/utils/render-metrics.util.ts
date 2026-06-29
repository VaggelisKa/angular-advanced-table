import { NAT_EN_LOCALE_ID } from '../common/locale-id.const';
import { NAT_EN_RENDER_METRICS_LOCALE_LABELS } from '../common/render-metrics.const';
import type {
  NatTableRenderMetricsColumnIntl,
  NatTableRenderMetricsFilterIntl,
  NatTableRenderMetricsIntl,
  NatTableRenderMetricsIntlConfig,
  NatTableRenderMetricsIntlProviderConfig,
  NatTableRenderMetricsLocalesMap,
  NatTableRenderMetricsNumberFormatter,
  NatTableRenderMetricsPanelIntl,
  NatTableRenderMetricsWidgetsIntl
} from '../common/render-metrics.type';

const DEFAULT_NUMBER_FORMATTER: NatTableRenderMetricsNumberFormatter = (value, options, locale) =>
  new Intl.NumberFormat(locale, options).format(value);

/** Merges the render-metrics filter text fields, override values winning. */
const mergeRenderMetricsFilterText = (
  parent?: NatTableRenderMetricsFilterIntl,
  override?: NatTableRenderMetricsFilterIntl
): Partial<NatTableRenderMetricsFilterIntl> => ({
  heading: override?.heading ?? parent?.heading,
  groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
  idleCaption: override?.idleCaption ?? parent?.idleCaption
});

/** Merges the render-metrics filter callbacks and options, override values winning. */
const mergeRenderMetricsFilterFormatters = (
  parent?: NatTableRenderMetricsFilterIntl,
  override?: NatTableRenderMetricsFilterIntl
): Partial<NatTableRenderMetricsFilterIntl> => ({
  rowSampleCaption: override?.rowSampleCaption ?? parent?.rowSampleCaption,
  options: override?.options ?? parent?.options
});

/** Merges render-metrics filter labels and options field by field. */
export const mergeRenderMetricsFilterIntl = (
  parent?: NatTableRenderMetricsFilterIntl,
  override?: NatTableRenderMetricsFilterIntl
): NatTableRenderMetricsFilterIntl => ({
  ...mergeRenderMetricsFilterText(parent, override),
  ...mergeRenderMetricsFilterFormatters(parent, override)
});

/** Merges the render-metrics panel text fields, override values winning. */
const mergeRenderMetricsPanelText = (
  parent?: NatTableRenderMetricsPanelIntl,
  override?: NatTableRenderMetricsPanelIntl
): Partial<NatTableRenderMetricsPanelIntl> => ({
  ariaLabel: override?.ariaLabel ?? parent?.ariaLabel,
  toneLabel: override?.toneLabel ?? parent?.toneLabel,
  idleSummary: override?.idleSummary ?? parent?.idleSummary
});

/** Merges the render-metrics panel callbacks, override values winning. */
const mergeRenderMetricsPanelFormatters = (
  parent?: NatTableRenderMetricsPanelIntl,
  override?: NatTableRenderMetricsPanelIntl
): Partial<NatTableRenderMetricsPanelIntl> => ({
  rowSampleSummary: override?.rowSampleSummary ?? parent?.rowSampleSummary,
  duration: override?.duration ?? parent?.duration
});

/** Merges render-metrics panel labels and formatters field by field. */
export const mergeRenderMetricsPanelIntl = (
  parent?: NatTableRenderMetricsPanelIntl,
  override?: NatTableRenderMetricsPanelIntl
): NatTableRenderMetricsPanelIntl => ({
  ...mergeRenderMetricsPanelText(parent, override),
  ...mergeRenderMetricsPanelFormatters(parent, override)
});

/** Merges the render-metrics column text fields, override values winning. */
const mergeRenderMetricsColumnText = (
  parent?: NatTableRenderMetricsColumnIntl,
  override?: NatTableRenderMetricsColumnIntl
): Partial<NatTableRenderMetricsColumnIntl> => ({
  header: override?.header ?? parent?.header,
  pendingLabel: override?.pendingLabel ?? parent?.pendingLabel
});

/** Merges the render-metrics column suffix and formatters, override values winning. */
const mergeRenderMetricsColumnFormatters = (
  parent?: NatTableRenderMetricsColumnIntl,
  override?: NatTableRenderMetricsColumnIntl
): Partial<NatTableRenderMetricsColumnIntl> => ({
  unitSuffix: override?.unitSuffix ?? parent?.unitSuffix,
  duration: override?.duration ?? parent?.duration
});

/** Merges render-metrics column labels and formatters field by field. */
export const mergeRenderMetricsColumnIntl = (
  parent?: NatTableRenderMetricsColumnIntl,
  override?: NatTableRenderMetricsColumnIntl
): NatTableRenderMetricsColumnIntl => ({
  ...mergeRenderMetricsColumnText(parent, override),
  ...mergeRenderMetricsColumnFormatters(parent, override)
});

const mergeRenderMetricsWidgetsIntl = (
  parent: NatTableRenderMetricsWidgetsIntl | undefined,
  override: NatTableRenderMetricsWidgetsIntl | undefined
): NatTableRenderMetricsWidgetsIntl => ({
  filter: mergeRenderMetricsFilterIntl(parent?.filter, override?.filter),
  panel: mergeRenderMetricsPanelIntl(parent?.panel, override?.panel),
  column: mergeRenderMetricsColumnIntl(parent?.column, override?.column)
});

/** Merges render-metrics locale dictionaries, with override values taking precedence. */
const mergeNatTableRenderMetricsIntl = (
  parent: NatTableRenderMetricsIntl | undefined,
  override: NatTableRenderMetricsIntl
): NatTableRenderMetricsIntl => ({
  renderMetrics: mergeRenderMetricsWidgetsIntl(parent?.renderMetrics, override.renderMetrics),
  formatNumber: override.formatNumber ?? parent?.formatNumber ?? DEFAULT_NUMBER_FORMATTER
});

const mergeNatTableRenderMetricsLocaleIntl = (
  parent?: NatTableRenderMetricsIntl,
  override?: NatTableRenderMetricsIntl
): NatTableRenderMetricsIntl => mergeNatTableRenderMetricsIntl(parent, override ?? {});

const mergeLocaleMaps = (
  parentLocales: NatTableRenderMetricsLocalesMap,
  overrideLocales: NatTableRenderMetricsLocalesMap
): NatTableRenderMetricsLocalesMap => {
  const merged: NatTableRenderMetricsLocalesMap = {};

  for (const [localeId, labels] of Object.entries(parentLocales)) {
    merged[localeId] = mergeNatTableRenderMetricsLocaleIntl(undefined, labels);
  }

  for (const [localeId, labels] of Object.entries(overrideLocales)) {
    merged[localeId] = mergeNatTableRenderMetricsLocaleIntl(merged[localeId], labels);
  }

  return merged;
};

const isRenderMetricsIntlConfig = (config: NatTableRenderMetricsIntlProviderConfig): config is NatTableRenderMetricsIntlConfig =>
  'locales' in config;

const normalizeRenderMetricsIntlProviderConfig = (
  config: NatTableRenderMetricsIntlProviderConfig
): NatTableRenderMetricsIntlConfig => {
  if (isRenderMetricsIntlConfig(config)) return config;

  return {
    locales: {
      [NAT_EN_LOCALE_ID]: config
    }
  };
};

/** Merges a parent render-metrics intl config with a provider override, field by field. */
export const mergeNatTableRenderMetricsIntlConfig = (
  parent: NatTableRenderMetricsIntlConfig,
  override: NatTableRenderMetricsIntlProviderConfig
): NatTableRenderMetricsIntlConfig => {
  const overrideConfig = normalizeRenderMetricsIntlProviderConfig(override);

  return {
    locales: mergeLocaleMaps(parent.locales ?? {}, overrideConfig.locales ?? {})
  };
};

/** Formats generated render-metrics numbers through the configured locale formatter. */
export const formatNatTableRenderMetricsNumber = (
  intl: NatTableRenderMetricsIntl,
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string
): string => (intl.formatNumber ?? DEFAULT_NUMBER_FORMATTER)(value, options, locale);

/** Resolves a render-metrics locale dictionary, falling back to built-in English defaults. */
export const resolveNatTableRenderMetricsIntl = (intl: NatTableRenderMetricsIntlConfig, locale: string): NatTableRenderMetricsIntl => {
  const englishIntl = intl.locales?.[NAT_EN_LOCALE_ID] ?? NAT_EN_RENDER_METRICS_LOCALE_LABELS;
  const selectedIntl = intl.locales?.[locale] ?? (locale === NAT_EN_LOCALE_ID ? {} : null);

  return selectedIntl ? mergeNatTableRenderMetricsIntl(englishIntl, selectedIntl) : mergeNatTableRenderMetricsIntl(englishIntl, {});
};
