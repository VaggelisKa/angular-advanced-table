import { Component } from '@angular/core';

import { NatList } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { mockOrderColumns } from '../../mock-order/mock-order-columns';
import { generateMockOrderRows, getMockOrderRowId } from '../../mock-order/mock-order.util';

const mockOrderRows = generateMockOrderRows(8);

// The row-actions column renders an `ngGridCellWidget` cell, which requires
// the table's Aria grid context and cannot render inside the list view.
const demoColumns = mockOrderColumns.filter((column) => column.id !== 'actions');

const EXAMPLE_CODE = `<!-- Minimal composition: the surface provides the state scope, the list renders. -->
<nat-table-surface>
  <nat-list [columns]="columns" [data]="rows" accessibleName="Orders" />
</nat-table-surface>

// component.ts — columns are the same TanStack ColumnDefs the table uses;
// field labels come from meta.label (falling back to a string header).
protected readonly rows = orderRows;
protected readonly columns: ColumnDef<Order, unknown>[] = [
  { accessorKey: 'id', header: 'Order', meta: { label: 'Order' } },
  { accessorKey: 'customer', header: 'Customer', meta: { label: 'Customer' } }
  // ...
];`;

/**
 * SPIKE demo: the smallest `nat-list` composition — a surface and the list,
 * no table anywhere. Fields render stacked in column order with labels
 * resolved from the column defs.
 */
@Component({
  selector: 'app-table-to-list-basic',
  imports: [NatList, NatTableSurface],
  templateUrl: './table-to-list-basic.html',
  styleUrl: './table-to-list-basic.css'
})
export class TableToListBasic {
  protected readonly rows = mockOrderRows;
  protected readonly columns = demoColumns;
  protected readonly getRowId = getMockOrderRowId;
  protected readonly exampleCode = EXAMPLE_CODE;
}
