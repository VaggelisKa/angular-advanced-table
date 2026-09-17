import { NAT_EN_LOCALE_LABELS, NAT_TABLE_BUILT_IN_LOCALES } from './accessibility.const';
import type {
  NatTableAccessibilityColumnReorderAnnouncementContext,
  NatTableAccessibilityColumnResizeAnnouncementContext,
  NatTableAccessibilityColumnVisibilityAnnouncementContext,
  NatTableAccessibilityFilteringAnnouncementContext,
  NatTableAccessibilityPaginationAnnouncementContext,
  NatTableAccessibilityRowPlaceholderContext,
  NatTableAccessibilitySelectionAnnouncementContext,
  NatTableAccessibilitySortingAnnouncementContext,
  NatTableAccessibilitySubHeaderContext,
  NatTableAccessibilitySummaryContext,
  NatTableAccessibilityText
} from './accessibility.type';
import { NAT_EN_LOCALE_ID } from './locale-id.const';
import { expectDefined, formatsNumber, isNonEmptyText } from '../test-helpers/locale-copy.helper';
import { SHIPPED_TABLE_LOCALES, collectKeyPaths } from '../test-helpers/shipped-locales.helper';

const localeIds = Object.keys(SHIPPED_TABLE_LOCALES);
const translatedLocaleIds = localeIds.filter((localeId) => localeId !== NAT_EN_LOCALE_ID);

/* Empty, subset, and complete views at both singular and plural counts. */
const SUMMARY_CONTEXTS: readonly NatTableAccessibilitySummaryContext[] = [
  {
    visibleRowsValue: 0,
    visibleRowsText: '0',
    totalRowsValue: 20,
    totalRowsText: '20',
    visibleColumnsValue: 1,
    visibleColumnsText: '1',
    pageIndex: 0,
    pageValue: 1,
    pageText: '1',
    pageCountValue: 2,
    pageCountText: '2',
    filterState: 'filtered',
    paginationState: 'enabled'
  },
  {
    visibleRowsValue: 10,
    visibleRowsText: '10',
    totalRowsValue: 20,
    totalRowsText: '20',
    visibleColumnsValue: 4,
    visibleColumnsText: '4',
    pageIndex: 0,
    pageValue: 1,
    pageText: '1',
    pageCountValue: 2,
    pageCountText: '2',
    filterState: 'unfiltered',
    paginationState: 'enabled'
  },
  {
    visibleRowsValue: 1,
    visibleRowsText: '1',
    totalRowsValue: 1,
    totalRowsText: '1',
    visibleColumnsValue: 1,
    visibleColumnsText: '1',
    pageIndex: 0,
    pageValue: 1,
    pageText: '1',
    pageCountValue: 1,
    pageCountText: '1',
    filterState: 'unfiltered',
    paginationState: 'disabled'
  }
];

const SORTING_CONTEXTS: readonly NatTableAccessibilitySortingAnnouncementContext[] = [
  { columnId: null, columnLabel: null, sortState: 'none', sortedColumns: [] },
  { columnId: 'service', columnLabel: 'Service', sortState: 'none', sortedColumns: [] },
  {
    columnId: 'service',
    columnLabel: 'Service',
    sortState: 'ascending',
    sortedColumns: [{ id: 'service', label: 'Service', sortState: 'ascending' }]
  },
  {
    columnId: 'service',
    columnLabel: 'Service',
    sortState: 'descending',
    sortedColumns: [{ id: 'service', label: 'Service', sortState: 'descending' }]
  },
  {
    columnId: 'service',
    columnLabel: 'Service',
    sortState: 'ascending',
    sortedColumns: [
      { id: 'service', label: 'Service', sortState: 'ascending' },
      { id: 'region', label: 'Region', sortState: 'descending' }
    ]
  }
];

const FILTERING_CONTEXTS: readonly NatTableAccessibilityFilteringAnnouncementContext[] = [
  { query: 'alpha', filterState: 'global', visibleRowsValue: 0, visibleRowsText: '0', totalRowsValue: 20, totalRowsText: '20' },
  { query: '', filterState: 'column', visibleRowsValue: 0, visibleRowsText: '0', totalRowsValue: 20, totalRowsText: '20' },
  { query: 'alpha', filterState: 'global', visibleRowsValue: 1, visibleRowsText: '1', totalRowsValue: 20, totalRowsText: '20' },
  { query: 'alpha', filterState: 'global', visibleRowsValue: 3, visibleRowsText: '3', totalRowsValue: 20, totalRowsText: '20' },
  { query: '', filterState: 'column', visibleRowsValue: 1, visibleRowsText: '1', totalRowsValue: 20, totalRowsText: '20' },
  { query: '', filterState: 'column', visibleRowsValue: 3, visibleRowsText: '3', totalRowsValue: 20, totalRowsText: '20' },
  { query: '', filterState: 'none', visibleRowsValue: 1, visibleRowsText: '1', totalRowsValue: 1, totalRowsText: '1' },
  { query: '', filterState: 'none', visibleRowsValue: 20, visibleRowsText: '20', totalRowsValue: 20, totalRowsText: '20' }
];

