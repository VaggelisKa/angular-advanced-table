import { InjectionToken, assertInInjectionContext, inject } from '@angular/core';
import type { Provider } from '@angular/core';

import { createNatTableMergedProvider, mapNatTableProviderConfig } from './provider-factory';
import { NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES } from '../common/render-metrics.const';
import type {
  NatTableRenderMetricsIntlConfig,
  NatTableRenderMetricsIntlProviderConfig,
  NatTableRenderMetricsIntlStaticProviderConfig,
  NatTableRenderMetricsLocalesProviderConfig
} from '../common/render-metrics.type';
import { mergeNatTableRenderMetricsIntlConfig } from '../utils/render-metrics.util';

/** Built-in locale defaults used when no render-metrics locale provider is configured. */
const NAT_TABLE_RENDER_METRICS_DEFAULT_INTL: NatTableRenderMetricsIntlConfig = {
  locales: NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES
};

/** Injection token backing `provideNatTableRenderMetricsLocales(...)`. */
export const NAT_TABLE_RENDER_METRICS_INTL = new InjectionToken<NatTableRenderMetricsIntlConfig>('NAT_TABLE_RENDER_METRICS_INTL', {
  providedIn: 'root',
  factory: (): NatTableRenderMetricsIntlConfig => NAT_TABLE_RENDER_METRICS_DEFAULT_INTL
});

/**
 * Provides default labels and number formatting for optional render-metrics helpers.
 *
 * Static configs, direct signals, and factories returning either are supported.
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag. Signal
 * updates flow through that hierarchy without recreating an injector.
 */
export const provideNatTableRenderMetricsIntl = (intl: NatTableRenderMetricsIntlProviderConfig): Provider[] =>
  createNatTableMergedProvider<NatTableRenderMetricsIntlConfig, NatTableRenderMetricsIntlStaticProviderConfig>(
    NAT_TABLE_RENDER_METRICS_INTL,
    NAT_TABLE_RENDER_METRICS_DEFAULT_INTL,
    intl,
    mergeNatTableRenderMetricsIntlConfig
  );

/**
 * Registers every render-metrics locale shipped by `ng-advanced-table/locale`.
 *
 * Call this only when using `ng-advanced-table/render-metrics`.
 */
export const provideNatTableRenderMetricsLocales = (overrides: NatTableRenderMetricsLocalesProviderConfig = {}): Provider[] =>
  provideNatTableRenderMetricsIntl(mapNatTableProviderConfig(overrides, (locales) => ({ locales })));

/**
 * Reads render-metrics locale defaults when called inside Angular injection context.
 *
 * Calls outside injection context fall back to the built-in default config.
 */
export const injectNatTableRenderMetricsIntl = (): NatTableRenderMetricsIntlConfig => {
  try {
    assertInInjectionContext(injectNatTableRenderMetricsIntl);
  } catch {
    return NAT_TABLE_RENDER_METRICS_DEFAULT_INTL;
  }

  return inject(NAT_TABLE_RENDER_METRICS_INTL);
};
