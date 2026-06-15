import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
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
    }
  });

  it('locks the English toolbar copy', () => {
    const toolbar = NAT_TABLE_BUILT_IN_UI_LOCALES['en'].toolbar;

    expect(toolbar?.toolbarLabel).toBe('Table toolbar');
  });

  it('keeps the toolbar slice through provideNatTableUiLocales()', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideNatTableUiLocales()],
    });

    const uiIntl = TestBed.inject(NAT_TABLE_UI_INTL);

    for (const localeId of Object.keys(NAT_TABLE_BUILT_IN_UI_LOCALES)) {
      const toolbar = uiIntl.locales?.[localeId]?.toolbar;

      expect(toolbar?.toolbarLabel, `${localeId}: toolbarLabel`).toBeTruthy();
    }
  });

  it('falls back to English toolbar copy for unknown locales', () => {
    const resolved = resolveNatTableUiIntl(NAT_TABLE_UI_DEFAULT_INTL, 'zz');

    expect(resolved.toolbar?.toolbarLabel).toBe('Table toolbar');
  });

  it('lets a locale dictionary override English toolbar copy', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNatTableUiLocales({
          da: {
            toolbar: {
              toolbarLabel: 'Tabel værktøjslinje',
            },
          },
        }),
      ],
    });

    const resolved = resolveNatTableUiIntl(TestBed.inject(NAT_TABLE_UI_INTL), 'da');

    expect(resolved.toolbar?.toolbarLabel).toBe('Tabel værktøjslinje');
  });

  it('lets provideNatTableUiIntl overrides win over the built-in dictionary', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNatTableUiIntl({
          toolbar: {
            toolbarLabel: 'Provider toolbar',
          },
        }),
      ],
    });

    const resolved = resolveNatTableUiIntl(TestBed.inject(NAT_TABLE_UI_INTL), 'en');

    expect(resolved.toolbar?.toolbarLabel).toBe('Provider toolbar');
  });
});
