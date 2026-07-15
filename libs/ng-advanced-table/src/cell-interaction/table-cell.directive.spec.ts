import { Component, ElementRef, afterNextRender, inject, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { ColumnDef } from '@tanstack/angular-table';
import { afterEach, vi } from 'vitest';

import { NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE } from './cell-interaction.const';
import { natTableCellControlPreparation } from './utils/cell-control-preparation.util';
import { ROW_ACTIVATE_INTERACTIVE_SELECTOR } from '../common/interaction.const';
import { NatTable } from '../table/table';
import { buildRows } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { queryAll, queryRequired } from '../test-helpers/table-dom.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';

@Component({
  selector: 'test-table-cell-render-host',
  imports: [NatTable, TestTableSurface],
  template: `
    <span>{{ unrelatedRenderTrigger() }}</span>
    <nat-table-surface>
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Cell control performance table" />
    </nat-table-surface>
  `
})
class TableCellRenderHost {
  public readonly unrelatedRenderTrigger = signal(0);
  public readonly rows = signal(buildRows(20));
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

@Component({
  selector: 'test-table-cell-rich-host',
  imports: [NatTable, TestTableSurface],
  template: `
    <span>{{ unrelatedRenderTrigger() }}</span>
    <nat-table-surface>
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Rich cell control performance table" />
    </nat-table-surface>
  `
})
class TableCellRichHost {
  public readonly unrelatedRenderTrigger = signal(0);
  /** 50 rows × 2 body columns = 100 cells with injected controls after first paint. */
  public readonly rows = signal(buildRows(50));
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

@Component({
  selector: 'test-table-cell-render-callback-host',
  imports: [NatTable, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-table [columns]="columns" [data]="rows" accessibleName="Render callback table" />
    </nat-table-surface>
  `
})
class TableCellRenderCallbackHost {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly rows = buildRows(1);
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

  public constructor() {
    afterNextRender({
      write: () => {
        this.host.querySelector('tbody td')?.insertAdjacentHTML('beforeend', '<button type="button">Edit</button>');
      }
    });
  }
}

const waitForMutation = (target: Node, options: MutationObserverInit): Promise<void> =>
  new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      observer.disconnect();
      resolve();
    });

    observer.observe(target, options);
  });

const waitForControlPrepared = (control: HTMLElement): Promise<void> =>
  new Promise((resolve) => {
    if (control.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE) && control.tabIndex === -1) {
      resolve();

      return;
    }

    const observer = new MutationObserver(() => {
      if (control.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE) && control.tabIndex === -1) {
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(control, {
      attributes: true,
      attributeFilter: [NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE, 'tabindex']
    });
  });

const prepareButtonsInBodyCells = async (fixture: { nativeElement: HTMLElement }): Promise<HTMLButtonElement[]> => {
  const cells = Array.from(fixture.nativeElement.querySelectorAll<HTMLElement>('tbody th, tbody td'));
  const contentAdded = Promise.all(cells.map((cell) => waitForMutation(cell, { childList: true, subtree: true })));

  for (const cell of cells) {
    cell.innerHTML = '<button type="button">Edit</button>';
  }

  await contentAdded;

  const buttons = Array.from(fixture.nativeElement.querySelectorAll<HTMLButtonElement>('tbody button'));

  await Promise.all(buttons.map((button) => waitForControlPrepared(button)));

  for (const button of buttons) {
    expect(button.getAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe('');
    expect(button.tabIndex).toBe(-1);
  }

  return buttons;
};

describe('FEATURE: NatTable cell control preparation', () => {
  afterEach(() => vi.restoreAllMocks());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCellRenderCallbackHost, TableCellRenderHost, TableCellRichHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  describe('GIVEN: a rendered table with unchanged cell content', () => {
    describe('WHEN: unrelated application renders occur', () => {
      it('THEN: it does not rescan every cell for interactive controls', async () => {
        const fixture = TestBed.createComponent(TableCellRenderHost);

        await fixture.whenStable();

        const bodyCellCount = queryAll(fixture, 'tbody th, tbody td').length;
        const originalQuerySelectorAll = Element.prototype.querySelectorAll;
        let preparationScanCount = 0;
        const prepareSpy = vi.spyOn(natTableCellControlPreparation, 'prepare');

        vi.spyOn(Element.prototype, 'querySelectorAll').mockImplementation(function (this: Element, selectors: string) {
          if (selectors === ROW_ACTIVATE_INTERACTIVE_SELECTOR && this.matches('tbody th, tbody td')) {
            preparationScanCount += 1;
          }

          return originalQuerySelectorAll.call(this, selectors);
        });

        prepareSpy.mockClear();

        for (let renderIndex = 1; renderIndex <= 3; renderIndex += 1) {
          fixture.componentInstance.unrelatedRenderTrigger.set(renderIndex);
          await fixture.whenStable();
        }

        expect(bodyCellCount).toBe(40);
        expect(preparationScanCount).toBe(0);
        expect(prepareSpy).not.toHaveBeenCalled();

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: a data cell rendered without interactive content', () => {
    describe('WHEN: a native control is added after the initial render', () => {
      it('THEN: it integrates the control into the cell keyboard model', async () => {
        const fixture = TestBed.createComponent(TableCellRenderHost);

        await fixture.whenStable();

        const cell = queryRequired<HTMLTableCellElement>(fixture, 'tbody td');
        const contentAdded = new Promise<void>((resolve) => {
          const observer = new MutationObserver(() => {
            observer.disconnect();
            resolve();
          });

          observer.observe(cell, { childList: true, subtree: true });
        });

        cell.innerHTML = '<button type="button">Edit</button>';
        await contentAdded;

        const button = cell.querySelector('button') as HTMLButtonElement;

        expect(button.getAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe('');
        expect(button.tabIndex).toBe(-1);

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: a control inserted by another after-render callback', () => {
    describe('WHEN: it is added after the manager initial read phase', () => {
      it('THEN: it integrates the control into the cell keyboard model', async () => {
        const fixture = TestBed.createComponent(TableCellRenderCallbackHost);

        await fixture.whenStable();

        const button = queryRequired<HTMLButtonElement>(fixture, 'tbody td button');

        expect(button.getAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe('');
        expect(button.tabIndex).toBe(-1);

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: an existing set of rendered table rows', () => {
    describe('WHEN: Angular moves those rows into a new order', () => {
      it('THEN: it does not rescan the moved cell subtrees', async () => {
        const fixture = TestBed.createComponent(TableCellRenderHost);

        await fixture.whenStable();

        const tbody = queryRequired<HTMLTableSectionElement>(fixture, 'tbody');
        const rowsMoved = waitForMutation(tbody, { childList: true });
        const originalQuerySelectorAll = Element.prototype.querySelectorAll;
        let preparationScanCount = 0;
        const prepareSpy = vi.spyOn(natTableCellControlPreparation, 'prepare');

        vi.spyOn(Element.prototype, 'querySelectorAll').mockImplementation(function (this: Element, selectors: string) {
          if (selectors === ROW_ACTIVATE_INTERACTIVE_SELECTOR) {
            preparationScanCount += 1;
          }

          return originalQuerySelectorAll.call(this, selectors);
        });

        prepareSpy.mockClear();

        fixture.componentInstance.rows.update((rows) => [...rows].reverse());
        await Promise.all([fixture.whenStable(), rowsMoved]);

        expect(preparationScanCount).toBe(0);
        expect(prepareSpy).not.toHaveBeenCalled();

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: a large table whose body cells already contain prepared controls', () => {
    describe('WHEN: rows reorder and unrelated application renders occur', () => {
      it('THEN: it does not re-prepare existing controls or rescan cell subtrees', async () => {
        const fixture = TestBed.createComponent(TableCellRichHost);

        await fixture.whenStable();

        const buttons = await prepareButtonsInBodyCells(fixture);
        const bodyCellCount = queryAll(fixture, 'tbody th, tbody td').length;
        const tbody = queryRequired<HTMLTableSectionElement>(fixture, 'tbody');
        const rowsMoved = waitForMutation(tbody, { childList: true });
        const originalQuerySelectorAll = Element.prototype.querySelectorAll;
        let preparationScanCount = 0;
        const prepareSpy = vi.spyOn(natTableCellControlPreparation, 'prepare');

        vi.spyOn(Element.prototype, 'querySelectorAll').mockImplementation(function (this: Element, selectors: string) {
          if (selectors === ROW_ACTIVATE_INTERACTIVE_SELECTOR) {
            preparationScanCount += 1;
          }

          return originalQuerySelectorAll.call(this, selectors);
        });

        prepareSpy.mockClear();

        fixture.componentInstance.rows.update((rows) => [...rows].reverse());
        await Promise.all([fixture.whenStable(), rowsMoved]);

        for (let renderIndex = 1; renderIndex <= 3; renderIndex += 1) {
          fixture.componentInstance.unrelatedRenderTrigger.set(renderIndex);
          await fixture.whenStable();
        }

        expect(bodyCellCount).toBe(100);
        expect(buttons).toHaveLength(100);
        expect(preparationScanCount).toBe(0);
        expect(prepareSpy).not.toHaveBeenCalled();

        for (const button of buttons) {
          expect(button.isConnected).toBe(true);
          expect(button.getAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe('');
          expect(button.tabIndex).toBe(-1);
        }

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: a disabled native control added to a rendered cell', () => {
    describe('WHEN: the control becomes enabled', () => {
      it('THEN: it integrates the newly reachable control into the cell keyboard model', async () => {
        const fixture = TestBed.createComponent(TableCellRenderHost);

        await fixture.whenStable();

        const cell = queryRequired<HTMLTableCellElement>(fixture, 'tbody td');
        const contentAdded = new Promise<void>((resolve) => {
          const observer = new MutationObserver(() => {
            observer.disconnect();
            resolve();
          });

          observer.observe(cell, { childList: true, subtree: true });
        });

        cell.innerHTML = '<button disabled type="button">Edit</button>';
        await contentAdded;

        const button = cell.querySelector('button') as HTMLButtonElement;

        expect(button.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe(false);

        const controlPrepared = new Promise<void>((resolve) => {
          const observer = new MutationObserver(() => {
            if (button.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)) {
              observer.disconnect();
              resolve();
            }
          });

          observer.observe(button, {
            attributes: true,
            attributeFilter: [NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE, 'tabindex']
          });
        });

        button.disabled = false;
        await controlPrepared;

        expect(button.getAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe('');
        expect(button.tabIndex).toBe(-1);

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: Angular Aria owns the roving tab stop of a grid cell', () => {
    describe('WHEN: Angular Aria makes a different cell tabbable', () => {
      it('THEN: it leaves the cell tabindex and managed-control marker unchanged', async () => {
        const fixture = TestBed.createComponent(TableCellRenderHost);

        await fixture.whenStable();

        const nextCell = queryRequired<HTMLElement>(fixture, 'tbody tr:first-child td');

        const tabindexChanged = new Promise<void>((resolve) => {
          const observer = new MutationObserver(() => {
            observer.disconnect();
            resolve();
          });

          observer.observe(nextCell, { attributes: true, attributeFilter: ['tabindex'] });
        });

        nextCell.tabIndex = 0;
        await tabindexChanged;

        expect(nextCell.tabIndex).toBe(0);
        expect(nextCell.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe(false);

        fixture.destroy();
      });
    });
  });
});
