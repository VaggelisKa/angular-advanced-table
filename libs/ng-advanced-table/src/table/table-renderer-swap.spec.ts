import { Component, inject, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NatTable } from './table';
import type { ColumnDef } from '../common/table-features.type';
import { NatTableService } from '../domain-logic/table.service';
import { NatList } from '../list/list';

type Row = {
  readonly id: string;
  readonly name: string;
  readonly status: string;
};

const idColumn: ColumnDef<Row, unknown> = { accessorKey: 'id', header: 'Id', meta: { label: 'Id', rowHeader: true } };
const nameColumn: ColumnDef<Row, unknown> = { accessorKey: 'name', header: 'Name', meta: { label: 'Name' } };
const statusColumn: ColumnDef<Row, unknown> = { accessorKey: 'status', header: 'Status', meta: { label: 'Status' } };

const columns: ColumnDef<Row, unknown>[] = [idColumn, nameColumn, statusColumn];

@Component({
  selector: 'nat-service-swap-host',
  imports: [NatList, NatTable],
  providers: [NatTableService],
  template: `
    @if (isTable()) {
      <nat-table [columns]="columns()" [data]="rows" accessibleName="Swap table" />
    } @else {
      <nat-list [columns]="columns()" [data]="rows" accessibleName="Swap list" />
    }
  `
})
class ServiceSwapHost {
  protected readonly rows: Row[] = [
    { id: 'r1', name: 'Alpha', status: 'ok' },
    { id: 'r2', name: 'Beta', status: 'bad' }
  ];

  public readonly columns = signal(columns);
  public readonly service = inject(NatTableService);
  public readonly isTable = signal(true);
  public readonly grid = viewChild(NatTable);
  public readonly list = viewChild(NatList);

  public constructor() {
    this.service.configure({ initialState: { sorting: [{ id: 'name', desc: false }] } });
  }
}

describe('FEATURE: renderer swap under a host-provided NatTableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  describe('GIVEN: a host without a state binding that swaps nat-table for nat-list', () => {
    describe('WHEN: the user sorts, then the renderer swaps to list and back to table', () => {
      it('THEN: it keeps the service-owned sorting instead of re-seeding from initialState', async () => {
        const fixture = TestBed.createComponent(ServiceSwapHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        expect(host.service.state().sorting).toStrictEqual([{ id: 'name', desc: false }]);

        host.grid()?.patchState({ sorting: [{ id: 'status', desc: true }] });
        await fixture.whenStable();

        host.isTable.set(false);
        await fixture.whenStable();

        expect(host.list()?.table.atoms.sorting.get()).toStrictEqual([{ id: 'status', desc: true }]);

        host.isTable.set(true);
        await fixture.whenStable();

        expect(host.grid()?.table.atoms.sorting.get()).toStrictEqual([{ id: 'status', desc: true }]);
        expect(host.service.state().sorting).toStrictEqual([{ id: 'status', desc: true }]);
      });
    });
  });

  describe('GIVEN: a host that changes its column definitions before any user action', () => {
    describe('WHEN: the columns are reordered after mount', () => {
      it('THEN: it renders the new definition order instead of the order seen at mount', async () => {
        const fixture = TestBed.createComponent(ServiceSwapHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        host.columns.set([statusColumn, idColumn, nameColumn]);
        await fixture.whenStable();

        expect(host.service.state().columnOrder).toStrictEqual([]);
        expect(
          host
            .grid()
            ?.table.getVisibleLeafColumns()
            .map((column) => column.id)
        ).toStrictEqual(['status', 'id', 'name']);
      });
    });
  });
});
