import { Component, computed, signal } from '@angular/core';

import type { NatTableUserState } from 'ng-advanced-table';
import { NatList } from 'ng-advanced-table';
import { NatTableSurface, withNatTableSelectionColumn } from 'ng-advanced-table/components';

import { mockOrderColumns } from '../../mock-order/mock-order-columns';
import { generateMockOrderRows, getMockOrderRowId } from '../../mock-order/mock-order.util';

const mockOrderRows = generateMockOrderRows(8);

const SELECTION_COLUMN_ID = 'select';

// The row-actions column renders an `ngGridCellWidget` cell, which requires
// the table's Aria grid context and cannot render inside the list view.
const baseColumns = mockOrderColumns.filter((column) => column.id !== 'actions');

// The selection column's header is the select-all checkbox component. A list
// renders a column's header def as its field label when no static label
// exists, which would repeat that select-all checkbox in every item — so give
// the column a screen-reader-only label and keep just the row checkbox.
const selectionColumns = withNatTableSelectionColumn(baseColumns, { columnId: SELECTION_COLUMN_ID }).map((column) =>
  column.id === SELECTION_COLUMN_ID ? { ...column, meta: { ...column.meta, hiddenHeaderLabel: 'Select order' } } : column
);

const EXAMPLE_CODE = `<!-- Same selection engine as the table: enable it, add a selection column. -->
<nat-table-surface [(state)]="state">
  <nat-list
    [columns]="columns"
    [data]="rows"
    [enableRowSelection]="true"
    [selectionMode]="selectionMode()"
    accessibleName="Orders" />
</nat-table-surface>

// component.ts — withNatTableSelectionColumn renders a real checkbox per item.
// Its header is the select-all checkbox, which a list would otherwise repeat as
// the field label, so give the column a screen-reader-only label instead.
protected readonly columns = withNatTableSelectionColumn(orderColumns, { columnId: 'select' }).map((column) =>
  column.id === 'select' ? { ...column, meta: { ...column.meta, hiddenHeaderLabel: 'Select order' } } : column
);

// Selection lives in the shared surface state, so it reads back like any slice.
protected readonly selectedCount = computed(() => Object.values(this.state().rowSelection ?? {}).filter(Boolean).length);

/* Selected items expose data-selected for styling. */
nat-list { --nat-table-list-item-background-selected: color-mix(in srgb, currentcolor 8%, transparent); }`;

/**
 * SPIKE demo: row selection on the list uses the same engine slice and the
 * same `withNatTableSelectionColumn` companion as the table — the generated
 * checkbox is plain DOM, so it renders in list items unchanged.
 */
@Component({
  selector: 'app-table-to-list-row-selection',
  imports: [NatList, NatTableSurface],
  templateUrl: './table-to-list-row-selection.html',
  styleUrl: './table-to-list-row-selection.css'
})
export class TableToListRowSelection {
  protected readonly rows = mockOrderRows;
  protected readonly columns = selectionColumns;
  protected readonly getRowId = getMockOrderRowId;
  protected readonly exampleCode = EXAMPLE_CODE;

  protected readonly selectionMode = signal<'single' | 'multiple'>('multiple');
  protected readonly state = signal<Partial<NatTableUserState>>({});

  protected readonly selectedCount = computed(() => Object.values(this.state().rowSelection ?? {}).filter(Boolean).length);

  protected setSelectionMode(mode: 'single' | 'multiple'): void {
    this.selectionMode.set(mode);
    this.state.update((current) => ({ ...current, rowSelection: {} }));
  }

  protected clearSelection(): void {
    this.state.update((current) => ({ ...current, rowSelection: {} }));
  }
}
