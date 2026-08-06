import { Component, computed, signal } from '@angular/core';

import type { NatTableUserState } from 'ng-advanced-table';
import { NatList } from 'ng-advanced-table';
import { NatTableSurface, withNatTableSelectionColumn } from 'ng-advanced-table/components';

import { LIST_DEMO_COLUMNS, LIST_DEMO_ROWS } from './list-demo-data';

const SELECTION_COLUMN_ID = 'select';

// The selection column's header is the select-all checkbox component. A list
// renders a column's header def as its field label when no static label
// exists, which would repeat that select-all checkbox in every item — so give
// the column a screen-reader-only label and keep just the row checkbox.
const selectionColumns = withNatTableSelectionColumn(LIST_DEMO_COLUMNS, { columnId: SELECTION_COLUMN_ID }).map((column) =>
  column.id === SELECTION_COLUMN_ID ? { ...column, meta: { ...column.meta, hiddenHeaderLabel: 'Select order' } } : column
);

/**
 * Docs demo: row selection on the list uses the same engine slice and the
 * same `withNatTableSelectionColumn` companion as the table — the generated
 * checkbox is plain DOM, so it renders in list items unchanged.
 */
@Component({
  selector: 'app-list-selection',
  imports: [NatList, NatTableSurface],
  templateUrl: './list-selection.html',
  styleUrl: './list-selection.css'
})
export class ListSelection {
  protected readonly rows = LIST_DEMO_ROWS;
  protected readonly columns = selectionColumns;

  protected readonly state = signal<Partial<NatTableUserState>>({});

  protected readonly selectedCount = computed(() => Object.values(this.state().rowSelection ?? {}).filter(Boolean).length);

  protected clearSelection(): void {
    this.state.update((current) => ({ ...current, rowSelection: {} }));
  }
}
