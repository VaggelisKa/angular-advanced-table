import { NAT_EN_CONTROLS_LOCALE_LABELS, NAT_TABLE_BUILT_IN_CONTROLS_LOCALES } from './controls.const';
import type {
  NatTableAccessibilityColumnVisibilityActionContext,
  NatTableAccessibilityColumnVisibilitySummaryContext,
  NatTableAccessibilityHeaderActionPinContext,
  NatTableAccessibilityHeaderActionSortContext,
  NatTableAccessibilityPageSizeOptionContext,
  NatTableAccessibilityPagerContext,
  NatTableAccessibilityScrollControlPositionContext,
  NatTableControlsNumberFormatter
} from './controls.type';
import { NAT_EN_LOCALE_ID } from './locale-id.const';
import { SHIPPED_CONTROLS_LOCALES, collectKeyPaths } from '../test-helpers/shipped-locales.const';

const expectDefined = <TValue>(value: TValue | undefined, label: string): TValue => {
  if (value === undefined) {
    throw new Error(`${label} must be defined.`);
  }

  return value;
};

const isNonEmptyText = (value: unknown): boolean => typeof value === 'string' && value.trim().length > 0;

const producesText = <TContext>(formatter: ((context: TContext) => string) | undefined, context: TContext): boolean =>
  typeof formatter === 'function' && isNonEmptyText(formatter(context));

const formatsNumber = (formatter: NatTableControlsNumberFormatter | undefined, localeId: string): boolean =>
  typeof formatter === 'function' && isNonEmptyText(formatter(1234.5, { maximumFractionDigits: 1 }, localeId));

const localeIds = Object.keys(SHIPPED_CONTROLS_LOCALES);
const translatedLocaleIds = localeIds.filter((localeId) => localeId !== NAT_EN_LOCALE_ID);

const pageSizeContext: NatTableAccessibilityPageSizeOptionContext = {
  pageSizeValue: 25,
  pageSizeText: '25',
  selectionState: 'not-selected'
};

// Nordic plurals inflect the modifier along with the noun, so a page size of
// one is a distinct phrase rather than the plural minus a suffix.
const singlePageSizeContext: NatTableAccessibilityPageSizeOptionContext = {
  pageSizeValue: 1,
  pageSizeText: '1',
  selectionState: 'selected'
};

const pagerContext: NatTableAccessibilityPagerContext = {
  pageValue: 2,
  pageText: '2',
  pageCountValue: 5,
  pageCountText: '5'
};

const scrollPositionContext: NatTableAccessibilityScrollControlPositionContext = {
  scrollLeftValue: 50,
  scrollLeftText: '50',
  maxScrollLeftValue: 200,
  maxScrollLeftText: '200',
  percentageValue: 25,
  percentageText: '25'
};

const columnVisibilitySummaryContext: NatTableAccessibilityColumnVisibilitySummaryContext = {
  visibleColumnCountValue: 3,
  visibleColumnCountText: '3',
  totalColumnCountValue: 5,
  totalColumnCountText: '5'
};

const visibleColumnContext: NatTableAccessibilityColumnVisibilityActionContext = {
  columnLabel: 'Service',
  visibilityState: 'visible',
  toggleAction: 'hide'
};

const hiddenColumnContext: NatTableAccessibilityColumnVisibilityActionContext = {
  columnLabel: 'Service',
  visibilityState: 'hidden',
  toggleAction: 'show'
};

const sortedHeaderContext: NatTableAccessibilityHeaderActionSortContext = {
  label: 'Service',
  sortState: 'ascending',
  sortPriority: 1,
  sortCount: 2
};

const unsortedHeaderContext: NatTableAccessibilityHeaderActionSortContext = {
  label: 'Service',
  sortState: 'none',
  sortPriority: null,
  sortCount: 0
};

const soleSortedHeaderContext: NatTableAccessibilityHeaderActionSortContext = {
  label: 'Service',
  sortState: 'descending',
  sortPriority: 1,
  sortCount: 1
};

const unpinnedHeaderContext: NatTableAccessibilityHeaderActionPinContext = {
  label: 'Service',
  pinState: 'unpinned',
  toggleAction: 'pin',
  pinSide: 'left',
  pinnedSide: null
};

const pinnedHeaderContext: NatTableAccessibilityHeaderActionPinContext = {
  label: 'Service',
  pinState: 'pinned',
  toggleAction: 'unpin',
  pinSide: 'right',
  pinnedSide: 'right'
};