const VISIBILITY_CONTEXTS: readonly NatTableAccessibilityColumnVisibilityAnnouncementContext[] = [
  {
    changedColumns: [{ id: 'service', label: 'Service', visibilityState: 'visible' }],
    visibleColumnsValue: 4,
    visibleColumnsText: '4',
    totalColumnsValue: 5,
    totalColumnsText: '5'
  },
  {
    changedColumns: [{ id: 'service', label: 'Service', visibilityState: 'hidden' }],
    visibleColumnsValue: 1,
    visibleColumnsText: '1',
    totalColumnsValue: 5,
    totalColumnsText: '5'
  },
  {
    changedColumns: [
      { id: 'service', label: 'Service', visibilityState: 'hidden' },
      { id: 'region', label: 'Region', visibilityState: 'visible' }
    ],
    visibleColumnsValue: 3,
    visibleColumnsText: '3',
    totalColumnsValue: 5,
    totalColumnsText: '5'
  }
];

const PAGINATION_CONTEXTS: readonly NatTableAccessibilityPaginationAnnouncementContext[] = [
  {
    pageIndex: 1,
    pageValue: 2,
    pageText: '2',
    pageCountValue: 5,
    pageCountText: '5',
    pageSizeValue: 25,
    pageSizeText: '25',
    visibleRowsValue: 25,
    visibleRowsText: '25'
  },
  {
    pageIndex: 0,
    pageValue: 1,
    pageText: '1',
    pageCountValue: 1,
    pageCountText: '1',
    pageSizeValue: 1,
    pageSizeText: '1',
    visibleRowsValue: 1,
    visibleRowsText: '1'
  }
];

const REORDER_CONTEXTS: readonly NatTableAccessibilityColumnReorderAnnouncementContext[] = [
  { columnId: 'service', label: 'Service', zone: 'left', positionValue: 1, positionText: '1', totalValue: 2, totalText: '2' },
  { columnId: 'service', label: 'Service', zone: 'center', positionValue: 2, positionText: '2', totalValue: 5, totalText: '5' },
  { columnId: 'service', label: 'Service', zone: 'right', positionValue: 3, positionText: '3', totalValue: 3, totalText: '3' }
];

const RESIZE_CONTEXTS: readonly NatTableAccessibilityColumnResizeAnnouncementContext[] = [
  { columnId: 'service', label: 'Service', widthValue: 160, widthText: '160' },
  { columnId: 'service', label: 'Service', widthValue: 80, widthText: '80', atMinimum: true },
  { columnId: 'service', label: 'Service', widthValue: 480, widthText: '480', atMaximum: true }
];

const SELECTION_CONTEXTS: readonly NatTableAccessibilitySelectionAnnouncementContext[] = [
  { selectedCountValue: 0, selectedCountText: '0', totalRowsValue: 20, totalRowsText: '20' },
  { selectedCountValue: 1, selectedCountText: '1', totalRowsValue: 20, totalRowsText: '20' },
  { selectedCountValue: 3, selectedCountText: '3', totalRowsValue: 20, totalRowsText: '20' },
  { selectedCountValue: 1, selectedCountText: '1', totalRowsValue: 1, totalRowsText: '1' },
  { selectedCountValue: 20, selectedCountText: '20', totalRowsValue: 20, totalRowsText: '20' },
  { selectedCountValue: 2, selectedCountText: '2', totalRowsValue: 0, totalRowsText: '0' }
];

const SUB_HEADER_CONTEXTS: readonly NatTableAccessibilitySubHeaderContext[] = [
  { value: 'Cloud', valueText: 'Cloud', rowCountValue: 3, rowCountText: '3' },
  { value: null, valueText: '', rowCountValue: 1, rowCountText: '1' }
];

const PLACEHOLDER_CONTEXT: NatTableAccessibilityRowPlaceholderContext = {
  positionValue: 42,
  positionText: '42',
  totalRowsValue: 500,
  totalRowsText: '500'
};

/** Raw contract tokens that must never reach a translated announcement. */
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
