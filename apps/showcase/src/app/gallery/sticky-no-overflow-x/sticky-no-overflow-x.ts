import { Component, signal } from '@angular/core';

import { NatTable, flexRenderComponent } from 'ng-advanced-table';
import type { ColumnDef, NatTableUserState } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table/components';

import type { MockOrderRow } from '../../mock-order/mock-order.type';
import { generateMockOrderRows, getMockOrderRowId } from '../../mock-order/mock-order.util';
import { NatRowActionsMenu } from '../../ui/nat-row-actions-menu/nat-row-actions-menu';
import { OrderCode } from '../../ui/order-code/order-code';

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

  public readonly tableState = signal<Partial<NatTableUserState>>({});
}