describe('FEATURE: built-in companion components locale completeness', () => {
  describe('GIVEN: the built-in components locale registry', () => {
    describe('WHEN: counting the locales it registers without configuration', () => {
      it('THEN: it registers English only, leaving translations opt-in', () => {
        expect(Object.keys(NAT_TABLE_BUILT_IN_CONTROLS_LOCALES)).toStrictEqual([NAT_EN_LOCALE_ID]);
      });
    });
  });

  describe('GIVEN: every built-in components locale dictionary', () => {
    describe('WHEN: inspecting the global search labels', () => {
      it.each(localeIds)('THEN: %s ships complete search copy', (localeId) => {
        const search = expectDefined(SHIPPED_CONTROLS_LOCALES[localeId].search, `${localeId}: search`);

        expect(isNonEmptyText(search.label), `${localeId}: search.label`).toBe(true);
        expect(isNonEmptyText(search.placeholder), `${localeId}: search.placeholder`).toBe(true);
      });
    });

    describe('WHEN: inspecting the column-visibility labels', () => {
      it.each(localeIds)('THEN: %s ships complete column-visibility copy', (localeId) => {
        const columnVisibility = expectDefined(SHIPPED_CONTROLS_LOCALES[localeId].columnVisibility, `${localeId}: columnVisibility`);
        const labels = expectDefined(columnVisibility.accessibilityLabels, `${localeId}: columnVisibility.accessibilityLabels`);

        expect(isNonEmptyText(columnVisibility.label), `${localeId}: columnVisibility.label`).toBe(true);
        expect(isNonEmptyText(columnVisibility.groupAriaLabel), `${localeId}: columnVisibility.groupAriaLabel`).toBe(true);
        expect(
          producesText(labels.visibilitySummary, columnVisibilitySummaryContext),
          `${localeId}: columnVisibility.visibilitySummary`
        ).toBe(true);
        expect(
          producesText(labels.toggleColumnAriaLabel, visibleColumnContext),
          `${localeId}: columnVisibility.toggleColumnAriaLabel`
        ).toBe(true);
        expect(
          producesText(labels.toggleColumnAriaLabel, hiddenColumnContext),
          `${localeId}: columnVisibility.toggleColumnAriaLabel (hidden)`
        ).toBe(true);
        expect(producesText(labels.columnState, { visibilityState: 'visible' }), `${localeId}: columnVisibility.columnState`).toBe(
          true
        );
        expect(
          producesText(labels.columnState, { visibilityState: 'hidden' }),
          `${localeId}: columnVisibility.columnState (hidden)`
        ).toBe(true);
      });
    });

    describe('WHEN: inspecting the page-size labels', () => {
      it.each(localeIds)('THEN: %s ships complete page-size copy', (localeId) => {
        const pageSize = expectDefined(SHIPPED_CONTROLS_LOCALES[localeId].pageSize, `${localeId}: pageSize`);
        const labels = expectDefined(pageSize.accessibilityLabels, `${localeId}: pageSize.accessibilityLabels`);

        expect(isNonEmptyText(pageSize.groupAriaLabel), `${localeId}: pageSize.groupAriaLabel`).toBe(true);
        expect(producesText(labels.pageSizeOptionText, pageSizeContext), `${localeId}: pageSize.pageSizeOptionText`).toBe(true);
        expect(producesText(labels.pageSizeOptionAriaLabel, pageSizeContext), `${localeId}: pageSize.pageSizeOptionAriaLabel`).toBe(
          true
        );
        expect(
          producesText(labels.pageSizeOptionText, singlePageSizeContext),
          `${localeId}: pageSize.pageSizeOptionText (single)`
        ).toBe(true);
        expect(
          producesText(labels.pageSizeOptionAriaLabel, singlePageSizeContext),
          `${localeId}: pageSize.pageSizeOptionAriaLabel (single)`
        ).toBe(true);
      });
    });

    describe('WHEN: inspecting the pager labels', () => {
      it.each(localeIds)('THEN: %s ships complete pager copy', (localeId) => {
        const pager = expectDefined(SHIPPED_CONTROLS_LOCALES[localeId].pager, `${localeId}: pager`);
        const labels = expectDefined(pager.accessibilityLabels, `${localeId}: pager.accessibilityLabels`);

        expect(isNonEmptyText(pager.groupAriaLabel), `${localeId}: pager.groupAriaLabel`).toBe(true);
        expect(isNonEmptyText(labels.previousPageAriaLabel), `${localeId}: pager.previousPageAriaLabel`).toBe(true);
        expect(isNonEmptyText(labels.nextPageAriaLabel), `${localeId}: pager.nextPageAriaLabel`).toBe(true);
        expect(producesText(labels.pageIndicator, pagerContext), `${localeId}: pager.pageIndicator`).toBe(true);
      });
    });

    describe('WHEN: inspecting the scroll-control labels', () => {
      it.each(localeIds)('THEN: %s ships complete scroll-control copy', (localeId) => {
        const scrollControl = expectDefined(SHIPPED_CONTROLS_LOCALES[localeId].scrollControl, `${localeId}: scrollControl`);
        const labels = expectDefined(scrollControl.accessibilityLabels, `${localeId}: scrollControl.accessibilityLabels`);

        expect(isNonEmptyText(scrollControl.groupAriaLabel), `${localeId}: scrollControl.groupAriaLabel`).toBe(true);
        expect(isNonEmptyText(labels.scrollLeftAriaLabel), `${localeId}: scrollControl.scrollLeftAriaLabel`).toBe(true);
        expect(isNonEmptyText(labels.scrollRightAriaLabel), `${localeId}: scrollControl.scrollRightAriaLabel`).toBe(true);
        expect(isNonEmptyText(labels.scrollPositionAriaLabel), `${localeId}: scrollControl.scrollPositionAriaLabel`).toBe(true);
        expect(producesText(labels.scrollPositionText, scrollPositionContext), `${localeId}: scrollControl.scrollPositionText`).toBe(
          true
        );
      });
    });

    describe('WHEN: inspecting the header-action labels', () => {
      it.each(localeIds)('THEN: %s ships complete header-action copy', (localeId) => {
        const headerActions = expectDefined(SHIPPED_CONTROLS_LOCALES[localeId].headerActions, `${localeId}: headerActions`);
        const labels = expectDefined(headerActions.accessibilityLabels, `${localeId}: headerActions.accessibilityLabels`);

        expect(producesText(labels.sortButton, sortedHeaderContext), `${localeId}: headerActions.sortButton`).toBe(true);
        expect(producesText(labels.sortButton, unsortedHeaderContext), `${localeId}: headerActions.sortButton (unsorted)`).toBe(true);
        expect(producesText(labels.sortButton, soleSortedHeaderContext), `${localeId}: headerActions.sortButton (sole sort)`).toBe(
          true
        );
        expect(producesText(labels.menuButton, { label: 'Service' }), `${localeId}: headerActions.menuButton`).toBe(true);
        expect(producesText(labels.menuLabel, { label: 'Service' }), `${localeId}: headerActions.menuLabel`).toBe(true);
        expect(producesText(labels.pinButton, unpinnedHeaderContext), `${localeId}: headerActions.pinButton`).toBe(true);
        expect(producesText(labels.pinButtonText, unpinnedHeaderContext), `${localeId}: headerActions.pinButtonText`).toBe(true);
        expect(producesText(labels.pinButton, pinnedHeaderContext), `${localeId}: headerActions.pinButton (pinned right)`).toBe(true);
        expect(
          producesText(labels.pinButtonText, pinnedHeaderContext),
          `${localeId}: headerActions.pinButtonText (pinned right)`
        ).toBe(true);
        expect(
          producesText(labels.moveButton, { label: 'Service', direction: 'right' }),
          `${localeId}: headerActions.moveButton`
        ).toBe(true);
        expect(
          producesText(labels.moveButtonText, { label: 'Service', direction: 'right' }),
          `${localeId}: headerActions.moveButtonText`
        ).toBe(true);
        expect(
          producesText(labels.moveButton, { label: 'Service', direction: 'left' }),
          `${localeId}: headerActions.moveButton (left)`
        ).toBe(true);
        expect(
          producesText(labels.moveButtonText, { label: 'Service', direction: 'left' }),
          `${localeId}: headerActions.moveButtonText (left)`
        ).toBe(true);
      });
    });

    describe('WHEN: inspecting the toolbar and selection labels', () => {
      it.each(localeIds)('THEN: %s ships complete toolbar and selection copy', (localeId) => {
        const locale = SHIPPED_CONTROLS_LOCALES[localeId];
        const toolbar = expectDefined(locale.toolbar, `${localeId}: toolbar`);
        const selection = expectDefined(locale.selection, `${localeId}: selection`);
        const selectionLabels = expectDefined(selection.accessibilityLabels, `${localeId}: selection.accessibilityLabels`);

        expect(isNonEmptyText(toolbar.toolbarLabel), `${localeId}: toolbar.toolbarLabel`).toBe(true);
        expect(isNonEmptyText(selection.columnLabel), `${localeId}: selection.columnLabel`).toBe(true);
        expect(isNonEmptyText(selectionLabels.selectAllAriaLabel), `${localeId}: selection.selectAllAriaLabel`).toBe(true);
        expect(producesText(selectionLabels.selectRowAriaLabel, { rowId: 'row-1' }), `${localeId}: selection.selectRowAriaLabel`).toBe(
          true
        );
      });
    });

    describe('WHEN: inspecting the number formatter', () => {
      it.each(localeIds)('THEN: %s ships a working number formatter', (localeId) => {
        expect(formatsNumber(SHIPPED_CONTROLS_LOCALES[localeId].formatNumber, localeId), `${localeId}: formatNumber`).toBe(true);
      });
    });
  });

  describe('GIVEN: every shipped companion-control dictionary other than English', () => {
    describe('WHEN: comparing its key paths with the English baseline', () => {
      it.each(translatedLocaleIds)('THEN: %s defines exactly the keys English defines', (localeId) => {
        expect(collectKeyPaths(SHIPPED_CONTROLS_LOCALES[localeId]).sort()).toStrictEqual(
          collectKeyPaths(NAT_EN_CONTROLS_LOCALE_LABELS).sort()
        );
      });
    });
  });
});
