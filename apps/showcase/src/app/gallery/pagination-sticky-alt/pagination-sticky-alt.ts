import { Component, signal } from '@angular/core';

import type { NatTableUserState } from 'ng-advanced-table';
import { NatTable } from 'ng-advanced-table';
import { NatTablePagination, NatTableSurface } from 'ng-advanced-table/components';

import { mockOrderColumns } from '../../mock-order/mock-order-columns';
import { generateMockOrderRows, getMockOrderRowId } from '../../mock-order/mock-order.util';

const mockOrderRows = generateMockOrderRows(50);

@Component({
  selector: 'app-pagination-sticky-alt',
  imports: [NatTable, NatTableSurface, NatTablePagination],
  templateUrl: './pagination-sticky-alt.html',
  styleUrl: './pagination-sticky-alt.css'
})
export class PaginationStickyAlt {
  protected readonly rows = mockOrderRows;
  protected readonly columns = mockOrderColumns;
  protected readonly getRowId = getMockOrderRowId;

  public readonly tableState = signal<Partial<NatTableUserState>>({
    pagination: {
      pageIndex: 0,
      pageSize: 5
    },
    columnPinning: {
      left: ['id'],
      right: ['actions']
    }
  });
}
