import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  NAT_TABLE_UI_DEFAULT_INTL,
  NAT_TABLE_UI_INTL,
  provideNatTableUiIntl,
  provideNatTableUiLocales,
  resolveNatTableUiIntl
} from './provide-ui-locales';
import { NAT_TABLE_BUILT_IN_UI_LOCALES } from './ui-built-in-locales';
import type {
  NatTableAccessibilityColumnVisibilityLabels,
  NatTableAccessibilityHeaderActionLabels,
  NatTableAccessibilityPageSizeLabels,
  NatTableAccessibilityPagerLabels,
  NatTableUiIntl,
  NatTableUiIntlConfig
} from './ui-types';

const localeOf = (uiIntl: NatTableUiIntlConfig, localeId: string): NatTableUiIntl | undefined => uiIntl.locales?.[localeId];

describe('FEATURE: UI locale toolbar slice', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('GIVEN: ships a complete toolbar slice in every built-in UI locale', () => {
    describe('WHEN: ships a complete toolbar slice in every built-in UI locale', () => {
      it('THEN: it ships a complete toolbar slice in every built-in UI locale', () => {
        const localeIds = Object.keys(NAT_TABLE_BUILT_IN_UI_LOCALES);

        expect(localeIds.length).toBeGreaterThan(0);

        for (const localeId of localeIds) {
          const toolbar = NAT_TABLE_BUILT_IN_UI_LOCALES[localeId].toolbar;

          expect(toolbar?.toolbarLabel, `${localeId}: toolbarLabel`).toBeTruthy();
        }
      });
    });
  });

  describe('GIVEN: locks the English toolbar copy', () => {
    describe('WHEN: locks the English toolbar copy', () => {
      it('THEN: it locks the English toolbar copy', () => {
        const toolbar = NAT_TABLE_BUILT_IN_UI_LOCALES['en'].toolbar;

        expect(toolbar?.toolbarLabel).toBe('Table toolbar');
      });
    });
  });

  describe('GIVEN: keeps the toolbar slice for %s through provideNatTableUiLocales()', () => {
    describe('WHEN: keeps the toolbar slice for %s through provideNatTableUiLocales()', () => {
      it.each(Object.keys(NAT_TABLE_BUILT_IN_UI_LOCALES))(
        'THEN: it keeps the toolbar slice for %s through provideNatTableUiLocales()',
        (localeId) => {
          TestBed.configureTestingModule({
            providers: [provideZonelessChangeDetection(), provideNatTableUiLocales()]
          });

          const uiIntl = TestBed.inject(NAT_TABLE_UI_INTL);

          expect(localeOf(uiIntl, localeId)?.toolbar?.toolbarLabel, `${localeId}: toolbarLabel`).toBeTruthy();
        }
      );
    });
  });

  describe('GIVEN: falls back to English toolbar copy for unknown locales', () => {
    describe('WHEN: falls back to English toolbar copy for unknown locales', () => {
      it('THEN: it falls back to English toolbar copy for unknown locales', () => {
        const resolved = resolveNatTableUiIntl(NAT_TABLE_UI_DEFAULT_INTL, 'zz');

        expect(resolved.toolbar?.toolbarLabel).toBe('Table toolbar');
      });
    });
  });

  describe('GIVEN: lets a locale dictionary override English toolbar copy', () => {
    describe('WHEN: lets a locale dictionary override English toolbar copy', () => {
      it('THEN: it lets a locale dictionary override English toolbar copy', () => {
        TestBed.configureTestingModule({
          providers: [
            provideZonelessChangeDetection(),
            provideNatTableUiLocales({
              da: {
                toolbar: {
                  toolbarLabel: 'Tabel værktøjslinje'
                }
              }
            })
          ]
        });

        const resolved = resolveNatTableUiIntl(TestBed.inject(NAT_TABLE_UI_INTL), 'da');

        expect(resolved.toolbar?.toolbarLabel).toBe('Tabel værktøjslinje');
      });
    });
  });

  describe('GIVEN: lets provideNatTableUiIntl overrides win over the built-in dictionary', () => {
    describe('WHEN: lets provideNatTableUiIntl overrides win over the built-in dictionary', () => {
      it('THEN: it lets provideNatTableUiIntl overrides win over the built-in dictionary', () => {
        TestBed.configureTestingModule({
          providers: [
            provideZonelessChangeDetection(),
            provideNatTableUiIntl({
              toolbar: {
                toolbarLabel: 'Provider toolbar'
              }
            })
          ]
        });

        const resolved = resolveNatTableUiIntl(TestBed.inject(NAT_TABLE_UI_INTL), 'en');

        expect(resolved.toolbar?.toolbarLabel).toBe('Provider toolbar');
      });
    });
  });
});

