import { InjectionToken } from '@angular/core';
import type { Provider } from '@angular/core';

import { createNatTableMergedProvider, mapNatTableProviderConfig } from './provider-factory';
import type { NatTableControlsIntlProviderConfig, NatTableControlsLocalesProviderConfig } from '../common/controls-provider.type';
import { NAT_TABLE_BUILT_IN_CONTROLS_LOCALES } from '../common/controls.const';
import type { NatTableControlsIntlConfig, NatTableControlsIntlStaticProviderConfig } from '../common/controls.type';
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
 * Static configs, direct signals, and factories returning either are supported.
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag. Signal
 * updates flow through that hierarchy without recreating an injector.
 */
export const provideNatTableControlsIntl = (intl: NatTableControlsIntlProviderConfig): Provider[] =>
  createNatTableMergedProvider<NatTableControlsIntlConfig, NatTableControlsIntlStaticProviderConfig>(
    NAT_TABLE_CONTROLS_INTL,
    NAT_TABLE_CONTROLS_DEFAULT_INTL,
    intl,
    mergeNatTableControlsIntlConfig
  );

/**
 * Registers every companion components locale shipped by `ng-advanced-table/locale`.
 *
 * Call this only when using `ng-advanced-table/components`.
 */
export const provideNatTableControlsLocales = (overrides: NatTableControlsLocalesProviderConfig = {}): Provider[] =>
  provideNatTableControlsIntl(mapNatTableProviderConfig(overrides, (locales) => ({ locales })));
