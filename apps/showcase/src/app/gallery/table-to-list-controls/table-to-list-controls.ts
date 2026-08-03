import { Component, signal } from '@angular/core';

import type { NatTableUserState, SortingState } from 'ng-advanced-table';
import { NatList } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { mockOrderColumns } from '../../mock-order/mock-order-columns';
import { generateMockOrderRows, getMockOrderRowId } from '../../mock-order/mock-order.util';
import { TableSearch } from '../../ui/table-search/table-search';

const mockOrderRows = generateMockOrderRows(12);

// The row-actions column renders an `ngGridCellWidget` cell, which requires
// the table's Aria grid context and cannot render inside the list view.
const demoColumns = mockOrderColumns.filter((column) => column.id !== 'actions');

// Toggleable fields for the consumer-owned visibility chips.
const DEMO_FIELDS = [
  { id: 'id', label: 'Order' },
  { id: 'customer', label: 'Customer' },
  { id: 'owner', label: 'Company' },
  { id: 'channel', label: 'Channel' },
  { id: 'region', label: 'Region' },
  { id: 'status', label: 'Status' },
  { id: 'items', label: 'Items' },
  { id: 'updatedAt', label: 'Updated' },
  { id: 'total', label: 'Total' }
] as const;

const EXAMPLE_CODE = `<!-- The list has no header UI — sort, search, and visibility are consumer-owned. -->
<nat-table-surface [(state)]="state">
  <app-table-search placeholder="Search orders" />

  <nat-list [columns]="columns" [data]="rows" accessibleName="Orders" />
</nat-table-surface>

// component.ts — sorting and visibility write the surface state signal.
protected sortBy(columnId: string, desc: boolean): void {
  this.state.update((current) => ({ ...current, sorting: [{ id: columnId, desc }] }));
}

protected toggleField(columnId: string, visible: boolean): void {
  this.state.update((current) => ({
    ...current,
    columnVisibility: { ...current.columnVisibility, [columnId]: visible }
  }));
}

// The search component is consumer code too: it injects NatTableService,
// calls registerSearch() (which enables global filtering), and pushes the
// query via controller.patchState({ globalFilter }).`;

/**
 * SPIKE demo: a standalone `nat-list` driven entirely by consumer-owned
 * controls — sort buttons and visibility chips writing the surface state
 * signal, plus the showcase's own `app-table-search`, which registers itself
 * on `NatTableService` and filters whichever renderer is active.
 */
@Component({
  selector: 'app-table-to-list-controls',
  imports: [NatList, NatTableSurface, TableSearch],
  templateUrl: './table-to-list-controls.html',
  styleUrl: './table-to-list-controls.css'
})
export class TableToListControls {
  protected readonly rows = mockOrderRows;
  protected readonly columns = demoColumns;
  protected readonly getRowId = getMockOrderRowId;
  protected readonly fields = DEMO_FIELDS;

  protected readonly state = signal<Partial<NatTableUserState>>({});
  protected readonly exampleCode = EXAMPLE_CODE;

  protected isSorted(columnId: string, desc: boolean): boolean {
    const sorting = this.state().sorting ?? [];

    return sorting.some((sort) => sort.id === columnId && sort.desc === desc);
  }

  protected sortBy(columnId: string, desc: boolean): void {
    const sorting: SortingState = this.isSorted(columnId, desc) ? [] : [{ id: columnId, desc }];

    this.state.update((current) => ({ ...current, sorting }));
  }

  protected isFieldVisible(columnId: string): boolean {
    return this.state().columnVisibility?.[columnId] !== false;
  }

  protected toggleField(columnId: string): void {
    const nextVisible = !this.isFieldVisible(columnId);

    this.state.update((current) => ({
      ...current,
      columnVisibility: { ...current.columnVisibility, [columnId]: nextVisible }
    }));
  }
}