describe('FEATURE: English companion-control accessibility copy', () => {
  const english = NAT_TABLE_BUILT_IN_UI_LOCALES['en'];
  const pageSizeContext = {
    pageSizeValue: 25,
    pageSizeText: '25',
    selectionState: 'not-selected' as const
  };
  const pagerContext = {
    pageValue: 2,
    pageText: '2',
    pageCountValue: 5,
    pageCountText: '5'
  };
  const visibilityContext = {
    columnLabel: 'Service',
    visibilityState: 'visible' as const,
    toggleAction: 'hide' as const
  };
  const sortedHeaderContext = {
    label: 'Service',
    sortState: 'ascending' as const,
    sortPriority: 1,
    sortCount: 2
  };
  const unpinnedHeaderContext = {
    label: 'Service',
    pinState: 'unpinned' as const,
    toggleAction: 'pin' as const,
    pinSide: 'left' as const,
    pinnedSide: null
  };
  const pinnedHeaderContext = {
    label: 'Service',
    pinState: 'pinned' as const,
    toggleAction: 'unpin' as const,
    pinSide: 'left' as const,
    pinnedSide: 'left' as const
  };

  describe('GIVEN: column visibility', () => {
    let labels: NatTableAccessibilityColumnVisibilityLabels | undefined;

    beforeEach(() => {
      labels = english.columnVisibility?.accessibilityLabels;
    });

    describe('WHEN: locks the toggle-column aria label', () => {
      it('THEN: it locks the toggle-column aria label', () => {
        expect(labels?.toggleColumnAriaLabel?.(visibilityContext)).toBe('Service shown. Hide column');
      });
    });
  });

  describe('GIVEN: page size', () => {
    let labels: NatTableAccessibilityPageSizeLabels | undefined;

    beforeEach(() => {
      labels = english.pageSize?.accessibilityLabels;
    });

    describe('WHEN: locks the page-size option text', () => {
      it('THEN: it locks the page-size option text', () => {
        expect(labels?.pageSizeOptionText?.(pageSizeContext)).toBe('25 rows');
      });
    });

    describe('WHEN: locks the page-size option aria label', () => {
      it('THEN: it locks the page-size option aria label', () => {
        expect(labels?.pageSizeOptionAriaLabel?.(pageSizeContext)).toBe('25 rows per page');
      });
    });
  });

  describe('GIVEN: pager', () => {
    let labels: NatTableAccessibilityPagerLabels | undefined;

    beforeEach(() => {
      labels = english.pager?.accessibilityLabels;
    });

    describe('WHEN: locks the page indicator', () => {
      it('THEN: it locks the page indicator', () => {
        expect(labels?.pageIndicator?.(pagerContext)).toBe('Page 2 of 5');
      });
    });
  });

  describe('GIVEN: header actions', () => {
    let labels: NatTableAccessibilityHeaderActionLabels | undefined;

    beforeEach(() => {
      labels = english.headerActions?.accessibilityLabels;
    });

    describe('WHEN: locks the unsorted sort-button label', () => {
      it('THEN: it locks the unsorted sort-button label', () => {
        expect(
          labels?.sortButton?.({
            ...sortedHeaderContext,
            sortState: 'none',
            sortPriority: null,
            sortCount: 0
          })
        ).toBe('Sort by Service');
      });
    });

    describe('WHEN: locks the sorted sort-button label', () => {
      it('THEN: it locks the sorted sort-button label', () => {
        expect(labels?.sortButton?.(sortedHeaderContext)).toBe(
          'Service sorted in ascending order, sort priority 1 of 2. Change sorting'
        );
      });
    });

    describe('WHEN: locks the menu-button label', () => {
      it('THEN: it locks the menu-button label', () => {
        expect(labels?.menuButton?.({ label: 'Service' })).toBe('Open column actions for Service column');
      });
    });

    describe('WHEN: locks the menu label', () => {
      it('THEN: it locks the menu label', () => {
        expect(labels?.menuLabel?.({ label: 'Service' })).toBe('Column actions for Service column');
      });
    });

    describe('WHEN: locks the pin-button label', () => {
      it('THEN: it locks the pin-button label', () => {
        expect(labels?.pinButton?.(unpinnedHeaderContext)).toBe('Pin left: Service column');
      });
    });

    describe('WHEN: locks the pin-button text', () => {
      it('THEN: it locks the pin-button text', () => {
        expect(labels?.pinButtonText?.(pinnedHeaderContext)).toBe('Unpin left');
      });
    });

    describe('WHEN: locks the move-button label', () => {
      it('THEN: it locks the move-button label', () => {
        expect(labels?.moveButton?.({ label: 'Service', direction: 'right' })).toBe('Move Service column right');
      });
    });

    describe('WHEN: locks the move-button text', () => {
      it('THEN: it locks the move-button text', () => {
        expect(labels?.moveButtonText?.({ label: 'Service', direction: 'right' })).toBe('Move right');
      });
    });
  });
});
