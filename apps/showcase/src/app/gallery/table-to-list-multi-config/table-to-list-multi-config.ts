import { Component, signal } from '@angular/core';

import type { ColumnDef, NatTableUserState } from 'ng-advanced-table';
import { NatList, NatTable } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { mockOrderColumns } from '../../mock-order/mock-order-columns';
import type { MockOrderRow } from '../../mock-order/mock-order.type';
import { generateMockOrderRows, getMockOrderRowId } from '../../mock-order/mock-order.util';
import { DemoCode } from '../../ui';

const mockOrderRows = generateMockOrderRows(12);

// Same reason as the toggle demo: the row-actions column renders an
// `ngGridCellWidget` cell, which requires the table's Aria grid context and
// cannot render inside the list view.
const tableColumns = mockOrderColumns.filter((column) => column.id !== 'actions');

const getColumnConfigId = (column: ColumnDef<MockOrderRow, unknown>): string | undefined =>
  'accessorKey' in column && typeof column.accessorKey === 'string' ? column.accessorKey : column.id;

// The list view renders a condensed column config: same ids as the table
// columns (so shared sorting state keeps applying), but only the fields
// worth showing in a compact card — and without visible field labels. Moving
// the visible label into `meta.hiddenHeaderLabel` keeps it screen-reader-only
// in the list; the table keeps its headers because it uses its own config.
const LIST_COLUMN_IDS = new Set(['id', 'customer', 'status', 'total']);

const listColumns = tableColumns
  .filter((column) => {
    const columnId = getColumnConfigId(column);

    return columnId !== undefined && LIST_COLUMN_IDS.has(columnId);
  })
  .map((column) => ({
    ...column,
    meta: { ...column.meta, label: undefined, hiddenHeaderLabel: column.meta?.label }
  }));

const EXAMPLE_MARKUP = `<!-- One surface, one state — a different column config per renderer. -->
<nat-table-surface [enableSorting]="true" [(state)]="state">
  @if (view() === 'table') {
    <nat-table [columns]="tableColumns" [data]="rows" accessibleName="Orders" />
  } @else {
    <nat-list [columns]="listColumns" [data]="rows" accessibleName="Orders" />
  }
</nat-table-surface>`;

const EXAMPLE_TS = `// component.ts — the list gets a condensed config with the same column ids,
// so shared state (sorting on a shared column) keeps applying. Moving the
// visible label to meta.hiddenHeaderLabel removes the field labels from the
// list only (they stay screen-reader-only); the table keeps its headers.
protected readonly tableColumns = orderColumns;
protected readonly listColumns = orderColumns
  .filter((column) => ['id', 'customer', 'status', 'total'].includes(column.accessorKey))
  .map((column) => ({
    ...column,
    meta: { ...column.meta, label: undefined, hiddenHeaderLabel: column.meta?.label }
  }));`;

type DemoViewMode = 'table' | 'list';

/**
 * SPIKE demo: one `nat-table-surface`, one shared state, but a different
 * column config per renderer — the table shows the full column set while the
 * list renders a condensed card config. Sorting on a column both configs
 * share keeps applying across the swap.
 */
@Component({
  selector: 'app-table-to-list-multi-config',
  imports: [DemoCode, NatList, NatTable, NatTableSurface],
  templateUrl: './table-to-list-multi-config.html',
  styleUrl: './table-to-list-multi-config.css'
})
export class TableToListMultiConfig {
  protected readonly rows = mockOrderRows;
  protected readonly tableColumns = tableColumns;
  protected readonly listColumns = listColumns;
  protected readonly getRowId = getMockOrderRowId;

  protected readonly view = signal<DemoViewMode>('table');
  protected readonly state = signal<Partial<NatTableUserState>>({});
  protected readonly exampleMarkup = EXAMPLE_MARKUP;
  protected readonly exampleTs = EXAMPLE_TS;
}
