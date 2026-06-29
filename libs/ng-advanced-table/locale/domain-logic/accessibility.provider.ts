import { InjectionToken, Optional, SkipSelf } from '@angular/core';
import type { Provider } from '@angular/core';

import { NAT_TABLE_BUILT_IN_LOCALES } from '../common/accessibility.const';
import type { NatTableIntlConfig, NatTableIntlProviderConfig, NatTableLocalesMap } from '../common/accessibility.type';
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
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag.
 */
export const provideNatTableIntl = (intl: NatTableIntlProviderConfig): Provider[] => [
  {
    provide: NAT_TABLE_INTL,
    deps: [[new Optional(), new SkipSelf(), NAT_TABLE_INTL]],
    useFactory: (parent: NatTableIntlConfig | null) => mergeNatTableIntlConfig(parent ?? NAT_TABLE_DEFAULT_INTL, intl)
  }
];

/**
 * Registers every table locale shipped by `ng-advanced-table/locale`.
 *
 * Pass `overrides` only when adding custom locale ids or overriding built-in
 * generated table labels. Instance-specific copy such as table names,
 * captions, descriptions, and column labels should stay on component inputs or
 * column definitions.
 */
export const provideNatTableLocales = (overrides: NatTableLocalesMap = {}): Provider[] => provideNatTableIntl({ locales: overrides });
