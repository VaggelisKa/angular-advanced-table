import { NAT_TABLE_BUILT_IN_LOCALES } from '../common/accessibility.const';
import type { NatTableLocalesMap } from '../common/accessibility.type';
import { NAT_TABLE_BUILT_IN_CONTROLS_LOCALES } from '../common/controls.const';
import type { NatTableControlsLocalesMap } from '../common/controls.type';
import { NAT_DA_CONTROLS_LOCALE_LABELS } from '../common/locale-da-controls.const';
import { NAT_DA_RENDER_METRICS_LOCALE_LABELS } from '../common/locale-da-render-metrics.const';
import { NAT_DA_LOCALE_LABELS } from '../common/locale-da.const';
import { NAT_FI_CONTROLS_LOCALE_LABELS } from '../common/locale-fi-controls.const';
import { NAT_FI_RENDER_METRICS_LOCALE_LABELS } from '../common/locale-fi-render-metrics.const';
import { NAT_FI_LOCALE_LABELS } from '../common/locale-fi.const';
import { NAT_DA_LOCALE_ID, NAT_FI_LOCALE_ID, NAT_NB_LOCALE_ID, NAT_NO_LOCALE_ID, NAT_SV_LOCALE_ID } from '../common/locale-id.const';
import { NAT_NB_CONTROLS_LOCALE_LABELS } from '../common/locale-nb-controls.const';
import { NAT_NB_RENDER_METRICS_LOCALE_LABELS } from '../common/locale-nb-render-metrics.const';
import { NAT_NB_LOCALE_LABELS } from '../common/locale-nb.const';
import { NAT_SV_CONTROLS_LOCALE_LABELS } from '../common/locale-sv-controls.const';
import { NAT_SV_RENDER_METRICS_LOCALE_LABELS } from '../common/locale-sv-render-metrics.const';
import { NAT_SV_LOCALE_LABELS } from '../common/locale-sv.const';
import { NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES } from '../common/render-metrics.const';
import type { NatTableRenderMetricsLocalesMap } from '../common/render-metrics.type';

/*
 * Every dictionary the entry point ships: the English default that needs no
 * registration plus the opt-in translations. One fixture for all three domain
 * specs, so a language added to the barrel cannot be covered in one spec and
 * silently skipped in another.
 */

export const SHIPPED_TABLE_LOCALES: NatTableLocalesMap = {
  ...NAT_TABLE_BUILT_IN_LOCALES,
  [NAT_DA_LOCALE_ID]: NAT_DA_LOCALE_LABELS,
  [NAT_FI_LOCALE_ID]: NAT_FI_LOCALE_LABELS,
  [NAT_NB_LOCALE_ID]: NAT_NB_LOCALE_LABELS,
  [NAT_NO_LOCALE_ID]: NAT_NB_LOCALE_LABELS,
  [NAT_SV_LOCALE_ID]: NAT_SV_LOCALE_LABELS
};

export const SHIPPED_CONTROLS_LOCALES: NatTableControlsLocalesMap = {
  ...NAT_TABLE_BUILT_IN_CONTROLS_LOCALES,
  [NAT_DA_LOCALE_ID]: NAT_DA_CONTROLS_LOCALE_LABELS,
  [NAT_FI_LOCALE_ID]: NAT_FI_CONTROLS_LOCALE_LABELS,
  [NAT_NB_LOCALE_ID]: NAT_NB_CONTROLS_LOCALE_LABELS,
  [NAT_NO_LOCALE_ID]: NAT_NB_CONTROLS_LOCALE_LABELS,
  [NAT_SV_LOCALE_ID]: NAT_SV_CONTROLS_LOCALE_LABELS
};

export const SHIPPED_RENDER_METRICS_LOCALES: NatTableRenderMetricsLocalesMap = {
  ...NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES,
  [NAT_DA_LOCALE_ID]: NAT_DA_RENDER_METRICS_LOCALE_LABELS,
  [NAT_FI_LOCALE_ID]: NAT_FI_RENDER_METRICS_LOCALE_LABELS,
  [NAT_NB_LOCALE_ID]: NAT_NB_RENDER_METRICS_LOCALE_LABELS,
  [NAT_NO_LOCALE_ID]: NAT_NB_RENDER_METRICS_LOCALE_LABELS,
  [NAT_SV_LOCALE_ID]: NAT_SV_RENDER_METRICS_LOCALE_LABELS
};

/**
 * Dotted key paths of a dictionary, so a translation can be compared with the
 * English baseline: a key added to English and forgotten in a translation is
 * otherwise invisible until a user reads an English string mid-sentence.
 */
export const collectKeyPaths = (value: unknown, prefix = ''): string[] => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, nested]) => collectKeyPaths(nested, prefix ? `${prefix}.${key}` : key));
};
