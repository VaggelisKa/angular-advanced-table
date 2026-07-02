import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

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
      imports: [TableHost, CustomSortIndicatorHost, MoveOnlyHeaderActionsHost, HiddenHeaderActionLabelHost],
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
        expect(menuButton.getAttribute('aria-label')).toBe('Open column actions for Service column');

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
        expect(openMenu.getAttribute('aria-label')).toBe('Column actions for Service column');
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
    });
  });
});
