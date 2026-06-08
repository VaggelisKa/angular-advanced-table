import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { type ColumnDef, type ColumnPinningState } from '@tanstack/angular-table';
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
  selector: 'app-pinning-showcase',
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
      background: linear-gradient(135deg, #1f6feb, #00ced1);
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
    .pinning-controls {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .column-control {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px dashed var(--border-color, rgba(0, 0, 0, 0.06));
    }
    .column-name {
      font-size: 0.9rem;
      font-weight: 600;
    }
    .btn-group {
      display: inline-flex;
      background: #f1f3f5;
      padding: 3px;
      border-radius: 8px;
    }
    .btn-sm {
      padding: 4px 8px;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      border: none;
      background: transparent;
      transition: all 120ms ease;
    }
    .btn-sm.active {
      background: #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
      color: #1f6feb;
    }
    :host-context([data-theme="dark"]) {
      --card-bg: #14171c;
      --card-border: #262b33;
      .description {
        color: #9aa4b1;
      }
      .btn-group {
        background: #212529;
      }
      .btn-sm.active {
        background: #14171c;
        color: #4f8bff;
      }
    }
  `,
  template: `
    <div class="showcase-container">
      <header class="header-section">
        <h1 class="title">Column Pinning</h1>
        <p class="description">
          Demonstrates sticky columns locked to the left or right side of the scrollable region.
        </p>
      </header>

      <div class="grid-layout">
        <div class="card">
          <h2 class="card-title">Scrollable Grid with Pinning</h2>
          <nat-table-surface>
            <nat-table
              #grid="natTable"
              [data]="data"
              [columns]="columns"
              [state]="tableState()"
              [enableColumnPinning]="true"
              ariaLabel="Pinning demo table"
              (columnPinningChange)="onColumnPinningChange($event)"
            />
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
                    type="button"
                    class="btn-sm"
                    [class.active]="getPinnedSide(col.id) === 'left'"
                    (click)="pinColumn(col.id, 'left')"
                  >
                    Left
                  </button>
                  <button
                    type="button"
                    class="btn-sm"
                    [class.active]="getPinnedSide(col.id) === null"
                    (click)="pinColumn(col.id, null)"
                  >
                    None
                  </button>
                  <button
                    type="button"
                    class="btn-sm"
                    [class.active]="getPinnedSide(col.id) === 'right'"
                    (click)="pinColumn(col.id, 'right')"
                  >
                    Right
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PinningShowcasePage {
  readonly data = DEMO_DATA;

  readonly targetColumns = [
    { id: 'name', label: 'Name' },
    { id: 'category', label: 'Category' },
    { id: 'status', label: 'Status' },
    { id: 'value', label: 'Value' },
  ];

  readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions([
    {
      accessorKey: 'name',
      header: 'Name',
      size: 150,
      enablePinning: true,
      meta: { label: 'Name', rowHeader: true },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      size: 150,
      enablePinning: true,
      meta: { label: 'Category' },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 120,
      enablePinning: true,
      meta: { label: 'Status' },
    },
    {
      accessorKey: 'value',
      header: 'Value',
      size: 150,
      enablePinning: true,
      meta: { label: 'Value', align: 'end' },
      cell: (context) => `$${context.getValue<number>().toLocaleString()}`,
    },
  ]);

  readonly tableState = signal<Partial<NatTableState>>({
    columnPinning: {
      left: ['name'],
      right: ['value'],
    },
  });

  getPinnedSide(id: string): 'left' | 'right' | null {
    const pinning = this.tableState().columnPinning;
    if (pinning?.left?.includes(id)) {
      return 'left';
    }
    if (pinning?.right?.includes(id)) {
      return 'right';
    }
    return null;
  }

  onColumnPinningChange(columnPinning: ColumnPinningState): void {
    this.tableState.update((current) => ({ ...current, columnPinning }));
  }

  pinColumn(id: string, side: 'left' | 'right' | null): void {
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
        columnPinning: { left, right },
      };
    });
  }
}
