import { NAT_EN_LOCALE_LABELS, NAT_TABLE_BUILT_IN_LOCALES } from './accessibility.const';
import type { NatTableAccessibilityText } from './accessibility.type';
import { NAT_EN_LOCALE_ID } from './locale-id.const';
import {
  FILTERING_CONTEXTS,
  PAGINATION_CONTEXTS,
  PLACEHOLDER_CONTEXT,
  REORDER_CONTEXTS,
  RESIZE_CONTEXTS,
  SELECTION_CONTEXTS,
  SORTING_CONTEXTS,
  SUB_HEADER_CONTEXTS,
  VISIBILITY_CONTEXTS
} from '../test-helpers/accessibility-contexts.helper';
import { expectDefined, formatsNumber, isNonEmptyText } from '../test-helpers/locale-copy.helper';
import { SHIPPED_TABLE_LOCALES, collectKeyPaths } from '../test-helpers/shipped-locales.helper';
import { SUMMARY_CONTEXTS } from '../test-helpers/summary-contexts.helper';

const localeIds = Object.keys(SHIPPED_TABLE_LOCALES);
const translatedLocaleIds = localeIds.filter((localeId) => localeId !== NAT_EN_LOCALE_ID);

const UNTRANSLATED_TOKENS = ['ascending', 'descending', 'visible', 'hidden', 'unpinned', 'undefined', 'NaN'];

type RenderedCopy = {
  readonly key: string;
  readonly value: string | undefined;
};

const renderFormatter = <TContext>(
  key: string,
  formatter: ((context: TContext) => string) | undefined,
  contexts: readonly TContext[]
): RenderedCopy[] => contexts.map((context, index) => ({ key: `${key}[${index}]`, value: formatter?.(context) }));

/** Every generated string a built-in table dictionary can produce. */
const renderAccessibilityCopy = (text: NatTableAccessibilityText): RenderedCopy[] => [
  ...renderFormatter('tableSummary', text.tableSummary, SUMMARY_CONTEXTS),
  ...renderFormatter('listSummary', text.listSummary, SUMMARY_CONTEXTS),
  ...renderFormatter('sortingChange', text.sortingChange, SORTING_CONTEXTS),
  ...renderFormatter('filteringChange', text.filteringChange, FILTERING_CONTEXTS),
  ...renderFormatter('columnVisibilityChange', text.columnVisibilityChange, VISIBILITY_CONTEXTS),
  ...renderFormatter('listColumnVisibilityChange', text.listColumnVisibilityChange, VISIBILITY_CONTEXTS),
  ...renderFormatter('pageSizeChange', text.pageSizeChange, PAGINATION_CONTEXTS),
  ...renderFormatter('listPageSizeChange', text.listPageSizeChange, PAGINATION_CONTEXTS),
  ...renderFormatter('pageChange', text.pageChange, PAGINATION_CONTEXTS),
  ...renderFormatter('listPageChange', text.listPageChange, PAGINATION_CONTEXTS),
  ...renderFormatter('columnReorder', text.columnReorder, REORDER_CONTEXTS),
  ...renderFormatter('columnResize', text.columnResize, RESIZE_CONTEXTS),
  ...renderFormatter('selectionChange', text.selectionChange, SELECTION_CONTEXTS),
  ...renderFormatter('subHeaderRow', text.subHeaderRow, SUB_HEADER_CONTEXTS),
  ...renderFormatter('listSubHeaderRow', text.listSubHeaderRow, SUB_HEADER_CONTEXTS),
  ...renderFormatter('placeholderRow', text.placeholderRow, [PLACEHOLDER_CONTEXT])
];

const staticCopyOf = (text: NatTableAccessibilityText): RenderedCopy[] => [
  { key: 'keyboardInstructions', value: text.keyboardInstructions },
  { key: 'listKeyboardInstructions', value: text.listKeyboardInstructions },
  { key: 'emptyState', value: text.emptyState },
  { key: 'loadingState', value: text.loadingState },
  { key: 'errorState', value: text.errorState },
  { key: 'reorderKeyboardInstructions', value: text.reorderKeyboardInstructions },
  { key: 'resizeKeyboardInstructions', value: text.resizeKeyboardInstructions }
];

const accessibilityTextOf = (localeId: string): NatTableAccessibilityText =>
  expectDefined(SHIPPED_TABLE_LOCALES[localeId].accessibilityText, `${localeId}: accessibilityText`);

describe('FEATURE: built-in table locale completeness', () => {
  describe('GIVEN: the built-in table locale registry', () => {
    describe('WHEN: counting the locales it registers without configuration', () => {
      it('THEN: it registers English only, leaving translations opt-in', () => {
        expect(Object.keys(NAT_TABLE_BUILT_IN_LOCALES)).toStrictEqual([NAT_EN_LOCALE_ID]);
      });
    });
  });

  describe('GIVEN: every built-in table locale dictionary', () => {
    describe('WHEN: inspecting the static instruction and body-state copy', () => {
      it.each(localeIds)('THEN: %s ships complete static copy', (localeId) => {
        for (const { key, value } of staticCopyOf(accessibilityTextOf(localeId))) {
          expect(isNonEmptyText(value), `${localeId}: ${key}`).toBe(true);
        }
      });
    });

    describe('WHEN: rendering every generated summary and announcement', () => {
      it.each(localeIds)('THEN: %s ships copy for every table and list state', (localeId) => {
        for (const { key, value } of renderAccessibilityCopy(accessibilityTextOf(localeId))) {
          expect(isNonEmptyText(value), `${localeId}: ${key}`).toBe(true);
        }
      });
    });

    describe('WHEN: inspecting the number formatter', () => {
      it.each(localeIds)('THEN: %s ships a working number formatter', (localeId) => {
        expect(formatsNumber(SHIPPED_TABLE_LOCALES[localeId].formatNumber, localeId), `${localeId}: formatNumber`).toBe(true);
      });
    });
  });

  describe('GIVEN: every built-in table locale dictionary other than English', () => {
    describe('WHEN: rendering every generated summary and announcement', () => {
      it.each(translatedLocaleIds)('THEN: %s leaves no raw contract token in its copy', (localeId) => {
        for (const { key, value } of renderAccessibilityCopy(accessibilityTextOf(localeId))) {
          const leaked = UNTRANSLATED_TOKENS.filter((token) => (value ?? '').includes(token));

          expect(leaked, `${localeId}: ${key} -> ${value}`).toStrictEqual([]);
        }
      });
    });
  });

  describe('GIVEN: every shipped table dictionary other than English', () => {
    describe('WHEN: comparing its key paths with the English baseline', () => {
      it.each(translatedLocaleIds)('THEN: %s defines exactly the keys English defines', (localeId) => {
        expect(collectKeyPaths(SHIPPED_TABLE_LOCALES[localeId]).sort()).toStrictEqual(collectKeyPaths(NAT_EN_LOCALE_LABELS).sort());
      });
    });
  });
});
