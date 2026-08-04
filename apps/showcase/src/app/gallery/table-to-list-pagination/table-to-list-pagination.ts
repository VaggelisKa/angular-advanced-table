import { Component, signal } from '@angular/core';

import type { NatTableUserState } from 'ng-advanced-table';
import { NatList } from 'ng-advanced-table';
import { NatTablePagination, NatTableSurface } from 'ng-advanced-table/components';

import { mockOrderColumns } from '../../mock-order/mock-order-columns';
import { generateMockOrderRows, getMockOrderRowId } from '../../mock-order/mock-order.util';
import { DemoCode } from '../../ui';

const mockOrderRows = generateMockOrderRows(42);

// The row-actions column renders an `ngGridCellWidget` cell, which requires
// the table's Aria grid context and cannot render inside the list view.
const demoColumns = mockOrderColumns.filter((column) => column.id !== 'actions');

const EXAMPLE_MARKUP = `<!-- The pagination companion resolves the list as its controller and pages it. -->
<nat-table-surface [(state)]="state">
  <nat-list [columns]="columns" [data]="rows" accessibleName="Orders" />

  <nat-table-pagination [pageSizeOptions]="[5, 10, 20]" />
</nat-table-surface>`;

const EXAMPLE_TS = `// component.ts — nothing list-specific: mounting the pagination control
// registers pagination on the surface, and the engine pages the rows.
protected readonly state = signal<Partial<NatTableUserState>>({});`;

/**
 * SPIKE demo: a paginated list. The `nat-table-pagination` companion resolves
 * whichever renderer the surface hosts — mounting it registers pagination on
 * the shared engine, which then pages the list rows exactly as it pages
 * table rows.
 */
@Component({
  selector: 'app-table-to-list-pagination',
  imports: [DemoCode, NatList, NatTablePagination, NatTableSurface],
  templateUrl: './table-to-list-pagination.html',
  styleUrl: './table-to-list-pagination.css'
})
export class TableToListPagination {
  protected readonly rows = mockOrderRows;
  protected readonly columns = demoColumns;
  protected readonly getRowId = getMockOrderRowId;
  protected readonly state = signal<Partial<NatTableUserState>>({});
  protected readonly exampleMarkup = EXAMPLE_MARKUP;
  protected readonly exampleTs = EXAMPLE_TS;
}
