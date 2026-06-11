import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  mergeToolbarLabels,
  NAT_TABLE_UI_DEFAULT_INTL,
  NAT_TABLE_UI_INTL,
  provideNatTableUiIntl,
  provideNatTableUiLocales,
  resolveNatTableUiIntl,
} from './provide-ui-locales';
import { NAT_TABLE_BUILT_IN_UI_LOCALES } from './ui-built-in-locales';

describe('UI locale toolbar slice', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('ships a complete toolbar slice in every built-in UI locale', () => {
    const localeIds = Object.keys(NAT_TABLE_BUILT_IN_UI_LOCALES);

    expect(localeIds.length).toBeGreaterThan(0);

    for (const localeId of localeIds) {
      const toolbar = NAT_TABLE_BUILT_IN_UI_LOCALES[localeId].toolbar;

      expect(toolbar?.toolbarLabel, `${localeId}: toolbarLabel`).toBeTruthy();
      expect(toolbar?.sortMenuLabel, `${localeId}: sortMenuLabel`).toBeTruthy();
      expect(toolbar?.viewMenuLabel, `${localeId}: viewMenuLabel`).toBeTruthy();
      expect(toolbar?.actionsMenuLabel, `${localeId}: actionsMenuLabel`).toBeTruthy();
      expect(toolbar?.accessibilityLabels?.moreButton, `${localeId}: moreButton`).toBeTypeOf(
        'function',
      );
      expect(
        toolbar?.accessibilityLabels?.moreMenuLabel,
        `${localeId}: moreMenuLabel`,
      ).toBeTypeOf('function');
      expect(
        toolbar?.accessibilityLabels?.searchExpandButton,
        `${localeId}: searchExpandButton`,
      ).toBeTypeOf('function');
      expect(toolbar?.accessibilityLabels?.sortMenuItem, `${localeId}: sortMenuItem`).toBeTypeOf(
        'function',
      );
      expect(
        toolbar?.accessibilityLabels?.viewMenuItem,
        `${localeId}: viewMenuItem`,
      ).toBeTypeOf('function');
    }
  });

  it('locks the English toolbar copy', () => {
    const toolbar = NAT_TABLE_BUILT_IN_UI_LOCALES['en'].toolbar;
    const labels = toolbar?.accessibilityLabels;

    expect(toolbar?.toolbarLabel).toBe('Table toolbar');
    expect(toolbar?.sortMenuLabel).toBe('Sort');
    expect(toolbar?.viewMenuLabel).toBe('View');
    expect(toolbar?.actionsMenuLabel).toBe('Actions');
    expect(labels?.moreButton?.({ hiddenCountValue: 2, hiddenCountText: '2' })).toBe(
      'More toolbar items (2 hidden)',
    );
    expect(labels?.moreMenuLabel?.()).toBe('More toolbar items');
    expect(labels?.searchExpandButton?.()).toBe('Expand search');
    expect(
      labels?.sortMenuItem?.({ columnLabel: 'Region', direction: 'ascending', active: false }),
    ).toBe('Sort Region ascending');
    expect(
      labels?.sortMenuItem?.({ columnLabel: 'Region', direction: 'descending', active: true }),
    ).toBe('Sort Region descending');
    expect(
      labels?.sortMenuItem?.({ columnLabel: 'Region', direction: 'none', active: false }),
    ).toBe('Clear sorting for Region');
    expect(labels?.viewMenuItem?.({ columnLabel: 'Region', visible: true })).toBe(
      'Toggle Region column',
    );
  });

  it('mergeToolbarLabels overrides per field and keeps parent fallbacks', () => {
    const parent = NAT_TABLE_BUILT_IN_UI_LOCALES['en'].toolbar?.accessibilityLabels;
    const merged = mergeToolbarLabels(parent, {
      searchExpandButton: () => 'Udvid søgning',
    });

    expect(merged.searchExpandButton?.()).toBe('Udvid søgning');
    expect(merged.moreMenuLabel?.()).toBe('More toolbar items');
    expect(merged.moreButton?.({ hiddenCountValue: 1, hiddenCountText: '1' })).toBe(
      'More toolbar items (1 hidden)',
    );
    expect(
      merged.sortMenuItem?.({ columnLabel: 'A', direction: 'descending', active: true }),
    ).toBe('Sort A descending');
    expect(merged.viewMenuItem?.({ columnLabel: 'A', visible: false })).toBe(
      'Toggle A column',
    );
  });

  it('keeps the toolbar slice through provideNatTableUiLocales()', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideNatTableUiLocales()],
    });

    const uiIntl = TestBed.inject(NAT_TABLE_UI_INTL);

    for (const localeId of Object.keys(NAT_TABLE_BUILT_IN_UI_LOCALES)) {
      const toolbar = uiIntl.locales?.[localeId]?.toolbar;

      expect(toolbar?.toolbarLabel, `${localeId}: toolbarLabel`).toBeTruthy();
      expect(
        toolbar?.accessibilityLabels?.moreMenuLabel,
        `${localeId}: moreMenuLabel`,
      ).toBeTypeOf('function');
    }
  });

  it('falls back to English toolbar copy for unknown locales', () => {
    const resolved = resolveNatTableUiIntl(NAT_TABLE_UI_DEFAULT_INTL, 'zz');

    expect(resolved.toolbar?.sortMenuLabel).toBe('Sort');
    expect(resolved.toolbar?.accessibilityLabels?.searchExpandButton?.()).toBe('Expand search');
  });

  it('lets a locale dictionary override English while keeping nested fallbacks', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNatTableUiLocales({
          da: {
            toolbar: {
              sortMenuLabel: 'Sortér',
              accessibilityLabels: {
                searchExpandButton: () => 'Udvid søgning',
              },
            },
          },
        }),
      ],
    });

    const resolved = resolveNatTableUiIntl(TestBed.inject(NAT_TABLE_UI_INTL), 'da');
    const labels = resolved.toolbar?.accessibilityLabels;

    expect(resolved.toolbar?.sortMenuLabel).toBe('Sortér');
    expect(resolved.toolbar?.viewMenuLabel).toBe('View');
    expect(labels?.searchExpandButton?.()).toBe('Udvid søgning');
    expect(labels?.moreMenuLabel?.()).toBe('More toolbar items');
  });

  it('lets provideNatTableUiIntl overrides win over the built-in dictionary', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNatTableUiIntl({
          toolbar: {
            actionsMenuLabel: 'Provider actions',
            accessibilityLabels: {
              moreButton: ({ hiddenCountText }) => `Provider more (${hiddenCountText})`,
            },
          },
        }),
      ],
    });

    const resolved = resolveNatTableUiIntl(TestBed.inject(NAT_TABLE_UI_INTL), 'en');
    const labels = resolved.toolbar?.accessibilityLabels;

    expect(resolved.toolbar?.actionsMenuLabel).toBe('Provider actions');
    expect(resolved.toolbar?.sortMenuLabel).toBe('Sort');
    expect(labels?.moreButton?.({ hiddenCountValue: 3, hiddenCountText: '3' })).toBe(
      'Provider more (3)',
    );
    expect(labels?.moreMenuLabel?.()).toBe('More toolbar items');
  });

  it('exposes the toolbar intl helper through the ui public api', async () => {
    const publicApi = await import('../public-api');

    expect(publicApi.mergeToolbarLabels).toBeTypeOf('function');
  });
});
