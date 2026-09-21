import { mergeNatTableAccessibilityText, resolveNatTableIntl } from './accessibility.util';
import { NAT_EN_LOCALE_LABELS, NAT_TABLE_BUILT_IN_LOCALES } from '../common/accessibility.const';
import type { NatTableAccessibilityText } from '../common/accessibility.type';
import { NAT_NB_LOCALE_LABELS } from '../common/languages/nb/accessibility.const';
import { NAT_NB_LOCALE_ID, NAT_NO_LOCALE_ID } from '../common/locale-id.const';
import { expectDefined } from '../test-helpers/locale-copy.helper';
import { SHIPPED_TABLE_LOCALES } from '../test-helpers/shipped-locales.helper';

const shippedLocaleIds = Object.keys(SHIPPED_TABLE_LOCALES);
const englishText = expectDefined(NAT_EN_LOCALE_LABELS.accessibilityText, 'English accessibility copy');

const shippedText = (localeId: string): NatTableAccessibilityText =>
  expectDefined(SHIPPED_TABLE_LOCALES[localeId].accessibilityText, `${localeId}: accessibilityText`);

const resolveShipped = (localeId: string): NatTableAccessibilityText =>
  expectDefined(resolveNatTableIntl({ locales: SHIPPED_TABLE_LOCALES }, localeId).accessibilityText, localeId);

const subHeaderContext = { value: 'A', valueText: 'A', rowCountValue: 1, rowCountText: '1' };
const placeholderContext = { positionValue: 5, positionText: '5', totalRowsValue: 10, totalRowsText: '10' };

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

  describe('GIVEN: formatter overrides on top of the built-in English dictionary', () => {
    describe('WHEN: merging the override', () => {
      const merged = mergeNatTableAccessibilityText(NAT_EN_LOCALE_LABELS.accessibilityText, {
        subHeaderRow: ({ valueText }) => `Table ${valueText}`,
        listSubHeaderRow: ({ valueText }) => `List ${valueText}`,
        placeholderRow: ({ positionText, totalRowsText }) => `Fetching ${positionText} of ${totalRowsText}`
      });

      it('THEN: the override formatters win and still receive the full context', () => {
        expect(expectDefined(merged.subHeaderRow, 'subHeaderRow')(subHeaderContext)).toBe('Table A');
        expect(expectDefined(merged.listSubHeaderRow, 'listSubHeaderRow')(subHeaderContext)).toBe('List A');
        expect(expectDefined(merged.placeholderRow, 'placeholderRow')(placeholderContext)).toBe('Fetching 5 of 10');
      });

      it('THEN: formatters the override leaves out stay the English ones', () => {
        expect(merged.tableSummary).toBe(englishText.tableSummary);
      });
    });
  });
});

describe('FEATURE: accessibility locale resolution', () => {
  describe('GIVEN: every shipped dictionary registered under its own id', () => {
    describe('WHEN: resolving a registered id', () => {
      it.each(shippedLocaleIds)('THEN: %s resolves to the dictionary registered under it', (localeId) => {
        const expected = shippedText(localeId);
        const resolved = resolveShipped(localeId);

        expect(resolved.emptyState).toBe(expected.emptyState);
        expect(resolved.keyboardInstructions).toBe(expected.keyboardInstructions);
        expect(resolved.tableSummary).toBe(expected.tableSummary);
      });
    });

    describe('WHEN: resolving a region-tagged variant of a registered id', () => {
      it.each(shippedLocaleIds)('THEN: %s-ZZ resolves to the base dictionary', (localeId) => {
        expect(resolveShipped(`${localeId}-ZZ`).emptyState).toBe(shippedText(localeId).emptyState);
      });
    });
  });

  describe('GIVEN: a config without the requested locale', () => {
    describe('WHEN: resolving an unknown locale id', () => {
      const resolved = resolveNatTableIntl({ locales: NAT_TABLE_BUILT_IN_LOCALES }, 'zz');

      it('THEN: it falls back to the registered English copy', () => {
        expect(resolved.accessibilityText?.emptyState).toBe(englishText.emptyState);
      });
    });

    describe('WHEN: the registry holds no English entry either', () => {
      const resolved = resolveNatTableIntl({ locales: {} }, 'zz');

      it('THEN: it falls back to the built-in English copy', () => {
        expect(resolved.accessibilityText?.emptyState).toBe(englishText.emptyState);
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
});
