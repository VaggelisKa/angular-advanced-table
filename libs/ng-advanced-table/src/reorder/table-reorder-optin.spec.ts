import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import type { ColumnDef } from '@tanstack/angular-table';

import { columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { createDropEvent, getHeaderColumnIds, queryAll, queryRequired } from '../test-helpers/table-dom.helper';
import { TableHost, createTableHostFixture, getInternalStore, getInternalTable } from '../test-helpers/table-hosts.helper';
import type { RecreateHostOptions } from '../test-helpers/table-hosts.helper';

// status opts out with meta.reorderable: false; its center-zone siblings stay reorderable by default.
const mixedColumns: ColumnDef<Row, unknown>[] = columns.map((column) => {
  const accessorKey = (column as { readonly accessorKey?: unknown }).accessorKey;

  return accessorKey === 'status' ? { ...column, meta: { ...column.meta, reorderable: false } } : column;
});

// surface reordering OFF; region opts IN with meta.reorderable: true, siblings stay non-reorderable.
const optInColumns: ColumnDef<Row, unknown>[] = columns.map((column) => {
  const accessorKey = (column as { readonly accessorKey?: unknown }).accessorKey;

  return accessorKey === 'region' ? { ...column, meta: { ...column.meta, reorderable: true } } : column;
});

const buildReorderEvent = (): KeyboardEvent =>
  new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true, shiftKey: true, bubbles: true, cancelable: true });

