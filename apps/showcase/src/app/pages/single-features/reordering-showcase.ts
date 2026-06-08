import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { type ColumnDef, type ColumnOrderState } from '@tanstack/angular-table';
import { TitleCasePipe } from '@angular/common';
import { NatTable, type NatTableState } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table-ui';

interface DemoItem {
  id: string;
  name: string;
  category: string;
  status: string;
  value: number;
}

const DEMO_DATA: DemoItem[] = [
  { id: 'item-1', name: 'Alpha Searcher', category: 'Analytics', status: 'Active', value: 4500 },
  { id: 'item-2', name: 'Beta Runner', category: 'Infrastructure', status: 'Active', value: 1200 },
  { id: 'item-3', name: 'Gamma Processor', category: 'Data Science', status: 'Paused', value: 7800 },
  { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Alert', value: 3100 },
  { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Data Science', status: 'Halted', value: 500 },
];

@Component({
  selector: 'app-reordering-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface, TitleCasePipe],
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
      background: linear-gradient(135deg, #1f6feb, #ff69b4);
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
      grid-template-columns: 1fr 340px;
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
    .order-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .order-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      border: 1px solid var(--card-border, rgba(0,0,0,0.06));
      border-radius: 6px;
      background: var(--card-contrast, #fafbfc);
      font-size: 0.88rem;
    }
    .order-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #1f6feb;
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .instructions {
      font-size: 0.82rem;
      color: #657786;
      line-height: 1.5;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border-color, rgba(0,0,0,0.06));
    }
    :host-context([data-theme="dark"]) {
      --card-bg: #14171c;
      --card-border: #262b33;
      --card-contrast: #1a1e24;
      .description {
        color: #9aa4b1;
      }
      .instructions {
        color: #9aa4b1;
      }
    }
  `,
  template: `
    <div class="showcase-container">
      <header class="header-section">
        <h1 class="title">Column Reordering</h1>
        <p class="description">
          Demonstrates drag-and-drop header reordering and accessible keyboard reordering.
        </p>
      </header>

      <div class="grid-layout">
        <div class="card">
          <h2 class="card-title">Drag & Reorder Grid</h2>
          <nat-table-surface>
            <nat-table
              #grid="natTable"
              [data]="data"
              [columns]="columns"
              [state]="tableState()"
              [enableColumnReorder]="true"
              ariaLabel="Reordering demo table"
              (columnOrderChange)="onColumnOrderChange($event)"
            />
          </nat-table-surface>
        </div>

        <div class="card">
          <h2 class="card-title">Rendered Column Order</h2>
          <div class="order-list">
            @for (colId of currentOrder(); track colId; let idx = $index) {
              <div class="order-item">
                <span class="order-badge">{{ idx + 1 }}</span>
                <span>{{ colId | titlecase }}</span>
              </div>
            }
          </div>
          <div class="instructions">
            <strong>Keyboard usage:</strong> Focus a header cell, then press
            <code>Alt + Shift + Left Arrow</code> or <code>Alt + Shift + Right Arrow</code> to swap columns.
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ReorderingShowcasePage {
  readonly data = DEMO_DATA;

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
      cell: (context) => `$${context.getValue<number>().toLocaleString()}`,
    },
  ]);

  readonly tableState = signal<Partial<NatTableState>>({
    columnOrder: ['name', 'category', 'status', 'value'],
  });

  readonly currentOrder = computed(() => {
    return this.tableState().columnOrder ?? ['name', 'category', 'status', 'value'];
  });

  onColumnOrderChange(columnOrder: ColumnOrderState): void {
    this.tableState.update((current) => ({ ...current, columnOrder }));
  }
}
export { ColumnOrderState };
