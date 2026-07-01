import { Component } from '@angular/core';

import type { CellContext, ColumnDef } from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
import type { NatTableUserState } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table/components';
import type { NatTableSortIndicatorContext } from 'ng-advanced-table/components';

import { generateMockOrderRows } from '../mock-order-data';
import type { MockOrderRow } from '../mock-order-data';

const orderStatusTone = (status: MockOrderRow['status']): 'positive' | 'warning' | 'neutral' => {
  switch (status) {
    case 'Ready':
      return 'positive';
    case 'Review':
      return 'warning';
    case 'Queued':
      return 'neutral';
  }
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency'
});

const ledgerSortIndicator = ({ sortState }: NatTableSortIndicatorContext): string => {
  switch (sortState) {
    case 'asc':
      return '↑';
    case 'desc':
      return '↓';
    case false:
      return '↕';
  }
};

@Component({
  selector: 'app-theming-showcase',
  imports: [NatTable, NatTableSurface],
  templateUrl: './theming-showcase.html',
  styleUrl: './theming-showcase.css'
})
export class ThemingShowcase {
  protected readonly rows = generateMockOrderRows(5);

  protected readonly initialState = {
    sorting: [{ id: 'total', desc: true }]
  } satisfies Partial<NatTableUserState>;

  protected readonly columns: ColumnDef<MockOrderRow, unknown>[] = withNatTableHeaderActions(
    [
      {
        accessorKey: 'id',
        header: 'Order',
        meta: { label: 'Order', rowHeader: true },
        cell: (context: CellContext<MockOrderRow, string>) => context.getValue().toUpperCase()
      },
      {
        accessorKey: 'customer',
        header: 'Customer',
        meta: { label: 'Customer' }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: {
          label: 'Status',
          cellTone: (context) => orderStatusTone(context.getValue<MockOrderRow['status']>())
        }
      },
      {
        accessorKey: 'total',
        header: 'Total',
        meta: { label: 'Total', align: 'end' },
        cell: (context: CellContext<MockOrderRow, number>) => currencyFormatter.format(context.getValue())
      }
    ],
    {
      enableColumnPinActions: false,
      sortIndicator: ledgerSortIndicator
    }
  );
}
