/* eslint-disable import-x/order */

import { Component, signal } from '@angular/core';

import type { ColumnDef } from '@tanstack/angular-table';
import { flexRenderComponent } from '@tanstack/angular-table';
import type { NatTableState } from 'ng-advanced-table';
import { NatTable } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table/components';

import { NatRowActionsMenu } from '../table-showcase-page/nat-row-actions-menu';
import type { MockOrderRow } from '../mock-order-data';
import { OrderCode, generateMockOrderRows, getMockOrderRowId } from '../mock-order-data';

const mockOrderColumns: ColumnDef<MockOrderRow, unknown>[] = withNatTableHeaderActions([
  {
    accessorKey: 'id',
    header: 'Order',
    enablePinning: false,
    size: 132,
    minSize: 112,
    meta: {
      label: 'Order',
      rowHeader: true,
      cellMaxLines: Infinity
    },
    cell: (info) =>
      flexRenderComponent(OrderCode, {
        inputs: {
          code: info.getValue<string>()
        }
      })
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    enablePinning: false,
    size: 220,
    minSize: 160,
    meta: {
      label: 'Customer'
    },
    cell: (info) => info.getValue<string>()
  },
  {
    id: 'actions',
    header: 'Actions',
    enablePinning: false,
    size: 50,
    minSize: 50,
    maxSize: 50,
    meta: {
      hiddenHeaderLabel: 'Row actions',
      align: 'end',
      headerSize: 50
    },
    cell: (info) =>
      flexRenderComponent(NatRowActionsMenu, {
        inputs: {
          symbol: info.row.original.id
        }
      })
  }
]);

const mockOrderRows = generateMockOrderRows(50);

@Component({
  selector: 'app-sticky-no-overflow-x',
  imports: [NatTable, NatTableSurface],
  templateUrl: './sticky-no-overflow-x.html',
  styleUrl: './sticky-no-overflow-x.css'
})
export class StickyNoOverflowX {
  protected readonly rows = mockOrderRows;
  protected readonly columns = mockOrderColumns;
  protected readonly getRowId = getMockOrderRowId;

  public readonly tableState = signal<Partial<NatTableState>>({});
}
