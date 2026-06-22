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

  it('locks English companion-control accessibility copy', () => {
    const english = NAT_TABLE_BUILT_IN_UI_LOCALES['en'];
    const pageSizeContext = {
      pageSizeValue: 25,
      pageSizeText: '25',
      selectionState: 'not-selected' as const,
    };
    const pagerContext = {
      pageValue: 2,
      pageText: '2',
      pageCountValue: 5,
      pageCountText: '5',
    };
    const visibilityContext = {
      columnLabel: 'Service',
      visibilityState: 'visible' as const,
      toggleAction: 'hide' as const,
    };
    const sortedHeaderContext = {
      label: 'Service',
      sortState: 'ascending' as const,
      sortPriority: 1,
      sortCount: 2,
    };
    const unpinnedHeaderContext = {
      label: 'Service',
      pinState: 'unpinned' as const,
      toggleAction: 'pin' as const,
      pinSide: 'left' as const,
      pinnedSide: null,
    };
    const pinnedHeaderContext = {
      label: 'Service',
      pinState: 'pinned' as const,
      toggleAction: 'unpin' as const,
      pinSide: 'left' as const,
      pinnedSide: 'left' as const,
    };

    expect(
      english.columnVisibility?.accessibilityLabels?.toggleColumnAriaLabel?.(visibilityContext),
    ).toBe('Service shown. Hide column');
    expect(english.pageSize?.accessibilityLabels?.pageSizeOptionText?.(pageSizeContext)).toBe(
      '25 rows',
    );
    expect(english.pageSize?.accessibilityLabels?.pageSizeOptionAriaLabel?.(pageSizeContext)).toBe(
      '25 rows per page',
    );
    expect(english.pager?.accessibilityLabels?.pageIndicator?.(pagerContext)).toBe('Page 2 of 5');
    expect(
      english.headerActions?.accessibilityLabels?.sortButton?.({
        ...sortedHeaderContext,
        sortState: 'none',
        sortPriority: null,
        sortCount: 0,
      }),
    ).toBe('Sort by Service');
    expect(english.headerActions?.accessibilityLabels?.sortButton?.(sortedHeaderContext)).toBe(
      'Service sorted in ascending order, sort priority 1 of 2. Change sorting',
    );
    expect(english.headerActions?.accessibilityLabels?.menuButton?.({ label: 'Service' })).toBe(
      'Open column actions for Service column',
    );
    expect(english.headerActions?.accessibilityLabels?.menuLabel?.({ label: 'Service' })).toBe(
      'Column actions for Service column',
    );
    expect(english.headerActions?.accessibilityLabels?.pinButton?.(unpinnedHeaderContext)).toBe(
      'Pin left: Service column',
    );
    expect(english.headerActions?.accessibilityLabels?.pinButtonText?.(pinnedHeaderContext)).toBe(
      'Unpin left',
    );
    expect(
      english.headerActions?.accessibilityLabels?.moveButton?.({
        label: 'Service',
        direction: 'right',
      }),
    ).toBe('Move Service column right');
    expect(
      english.headerActions?.accessibilityLabels?.moveButtonText?.({
        label: 'Service',
        direction: 'right',
      }),
    ).toBe('Move right');
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
