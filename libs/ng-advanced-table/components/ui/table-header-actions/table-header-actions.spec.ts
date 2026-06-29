import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import {
  attrOf,
  getHeaderActionsMenuButton,
  getHeaderColumnIds,
  getOpenMenuHarness,
  getOpenMenuItem,
  getOpenMoveMenuItem,
  lastChildHasClass,
  queryByTestId,
  requireOpenMenu,
  root,
  textOf
} from '../../test-helpers/table-ui-dom.helper';
import {
  CustomSortIndicatorHost,
  HiddenHeaderActionLabelHost,
  MoveOnlyHeaderActionsHost
} from '../../test-helpers/table-ui-header-hosts.helper';
import { TableUiHost } from '../../test-helpers/table-ui-hosts.helper';

describe('FEATURE: NatTable UI', () => {
  let fixture: ComponentFixture<TableUiHost>;
  let host: TableUiHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableUiHost, CustomSortIndicatorHost, MoveOnlyHeaderActionsHost, HiddenHeaderActionLabelHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TableUiHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  const recreateHost = async (): Promise<void> => {
    fixture.destroy();
    fixture = TestBed.createComponent(TableUiHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  };

  describe('GIVEN: a table with header sort and column actions', () => {
    describe('WHEN: header sort and pin actions are interacted with', () => {
      it('THEN: it wraps headers with sort and column actions without losing the original label', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        await recreateHost();

        fixture.detectChanges();

        const headerLabel = root(fixture).querySelector('thead th[data-column-id="name"] .header-label') as HTMLElement;
        const sortButton = root(fixture).querySelector('thead th[data-column-id="name"] .sort-button') as HTMLButtonElement;
        const menuButton = root(fixture).querySelector('thead th[data-column-id="name"] .menu-button') as HTMLButtonElement;
        const sortIcon = root(fixture).querySelector('thead th[data-column-id="name"] .sort-icon') as HTMLElement;
        const reorderableHeader = root(fixture).querySelector('thead th[data-column-id="name"]') as HTMLTableCellElement;

        // then: header label and controls are rendered correctly
        expect(headerLabel.textContent.trim()).toBe('Service');
        expect(reorderableHeader.classList.contains('is-reorderable')).toBe(true);
        expect(reorderableHeader.classList.contains('cdk-drag')).toBe(true);
        expect(reorderableHeader.querySelector('.column-reorder-handle')).toBeNull();
        expect(sortButton.classList.contains('cdk-drag-handle')).toBe(false);
        expect(menuButton.classList.contains('cdk-drag-handle')).toBe(false);
        expect(attrOf(root(fixture), 'thead th[data-column-id="name"]', 'aria-sort')).toBeNull();
        expect(attrOf(sortIcon, '.nat-default-sort', 'data-sort-state')).toBe('none');
        expect(sortIcon.querySelector('.nat-default-sort__svg')).toBeTruthy();
        expect(sortButton.getAttribute('aria-label')).toBe('Sort by Service');
        expect(menuButton.getAttribute('aria-label')).toBe('Open column actions for Service column');
        expect(menuButton.querySelector('.menu-button__icon')).toBeTruthy();

        // when: the sort button is clicked
        sortButton.click();
        fixture.detectChanges();

        // then: column sorts ascending
        expect(host.tableState().sorting).toStrictEqual([{ id: 'name', desc: false }]);
        expect(sortButton.classList.contains('is-sorted')).toBe(true);
        expect(attrOf(root(fixture), 'thead th[data-column-id="name"]', 'aria-sort')).toBe('ascending');
        expect(attrOf(root(fixture), 'thead th[data-column-id="name"] .nat-default-sort', 'data-sort-state')).toBe('asc');
        expect(sortButton.getAttribute('aria-label')).toBe('Service sorted in ascending order. Change sorting');

        // when: the menu button is clicked to open column actions
        menuButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const menu = await getOpenMenuHarness(fixture);
        const openMenu = requireOpenMenu();
        const leftPinMenuItem = getOpenMenuItem('left');
        const rightPinMenuItem = getOpenMenuItem('right');

        // then: pin menu items are rendered with correct roles and labels
        expect(menuButton.getAttribute('aria-expanded')).toBe('true');
        expect(await menu.isOpen()).toBe(true);
        expect(openMenu.getAttribute('aria-label')).toBe('Column actions for Service column');
        expect(leftPinMenuItem.getAttribute('role')).toBe('menuitem');
        expect(rightPinMenuItem.getAttribute('role')).toBe('menuitem');
        expect(await menu.getItems({ text: /Pin left/ })).toHaveLength(1);
        expect(await menu.getItems({ text: /Pin right/ })).toHaveLength(1);
        expect(textOf(leftPinMenuItem, '.column-menu-item__label')).toBe('Pin left');
        expect(textOf(rightPinMenuItem, '.column-menu-item__label')).toBe('Pin right');
        expect(leftPinMenuItem.querySelector('.column-menu-item__dock[data-pin-side="left"]')).toBeTruthy();
        expect(rightPinMenuItem.querySelector('.column-menu-item__dock[data-pin-side="right"]')).toBeTruthy();

        const leftMoveMenuItem = getOpenMoveMenuItem('left');
        const rightMoveMenuItem = getOpenMoveMenuItem('right');

        expect(await (await menu.getItems({ text: /Move right/ }))[0].isDisabled()).toBe(false);
        expect(leftMoveMenuItem.getAttribute('aria-label')).toBe('Move Service column left');
        expect(rightMoveMenuItem.getAttribute('aria-label')).toBe('Move Service column right');
        expect(textOf(rightMoveMenuItem, '.column-menu-item__label')).toBe('Move right');

        // when: the left pin menu item is clicked
        leftPinMenuItem.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then: column is pinned left
        expect(host.tableState().columnPinning).toStrictEqual({
          left: ['name'],
          right: []
        });

        // when: the menu is opened again after pinning
        menuButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const updatedLeftPinMenuItem = getOpenMenuItem('left');
        const updatedRightPinMenuItem = getOpenMenuItem('right');

        // then: pin state is reflected in the menu items
        expect(updatedLeftPinMenuItem.classList.contains('is-active')).toBe(true);
        expect(updatedRightPinMenuItem.classList.contains('is-active')).toBe(false);
        expect(textOf(updatedLeftPinMenuItem, '.column-menu-item__label')).toBe('Unpin left');

        // when: the right pin menu item is clicked
        updatedRightPinMenuItem.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then: column is re-pinned to the right and appears at the end
        expect(host.tableState().columnPinning).toStrictEqual({
          left: [],
          right: ['name']
        });
        expect(getHeaderColumnIds(fixture)).toStrictEqual(['region', 'status', 'throughput', 'name']);
        const rightPinnedHeaderActions = root(fixture).querySelector(
          'thead th[data-column-id="name"] .header-actions-row'
        ) as HTMLElement;

        expect(lastChildHasClass(rightPinnedHeaderActions, 'header-controls')).toBe(true);
        expect(headerLabel.textContent.trim()).toBe('Service');
      });
    });

    describe('WHEN: keyboard navigation is used in a header cell', () => {
      it('THEN: it wraps the header controls in one grid-cell widget and keeps them keyboard-reachable', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        fixture.detectChanges();

        const header = root(fixture).querySelector('thead th[data-column-id="name"]') as HTMLTableCellElement;
        const widgets = header.querySelectorAll('[ngGridCellWidget]');
        const sortButton = header.querySelector('.sort-button') as HTMLButtonElement;
        const menuButton = header.querySelector('.menu-button') as HTMLButtonElement;

        // One complex widget per cell wraps both controls, per the aria grid pattern.
        // then: one grid-cell widget wraps both controls
        expect(widgets).toHaveLength(1);
        expect(widgets[0].classList.contains('header-content')).toBe(true);
        expect(sortButton.tabIndex).toBe(0);
        expect(menuButton.tabIndex).toBe(0);

        // Enter steps into the cell's first control.
        // when: Enter is pressed on the header cell
        header.focus();
        header.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));

        // then: focus moves to the sort button
        expect(document.activeElement).toBe(sortButton);

        // Tab and Shift+Tab walk between the cell's controls.
        // when: Tab is pressed on the sort button
        sortButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));

        // then: focus moves to the menu button
        expect(document.activeElement).toBe(menuButton);

        // when: Shift+Tab is pressed on the menu button
        menuButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));

        // then: focus returns to the sort button
        expect(document.activeElement).toBe(sortButton);

        // Escape returns focus to the cell.
        // when: Escape is pressed on the sort button
        sortButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));

        // then: focus returns to the header cell
        expect(document.activeElement).toBe(header);
      });
    });

    describe('WHEN: the table with a hidden header label renders', () => {
      it('THEN: it keeps header action controls visible when the header label is hidden', () => {
        const hiddenFixture = TestBed.createComponent(HiddenHeaderActionLabelHost);

        hiddenFixture.detectChanges();

        const nameHeader = root(hiddenFixture).querySelector('thead th[data-column-id="name"]') as HTMLElement;
        const headerLabel = nameHeader.querySelector('.header-label') as HTMLElement;
        const sortButton = nameHeader.querySelector('.sort-button') as HTMLButtonElement;
        const menuButton = nameHeader.querySelector('.menu-button') as HTMLButtonElement;

        expect(headerLabel.classList.contains('sr-only')).toBe(true);
        expect(headerLabel.textContent.trim()).toBe('Row actions');
        expect(sortButton).toBeTruthy();
        expect(menuButton).toBeTruthy();
        expect(sortButton.getAttribute('aria-label')).toBe('Sort by Row actions');
        expect(menuButton.getAttribute('aria-label')).toBe('Open column actions for Row actions column');

        hiddenFixture.destroy();
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
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        fixture.detectChanges();

        const throughputMenuButton = root(fixture).querySelector(
          'thead th[data-column-id="throughput"] .menu-button'
        ) as HTMLButtonElement;

        // when: the throughput column menu is opened and pinned right
        throughputMenuButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        getOpenMenuItem('right').click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then: column is pinned right
        expect(host.tableState().columnPinning).toStrictEqual({
          left: [],
          right: ['throughput']
        });

        const rightPinnedEndAlignedHeaderActions = root(fixture).querySelector(
          'thead th[data-column-id="throughput"] .header-actions-row'
        ) as HTMLElement;

        // then: controls remain last in the right-pinned end-aligned header
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

    describe('WHEN: a column is moved via the header actions menu', () => {
      it('THEN: it moves columns through the header actions menu and announces the move', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        fixture.detectChanges();

        const regionMenuButton = getHeaderActionsMenuButton(fixture, 'region');
        const liveRegion = root(fixture).querySelector('nat-table p[aria-live="polite"]') as HTMLElement;

        // when: the region column menu is opened
        regionMenuButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const moveRightMenuItem = getOpenMoveMenuItem('right', 'region');

        // then: move right item is enabled
        expect(moveRightMenuItem.disabled).toBe(false);

        // when: move right is clicked
        moveRightMenuItem.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then: column order updates and live region announces the move
        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'status', 'region', 'throughput']);
        expect(host.tableState().columnOrder).toStrictEqual(['name', 'status', 'region', 'throughput']);
        expect(liveRegion.textContent.trim()).toBe('Moved Region column to position 3 of 4 in the unpinned region.');
      });
    });

    describe('WHEN: a pinned column is moved via the header actions menu', () => {
      it('THEN: it moves pinned columns through the header actions menu inside the pinned region', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when: two columns are pinned left
        host.tableState.set({
          columnPinning: {
            left: ['name', 'region'],
            right: []
          }
        });
        fixture.detectChanges();

        const regionMenuButton = getHeaderActionsMenuButton(fixture, 'region');

        // when: the region column menu is opened and move left is clicked
        regionMenuButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        getOpenMoveMenuItem('left', 'region').click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then: pinned region order updates
        expect(getHeaderColumnIds(fixture)).toStrictEqual(['region', 'name', 'status', 'throughput']);
        expect(host.tableState().columnPinning).toStrictEqual({
          left: ['region', 'name'],
          right: []
        });
      });
    });

    describe('WHEN: the table with move-only actions renders', () => {
      it('THEN: it renders move-only header action menus without pin actions', async () => {
        const moveOnlyFixture = TestBed.createComponent(MoveOnlyHeaderActionsHost);

        moveOnlyFixture.detectChanges();

        const menuButton = getHeaderActionsMenuButton(moveOnlyFixture, 'region');

        // when: the menu is opened
        menuButton.click();
        moveOnlyFixture.detectChanges();
        await moveOnlyFixture.whenStable();
        moveOnlyFixture.detectChanges();

        const menu = await getOpenMenuHarness(moveOnlyFixture);

        expect(queryByTestId('nat-table-header-pin-left-region')).toBeNull();
        expect(queryByTestId('nat-table-header-pin-right-region')).toBeNull();
        expect(await menu.getItems({ text: /Pin/ })).toHaveLength(0);
        expect(await menu.getItems({ text: /Move left/ })).toHaveLength(1);
        expect(await menu.getItems({ text: /Move right/ })).toHaveLength(1);

        moveOnlyFixture.destroy();
      });
    });

    describe('WHEN: the table with a custom sort indicator renders', () => {
      it('THEN: it renders caller-provided sort indicator content through header actions', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const customFixture = TestBed.createComponent(CustomSortIndicatorHost);

        customFixture.detectChanges();

        let sortIcon = root(customFixture).querySelector('thead th[data-column-id="name"] .sort-icon') as HTMLElement;
        const sortButton = root(customFixture).querySelector('thead th[data-column-id="name"] .sort-button') as HTMLButtonElement;

        // then: unsorted indicator shows the custom glyph
        expect(sortIcon.textContent.trim()).toBe('-');

        // when: the sort button is clicked
        sortButton.click();
        customFixture.detectChanges();

        sortIcon = root(customFixture).querySelector('thead th[data-column-id="name"] .sort-icon') as HTMLElement;

        // then: ascending indicator shows the custom glyph
        expect(sortIcon.textContent.trim()).toBe('A');
        expect(sortIcon.textContent).not.toContain('↕');
      });
    });
  });
});
