import { InjectionToken, Optional, SkipSelf, inject } from '@angular/core';
import type { Provider } from '@angular/core';

import { NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES } from '../common/render-metrics.const';
import type {
  NatTableRenderMetricsIntlConfig,
  NatTableRenderMetricsIntlProviderConfig,
  NatTableRenderMetricsLocalesMap
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

const isMissingInjectionContextError = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'code' in error && (error as { readonly code: unknown }).code === -203;

/**
 * Provides default labels and number formatting for optional render-metrics helpers.
 *
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag.
 */
export const provideNatTableRenderMetricsIntl = (intl: NatTableRenderMetricsIntlProviderConfig): Provider[] => [
  {
    provide: NAT_TABLE_RENDER_METRICS_INTL,
    deps: [[new Optional(), new SkipSelf(), NAT_TABLE_RENDER_METRICS_INTL]],
    useFactory: (parent: NatTableRenderMetricsIntlConfig | null) =>
      mergeNatTableRenderMetricsIntlConfig(parent ?? NAT_TABLE_RENDER_METRICS_DEFAULT_INTL, intl)
  }
];

/**
 * Registers every render-metrics locale shipped by `ng-advanced-table/locale`.
 *
 * Call this only when using `ng-advanced-table/render-metrics`.
 */
export const provideNatTableRenderMetricsLocales = (overrides: NatTableRenderMetricsLocalesMap = {}): Provider[] =>
  provideNatTableRenderMetricsIntl({ locales: overrides });

/**
 * Reads render-metrics locale defaults when called inside Angular injection context.
 *
 * Calls outside injection context fall back to the built-in default config.
 */
export const injectNatTableRenderMetricsIntl = (): NatTableRenderMetricsIntlConfig => {
  try {
    return inject(NAT_TABLE_RENDER_METRICS_INTL);
  } catch (error) {
    if (!isMissingInjectionContextError(error)) {
      throw error;
    }

    return NAT_TABLE_RENDER_METRICS_DEFAULT_INTL;
  }
};
