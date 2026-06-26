import { TitleCasePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

import type { CellContext, ColumnDef, ColumnOrderState } from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
import type { NatTableState } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table/ui';

type DemoItem = {
  id: string;
  name: string;
  category: string;
  status: string;
  value: number;
};

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
  selector: 'app-reordering-showcase',
  imports: [NatTable, NatTableSurface, TitleCasePipe],
  template: `
    <div class="grid-layout grid-layout-with-panel">
      <div class="card">
        <h2 class="card-title">Drag & Reorder Grid</h2>
        <nat-table-surface [(state)]="tableState" data-testid="reordering-demo-table">
          <nat-table [columns]="columns" [data]="data" accessibleName="Reordering demo table" />
        </nat-table-surface>
      </div>

      <div class="card">
        <h2 class="card-title">Rendered Column Order</h2>
        <div class="order-list" data-testid="reordering-order-list">
          @for (colId of currentOrder(); track colId) {
            <div [attr.data-column-id]="colId" class="order-item" data-testid="reordering-order-item">
              <span class="order-badge">{{ $index + 1 }}</span>
              <span>{{ colId | titlecase }}</span>
            </div>
          }
        </div>
        <div class="instructions">
          <strong>Keyboard usage:</strong> Focus a header cell, then press <code>Ctrl + Shift + Left Arrow</code> or
          <code>Ctrl + Shift + Right Arrow</code> to swap columns. On macOS, use <code>Command + Shift + Left Arrow</code> or
          <code>Command + Shift + Right Arrow</code>.
        </div>
        <div class="instructions">
          <strong>Pointer usage:</strong> Open a header actions menu and choose <span>Move left</span> or <span>Move right</span> to
          reorder without dragging.
        </div>
      </div>
    </div>
  `
})
export class ReorderingShowcasePage {
  protected readonly data = DEMO_DATA;

  protected readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions(
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
      enableColumnPinActions: false,
      enableColumnReorderActions: true
    }
  );

  protected readonly tableState = signal<Partial<NatTableState>>({
    columnOrder: ['name', 'category', 'status', 'value']
  });

  protected readonly currentOrder = computed(() => {
    return this.tableState().columnOrder ?? ['name', 'category', 'status', 'value'];
  });
}

export type { ColumnOrderState };
