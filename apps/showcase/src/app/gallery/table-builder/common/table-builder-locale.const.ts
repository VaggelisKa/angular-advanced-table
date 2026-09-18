import type { Provider } from '@angular/core';

import {
  NAT_DA_CONTROLS_LOCALE_LABELS,
  NAT_DA_LOCALE_LABELS,
  provideNatTableControlsLocales,
  provideNatTableLocales
} from 'ng-advanced-table/locale';

import type { LocalePreview } from './table-builder.type';

/**
 * Built-in dictionaries are opt-in, so the demo registers the two domains it
 * uses: table announcements and companion-control labels.
 */
export const DEMO_LOCALE_PROVIDERS: Provider[] = [
  provideNatTableLocales({ da: NAT_DA_LOCALE_LABELS }),
  provideNatTableControlsLocales({ da: NAT_DA_CONTROLS_LOCALE_LABELS })
];

/** Locale id used by the builder's localization demo. */
export const DEMO_LOCALE_ID = 'da';

export const LOCALE_PREVIEWS: { value: LocalePreview; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'da', label: 'Dansk' }
];

/**
 * Data-layer copy for the localization demo: column headers plus the selection
 * column's row-aware aria labels. `provideNatTableControlsLocales` localizes
 * table *controls*, but column headers are your own data — you localize them
 * yourself, which is what this table demonstrates.
 */
export const DEMO_COLUMN_INTL: Record<
  LocalePreview,
  {
    readonly headers: Record<'name' | 'category' | 'status' | 'owner' | 'value', string>;
    readonly selectAllAriaLabel: string;
    readonly selectRowAriaLabel: (name: string) => string;
  }
> = {
  en: {
    headers: { name: 'Name', category: 'Category', status: 'Status', owner: 'Owner', value: 'Value' },
    selectAllAriaLabel: 'Select all rows',
    selectRowAriaLabel: (name) => `Select ${name}`
  },
  da: {
    headers: { name: 'Navn', category: 'Kategori', status: 'Status', owner: 'Ejer', value: 'Værdi' },
    selectAllAriaLabel: 'Vælg alle rækker',
    selectRowAriaLabel: (name) => `Vælg ${name}`
  }
};
