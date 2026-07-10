import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import type { ColumnDef } from '@tanstack/angular-table';

import { columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { getHeaderColumnIds, queryRequired } from '../test-helpers/table-dom.helper';
import { TableHost, createTableHostFixture, getInternalStore } from '../test-helpers/table-hosts.helper';
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

describe('FEATURE: NatTable per-column reorder opt-out', () => {
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

        // then: the opted-out column shows no reorder affordance and cannot move
        expect(statusHeader.classList.contains('is-reorderable')).toBe(false);
        expect(store.canMoveColumn('status', 'left')).toBe(false);
        expect(store.canMoveColumn('status', 'right')).toBe(false);

        // then: an opted-in sibling keeps its reorder affordance and can move
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

        // when: the hotkey fires on the opted-out column
        statusHeader.focus();
        statusHeader.dispatchEvent(blockedEvent);
        fixture.detectChanges();

        // then: nothing is consumed or moved
        expect(blockedEvent.defaultPrevented).toBe(false);
        expect(host.stateEvents).toStrictEqual([]);
        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'region', 'status', 'throughput']);

        // when: the hotkey fires on an opted-in sibling
        regionHeader.focus();
        regionHeader.dispatchEvent(buildReorderEvent());
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then: the opted-in sibling reorders
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

        // then: the opted-in column keeps its reorder affordance and can move despite the surface being off
        expect(regionHeader.classList.contains('is-reorderable')).toBe(true);
        expect(store.canMoveColumn('region', 'right')).toBe(true);

        // then: a default sibling stays non-reorderable
        expect(statusHeader.classList.contains('is-reorderable')).toBe(false);
        expect(store.canMoveColumn('status', 'left')).toBe(false);
        expect(store.canMoveColumn('status', 'right')).toBe(false);
      });
    });
  });
});
