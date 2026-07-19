import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { ColumnDef } from '@tanstack/angular-table';
import { afterEach, vi } from 'vitest';

import { NAT_TABLE_CELL_SELECTOR, NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE } from './cell-interaction.const';
import { natTableCellControlPreparation } from './utils/cell-control-preparation.util';
import { ROW_ACTIVATE_INTERACTIVE_SELECTOR } from '../common/interaction.const';
import { NatTable } from '../table/table';
import { waitForControlPrepared, waitForMutation } from '../test-helpers/cell-control-dom.helper';
import { buildRows } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { queryRequired } from '../test-helpers/table-dom.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';

@Component({
  selector: 'test-table-cell-control-manager-host',
  imports: [NatTable, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-table [columns]="columns" [data]="rows" accessibleName="Cell control manager table" />
    </nat-table-surface>
  `
})
class TableCellControlManagerHost {
  protected readonly rows = buildRows(2);
  protected readonly columns: ColumnDef<Row, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Service',
      meta: { label: 'Service', rowHeader: true }
    },
    {
      accessorKey: 'region',
      header: 'Region',
      meta: { label: 'Region' }
    }
  ];
}

describe('FEATURE: NatTable cell-control mutation management', () => {
  afterEach(() => vi.restoreAllMocks());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCellControlManagerHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  describe('GIVEN: a known cell containing a prepared native control', () => {
    describe('WHEN: an irrelevant attribute changes on the cell', () => {
      it('THEN: it does not rescan the cell control subtree or re-prepare controls', async () => {
        const fixture = TestBed.createComponent(TableCellControlManagerHost);

        await fixture.whenStable();

        const cell = queryRequired<HTMLTableCellElement>(fixture, 'tbody td');
        const contentAdded = waitForMutation(cell, { childList: true });

        cell.innerHTML = '<button type="button">Edit</button>';
        await contentAdded;

        const originalQuerySelectorAll = Element.prototype.querySelectorAll;
        let cellPreparationScanCount = 0;
        const prepareSpy = vi.spyOn(natTableCellControlPreparation, 'prepare');

        vi.spyOn(Element.prototype, 'querySelectorAll').mockImplementation(function (this: Element, selectors: string) {
          if (selectors === ROW_ACTIVATE_INTERACTIVE_SELECTOR && this.matches(NAT_TABLE_CELL_SELECTOR)) {
            cellPreparationScanCount += 1;
          }

          return originalQuerySelectorAll.call(this, selectors);
        });

        prepareSpy.mockClear();

        const attributeChanged = waitForMutation(cell, { attributes: true, attributeFilter: ['aria-label'] });

        cell.setAttribute('aria-label', 'Updated consumer label');
        await attributeChanged;

        expect(cellPreparationScanCount).toBe(0);
        expect(prepareSpy).not.toHaveBeenCalled();

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: a prepared native control inside a known cell', () => {
    describe('WHEN: the same element is removed and inserted into another known cell', () => {
      it('THEN: it prepares the moved control without rescanning a cell subtree', async () => {
        const fixture = TestBed.createComponent(TableCellControlManagerHost);

        await fixture.whenStable();

        const sourceCell = queryRequired<HTMLTableCellElement>(fixture, 'tbody tr:first-child td');
        const targetCell = queryRequired<HTMLTableCellElement>(fixture, 'tbody tr:nth-child(2) td');
        const contentAdded = waitForMutation(sourceCell, { childList: true });

        sourceCell.innerHTML = '<button type="button">Edit</button>';
        await contentAdded;

        const button = sourceCell.querySelector('button') as HTMLButtonElement;
        const contentRemoved = waitForMutation(sourceCell, { childList: true });

        button.remove();
        await contentRemoved;

        button.tabIndex = 0;

        const originalQuerySelectorAll = Element.prototype.querySelectorAll;
        let cellPreparationScanCount = 0;
        const prepareSpy = vi.spyOn(natTableCellControlPreparation, 'prepare');

        vi.spyOn(Element.prototype, 'querySelectorAll').mockImplementation(function (this: Element, selectors: string) {
          if (selectors === ROW_ACTIVATE_INTERACTIVE_SELECTOR && this.matches(NAT_TABLE_CELL_SELECTOR)) {
            cellPreparationScanCount += 1;
          }

          return originalQuerySelectorAll.call(this, selectors);
        });

        prepareSpy.mockClear();

        const controlPrepared = waitForControlPrepared(button);

        targetCell.appendChild(button);
        await controlPrepared;

        expect(button.closest(NAT_TABLE_CELL_SELECTOR)).toBe(targetCell);
        expect(button.getAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe('');
        expect(button.tabIndex).toBe(-1);
        expect(cellPreparationScanCount).toBe(0);
        expect(prepareSpy).toHaveBeenCalled();

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: a known cell removed from the table', () => {
    describe('WHEN: a native control is added while detached and the cell is reinserted later', () => {
      it('THEN: it prepares the control after the cell returns to the table', async () => {
        const fixture = TestBed.createComponent(TableCellControlManagerHost);

        await fixture.whenStable();

        const row = queryRequired<HTMLTableRowElement>(fixture, 'tbody tr');
        const cell = queryRequired<HTMLTableCellElement>(fixture, 'tbody td');
        const cellRemoved = waitForMutation(row, { childList: true });

        cell.remove();
        await cellRemoved;

        cell.innerHTML = '<button type="button">Edit</button>';

        const button = cell.querySelector('button') as HTMLButtonElement;
        const cellReinserted = waitForMutation(row, { childList: true });

        row.appendChild(cell);
        await cellReinserted;
        await fixture.whenStable();

        expect(button.getAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe('');
        expect(button.tabIndex).toBe(-1);

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: a non-interactive element already in a known cell', () => {
    describe('WHEN: an attribute flip makes it match the interactive selector', () => {
      it('THEN: it prepares role, href, and contenteditable transitions', async () => {
        const fixture = TestBed.createComponent(TableCellControlManagerHost);

        await fixture.whenStable();

        const cell = queryRequired<HTMLTableCellElement>(fixture, 'tbody td');
        const contentAdded = waitForMutation(cell, { childList: true });

        // tabIndex 0 so preparation does not treat the element as an author opt-out
        // once the interactive selector starts matching after the attribute flip.
        cell.innerHTML = '<span tabindex="0">Role later</span><a tabindex="0">Link later</a><div tabindex="0">Edit later</div>';
        await contentAdded;

        const roleCandidate = cell.querySelector('span') as HTMLElement;
        const hrefCandidate = cell.querySelector('a') as HTMLAnchorElement;
        const editableCandidate = cell.querySelector('div') as HTMLElement;

        expect(roleCandidate.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe(false);
        expect(hrefCandidate.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe(false);
        expect(editableCandidate.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe(false);

        const rolePrepared = waitForControlPrepared(roleCandidate);

        roleCandidate.setAttribute('role', 'button');
        await rolePrepared;

        const hrefPrepared = waitForControlPrepared(hrefCandidate);

        hrefCandidate.setAttribute('href', '#details');
        await hrefPrepared;

        const editablePrepared = waitForControlPrepared(editableCandidate);

        editableCandidate.setAttribute('contenteditable', 'true');
        await editablePrepared;

        expect(roleCandidate.getAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe('');
        expect(roleCandidate.tabIndex).toBe(-1);
        expect(hrefCandidate.getAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe('');
        expect(hrefCandidate.tabIndex).toBe(-1);
        expect(editableCandidate.getAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe('');
        expect(editableCandidate.tabIndex).toBe(-1);

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: an added wrapper inside a known cell containing a control and a nested known cell', () => {
    describe('WHEN: the wrapper is inserted into the outer cell', () => {
      it('THEN: it prepares the sibling control', async () => {
        const fixture = TestBed.createComponent(TableCellControlManagerHost);

        await fixture.whenStable();

        const outerCell = queryRequired<HTMLTableCellElement>(fixture, 'tbody tr:first-child td');
        const nestedKnownCell = queryRequired<HTMLTableCellElement>(fixture, 'tbody tr:nth-child(2) td');
        const wrapper = document.createElement('div');
        const button = document.createElement('button');

        button.textContent = 'Edit';
        nestedKnownCell.remove();
        wrapper.append(button, nestedKnownCell);

        const contentAdded = waitForMutation(outerCell, { childList: true });

        outerCell.appendChild(wrapper);
        await contentAdded;
        await waitForControlPrepared(button);

        expect(button.getAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe('');
        expect(button.tabIndex).toBe(-1);

        fixture.destroy();
      });
    });
  });
});
