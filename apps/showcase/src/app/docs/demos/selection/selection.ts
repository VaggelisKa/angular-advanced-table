import { Component, computed, linkedSignal, signal } from '@angular/core';

import type { CellContext, ColumnDef, RowSelectionState } from '@tanstack/angular-table';
import type { NatTableRowActivateEvent, NatTableUserState } from 'ng-advanced-table';
import { NatTable } from 'ng-advanced-table';
import { NatTableSurface, NatTableToolbar, NatToolbarItem, withNatTableSelectionColumn } from 'ng-advanced-table/components';

import type { DemoItem, RowSelectionSource } from './selection.type';
import { computeRowSelection } from './selection.util';

const DEMO_DATA: DemoItem[] = [
  { id: 'item-1', name: 'Alpha Searcher', category: 'Analytics', status: 'Active', value: 4500 },
  { id: 'item-2', name: 'Beta Runner', category: 'Infrastructure', status: 'Active', value: 1200 },
  {
    id: 'item-3',
    name: 'Gamma Processor',
    category: 'Data Science',
    status: 'Paused',
    value: 7800
  },
  { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Alert', value: 3100 },
  { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Data Science', status: 'Halted', value: 500 }
];

@Component({
  selector: 'app-selection',
  imports: [NatTable, NatTableSurface, NatTableToolbar, NatToolbarItem],
  templateUrl: './selection.html'
})
export class Selection {
  protected readonly data = signal<DemoItem[]>(DEMO_DATA);
  protected readonly selectionMode = signal<'single' | 'multiple'>('multiple');

  /**
   * Row selection derived from the current data and cardinality. Using a
   * `linkedSignal` keeps the selection self-healing: rows removed from `data`
   * are pruned, switching selection mode clears the selection, and the user's
   * other still-valid choices survive data changes. User toggles flow back in
   * through `set()` (see `onRowSelectionChange`).
   */
  protected readonly rowSelection = linkedSignal<RowSelectionSource, RowSelectionState>({
    source: () => ({
      rowIds: new Set(this.data().map((item) => item.id)),
      multiple: this.selectionMode() === 'multiple'
    }),
    computation: (source, previous) => computeRowSelection(source, previous)
  });

  protected readonly tableState = computed<Partial<NatTableUserState>>(() => ({
    rowSelection: this.rowSelection()
  }));

  protected readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableSelectionColumn(
    [
      {
        accessorKey: 'name',
        header: 'Name',
        meta: { label: 'Name', rowHeader: true }
      },
      {
        accessorKey: 'category',
        header: 'Category',
        meta: { label: 'Category' }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: { label: 'Status' }
      },
      {
        accessorKey: 'value',
        header: 'Value',
        meta: { label: 'Value', align: 'end' },
        cell: (context: CellContext<DemoItem, number>) => `$${context.getValue().toLocaleString()}`
      }
    ],
    {
      label: 'Selection',
      selectAllAriaLabel: 'Select all services',
      selectRowAriaLabel: (row) => `Select ${row.original.name}`
    }
  );

  protected readonly selectedNames = computed(() => {
    const selection = this.rowSelection();

    return this.data()
      .filter((item) => selection[item.id])
      .map((item) => item.name);
  });

  protected readonly selectedSummary = computed(() => {
    const names = this.selectedNames();

    return names.length ? names.join(', ') : 'None';
  });

  /**
   * Name of the row most recently activated by `(rowActivate)` — a primary
   * click or Enter/Space on a non-interactive cell. Demonstrates that the
   * selection checkbox is an interactive descendant, so toggling it does not
   * also activate the row.
   */
  protected readonly lastActivatedName = signal<string | null>(null);

  protected onRowActivate(event: NatTableRowActivateEvent<DemoItem>): void {
    this.lastActivatedName.set(event.rowData.name);
  }

  protected onRowSelectionChange(rowSelection: RowSelectionState): void {
    this.rowSelection.set(rowSelection);
  }

  protected setMode(mode: 'single' | 'multiple'): void {
    // The linkedSignal collapses any multi-selection to the new cardinality.
    this.selectionMode.set(mode);
  }

  protected clearSelection(): void {
    this.rowSelection.set({});
  }

  protected deleteSelected(): void {
    const selection = this.rowSelection();
    const selectedIds = new Set(Object.keys(selection).filter((id) => selection[id]));

    if (selectedIds.size === 0) {
      return;
    }

    // Removing the rows from the data prunes their selection through the linkedSignal.
    this.data.update((items) => items.filter((item) => !selectedIds.has(item.id)));
  }

  protected restoreData(): void {
    this.data.set(DEMO_DATA);
    this.rowSelection.set({});
  }
}
