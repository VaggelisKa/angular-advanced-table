import type { NatTableControlsIntl } from 'ng-advanced-table/locale';

import type { LocalePreview } from './table-builder.type';

/** Locale id used by the builder's localization demo. */
export const DEMO_LOCALE_ID = 'da';

// Danish control-label overrides. Partial dictionary — unset keys fall back to the
// built-in English defaults via provideNatTableControlsLocales' merge.
export const NAT_DA_CONTROLS_LABELS: NatTableControlsIntl = {
  search: { label: 'Søg i rækker', placeholder: 'Søg i rækker' },
  columnVisibility: { label: 'Kolonner', groupAriaLabel: 'Kolonnesynlighed' },
  pageSize: {
    groupAriaLabel: 'Rækker pr. side',
    accessibilityLabels: {
      pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} rækker`,
      pageSizeOptionAriaLabel: ({ pageSizeText }) => `${pageSizeText} rækker pr. side`
    }
  },
  pager: {
    groupAriaLabel: 'Tabelpaginering',
    accessibilityLabels: {
      previousPageAriaLabel: 'Forrige side',
      nextPageAriaLabel: 'Næste side',
      pageIndicator: ({ pageText, pageCountText }) => `Side ${pageText} af ${pageCountText}`
    }
  },
  toolbar: { toolbarLabel: 'Tabelværktøjslinje' },
  selection: { columnLabel: 'Markering' }
};

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
    readonly headers: Record<'name' | 'category' | 'status' | 'value', string>;
    readonly selectAllAriaLabel: string;
    readonly selectRowAriaLabel: (name: string) => string;
  }
> = {
  en: {
    headers: { name: 'Name', category: 'Category', status: 'Status', value: 'Value' },
    selectAllAriaLabel: 'Select all rows',
    selectRowAriaLabel: (name) => `Select ${name}`
  },
  da: {
    headers: { name: 'Navn', category: 'Kategori', status: 'Status', value: 'Værdi' },
    selectAllAriaLabel: 'Vælg alle rækker',
    selectRowAriaLabel: (name) => `Vælg ${name}`
  }
};
