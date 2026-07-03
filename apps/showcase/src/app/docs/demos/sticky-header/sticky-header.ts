import { Component, signal } from '@angular/core';

import type { CellContext, ColumnDef } from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table/components';

type DemoItem = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly status: string;
  readonly value: number;
};

const CATEGORIES = ['Analytics', 'Infrastructure', 'Data Science', 'Security'] as const;
const STATUSES = ['Active', 'Paused', 'Alert', 'Halted'] as const;

// Generate 40 rows to ensure vertical scrollability
const DEMO_DATA: DemoItem[] = Array.from({ length: 40 }, (_, index) => {
  const id = index + 1;

  return {
    id: `item-${id}`,
    name: `Resource Node ${id}`,
    category: CATEGORIES[id % CATEGORIES.length],
    status: STATUSES[id % STATUSES.length],
    value: 1000 + ((id * 235) % 9000)
  };
});

@Component({
  selector: 'app-sticky-header',
  imports: [NatTable, NatTableSurface],
  styles: `
    nat-table-surface {
      --nat-table-max-height: 400px;
    }
  `,
  template: `
    <div class="grid-layout grid-layout-with-panel">
      <div class="card">
        <h2 class="card-title">Scrollable Grid</h2>
        <nat-table-surface [stickyHeader]="stickyHeaderEnabled()">
          <nat-table [columns]="columns" [data]="data" accessibleName="Sticky header demo table" />
        </nat-table-surface>
      </div>

      <div class="card">
        <h2 class="card-title">Configure Sticky State</h2>
        <div class="control-panel">
          <label class="toggle-label toggle-switch">
            <input
              [checked]="stickyHeaderEnabled()"
              class="toggle-switch-input"
              type="checkbox"
              (change)="toggleStickyHeader($event)" />
            <span>Enable Sticky Header</span>
          </label>
          <div class="tip">
            Scroll down the table to verify the sticky behavior, then turn it off to observe standard scrolling logic.
          </div>
        </div>
      </div>
    </div>
  `
})
export class StickyHeader {
  protected readonly data = DEMO_DATA;
  protected readonly stickyHeaderEnabled = signal(true);

  protected readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions([
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
  ]);

  protected toggleStickyHeader(event: Event): void {
    const target = event.target;

    if (target instanceof HTMLInputElement) {
      this.stickyHeaderEnabled.set(target.checked);
    }
  }
}
