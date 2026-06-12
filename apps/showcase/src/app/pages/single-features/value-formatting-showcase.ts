import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type CellContext, type ColumnDef } from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table-ui';

interface DemoItem {
  id: string;
  name: string;
  price: number;
  growth: number;
  updated: string;
  status: string;
}

const DEMO_DATA: DemoItem[] = [
  {
    id: 'item-1',
    name: 'Alpha Searcher',
    price: 4500.5,
    growth: 0.1825,
    updated: '2026-01-14',
    status: 'Active',
  },
  {
    id: 'item-2',
    name: 'Beta Runner',
    price: 1200,
    growth: -0.042,
    updated: '2026-02-03',
    status: 'Active',
  },
  {
    id: 'item-3',
    name: 'Gamma Processor',
    price: 7800.75,
    growth: 0.301,
    updated: '2026-03-21',
    status: 'Paused',
  },
  {
    id: 'item-4',
    name: 'Delta Watcher',
    price: 3100.25,
    growth: 0.0875,
    updated: '2026-04-09',
    status: 'Alert',
  },
  {
    id: 'item-5',
    name: 'Epsilon Shield',
    price: 9200,
    growth: 0.56,
    updated: '2026-05-28',
    status: 'Active',
  },
  {
    id: 'item-6',
    name: 'Zeta Pipeline',
    price: 500.99,
    growth: -0.118,
    updated: '2026-06-02',
    status: 'Halted',
  },
];

type DemoLocale = 'en-US' | 'da-DK';

@Component({
  selector: 'app-value-formatting-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface],
  template: `
    <div class="showcase-page showcase-container">
      <header class="header-section">
        <h1 class="title">Value Formatting</h1>
        <p class="description">
          Demonstrates declarative cell display formatting through
          <code>meta.valueFormatter</code>. The Price, Growth, and Updated columns format raw values
          with <code>Intl.NumberFormat</code> and <code>Intl.DateTimeFormat</code> using the table
          locale, while the Status column keeps its explicit cell renderer.
        </p>
      </header>

      <div class="grid-layout grid-layout-with-panel">
        <div class="card">
          <h2 class="card-title">Locale-Aware Formatting Grid</h2>
          <nat-table-surface>
            <nat-table
              [data]="data"
              [columns]="columns"
              [locale]="locale()"
              accessibleName="Value formatting demo table"
            />
          </nat-table-surface>
        </div>

        <div class="card">
          <h2 class="card-title">Switch The Table Locale</h2>
          <div class="actions-panel">
            <button
              type="button"
              class="btn btn-outline"
              [attr.aria-pressed]="locale() === 'en-US'"
              (click)="setLocale('en-US')"
            >
              English (en-US)
            </button>
            <button
              type="button"
              class="btn btn-outline"
              [attr.aria-pressed]="locale() === 'da-DK'"
              (click)="setLocale('da-DK')"
            >
              Danish (da-DK)
            </button>
          </div>

          <div class="info-tag">Active locale: {{ locale() }}</div>

          <div class="instructions">
            <ol>
              <li>
                Toggle the locale and watch Price, Growth, and Updated re-format. The cell text is
                exactly what screen readers announce.
              </li>
              <li>
                The Status column declares an explicit <code>cell</code> renderer, so it bypasses
                <code>valueFormatter</code> entirely.
              </li>
              <li>
                <strong>Keyboard:</strong> <code>Tab</code> to the grid, move between cells with the
                <code>Arrow</code> keys, press <code>Enter</code> on a header cell to reach its sort
                button, and <code>Escape</code> to return to the cell.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ValueFormattingShowcasePage {
  readonly data = DEMO_DATA;
  readonly locale = signal<DemoLocale>('en-US');

  readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions([
    {
      accessorKey: 'name',
      header: 'Name',
      meta: { label: 'Name', rowHeader: true },
    },
    {
      accessorKey: 'price',
      header: 'Price',
      meta: {
        label: 'Price',
        align: 'end',
        valueFormatter: ({ value, locale }) =>
          new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(
            value as number,
          ),
      },
    },
    {
      accessorKey: 'growth',
      header: 'Growth',
      meta: {
        label: 'Growth',
        align: 'end',
        valueFormatter: ({ value, locale }) =>
          new Intl.NumberFormat(locale, {
            style: 'percent',
            maximumFractionDigits: 1,
            signDisplay: 'exceptZero',
          }).format(value as number),
      },
    },
    {
      accessorKey: 'updated',
      header: 'Updated',
      meta: {
        label: 'Updated',
        valueFormatter: ({ value, locale }) =>
          new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(
            new Date(`${value as string}T00:00:00`),
          ),
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { label: 'Status' },
      cell: (context: CellContext<DemoItem, string>) => `Custom: ${context.getValue()}`,
    },
  ]);

  setLocale(locale: DemoLocale): void {
    this.locale.set(locale);
  }
}
