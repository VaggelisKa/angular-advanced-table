import { Component, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { CellContext, ColumnDef, NatTableUserState } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table/components';

type DemoItem = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly status: string;
  readonly value: number;
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
  selector: 'app-pinning',
  imports: [NatTable, NatTableSurface],
  styles: `
    .pinning-shadow-example {
      --nat-table-pinned-divider-shadow-color: light-dark(rgb(232 235 238 / 35%), rgb(17 20 24 / 50%));
    }
  `,
  template: `
    <div class="grid-layout grid-layout-with-panel">
      <div class="card">
        <h2 class="card-title">Scrollable Grid with Pinning</h2>
        <nat-table-surface [enablePinning]="true" [enableSorting]="true" [(state)]="tableState" class="pinning-shadow-example">
          <nat-table [columns]="columns" [data]="data" accessibleName="Pinning demo table" />
        </nat-table-surface>
      </div>

      <div class="card">
        <h2 class="card-title">Configure Pinning State</h2>
        <div class="pinning-controls">
          @for (col of targetColumns; track col.id) {
            <div class="column-control">
              <span class="column-name">{{ col.label }}</span>
              <div class="btn-group">
                <button
                  [class.active]="getPinnedSide(col.id) === 'left'"
                  class="btn-sm"
                  type="button"
                  (click)="pinColumn(col.id, 'left')">
                  Left
                </button>
                <button [class.active]="getPinnedSide(col.id) === null" class="btn-sm" type="button" (click)="pinColumn(col.id, null)">
                  None
                </button>
                <button
                  [class.active]="getPinnedSide(col.id) === 'right'"
                  class="btn-sm"
                  type="button"
                  (click)="pinColumn(col.id, 'right')">
                  Right
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class Pinning {
  protected readonly data = DEMO_DATA;

  protected readonly targetColumns = [
    { id: 'name', label: 'Name' },
    { id: 'category', label: 'Category' },
    { id: 'status', label: 'Status' },
    { id: 'value', label: 'Value' }
  ];

  protected readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions([
    {
      accessorKey: 'name',
      header: 'Name',
      size: 150,
      meta: { label: 'Name', rowHeader: true }
    },
    {
      accessorKey: 'category',
      header: 'Category',
      size: 150,
      meta: { label: 'Category' }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 120,
      meta: { label: 'Status' }
    },
    {
      accessorKey: 'value',
      header: 'Value',
      size: 150,
      meta: { label: 'Value', align: 'end' },
      cell: (context: CellContext<DemoItem, number>) => `$${context.getValue().toLocaleString()}`
    }
  ]);

  protected readonly tableState = signal<Partial<NatTableUserState>>({
    columnPinning: {
      left: ['name'],
      right: ['value']
    }
  });

  protected getPinnedSide(id: string): 'left' | 'right' | null {
    const pinning = this.tableState().columnPinning;

    if (pinning?.left?.includes(id)) {
      return 'left';
    }

    if (pinning?.right?.includes(id)) {
      return 'right';
    }

    return null;
  }

  protected pinColumn(id: string, side: 'left' | 'right' | null): void {
    this.tableState.update((current) => {
      const pinning = current.columnPinning ?? { left: [], right: [] };
      const left = (pinning.left ?? []).filter((x) => x !== id);
      const right = (pinning.right ?? []).filter((x) => x !== id);

      if (side === 'left') {
        left.push(id);
      } else if (side === 'right') {
        right.push(id);
      }

      return {
        ...current,
        columnPinning: { left, right }
      };
    });
  }
}
