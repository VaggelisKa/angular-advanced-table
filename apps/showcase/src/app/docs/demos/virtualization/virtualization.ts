import { Component, signal } from '@angular/core';

import { NatTable, NatTableVirtualize } from 'ng-advanced-table';
import type { CellContext, ColumnDef, NatTableUserState } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table/components';

import type { MockOrderRow } from '../../../mock-order/mock-order.type';
import { currencyFormatter, dateFormatter, generateMockOrderRows, integerFormatter } from '../../../mock-order/mock-order.util';

const VIRTUAL_ROWS = generateMockOrderRows(10_000);

@Component({
  selector: 'app-virtualization',
  imports: [NatTable, NatTableSurface, NatTableVirtualize],
  styles: `
    nat-table-surface {
      --nat-table-height: 28rem;
    }

    .virtualization-summary {
      margin: 0 0 0.75rem;
    }
  `,
  template: `
    <div class="card" data-testid="virtualization-demo">
      <h2 class="card-title">10,000 composable rows</h2>
      <p class="description virtualization-summary">
        Only the visible row window is mounted. Sorting, pinning, resizing, reordering, sticky headers, and grid keyboard navigation
        still use the same table controller.
      </p>

      <nat-table-surface
        [enableColumnResizing]="true"
        [enablePinning]="true"
        [enableReordering]="true"
        [enableSorting]="true"
        [stickyHeader]="true"
        [(state)]="tableState"
        columnSizingMode="fixed">
        <nat-table
          [columns]="columns"
          [data]="rows"
          [natTableVirtualize]="{ rowHeight: 44, overscan: 6 }"
          accessibleName="Ten thousand virtualized orders"
          data-testid="virtualization-table" />
      </nat-table-surface>
    </div>
  `
})
export class Virtualization {
  protected readonly rows = VIRTUAL_ROWS;
  protected readonly tableState = signal<Partial<NatTableUserState>>({
    columnPinning: { left: ['customer'], right: ['total'] }
  });

  protected readonly columns: ColumnDef<MockOrderRow, unknown>[] = withNatTableHeaderActions(
    [
      {
        accessorKey: 'customer',
        header: 'Customer',
        size: 190,
        meta: { label: 'Customer', rowHeader: true, cellMaxLines: 1 }
      },
      {
        accessorKey: 'owner',
        header: 'Owner',
        size: 230,
        meta: { label: 'Owner', cellMaxLines: 1 }
      },
      {
        accessorKey: 'channel',
        header: 'Channel',
        size: 130,
        meta: { label: 'Channel', cellMaxLines: 1 }
      },
      {
        accessorKey: 'region',
        header: 'Region',
        size: 130,
        meta: { label: 'Region', cellMaxLines: 1 }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        meta: { label: 'Status', cellMaxLines: 1 }
      },
      {
        accessorKey: 'items',
        header: 'Items',
        size: 110,
        meta: { label: 'Items', align: 'end', cellMaxLines: 1 },
        cell: (context: CellContext<MockOrderRow, number>) => integerFormatter.format(context.getValue())
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        size: 140,
        meta: { label: 'Updated', cellMaxLines: 1 },
        cell: (context: CellContext<MockOrderRow, number>) => dateFormatter.format(context.getValue())
      },
      {
        accessorKey: 'total',
        header: 'Total',
        size: 150,
        meta: { label: 'Total', align: 'end', cellMaxLines: 1 },
        cell: (context: CellContext<MockOrderRow, number>) => currencyFormatter.format(context.getValue())
      }
    ],
    { enableColumnReorderActions: true }
  );
}
