import { NAT_TABLE_BUILT_IN_CONTROLS_LOCALES } from './controls.const';
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

const localeIds = Object.keys(NAT_TABLE_BUILT_IN_CONTROLS_LOCALES);

const pageSizeContext: NatTableAccessibilityPageSizeOptionContext = {
  pageSizeValue: 25,
  pageSizeText: '25',
  selectionState: 'not-selected'
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

const sortedHeaderContext: NatTableAccessibilityHeaderActionSortContext = {
  label: 'Service',
  sortState: 'ascending',
  sortPriority: 1,
  sortCount: 2
};

const unpinnedHeaderContext: NatTableAccessibilityHeaderActionPinContext = {
  label: 'Service',
  pinState: 'unpinned',
  toggleAction: 'pin',
  pinSide: 'left',
  pinnedSide: null
};

describe('FEATURE: built-in companion components locale completeness', () => {
  describe('GIVEN: the built-in components locale registry', () => {
    describe('WHEN: counting the registered locales', () => {
      it('THEN: it registers at least one built-in components locale', () => {
        expect(localeIds.length).toBeGreaterThan(0);
      });
    });
  });

  describe('GIVEN: every built-in components locale dictionary', () => {
    describe('WHEN: inspecting the global search labels', () => {
      it.each(localeIds)('THEN: %s ships complete search copy', (localeId) => {
        const search = expectDefined(NAT_TABLE_BUILT_IN_CONTROLS_LOCALES[localeId].search, `${localeId}: search`);

        expect(isNonEmptyText(search.label), `${localeId}: search.label`).toBe(true);
        expect(isNonEmptyText(search.placeholder), `${localeId}: search.placeholder`).toBe(true);
      });
    });

    describe('WHEN: inspecting the column-visibility labels', () => {
      it.each(localeIds)('THEN: %s ships complete column-visibility copy', (localeId) => {
        const columnVisibility = expectDefined(
          NAT_TABLE_BUILT_IN_CONTROLS_LOCALES[localeId].columnVisibility,
          `${localeId}: columnVisibility`
        );
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
        expect(producesText(labels.columnState, { visibilityState: 'visible' }), `${localeId}: columnVisibility.columnState`).toBe(
          true
        );
      });
    });

    describe('WHEN: inspecting the page-size labels', () => {
      it.each(localeIds)('THEN: %s ships complete page-size copy', (localeId) => {
        const pageSize = expectDefined(NAT_TABLE_BUILT_IN_CONTROLS_LOCALES[localeId].pageSize, `${localeId}: pageSize`);
        const labels = expectDefined(pageSize.accessibilityLabels, `${localeId}: pageSize.accessibilityLabels`);

        expect(isNonEmptyText(pageSize.groupAriaLabel), `${localeId}: pageSize.groupAriaLabel`).toBe(true);
        expect(producesText(labels.pageSizeOptionText, pageSizeContext), `${localeId}: pageSize.pageSizeOptionText`).toBe(true);
        expect(producesText(labels.pageSizeOptionAriaLabel, pageSizeContext), `${localeId}: pageSize.pageSizeOptionAriaLabel`).toBe(
          true
        );
      });
    });

    describe('WHEN: inspecting the pager labels', () => {
      it.each(localeIds)('THEN: %s ships complete pager copy', (localeId) => {
        const pager = expectDefined(NAT_TABLE_BUILT_IN_CONTROLS_LOCALES[localeId].pager, `${localeId}: pager`);
        const labels = expectDefined(pager.accessibilityLabels, `${localeId}: pager.accessibilityLabels`);

        expect(isNonEmptyText(pager.groupAriaLabel), `${localeId}: pager.groupAriaLabel`).toBe(true);
        expect(isNonEmptyText(labels.previousPageAriaLabel), `${localeId}: pager.previousPageAriaLabel`).toBe(true);
        expect(isNonEmptyText(labels.nextPageAriaLabel), `${localeId}: pager.nextPageAriaLabel`).toBe(true);
        expect(producesText(labels.pageIndicator, pagerContext), `${localeId}: pager.pageIndicator`).toBe(true);
      });
    });

    describe('WHEN: inspecting the scroll-control labels', () => {
      it.each(localeIds)('THEN: %s ships complete scroll-control copy', (localeId) => {
        const scrollControl = expectDefined(NAT_TABLE_BUILT_IN_CONTROLS_LOCALES[localeId].scrollControl, `${localeId}: scrollControl`);
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
        const headerActions = expectDefined(NAT_TABLE_BUILT_IN_CONTROLS_LOCALES[localeId].headerActions, `${localeId}: headerActions`);
        const labels = expectDefined(headerActions.accessibilityLabels, `${localeId}: headerActions.accessibilityLabels`);

        expect(producesText(labels.sortButton, sortedHeaderContext), `${localeId}: headerActions.sortButton`).toBe(true);
        expect(producesText(labels.menuButton, { label: 'Service' }), `${localeId}: headerActions.menuButton`).toBe(true);
        expect(producesText(labels.menuLabel, { label: 'Service' }), `${localeId}: headerActions.menuLabel`).toBe(true);
        expect(producesText(labels.pinButton, unpinnedHeaderContext), `${localeId}: headerActions.pinButton`).toBe(true);
        expect(producesText(labels.pinButtonText, unpinnedHeaderContext), `${localeId}: headerActions.pinButtonText`).toBe(true);
        expect(
          producesText(labels.moveButton, { label: 'Service', direction: 'right' }),
          `${localeId}: headerActions.moveButton`
        ).toBe(true);
        expect(
          producesText(labels.moveButtonText, { label: 'Service', direction: 'right' }),
          `${localeId}: headerActions.moveButtonText`
        ).toBe(true);
      });
    });

    describe('WHEN: inspecting the toolbar and selection labels', () => {
      it.each(localeIds)('THEN: %s ships complete toolbar and selection copy', (localeId) => {
        const locale = NAT_TABLE_BUILT_IN_CONTROLS_LOCALES[localeId];
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
        expect(formatsNumber(NAT_TABLE_BUILT_IN_CONTROLS_LOCALES[localeId].formatNumber, localeId), `${localeId}: formatNumber`).toBe(true);
      });
    });
  });
});
