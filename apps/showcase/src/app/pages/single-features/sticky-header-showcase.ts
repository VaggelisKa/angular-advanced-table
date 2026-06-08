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
    value: 1000 + (id * 235) % 9000,
  };
});

@Component({
  selector: 'app-sticky-header-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface],
  styles: `
    .showcase-container {
      display: grid;
      gap: 24px;
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header-section {
      border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
      padding-bottom: 16px;
    }
    .title {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #1f6feb, #ff1493);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0 0 8px;
    }
    .description {
      color: #657786;
      font-size: 1rem;
      margin: 0;
    }
    .grid-layout {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 24px;
      align-items: start;
    }
    @media (max-width: 900px) {
      .grid-layout {
        grid-template-columns: 1fr;
      }
    }
    .card {
      background: var(--card-bg, #ffffff);
      border-radius: 12px;
      border: 1px solid var(--card-border, rgba(0, 0, 0, 0.06));
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
    }
    .card-title {
      font-size: 1.15rem;
      font-weight: 600;
      margin: 0 0 16px;
    }
    nat-table {
      --nat-table-max-height: 400px;
    }
    .control-panel {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .toggle-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
    }
    .toggle-label input {
      width: 16px;
      height: 16px;
      accent-color: #1f6feb;
    }
    .tip {
      font-size: 0.82rem;
      color: #657786;
      line-height: 1.45;
      padding-top: 12px;
      border-top: 1px dashed var(--border-color, rgba(0, 0, 0, 0.08));
    }
    :host-context([data-theme="dark"]) {
      --card-bg: #14171c;
      --card-border: #262b33;
      .description {
        color: #9aa4b1;
      }
      .tip {
        color: #9aa4b1;
      }
    }
  `,
  template: `
    <div class="showcase-container">
      <header class="header-section">
        <h1 class="title">Sticky Header</h1>
        <p class="description">
          Demonstrates vertical sticky header pinning. The header stays docked when scrolling down the grid.
        </p>
      </header>

      <div class="grid-layout">
        <div class="card">
          <h2 class="card-title">Scrollable Grid</h2>
          <nat-table-surface>
            <nat-table
              [data]="data"
              [columns]="columns"
              [stickyHeader]="stickyHeaderEnabled()"
              ariaLabel="Sticky header demo table"
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
              Scroll down the table to verify the sticky behavior, then turn it off to observe standard scrolling logic.
            </div>
          </div>
        </div>
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
