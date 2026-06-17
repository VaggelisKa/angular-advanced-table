import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type CellContext, type ColumnDef } from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table-ui';

interface DemoItem {
  id: string;
  name: string;
  category: string;
  status: string;
  value: number;
}

// Generate 40 rows to ensure vertical scrollability
const DEMO_DATA: DemoItem[] = Array.from({ length: 40 }, (_, index) => {
  const id = index + 1;
  const categories = ['Analytics', 'Infrastructure', 'Data Science', 'Security'];
  const statuses = ['Active', 'Paused', 'Alert', 'Halted'];

  return {
    id: `item-${id}`,
    name: `Resource Node ${id}`,
    category: categories[id % categories.length]!,
    status: statuses[id % statuses.length]!,
    value: 1000 + ((id * 235) % 9000),
  };
});

@Component({
  selector: 'app-sticky-header-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface],
  styles: `
    .scrollable-grid-card nat-table-surface {
      --nat-table-max-height: 400px;
    }
    .table-stack nat-table-surface {
      --nat-table-max-height: none;
    }
  `,
  template: `
    <div class="showcase-page showcase-container">
      <header class="header-section">
        <h1 class="title">Sticky Header</h1>
        <p class="description">
          Demonstrates vertical sticky header pinning. The header stays docked when scrolling down
          the grid.
        </p>
      </header>

      <div class="grid-layout grid-layout-with-panel">
        <div class="card scrollable-grid-card">
          <h2 class="card-title">Scrollable Grid</h2>
          <nat-table-surface [stickyHeader]="stickyHeaderEnabled()">
            <nat-table
              [data]="data"
              [columns]="columns"
              accessibleName="Sticky header demo table"
            />
          </nat-table-surface>
        </div>

        <div class="card">
          <h2 class="card-title">Configure Sticky State</h2>
          <div class="control-panel">
            <label class="toggle-label">
              <input
                type="checkbox"
                [checked]="stickyHeaderEnabled()"
                (change)="toggleStickyHeader($event)"
              />
              <span>Enable Sticky Header</span>
            </label>
            <div class="tip">
              Scroll down the table to verify the sticky behavior, then turn it off to observe
              standard scrolling logic.
            </div>
          </div>
        </div>
      </div>

      <header class="header-section">
        <h2 class="title">Viewport Sticky Tables (No Max Height)</h2>
        <p class="description">
          These 5 tables have no max height limit. As you scroll down the page, each table's header
          will stick to the top of the viewport/window and push the previous one out of view.
        </p>
      </header>

      <div class="table-stack">
        @for (i of [1, 2, 3, 4, 5]; track i) {
          <div class="card" style="margin-bottom: 4rem;">
            <h3 class="card-title">Table #{{ i }}</h3>
            <nat-table-surface [stickyHeader]="stickyHeaderEnabled()">
              <nat-table
                [data]="data"
                [columns]="columns"
                [accessibleName]="'Viewport sticky table ' + i"
              />
            </nat-table-surface>
          </div>
        }
      </div>
    </div>
  `,
})
export class StickyHeaderShowcasePage {
  readonly data = DEMO_DATA;
  readonly stickyHeaderEnabled = signal(true);

  readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions([
    {
      accessorKey: 'name',
      header: 'Name',
      meta: { label: 'Name', rowHeader: true },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      meta: { label: 'Category' },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { label: 'Status' },
    },
    {
      accessorKey: 'value',
      header: 'Value',
      meta: { label: 'Value', align: 'end' },
      cell: (context: CellContext<DemoItem, number>) => `$${context.getValue().toLocaleString()}`,
    },
  ]);

  toggleStickyHeader(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.stickyHeaderEnabled.set(target.checked);
    }
  }
}
