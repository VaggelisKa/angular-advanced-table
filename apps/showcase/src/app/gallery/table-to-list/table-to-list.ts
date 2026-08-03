import { Component, computed, signal } from '@angular/core';

import type { NatTableUserState, SortingState } from 'ng-advanced-table';
import { NatList, NatTable } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { mockOrderColumns } from '../../mock-order/mock-order-columns';
import { generateMockOrderRows, getMockOrderRowId } from '../../mock-order/mock-order.util';

const mockOrderRows = generateMockOrderRows(12);

// The row-actions column renders an `ngGridCellWidget` cell component, which
// requires the table's Aria grid-cell context and cannot render inside the
// list view — this demo shares one column set, so it drops that column.
const demoColumns = mockOrderColumns.filter((column) => column.id !== 'actions');

// Field ids/labels for the consumer-owned reorder chips, in definition order.
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

const DEMO_FIELD_LABELS = new Map<string, string>(DEMO_FIELDS.map((field) => [field.id, field.label]));

const getFieldLabel = (columnId: string): string => DEMO_FIELD_LABELS.get(columnId) ?? columnId;

const EXAMPLE_CODE = `<!-- Same surface, same state — swap the renderer. -->
<nat-table-surface [enableSorting]="true" [enableReordering]="true" [(state)]="state">
  @if (view() === 'table') {
    <nat-table [columns]="columns" [data]="rows" accessibleName="Orders" />
  } @else {
    <nat-list [columns]="columns" [data]="rows" accessibleName="Orders" />
  }
</nat-table-surface>

// component.ts — the list has no header UI; sort and reorder it by writing the state.
protected readonly view = signal<'table' | 'list'>('table');
protected readonly state = signal<Partial<NatTableUserState>>({});

protected sortByTotal(): void {
  this.state.update((current) => ({ ...current, sorting: [{ id: 'total', desc: true }] }));
}

protected moveField(columnOrder: string[]): void {
  this.state.update((current) => ({ ...current, columnOrder }));
}`;

type DemoViewMode = 'table' | 'list';

/**
 * SPIKE demo: one `nat-table-surface` driving either the table or the list
 * renderer. Both consume the same engine state, so sorting, column order, and
 * column visibility survive toggling between the two views. The list has no
 * header UI — the demo sorts and reorders it through the surface state signal
 * (consumer-owned controls), while column visibility reuses the library's
 * `nat-table-column-visibility` companion, which resolves either renderer as
 * its controller.
 */
@Component({
  selector: 'app-table-to-list',
  imports: [NatList, NatTable, NatTableSurface],
  templateUrl: './table-to-list.html',
  styleUrl: './table-to-list.css'
})
export class TableToList {
  protected readonly rows = mockOrderRows;
  protected readonly columns = demoColumns;
  protected readonly getRowId = getMockOrderRowId;

  protected readonly view = signal<DemoViewMode>('table');
  protected readonly state = signal<Partial<NatTableUserState>>({});
  protected readonly exampleCode = EXAMPLE_CODE;

  /** Current field order: the state's columnOrder first, then any unlisted fields in definition order. */
  protected readonly fieldOrder = computed<string[]>(() => {
    const knownIds = DEMO_FIELDS.map((field) => field.id);
    const ordered = (this.state().columnOrder ?? []).filter((columnId): columnId is (typeof knownIds)[number] =>
      (knownIds as readonly string[]).includes(columnId)
    );

    for (const columnId of knownIds) {
      if (!ordered.includes(columnId)) {
        ordered.push(columnId);
      }
    }

    return ordered;
  });

  protected readonly fieldLabel = getFieldLabel;

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

  protected moveField(columnId: string, delta: -1 | 1): void {
    const order = [...this.fieldOrder()];
    const fromIndex = order.indexOf(columnId);
    const toIndex = fromIndex + delta;

    if (fromIndex === -1 || toIndex < 0 || toIndex >= order.length) {
      return;
    }

    order.splice(fromIndex, 1);
    order.splice(toIndex, 0, columnId);
    this.state.update((current) => ({ ...current, columnOrder: order }));
  }

  protected isSorted(columnId: string, desc: boolean): boolean {
    const sorting = this.state().sorting ?? [];

    return sorting.some((sort) => sort.id === columnId && sort.desc === desc);
  }

  protected sortBy(columnId: string, desc: boolean): void {
    const sorting: SortingState = this.isSorted(columnId, desc) ? [] : [{ id: columnId, desc }];

    this.state.update((current) => ({ ...current, sorting }));
  }
}
