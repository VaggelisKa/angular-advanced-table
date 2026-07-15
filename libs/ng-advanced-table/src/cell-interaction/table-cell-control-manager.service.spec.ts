import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { ColumnDef } from '@tanstack/angular-table';
import { afterEach, vi } from 'vitest';

import { NAT_TABLE_CELL_SELECTOR, NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE } from './cell-interaction.const';
import { ROW_ACTIVATE_INTERACTIVE_SELECTOR } from '../common/interaction.const';
import { NatTable } from '../table/table';
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
      it('THEN: it does not rescan the cell control subtree', async () => {
        const fixture = TestBed.createComponent(TableCellControlManagerHost);

        await fixture.whenStable();

        const cell = queryRequired<HTMLTableCellElement>(fixture, 'tbody td');
        const contentAdded = new Promise<void>((resolve) => {
          const observer = new MutationObserver(() => {
            observer.disconnect();
            resolve();
          });

          observer.observe(cell, { childList: true });
        });

        cell.innerHTML = '<button type="button">Edit</button>';
        await contentAdded;

        const originalQuerySelectorAll = Element.prototype.querySelectorAll;
        let cellPreparationScanCount = 0;

        vi.spyOn(Element.prototype, 'querySelectorAll').mockImplementation(function (this: Element, selectors: string) {
          if (selectors === ROW_ACTIVATE_INTERACTIVE_SELECTOR && this.matches(NAT_TABLE_CELL_SELECTOR)) {
            cellPreparationScanCount += 1;
          }

          return originalQuerySelectorAll.call(this, selectors);
        });

        const attributeChanged = new Promise<void>((resolve) => {
          const observer = new MutationObserver(() => {
            observer.disconnect();
            resolve();
          });

          observer.observe(cell, { attributes: true, attributeFilter: ['aria-label'] });
        });

        cell.setAttribute('aria-label', 'Updated consumer label');
        await attributeChanged;

        expect(cellPreparationScanCount).toBe(0);

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
        const contentAdded = new Promise<void>((resolve) => {
          const observer = new MutationObserver(() => {
            observer.disconnect();
            resolve();
          });

          observer.observe(sourceCell, { childList: true });
        });

        sourceCell.innerHTML = '<button type="button">Edit</button>';
        await contentAdded;

        const button = sourceCell.querySelector('button') as HTMLButtonElement;
        const contentRemoved = new Promise<void>((resolve) => {
          const observer = new MutationObserver(() => {
            observer.disconnect();
            resolve();
          });

          observer.observe(sourceCell, { childList: true });
        });

        button.remove();
        await contentRemoved;

        button.tabIndex = 0;

        const originalQuerySelectorAll = Element.prototype.querySelectorAll;
        let cellPreparationScanCount = 0;

        vi.spyOn(Element.prototype, 'querySelectorAll').mockImplementation(function (this: Element, selectors: string) {
          if (selectors === ROW_ACTIVATE_INTERACTIVE_SELECTOR && this.matches(NAT_TABLE_CELL_SELECTOR)) {
            cellPreparationScanCount += 1;
          }

          return originalQuerySelectorAll.call(this, selectors);
        });

        const controlPrepared = new Promise<void>((resolve) => {
          const observer = new MutationObserver(() => {
            if (button.tabIndex === -1) {
              observer.disconnect();
              resolve();
            }
          });

          observer.observe(button, { attributes: true, attributeFilter: ['tabindex'] });
        });

        targetCell.appendChild(button);
        await controlPrepared;

        expect(button.closest(NAT_TABLE_CELL_SELECTOR)).toBe(targetCell);
        expect(button.getAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe('');
        expect(button.tabIndex).toBe(-1);
        expect(cellPreparationScanCount).toBe(0);

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

        const contentAdded = new Promise<void>((resolve) => {
          const observer = new MutationObserver(() => {
            observer.disconnect();
            resolve();
          });

          observer.observe(outerCell, { childList: true });
        });

        outerCell.appendChild(wrapper);
        await contentAdded;

        expect(button.getAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe('');
        expect(button.tabIndex).toBe(-1);

        fixture.destroy();
      });
    });
  });
});
