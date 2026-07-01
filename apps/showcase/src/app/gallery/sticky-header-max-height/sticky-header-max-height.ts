import { Component } from '@angular/core';

import type { NatTableUserState } from 'ng-advanced-table';
import { NatTable } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { mockOrderColumns } from '../../mock-order/mock-order-columns';
import { generateMockOrderRows, getMockOrderRowId } from '../../mock-order/mock-order.util';

const mockOrderRows = generateMockOrderRows(50);

const preconfiguredTableState: Partial<NatTableUserState> = {
  columnPinning: {
    left: ['id'],
    right: []
  }
};

@Component({
  selector: 'app-sticky-header-max-height',
  imports: [NatTable, NatTableSurface],
  templateUrl: './sticky-header-max-height.html',
  styleUrl: './sticky-header-max-height.css'
})
export class StickyHeaderMaxHeight {
  protected readonly rows = mockOrderRows;
  protected readonly columns = mockOrderColumns;
  protected readonly tableState = preconfiguredTableState;
  protected readonly getRowId = getMockOrderRowId;
}
