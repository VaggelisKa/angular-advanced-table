import { NAT_EN_CONTROLS_LOCALE_LABELS, NAT_TABLE_BUILT_IN_CONTROLS_LOCALES } from './controls.const';
import { NAT_EN_LOCALE_ID } from './locale-id.const';
import {
  columnVisibilitySummaryContext,
  hiddenColumnContext,
  pageSizeContext,
  pagerContext,
  pinnedHeaderContext,
  scrollPositionContext,
  singlePageSizeContext,
  soleSortedHeaderContext,
  sortedHeaderContext,
  unpinnedHeaderContext,
  unsortedHeaderContext,
  visibleColumnContext
} from '../test-helpers/controls-contexts.helper';
import { expectDefined, formatsNumber, isNonEmptyText, producesText } from '../test-helpers/locale-copy.helper';
import { SHIPPED_CONTROLS_LOCALES, collectKeyPaths } from '../test-helpers/shipped-locales.helper';

const localeIds = Object.keys(SHIPPED_CONTROLS_LOCALES);
const translatedLocaleIds = localeIds.filter((localeId) => localeId !== NAT_EN_LOCALE_ID);

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
