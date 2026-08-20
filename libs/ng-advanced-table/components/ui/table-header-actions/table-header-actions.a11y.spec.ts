import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { root } from '../../test-helpers/table-dom.helper';
import {
  CustomSortIndicatorHost,
  HiddenHeaderActionLabelHost,
  MoveOnlyHeaderActionsHost
} from '../../test-helpers/table-header-hosts.helper';
import { TableHost } from '../../test-helpers/table-hosts.helper';

describe('FEATURE: NatTable UI - Header Actions A11y', () => {
  let fixture: ComponentFixture<TableHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHost, CustomSortIndicatorHost, MoveOnlyHeaderActionsHost, HiddenHeaderActionLabelHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TableHost);
    await fixture.whenStable();
  });

  describe('GIVEN: a table with header sort and column actions', () => {
    describe('WHEN: keyboard navigation is used in a header cell', () => {
      it('THEN: it renders no grid-cell widget and manages the header controls out of the tab order', () => {
        fixture.detectChanges();

        const header = root(fixture).querySelector('thead th[data-column-id="name"]') as HTMLTableCellElement;
        const headerContent = header.querySelector('.header-content') as HTMLElement;
        const sortButton = header.querySelector('.sort-button') as HTMLButtonElement;
        const menuButton = header.querySelector('.menu-button') as HTMLButtonElement;

        // No ngGridCellWidget wrapper: the unregistered widget still self-assigns
        // tabindex="0" while its cell is active, adding a focus stop between the
        // cell and its controls that swallows Tab.
        expect(header.querySelectorAll('[ngGridCellWidget]')).toHaveLength(0);
        expect(headerContent.hasAttribute('tabindex')).toBe(false);
        expect(sortButton.tabIndex).toBe(-1);
        expect(sortButton.hasAttribute('data-nat-table-managed-cell-widget')).toBe(true);
        expect(menuButton.tabIndex).toBe(-1);
        expect(menuButton.hasAttribute('data-nat-table-managed-cell-widget')).toBe(true);

        header.focus();
        header.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));

        expect(document.activeElement).toBe(sortButton);

        sortButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));

        expect(document.activeElement).toBe(menuButton);

        menuButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));

        expect(document.activeElement).toBe(sortButton);

        sortButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));

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
  });
});
