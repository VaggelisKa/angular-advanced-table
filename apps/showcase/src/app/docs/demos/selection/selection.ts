import { Component, computed, linkedSignal, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { ColumnDef, NatTableRowActivateEvent, NatTableUserState, RowSelectionState } from 'ng-advanced-table';
import { NatTableSurface, NatTableToolbar, NatToolbarItem, withNatTableSelectionColumn } from 'ng-advanced-table/components';

import type { RowSelectionSource, SelectionMode } from './selection.type';
import { computeRowSelection } from './selection.util';
import { DemoAside, DemoFacts, DemoLayout, DemoSection, DemoToggleGroup } from '../../../ui';
import type { DemoFact, DemoToggleOption } from '../../../ui';
import { DEMO_ITEMS, demoItemBaseColumns } from '../demo-data';
import type { DemoItem } from '../demo-data';

const MODE_OPTIONS: readonly DemoToggleOption<SelectionMode>[] = [
  { value: 'multiple', label: 'Multiple' },
  { value: 'single', label: 'Single' }
];

@Component({
  selector: 'app-selection',
  imports: [
    NatTable,
    NatTableSurface,
    NatTableToolbar,
    NatToolbarItem,
    DemoAside,
    DemoFacts,
    DemoLayout,
    DemoSection,
    DemoToggleGroup
  ],
  templateUrl: './selection.html',
  styles: `
    :host {
      display: block;
    }
  `
})
export class Selection {
  protected readonly data = signal<DemoItem[]>([...DEMO_ITEMS]);
  protected readonly selectionMode = signal<SelectionMode>('multiple');
  protected readonly modeOptions = MODE_OPTIONS;

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

  protected readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableSelectionColumn(demoItemBaseColumns, {
    label: 'Selection',
    selectAllAriaLabel: 'Select all services',
    selectRowAriaLabel: (row) => `Select ${row.original.name}`
  });

  protected readonly selectedNames = computed(() => {
    const selection = this.rowSelection();

    return this.data()
      .filter((item) => selection[item.id])
      .map((item) => item.name);
  });

  /**
   * Name of the row most recently activated by `(rowActivate)` — a primary
   * click or Enter/Space on a non-interactive cell. Demonstrates that the
   * selection checkbox is an interactive descendant, so toggling it does not
   * also activate the row.
   */
  protected readonly lastActivatedName = signal<string | null>(null);

  protected readonly facts = computed<DemoFact[]>(() => {
    const names = this.selectedNames();

    return [
      { label: 'Mode', value: this.selectionMode(), testId: 'selection-mode' },
      {
        label: `Selected (${names.length})`,
        value: names.length ? names.join(', ') : 'None',
        testId: 'selected-summary'
      },
      { label: 'Last activated', value: this.lastActivatedName() ?? 'None', testId: 'last-activated' }
    ];
  });

  protected onRowActivate(event: NatTableRowActivateEvent<DemoItem>): void {
    this.lastActivatedName.set(event.rowData.name);
  }

  protected onRowSelectionChange(rowSelection: RowSelectionState): void {
    this.rowSelection.set(rowSelection);
  }

  protected setMode(mode: SelectionMode): void {
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
    this.data.set([...DEMO_ITEMS]);
    this.rowSelection.set({});
  }
}
