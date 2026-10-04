import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import type { Cell } from '@tanstack/angular-table';

import type { Row } from '../test-helpers/table-data.helper';
import { TableHost, createTableHostFixture, getInternalStore } from '../test-helpers/table-hosts.helper';

// Every TanStack row memoizes its cells on the column order and pinning arrays
// handed to it. A fresh-but-equal array on an unrelated state change makes all
// rendered rows rebuild every cell, which re-renders every cell's content.
const getVisibleCellsById = (fixture: ComponentFixture<TableHost>): Map<string, readonly Cell<Row, unknown>[]> =>
  new Map(
    getInternalStore(fixture)
      .table.getRowModel()
      .rows.map((row) => [row.id, row.getVisibleCells()])
  );

describe('FEATURE: TanStack cell identity across table state changes', () => {
  let fixture: ComponentFixture<TableHost>;
  let host: TableHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    ({ fixture, host } = await createTableHostFixture());
  });

  describe('GIVEN: an uncontrolled table with a pinned column', () => {
    describe('WHEN: the sorting changes through the table', () => {
      it('THEN: it keeps the column order, pinning, and every row cell by reference', async () => {
        const store = getInternalStore(fixture);
        const leafColumnsBefore = store.table.getAllLeafColumns();
        const pinningBefore = store.table.getState().columnPinning;
        const cellsBefore = getVisibleCellsById(fixture);

        store.table.setSorting([{ id: 'name', desc: false }]);
        await fixture.whenStable();

        const cellsAfter = getVisibleCellsById(fixture);

        expect(store.table.getState().sorting).toStrictEqual([{ id: 'name', desc: false }]);
        expect(store.table.getAllLeafColumns()).toBe(leafColumnsBefore);
        expect(store.table.getState().columnPinning).toBe(pinningBefore);
        expect(cellsAfter.size).toBe(cellsBefore.size);

        for (const [rowId, cells] of cellsAfter) {
          expect(cells).toBe(cellsBefore.get(rowId));
        }
      });
    });

    describe('WHEN: the column pinning changes to a different value', () => {
      it('THEN: it hands TanStack the new pinning and rebuilds the row cells in the new order', async () => {
        const store = getInternalStore(fixture);
        const cellsBefore = getVisibleCellsById(fixture);

        store.table.setColumnPinning({ left: ['region'], right: [] });
        await fixture.whenStable();

        const [rowId, cellsAfter] = [...getVisibleCellsById(fixture)][0];

        expect(store.table.getState().columnPinning).toStrictEqual({ left: ['region'], right: [] });
        expect(cellsAfter).not.toBe(cellsBefore.get(rowId));
        expect(cellsAfter[0].column.id).toBe('region');
      });
    });
  });

  describe('GIVEN: a controlled state binding that omits the column order and pinning slices', () => {
    describe('WHEN: the consumer replaces the state object with a new sorting', () => {
      it('THEN: it keeps every row cell by reference', async () => {
        const cellsBefore = getVisibleCellsById(fixture);

        host.state.set({ sorting: [{ id: 'region', desc: true }] });
        await fixture.whenStable();

        const store = getInternalStore(fixture);
        const cellsAfter = getVisibleCellsById(fixture);

        expect(store.table.getState().sorting).toStrictEqual([{ id: 'region', desc: true }]);

        for (const [rowId, cells] of cellsAfter) {
          expect(cells).toBe(cellsBefore.get(rowId));
        }
      });
    });
  });
});
