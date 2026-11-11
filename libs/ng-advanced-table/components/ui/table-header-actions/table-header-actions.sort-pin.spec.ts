import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NatTable } from 'ng-advanced-table';

import type { Row } from '../../test-helpers/table-data.helper';
import {
  attrOf,
  getHeaderColumnIds,
  getOpenMenuHarness,
  getOpenMenuItem,
  requireOpenMenu,
  root,
  textOf
} from '../../test-helpers/table-dom.helper';
import {
  PinOnlyHeaderActionsHost,
  SortActionsOverrideDisabledHost,
  SortActionsOverrideEnabledHost,
  SortButtonFillHost
} from '../../test-helpers/table-header-hosts-sort-actions.helper';
import {
  CustomSortIndicatorHost,
  HiddenHeaderActionLabelHost,
  MoveOnlyHeaderActionsHost
} from '../../test-helpers/table-header-hosts.helper';
import { TableHost } from '../../test-helpers/table-hosts.helper';

describe('FEATURE: NatTable UI - Header Actions Sort & Pin', () => {
  let fixture: ComponentFixture<TableHost>;
  let host: TableHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TableHost,
        CustomSortIndicatorHost,
        MoveOnlyHeaderActionsHost,
        HiddenHeaderActionLabelHost,
        PinOnlyHeaderActionsHost,
        SortActionsOverrideDisabledHost,
        SortActionsOverrideEnabledHost,
        SortButtonFillHost
      ],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TableHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  const recreateHost = async (): Promise<void> => {
    fixture.destroy();
    fixture = TestBed.createComponent(TableHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  };

  describe('GIVEN: a table with header sort and column actions', () => {
    describe('WHEN: header sort and pin actions are interacted with', () => {
      it('THEN: it wraps headers with sort and column actions without losing the original label', async () => {
        await recreateHost();
        fixture.detectChanges();

        const headerLabel = root(fixture).querySelector('thead th[data-column-id="name"] .header-label') as HTMLElement;
        const sortButton = root(fixture).querySelector('thead th[data-column-id="name"] .sort-button') as HTMLButtonElement;
        const menuButton = root(fixture).querySelector('thead th[data-column-id="name"] .menu-button') as HTMLButtonElement;
        const reorderableHeader = root(fixture).querySelector('thead th[data-column-id="name"]') as HTMLTableCellElement;

        expect(headerLabel.textContent.trim()).toBe('Service');
        expect(reorderableHeader.classList.contains('is-reorderable')).toBe(true);
        expect(reorderableHeader.classList.contains('cdk-drag')).toBe(true);
        expect(sortButton.getAttribute('aria-label')).toBe('Sort by Service');
        expect(menuButton.getAttribute('aria-label')).toBe('Service column actions');

        sortButton.click();
        fixture.detectChanges();

        expect(host.tableState().sorting).toStrictEqual([{ id: 'name', desc: false }]);
        expect(sortButton.classList.contains('is-sorted')).toBe(true);
        expect(attrOf(root(fixture), 'thead th[data-column-id="name"]', 'aria-sort')).toBe('ascending');

        menuButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const menu = await getOpenMenuHarness(fixture);
        const openMenu = requireOpenMenu();
        const leftPinMenuItem = getOpenMenuItem('left');
        const rightPinMenuItem = getOpenMenuItem('right');

        expect(await menu.isOpen()).toBe(true);
        expect(openMenu.getAttribute('aria-label')).toBe('Service column actions');
        expect(textOf(leftPinMenuItem, '.column-menu-item__label')).toBe('Pin left');
        expect(textOf(rightPinMenuItem, '.column-menu-item__label')).toBe('Pin right');

        leftPinMenuItem.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(host.tableState().columnPinning).toStrictEqual({
          left: ['name'],
          right: []
        });

        menuButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const updatedLeftPinMenuItem = getOpenMenuItem('left');
        const updatedRightPinMenuItem = getOpenMenuItem('right');

        expect(updatedLeftPinMenuItem.classList.contains('is-active')).toBe(true);
        expect(textOf(updatedLeftPinMenuItem, '.column-menu-item__label')).toBe('Unpin left');

        updatedRightPinMenuItem.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(host.tableState().columnPinning).toStrictEqual({
          left: [],
          right: ['name']
        });
        expect(getHeaderColumnIds(fixture)).toStrictEqual(['region', 'status', 'throughput', 'name']);
      });
    });

    describe('WHEN: the table renders with an end-aligned column', () => {
      it('THEN: it keeps the column actions menu on the right for end-aligned headers', () => {
        fixture.detectChanges();

        const endAlignedHeaderContent = root(fixture).querySelector(
          'thead th[data-column-id="throughput"] .header-content'
        ) as HTMLElement;
        const endAlignedHeaderActions = root(fixture).querySelector(
          'thead th[data-column-id="throughput"] .header-actions-row'
        ) as HTMLElement;

        expect(endAlignedHeaderContent.classList.contains('is-align-end')).toBe(true);
        expect(endAlignedHeaderActions.lastElementChild?.classList.contains('header-controls')).toBe(true);
      });
    });

    describe('WHEN: the throughput column is pinned right', () => {
      it('THEN: it keeps the column actions menu on the right for right-pinned end-aligned headers', async () => {
        fixture.detectChanges();

        const throughputMenuButton = root(fixture).querySelector(
          'thead th[data-column-id="throughput"] .menu-button'
        ) as HTMLButtonElement;

        throughputMenuButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        getOpenMenuItem('right').click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(host.tableState().columnPinning).toStrictEqual({
          left: [],
          right: ['throughput']
        });

        const rightPinnedEndAlignedHeaderActions = root(fixture).querySelector(
          'thead th[data-column-id="throughput"] .header-actions-row'
        ) as HTMLElement;

        expect(rightPinnedEndAlignedHeaderActions.lastElementChild?.classList.contains('header-controls')).toBe(true);
      });
    });

    describe('WHEN: the sort button is clicked', () => {
      it('THEN: it announces sort updates through the table live region', async () => {
        fixture.detectChanges();

        const sortButton = root(fixture).querySelector('thead th[data-column-id="name"] .sort-button') as HTMLButtonElement;
        const liveRegion = root(fixture).querySelector('nat-table p[aria-live="polite"]') as HTMLElement;

        sortButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(liveRegion.textContent.trim()).toBe('Sorted by Service ascending.');
      });
    });

    describe('WHEN: the table with a custom sort indicator renders', () => {
      it('THEN: it renders caller-provided sort indicator content through header actions', () => {
        const customFixture = TestBed.createComponent(CustomSortIndicatorHost);

        customFixture.detectChanges();

        let sortIcon = root(customFixture).querySelector('thead th[data-column-id="name"] .sort-icon') as HTMLElement;
        const sortButton = root(customFixture).querySelector('thead th[data-column-id="name"] .sort-button') as HTMLButtonElement;

        expect(sortIcon.textContent.trim()).toBe('-');

        sortButton.click();
        customFixture.detectChanges();

        sortIcon = root(customFixture).querySelector('thead th[data-column-id="name"] .sort-icon') as HTMLElement;

        expect(sortIcon.textContent.trim()).toBe('A');
      });

      it('THEN: it marks the custom indicator so it follows the sort icon colour tokens', () => {
        const customFixture = TestBed.createComponent(CustomSortIndicatorHost);

        customFixture.detectChanges();
        fixture.detectChanges();

        const customIcon = root(customFixture).querySelector('[data-testid="nat-table-header-sort-name"] .sort-icon') as HTMLElement;
        const builtInIcon = root(fixture).querySelector('[data-testid="nat-table-header-sort-name"] .sort-icon') as HTMLElement;
        const customRules = Array.from(document.styleSheets)
          .flatMap((styleSheet) => Array.from(styleSheet.cssRules))
          .flatMap((rule) => (rule instanceof CSSMediaRule ? Array.from(rule.cssRules) : [rule]))
          .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule && rule.selectorText.includes('.sort-icon--custom'))
          .map((rule) => rule.cssText)
          .join(' ');

        expect(customIcon.classList.contains('sort-icon--custom')).toBe(true);
        expect(builtInIcon.classList.contains('sort-icon--custom')).toBe(false);
        expect(customRules).toContain('var(--nat-table-sort-icon-color-idle, var(--sys-nat-table-sort-icon-color-idle, inherit))');
        expect(customRules).toContain('--nat-table-sort-icon-color-active');
        expect(customRules).toContain('--nat-table-sort-icon-color-hover');
        expect(customRules).toContain('--nat-table-sort-icon-color-disabled');
      });
    });

    describe('WHEN: enableSortActions is not set', () => {
      it('THEN: it renders the sort button as before (default true)', () => {
        fixture.detectChanges();

        const sortButton = root(fixture).querySelector('thead th[data-column-id="name"] .sort-button');

        expect(sortButton).toBeTruthy();
      });
    });
  });

  describe('GIVEN: a table with sort actions disabled at the helper level', () => {
    describe('WHEN: the table renders', () => {
      it('THEN: it hides the sort button, keeps the header label, and keeps the pin menu functional', async () => {
        const disabledFixture = TestBed.createComponent(PinOnlyHeaderActionsHost);

        disabledFixture.detectChanges();

        const headerLabel = root(disabledFixture).querySelector('thead th[data-column-id="name"] .header-label') as HTMLElement;
        const sortButton = root(disabledFixture).querySelector('thead th[data-column-id="name"] .sort-button');
        const menuButton = root(disabledFixture).querySelector('thead th[data-column-id="name"] .menu-button') as HTMLButtonElement;

        expect(headerLabel.textContent.trim()).toBe('Service');
        expect(sortButton).toBeNull();
        expect(menuButton).toBeTruthy();

        menuButton.click();
        disabledFixture.detectChanges();
        await disabledFixture.whenStable();
        disabledFixture.detectChanges();

        const menu = await getOpenMenuHarness(disabledFixture);

        expect(await menu.isOpen()).toBe(true);
        expect(getOpenMenuItem('left')).toBeTruthy();
      });
    });

    describe('WHEN: sorting is applied programmatically', () => {
      it('THEN: rows still reorder and aria-sort is still reflected on the header', async () => {
        const disabledFixture = TestBed.createComponent(PinOnlyHeaderActionsHost);

        disabledFixture.detectChanges();

        const table = disabledFixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

        table.patchState({ sorting: [{ id: 'name', desc: false }] });
        disabledFixture.detectChanges();
        await disabledFixture.whenStable();
        disabledFixture.detectChanges();

        expect(attrOf(root(disabledFixture), 'thead th[data-column-id="name"]', 'aria-sort')).toBe('ascending');

        const rowNames = Array.from(root(disabledFixture).querySelectorAll('tbody td[data-column-id="name"]')).map((cell) =>
          cell.textContent.trim()
        );

        expect(rowNames).toStrictEqual([...rowNames].sort());
      });
    });
  });

  describe('GIVEN: a column overriding a helper-level enableSortActions: true with false', () => {
    describe('WHEN: the table renders', () => {
      it('THEN: it hides the sort button only for the overriding column', () => {
        const overrideFixture = TestBed.createComponent(SortActionsOverrideDisabledHost);

        overrideFixture.detectChanges();

        const nameSortButton = root(overrideFixture).querySelector('thead th[data-column-id="name"] .sort-button');
        const regionSortButton = root(overrideFixture).querySelector('thead th[data-column-id="region"] .sort-button');

        expect(nameSortButton).toBeNull();
        expect(regionSortButton).toBeTruthy();
      });
    });
  });

  describe('GIVEN: a column overriding a helper-level enableSortActions: false with true', () => {
    describe('WHEN: the table renders', () => {
      it('THEN: it shows the sort button only for the overriding column', () => {
        const overrideFixture = TestBed.createComponent(SortActionsOverrideEnabledHost);

        overrideFixture.detectChanges();

        const nameSortButton = root(overrideFixture).querySelector('thead th[data-column-id="name"] .sort-button');
        const regionSortButton = root(overrideFixture).querySelector('thead th[data-column-id="region"] .sort-button');

        expect(nameSortButton).toBeTruthy();
        expect(regionSortButton).toBeNull();
      });
    });
  });

  describe('GIVEN: a table whose sort buttons fill the header cell', () => {
    const pointerDownReachesHeader = (target: ComponentFixture<unknown>, columnId: string): boolean => {
      const header = root(target).querySelector(`[data-testid="nat-table-header-${columnId}"]`) as HTMLTableCellElement;
      const sortButton = root(target).querySelector(`[data-testid="nat-table-header-sort-${columnId}"]`) as HTMLButtonElement;
      let reached = false;
      const listener = (): void => {
        reached = true;
      };

      header.addEventListener('pointerdown', listener);
      sortButton.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      header.removeEventListener('pointerdown', listener);

      return reached;
    };

    describe('WHEN: the table renders', () => {
      it('THEN: it stretches the hit area for filled columns only and still sorts on click', () => {
        const fillFixture = TestBed.createComponent(SortButtonFillHost);

        fillFixture.detectChanges();

        const nameSortButton = root(fillFixture).querySelector('[data-testid="nat-table-header-sort-name"]') as HTMLButtonElement;
        const regionSortButton = root(fillFixture).querySelector('[data-testid="nat-table-header-sort-region"]') as HTMLButtonElement;

        expect(nameSortButton.classList.contains('is-fill')).toBe(true);
        expect(regionSortButton.classList.contains('is-fill')).toBe(false);

        nameSortButton.click();
        fillFixture.detectChanges();

        expect(attrOf(root(fillFixture), '[data-testid="nat-table-header-name"]', 'aria-sort')).toBe('ascending');
      });
    });

    describe('WHEN: a pointer is pressed on a sort button', () => {
      it('THEN: it lets the press reach the header for filled columns so the header can still be dragged', () => {
        const fillFixture = TestBed.createComponent(SortButtonFillHost);

        fillFixture.detectChanges();
        fixture.detectChanges();

        expect(pointerDownReachesHeader(fillFixture, 'name')).toBe(true);
        expect(pointerDownReachesHeader(fillFixture, 'region')).toBe(false);
        expect(pointerDownReachesHeader(fixture, 'name')).toBe(false);
      });
    });
  });
});
