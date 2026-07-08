import { InjectionToken } from '@angular/core';
import type { Provider } from '@angular/core';

import { createNatTableMergedProvider } from './provider-factory';
import { NAT_TABLE_BUILT_IN_CONTROLS_LOCALES } from '../common/controls.const';
import type {
  NatTableControlsIntlConfig,
  NatTableControlsIntlProviderConfig,
  NatTableControlsLocalesMap
} from '../common/controls.type';
import { mergeNatTableControlsIntlConfig } from '../utils/controls.util';

/** Built-in locale defaults used when no components locale provider is configured. */
const NAT_TABLE_CONTROLS_DEFAULT_INTL: NatTableControlsIntlConfig = {
  locales: NAT_TABLE_BUILT_IN_CONTROLS_LOCALES
};

/** Injection token backing `provideNatTableControlsLocales(...)`. */
export const NAT_TABLE_CONTROLS_INTL = new InjectionToken<NatTableControlsIntlConfig>('NAT_TABLE_CONTROLS_INTL', {
  providedIn: 'root',
  factory: (): NatTableControlsIntlConfig => NAT_TABLE_CONTROLS_DEFAULT_INTL
});

/**
 * Provides default labels and number formatting for the companion controls in `ng-advanced-table/components`.
 *
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag.
 */
export const provideNatTableControlsIntl = (intl: NatTableControlsIntlProviderConfig): Provider[] =>
  createNatTableMergedProvider(NAT_TABLE_CONTROLS_INTL, NAT_TABLE_CONTROLS_DEFAULT_INTL, intl, mergeNatTableControlsIntlConfig);

/**
 * Registers every companion components locale shipped by `ng-advanced-table/locale`.
 *
 * Call this only when using `ng-advanced-table/components`.
 */
export const provideNatTableControlsLocales = (overrides: NatTableControlsLocalesMap = {}): Provider[] =>
  provideNatTableControlsIntl({ locales: overrides });
