import { mergeNatTableAccessibilityText, resolveNatTableIntl } from './accessibility.util';
import { NAT_TABLE_BUILT_IN_LOCALES } from '../common/accessibility.const';

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
  });

  describe('GIVEN: a config without the requested locale', () => {
    describe('WHEN: resolving an unknown locale id', () => {
      const resolved = resolveNatTableIntl({ locales: NAT_TABLE_BUILT_IN_LOCALES }, 'zz');

      it('THEN: it falls back to built-in English copy', () => {
        expect(resolved.accessibilityText?.emptyState).toBe('No rows match the current view.');
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

  describe('GIVEN: the built-in placeholder row copy for remote windowing', () => {
    describe('WHEN: formatting an unfetched row slot', () => {
      it('THEN: it names the absolute position, the represented total, and the loading state', () => {
        const resolved = resolveNatTableIntl({ locales: NAT_TABLE_BUILT_IN_LOCALES }, 'en');
        const context = { positionValue: 1_000_001, positionText: '1,000,001', totalRowsValue: 2_000_000, totalRowsText: '2,000,000' };

        expect(resolved.accessibilityText?.placeholderRow?.(context)).toBe('Row 1,000,001 of 2,000,000 is loading.');
      });
    });

    describe('WHEN: a consumer overrides the placeholder formatter', () => {
      it('THEN: the override wins through the provider merge', () => {
        const merged = mergeNatTableAccessibilityText(NAT_TABLE_BUILT_IN_LOCALES['en'].accessibilityText, {
          placeholderRow: ({ positionText }) => `Fetching ${positionText}`
        });
        const context = { positionValue: 5, positionText: '5', totalRowsValue: 10, totalRowsText: '10' };

        expect(merged.placeholderRow?.(context)).toBe('Fetching 5');
      });
    });
  });
});
