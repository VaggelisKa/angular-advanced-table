import { Component, DestroyRef, Directive, inject, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import type { ColumnDef } from '@tanstack/angular-table';

import { NatTable } from './table';
import type { NatTableRowRenderStrategy, NatTableVirtualItem } from '../common/row-render-strategy.type';
import { NatTableRowRenderStrategyRegistry } from '../domain-logic/table-row-render-strategy.service';
import { NatTableService } from '../domain-logic/table.service';

type TestRow = { readonly id: string; readonly name: string };

const ROW_HEIGHT = 40;
const windowItems = signal<readonly NatTableVirtualItem[]>([]);

const showRows = (indexes: readonly number[]): void =>
  windowItems.set(indexes.map((index) => ({ index, start: index * ROW_HEIGHT, end: (index + 1) * ROW_HEIGHT })));

@Directive({ selector: 'nat-table[testMovableRowWindow]' })
class TestMovableRowWindow {
  public constructor() {
    const strategy: NatTableRowRenderStrategy = {
      items: windowItems,
      totalSize: signal(20 * ROW_HEIGHT),
      rowHeight: signal(ROW_HEIGHT)
    };

    inject(DestroyRef).onDestroy(inject(NatTableRowRenderStrategyRegistry).register(strategy));
  }
}

@Component({
  selector: 'test-movable-row-window-host',
  imports: [NatTable, TestMovableRowWindow],
  providers: [NatTableService],
  template: `<nat-table [columns]="columns" [data]="rows" accessibleName="Movable row window" testMovableRowWindow />`
})
class MovableRowWindowHost {
  protected readonly rows: TestRow[] = Array.from({ length: 20 }, (_, index) => ({ id: `row-${index}`, name: `Row ${index}` }));
  protected readonly columns: ColumnDef<TestRow, unknown>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'id', header: 'Id' }
  ];
}

const bodyRows = (fixture: ComponentFixture<MovableRowWindowHost>): HTMLTableRowElement[] => [
  ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLTableRowElement>('[data-testid="nat-table-row"]')
];

const renderWindow = async (fixture: ComponentFixture<MovableRowWindowHost>, indexes: readonly number[]): Promise<void> => {
  showRows(indexes);
  await fixture.whenStable();
};

describe('FEATURE: windowed body row reuse', () => {
  let fixture: ComponentFixture<MovableRowWindowHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovableRowWindowHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
    fixture = TestBed.createComponent(MovableRowWindowHost);
    await renderWindow(fixture, [0, 1, 2, 3]);
  });

  afterEach(() => fixture.destroy());

  describe('GIVEN: a row-render strategy windows the body', () => {
    describe('WHEN: the window moves down by two rows', () => {
      it('THEN: it reuses the row and cell nodes of the rows that left for the rows that entered', async () => {
        const rowsBefore = bodyRows(fixture);
        const cellsBefore = new Set((fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr.data-row td'));

        await renderWindow(fixture, [2, 3, 4, 5]);

        const rowsAfter = bodyRows(fixture);

        expect(rowsAfter.map((row) => row.dataset['rowId'])).toStrictEqual(['row-2', 'row-3', 'row-4', 'row-5']);
        expect(rowsAfter.every((row) => rowsBefore.includes(row))).toBe(true);
        expect(
          [...(fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr.data-row td')].every((cell) => cellsBefore.has(cell))
        ).toBe(true);
        expect(rowsAfter.map((row) => row.querySelector('[data-column-id="id"]')?.textContent.trim())).toStrictEqual([
          'row-2',
          'row-3',
          'row-4',
          'row-5'
        ]);
      });
    });

    describe('WHEN: rows enter before a row that stays mounted', () => {
      it('THEN: it never detaches the row that stays', async () => {
        await renderWindow(fixture, [3, 4, 5, 6]);

        const keptRow = bodyRows(fixture).find((row) => row.dataset['rowId'] === 'row-5');
        const removedNodes: Node[] = [];
        const observer = new MutationObserver((records) => records.forEach((record) => removedNodes.push(...record.removedNodes)));

        observer.observe(keptRow?.parentElement as HTMLElement, { childList: true });
        await renderWindow(fixture, [0, 1, 2, 5]);
        removedNodes.push(...observer.takeRecords().flatMap((record) => [...record.removedNodes]));
        observer.disconnect();

        expect(bodyRows(fixture).map((row) => row.dataset['rowId'])).toStrictEqual(['row-0', 'row-1', 'row-2', 'row-5']);
        expect(bodyRows(fixture).at(-1)).toBe(keptRow);
        expect(removedNodes).not.toContain(keptRow);
      });
    });
  });
});
