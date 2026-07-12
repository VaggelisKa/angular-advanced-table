import { InjectionToken } from '@angular/core';
import type { Provider } from '@angular/core';

import { createNatTableMergedProvider, mapNatTableProviderConfig } from './provider-factory';
import { NAT_TABLE_BUILT_IN_LOCALES } from '../common/accessibility.const';
import type {
  NatTableIntlConfig,
  NatTableIntlProviderConfig,
  NatTableIntlStaticProviderConfig,
  NatTableLocalesProviderConfig
} from '../common/accessibility.type';
import { mergeNatTableIntlConfig } from '../utils/accessibility.util';

/** Built-in locale defaults used when no provider is configured. */
const NAT_TABLE_DEFAULT_INTL: NatTableIntlConfig = {
  locales: NAT_TABLE_BUILT_IN_LOCALES
};

/** Injection token backing `provideNatTableLocales(...)`. */
export const NAT_TABLE_INTL = new InjectionToken<NatTableIntlConfig>('NAT_TABLE_INTL', {
  providedIn: 'root',
  factory: (): NatTableIntlConfig => NAT_TABLE_DEFAULT_INTL
});

/**
 * Provides default table labels, announcement formatters, and number formatting.
 *
 * Static configs, direct signals, and factories returning either are supported.
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag. Signal
 * updates flow through that hierarchy without recreating an injector.
 */
export const provideNatTableIntl = (intl: NatTableIntlProviderConfig): Provider[] =>
  createNatTableMergedProvider<NatTableIntlConfig, NatTableIntlStaticProviderConfig>(
    NAT_TABLE_INTL,
    NAT_TABLE_DEFAULT_INTL,
    intl,
    mergeNatTableIntlConfig
  );

/**
 * Registers every table locale shipped by `ng-advanced-table/locale`.
 *
 * Pass `overrides` only when adding custom locale ids or overriding built-in
 * generated table labels. Instance-specific copy such as table names,
 * captions, descriptions, and column labels should stay on component inputs or
 * column definitions.
 */
export const provideNatTableLocales = (overrides: NatTableLocalesProviderConfig = {}): Provider[] =>
  provideNatTableIntl(mapNatTableProviderConfig(overrides, (locales) => ({ locales })));