describe('FEATURE: NatTable per-column reorder opt-in/out', () => {
  let fixture: ComponentFixture<TableHost>;
  let host: TableHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  const recreateHost = async (options: RecreateHostOptions = {}): Promise<void> => {
    ({ fixture, host } = await createTableHostFixture(options));
  };

  describe('GIVEN: a reorder-enabled table where one column opts out of meta.reorderable', () => {
    describe('WHEN: the non-reorderable column is inspected', () => {
      it('THEN: it drops its drag affordance and Move buttons while an opted-in sibling stays movable', async () => {
        await recreateHost({ enableReordering: true, columns: mixedColumns });
        fixture.detectChanges();

        const store = getInternalStore(fixture);
        const statusHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="status"]');
        const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');

        expect(statusHeader.classList.contains('is-reorderable')).toBe(false);
        expect(store.canMoveColumn('status', 'left')).toBe(false);
        expect(store.canMoveColumn('status', 'right')).toBe(false);

        expect(regionHeader.classList.contains('is-reorderable')).toBe(true);
        expect(store.canMoveColumn('region', 'right')).toBe(true);
      });
    });

    describe('WHEN: the reorder hotkey is pressed on each column', () => {
      it('THEN: it ignores the non-reorderable column without consuming the shortcut but still moves an opted-in sibling', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        await recreateHost({ enableReordering: true, columns: mixedColumns });
        fixture.detectChanges();

        const statusHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="status"]');
        const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');
        const blockedEvent = buildReorderEvent();

        host.stateEvents.length = 0;

        statusHeader.focus();
        statusHeader.dispatchEvent(blockedEvent);
        fixture.detectChanges();

        expect(blockedEvent.defaultPrevented).toBe(false);
        expect(host.stateEvents).toStrictEqual([]);
        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'region', 'status', 'throughput']);

        regionHeader.focus();
        regionHeader.dispatchEvent(buildReorderEvent());
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'status', 'region', 'throughput']);
      });
    });

    describe('WHEN: a reorderable sibling is moved across the opted-out column', () => {
      it('THEN: the opted-out column is displaced even though it cannot be grabbed', async () => {
        await recreateHost({ enableReordering: true, columns: mixedColumns });
        fixture.detectChanges();

        const store = getInternalStore(fixture);

        expect(store.canMoveColumn('status', 'left')).toBe(false);
        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'region', 'status', 'throughput']);

        store.moveColumnByDelta('region', 1);
        fixture.detectChanges();

        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'status', 'region', 'throughput']);
      });
    });
  });

  describe('GIVEN: a reorder-disabled table where one column opts in with meta.reorderable', () => {
    describe('WHEN: the opted-in column and a default sibling are inspected', () => {
      it('THEN: only the opted-in column exposes its drag affordance and can move', async () => {
        await recreateHost({ enableReordering: false, columns: optInColumns });
        fixture.detectChanges();

        const store = getInternalStore(fixture);
        const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');
        const statusHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="status"]');

        expect(regionHeader.classList.contains('is-reorderable')).toBe(true);
        expect(store.canMoveColumn('region', 'right')).toBe(true);

        expect(statusHeader.classList.contains('is-reorderable')).toBe(false);
        expect(store.canMoveColumn('status', 'left')).toBe(false);
        expect(store.canMoveColumn('status', 'right')).toBe(false);

        // The per-column opt-in must cause the drag/drop row infrastructure to render
        // even though the surface enableReordering flag is off.

        const dropLists = fixture.debugElement.queryAll(By.directive(CdkDropList));
        const drags = fixture.debugElement.queryAll(By.directive(CdkDrag));
        const reorderableCells = queryAll(fixture, '.header-cell.is-reorderable');

        expect(dropLists).toHaveLength(1);
        expect(drags.length).toBeGreaterThan(0);
        expect(reorderableCells).toHaveLength(1);
      });
    });

    describe('WHEN: the opted-in column is dropped via drag/drop', () => {
      it('THEN: it reorders the opted-in column even though drag/drop is off at the surface', async () => {
        await recreateHost({ enableReordering: false, columns: optInColumns });
        fixture.detectChanges();

        // The opt-in must have activated the full drag row + directives.

        const dropLists = fixture.debugElement.queryAll(By.directive(CdkDropList));
        const drags = fixture.debugElement.queryAll(By.directive(CdkDrag));
        const reorderableCells = queryAll(fixture, '.header-cell.is-reorderable');

        expect(dropLists).toHaveLength(1);
        expect(drags.length).toBeGreaterThan(0);
        expect(reorderableCells).toHaveLength(1);

        const table = getInternalTable(fixture);
        const leafHeaderGroup = table.table.getHeaderGroups().at(-1);

        if (!leafHeaderGroup) {
          throw new Error('Expected a leaf header group.');
        }

        table.onHeaderDrop(createDropEvent('region', 1, 2), leafHeaderGroup);
        fixture.detectChanges();

        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'status', 'region', 'throughput']);
        expect(host.stateEvents.at(-1)?.columnOrder).toStrictEqual(['name', 'status', 'region', 'throughput']);
      });
    });

    describe('WHEN: the non-opted-in column is dropped via drag/drop', () => {
      it('THEN: it ignores the drop and leaves the header order unchanged', async () => {
        await recreateHost({ enableReordering: false, columns: optInColumns });
        fixture.detectChanges();

        // The drop list row must still be present (sibling opt-in enables the row),
        // but the individual non-opted column must be disabled for drag.

        const dropLists = fixture.debugElement.queryAll(By.directive(CdkDropList));
        const drags = fixture.debugElement.queryAll(By.directive(CdkDrag));
        const reorderableCells = queryAll(fixture, '.header-cell.is-reorderable');
        const statusHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="status"]');

        expect(dropLists).toHaveLength(1);
        expect(drags.length).toBeGreaterThan(0);
        expect(reorderableCells).toHaveLength(1);
        expect(statusHeader.classList.contains('is-reorderable')).toBe(false);

        const table = getInternalTable(fixture);
        const leafHeaderGroup = table.table.getHeaderGroups().at(-1);

        if (!leafHeaderGroup) {
          throw new Error('Expected a leaf header group.');
        }

        host.stateEvents.length = 0;

        table.onHeaderDrop(createDropEvent('status', 2, 1), leafHeaderGroup);
        fixture.detectChanges();

        expect(host.stateEvents).toStrictEqual([]);
        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'region', 'status', 'throughput']);
      });
    });
  });
});
