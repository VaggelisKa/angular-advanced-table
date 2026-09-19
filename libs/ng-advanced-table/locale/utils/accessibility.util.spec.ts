import { mergeNatTableAccessibilityText, resolveNatTableIntl } from './accessibility.util';
import { NAT_TABLE_BUILT_IN_LOCALES } from '../common/accessibility.const';
import { NAT_NB_LOCALE_LABELS } from '../common/languages/nb/accessibility.const';
import { NAT_NB_LOCALE_ID, NAT_NO_LOCALE_ID } from '../common/locale-id.const';

describe('FEATURE: accessibility intl merge', () => {
  describe('GIVEN: a parent and an override accessibility text', () => {
    describe('WHEN: merging field by field', () => {
      const merged = mergeNatTableAccessibilityText(
        { emptyState: 'Parent empty', loadingState: 'Parent loading' },
        { emptyState: 'Child empty' }
      );

      it('THEN: the override wins', () => {
        expect(merged.emptyState).toBe('Child empty');
      });

      it('THEN: the parent fills the gaps', () => {
        expect(merged.loadingState).toBe('Parent loading');
      });
    });

    describe('WHEN: merging the keyboard instruction entries', () => {
      const merged = mergeNatTableAccessibilityText(
        { keyboardInstructions: 'Parent grid keys', listKeyboardInstructions: 'Parent list keys' },
        { listKeyboardInstructions: 'Child list keys' }
      );

      it('THEN: the list entry merges independently of the grid entry', () => {
        expect(merged.listKeyboardInstructions).toBe('Child list keys');
        expect(merged.keyboardInstructions).toBe('Parent grid keys');
      });
    });
  });

  describe('GIVEN: a config without the requested locale', () => {
    describe('WHEN: resolving an unknown locale id', () => {
      const resolved = resolveNatTableIntl({ locales: NAT_TABLE_BUILT_IN_LOCALES }, 'zz');

      it('THEN: it falls back to built-in English copy', () => {
        expect(resolved.accessibilityText?.emptyState).toBe('No rows match the current view.');
      });
    });
  });

  describe('GIVEN: the Bokmål dictionary registered under both Norwegian ids', () => {
    describe('WHEN: resolving each id', () => {
      const locales = { [NAT_NB_LOCALE_ID]: NAT_NB_LOCALE_LABELS, [NAT_NO_LOCALE_ID]: NAT_NB_LOCALE_LABELS };

      it('THEN: both resolve to the same copy', () => {
        expect(resolveNatTableIntl({ locales }, NAT_NO_LOCALE_ID).accessibilityText?.emptyState).toBe(
          resolveNatTableIntl({ locales }, NAT_NB_LOCALE_ID).accessibilityText?.emptyState
        );
      });

      it('THEN: a region-tagged id resolves the base language', () => {
        expect(resolveNatTableIntl({ locales }, 'nb-NO').accessibilityText?.emptyState).toBe(
          resolveNatTableIntl({ locales }, NAT_NB_LOCALE_ID).accessibilityText?.emptyState
        );
      });
    });
  });

  describe('GIVEN: the built-in sub-header row copy', () => {
    describe('WHEN: formatting a group announcement', () => {
      const context = { value: 'Active', valueText: 'Active', rowCountValue: 3, rowCountText: '3' };
      const resolved = resolveNatTableIntl({ locales: NAT_TABLE_BUILT_IN_LOCALES }, 'en');

      it('THEN: the table copy announces rows and the list copy announces items', () => {
        expect(resolved.accessibilityText?.subHeaderRow?.(context)).toBe('Active group, 3 rows.');
        expect(resolved.accessibilityText?.listSubHeaderRow?.(context)).toBe('Active group, 3 items.');
      });

      it('THEN: an empty group value falls back to a bare group label', () => {
        const emptyContext = { value: null, valueText: '', rowCountValue: 1, rowCountText: '1' };

        expect(resolved.accessibilityText?.subHeaderRow?.(emptyContext)).toBe('Group, 1 row.');
      });
    });

    describe('WHEN: a consumer overrides the sub-header formatters', () => {
      it('THEN: the overrides win through the provider merge', () => {
        const merged = mergeNatTableAccessibilityText(NAT_TABLE_BUILT_IN_LOCALES['en'].accessibilityText, {
          subHeaderRow: ({ valueText }) => `Table ${valueText}`,
          listSubHeaderRow: ({ valueText }) => `List ${valueText}`
        });
        const context = { value: 'A', valueText: 'A', rowCountValue: 1, rowCountText: '1' };

        expect(merged.subHeaderRow?.(context)).toBe('Table A');
        expect(merged.listSubHeaderRow?.(context)).toBe('List A');
      });
    });
  });

  describe('GIVEN: the built-in table and list summary copy', () => {
    describe('WHEN: the shown rows are fewer than the represented total', () => {
      it('THEN: it phrases the subset against the total regardless of filtering, matching aria-rowcount', () => {
        const resolved = resolveNatTableIntl({ locales: NAT_TABLE_BUILT_IN_LOCALES }, 'en');
        // An unfiltered remote window: 200 loaded rows of a 2,000,000-row dataset.
        const context = {
          visibleRowsValue: 200,
          visibleRowsText: '200',
          totalRowsValue: 2_000_000,
          totalRowsText: '2,000,000',
          visibleColumnsValue: 5,
          visibleColumnsText: '5',
          pageIndex: 0,
          pageValue: 1,
          pageText: '1',
          pageCountValue: 1,
          pageCountText: '1',
          filterState: 'unfiltered',
          paginationState: 'disabled'
        } as const;

        expect(resolved.accessibilityText?.tableSummary?.(context)).toBe('Showing 200 of 2,000,000 rows, 5 visible columns.');
        expect(resolved.accessibilityText?.listSummary?.(context)).toBe('Showing 200 of 2,000,000 items, 5 visible fields.');
      });
    });

    describe('WHEN: every represented row is shown', () => {
      it('THEN: it keeps the plain phrasing without a total', () => {
        const resolved = resolveNatTableIntl({ locales: NAT_TABLE_BUILT_IN_LOCALES }, 'en');
        const context = {
          visibleRowsValue: 6,
          visibleRowsText: '6',
          totalRowsValue: 6,
          totalRowsText: '6',
          visibleColumnsValue: 4,
          visibleColumnsText: '4',
          pageIndex: 0,
          pageValue: 1,
          pageText: '1',
          pageCountValue: 1,
          pageCountText: '1',
          filterState: 'unfiltered',
          paginationState: 'disabled'
        } as const;

        expect(resolved.accessibilityText?.tableSummary?.(context)).toBe('Showing 6 rows, 4 visible columns.');
      });
    });
  });

  describe('GIVEN: the built-in search filtering copy', () => {
    describe('WHEN: exactly one row matches the query', () => {
      it('THEN: it agrees the verb with the singular row count', () => {
        const resolved = resolveNatTableIntl({ locales: NAT_TABLE_BUILT_IN_LOCALES }, 'en');
        const context = {
          query: 'alpha',
          filterState: 'global',
          visibleRowsValue: 1,
          visibleRowsText: '1',
          totalRowsValue: 20,
          totalRowsText: '20'
        } as const;

        expect(resolved.accessibilityText?.filteringChange?.(context)).toBe('1 row matches "alpha".');
      });
    });

    describe('WHEN: several rows match the query', () => {
      it('THEN: it keeps the plural verb', () => {
        const resolved = resolveNatTableIntl({ locales: NAT_TABLE_BUILT_IN_LOCALES }, 'en');
        const context = {
          query: 'alpha',
          filterState: 'global',
          visibleRowsValue: 3,
          visibleRowsText: '3',
          totalRowsValue: 20,
          totalRowsText: '20'
        } as const;

        expect(resolved.accessibilityText?.filteringChange?.(context)).toBe('3 rows match "alpha".');
      });
    });
  });

  describe('GIVEN: the built-in placeholder row copy for remote windowing', () => {
    describe('WHEN: formatting an unfetched row slot', () => {
      it('THEN: it conveys only the loading state, leaving the position to aria-rowindex', () => {
        const resolved = resolveNatTableIntl({ locales: NAT_TABLE_BUILT_IN_LOCALES }, 'en');
        // The context still carries the position and total, but the default
        // copy must not restate them: aria-rowindex/aria-rowcount announce the
        // position in grid coordinates (header row included), so any number
        // here would be a second, off-by-one readout for the same row.
        const context = { positionValue: 1_000_001, positionText: '1,000,001', totalRowsValue: 2_000_000, totalRowsText: '2,000,000' };

        expect(resolved.accessibilityText?.placeholderRow?.(context)).toBe('Loading.');
      });
    });

    describe('WHEN: a consumer overrides the placeholder formatter', () => {
      it('THEN: the override wins and can still build position-bearing copy from the context', () => {
        const merged = mergeNatTableAccessibilityText(NAT_TABLE_BUILT_IN_LOCALES['en'].accessibilityText, {
          placeholderRow: ({ positionText, totalRowsText }) => `Fetching ${positionText} of ${totalRowsText}`
        });
        const context = { positionValue: 5, positionText: '5', totalRowsValue: 10, totalRowsText: '10' };

        expect(merged.placeholderRow?.(context)).toBe('Fetching 5 of 10');
      });
    });
  });
});
