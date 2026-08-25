import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { ColumnDef } from '@tanstack/angular-table';

import type { NatTableUserState } from 'ng-advanced-table';
import { NatList, NatTable } from 'ng-advanced-table';

import { NatTableSurface } from './table-surface';

type Row = {
  readonly id: string;
  readonly name: string;
  readonly status: string;
};

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'id', header: 'Id', meta: { label: 'Id', rowHeader: true } },
  { accessorKey: 'name', header: 'Name', meta: { label: 'Name' } },
  { accessorKey: 'status', header: 'Status', meta: { label: 'Status' } }
];

@Component({
  selector: 'nat-swap-host',
  imports: [NatList, NatTable, NatTableSurface],
  template: `
    <nat-table-surface [enablePinning]="true" [enableSorting]="true" [(state)]="state">
      @if (isTable()) {
        <nat-table [columns]="columns" [data]="rows" accessibleName="Swap table" />
      } @else {
        <nat-list [columns]="columns" [data]="rows" accessibleName="Swap list" />
      }
    </nat-table-surface>
  `
})
class SwapHost {
  protected readonly rows: Row[] = [
    { id: 'r1', name: 'Alpha', status: 'ok' },
    { id: 'r2', name: 'Beta', status: 'bad' }
  ];

  protected readonly columns = columns;
  public readonly isTable = signal(true);
  public readonly state = signal<Partial<NatTableUserState>>({});
}

@Component({
  selector: 'nat-swap-subset-host',
  imports: [NatList, NatTable, NatTableSurface],
  template: `
    <nat-table-surface [enablePinning]="true" [enableSorting]="true" [(state)]="state">
      @if (isTable()) {
        <nat-table [columns]="tableColumns" [data]="rows" accessibleName="Swap table" />
      } @else {
        <nat-list [columns]="listColumns" [data]="rows" accessibleName="Swap list" />
      }
    </nat-table-surface>
  `
})
class SwapSubsetHost {
  protected readonly rows: Row[] = [
    { id: 'r1', name: 'Alpha', status: 'ok' },
    { id: 'r2', name: 'Beta', status: 'bad' }
  ];

  protected readonly tableColumns = columns;
  protected readonly listColumns = columns.slice(1);
  public readonly isTable = signal(true);
  public readonly state = signal<Partial<NatTableUserState>>({});
}

describe('FEATURE: table surface renderer swap state retention', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  describe('GIVEN: a surface swapping nat-table for nat-list with two-way state', () => {
    describe('WHEN: the renderer swaps to list and back to table', () => {
      it('THEN: it keeps every populated state slice intact', async () => {
        const fixture = TestBed.createComponent(SwapHost);

        await fixture.whenStable();

        const seeded: Partial<NatTableUserState> = {
          sorting: [{ id: 'name', desc: false }],
          columnOrder: ['status', 'id', 'name'],
          columnPinning: { left: ['id'], right: [] },
          columnSizing: { name: 240 },
          columnVisibility: { status: true },
          columnFilters: [{ id: 'status', value: 'ok' }],
          globalFilter: '',
          rowSelection: { r1: true },
          pagination: { pageIndex: 0, pageSize: 10 }
        };

        fixture.componentInstance.state.set(seeded);
        await fixture.whenStable();

        fixture.componentInstance.isTable.set(false);
        await fixture.whenStable();

        const afterListSwap = fixture.componentInstance.state();

        fixture.componentInstance.isTable.set(true);
        await fixture.whenStable();

        const afterReturn = fixture.componentInstance.state();

        expect(afterListSwap.columnPinning).toStrictEqual({ left: ['id'], right: [] });
        expect(afterReturn.columnPinning).toStrictEqual({ left: ['id'], right: [] });
        expect(afterReturn.sorting).toStrictEqual([{ id: 'name', desc: false }]);
        expect(afterReturn.columnOrder).toStrictEqual(['status', 'id', 'name']);
        expect(afterReturn.columnSizing).toStrictEqual({ name: 240 });
        expect(afterReturn.columnFilters).toStrictEqual([{ id: 'status', value: 'ok' }]);
        expect(afterReturn.rowSelection).toStrictEqual({ r1: true });
      });
    });
  });

  describe('GIVEN: a surface whose list renderer omits the pinned column', () => {
    describe('WHEN: the renderer swaps to list and back to table', () => {
      it('THEN: it keeps state slices referencing columns absent from the list renderer', async () => {
        const fixture = TestBed.createComponent(SwapSubsetHost);

        await fixture.whenStable();

        fixture.componentInstance.state.set({
          columnPinning: { left: ['id'], right: [] },
          sorting: [{ id: 'id', desc: true }],
          columnSizing: { id: 180 }
        });
        await fixture.whenStable();

        fixture.componentInstance.isTable.set(false);
        await fixture.whenStable();

        fixture.componentInstance.isTable.set(true);
        await fixture.whenStable();

        const afterReturn = fixture.componentInstance.state();

        expect(afterReturn.columnPinning).toStrictEqual({ left: ['id'], right: [] });
        expect(afterReturn.sorting).toStrictEqual([{ id: 'id', desc: true }]);
        expect(afterReturn.columnSizing).toStrictEqual({ id: 180 });
      });
    });
  });
});
