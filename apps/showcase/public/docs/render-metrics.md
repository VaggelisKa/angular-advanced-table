Render metrics are optional diagnostics from `ng-advanced-table-utils`. They measure row render timing, add a synthetic metrics column, and expose a compact panel and filter. Enable them when you are tuning a heavy table or building an internal performance view.

## Install

```bash
npm install ng-advanced-table-utils
```

Use it with the core and UI packages:

```bash
npm install ng-advanced-table ng-advanced-table-ui ng-advanced-table-utils @tanstack/angular-table @angular/common @angular/aria @angular/cdk
```

## Basic Wiring

Create one `NatTableRenderMetricsStore`, enable row render events on the table, and record each event.

```ts
import { Component, viewChild } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';

import { NatTable } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table-ui';
import { NatRenderMetricsPanel, NatTableRenderMetricsStore, type NatTableRenderMetricsEvent } from 'ng-advanced-table-utils';

@Component({
  selector: 'app-positions-table',
  imports: [NatTable, NatTableSurface, NatRenderMetricsPanel],
  template: `
    <nat-table-surface>
      <nat-render-metrics-panel [controller]="metricsTable()" [store]="metricsStore" />

      <nat-table
        #metricsTable
        [data]="rows()"
        [columns]="columns"
        [emitRowRenderEvents]="true"
        accessibleName="Position render metrics"
        (rowRendered)="onRowRendered($event)" />
    </nat-table-surface>
  `
})
export class PositionsTable {
  readonly metricsStore = new NatTableRenderMetricsStore();
  readonly metricsTable = viewChild<NatTable<PositionRow>>('metricsTable');
  readonly columns: ColumnDef<PositionRow>[] = [];

  protected onRowRendered(event: NatTableRenderMetricsEvent): void {
    this.metricsStore.record(event);
  }
}
```

`emitRowRenderEvents` is off by default because it adds per-row render instrumentation. Keep it disabled in ordinary tables.

## Metrics Column

Use `withRenderMetricsColumn(...)` to append a synthetic render-time column. Wrap with header actions after adding synthetic columns.

```ts
import { withNatTableHeaderActions } from 'ng-advanced-table-ui';
import { NatTableRenderMetricsStore, withRenderMetricsColumn } from 'ng-advanced-table-utils';

readonly metricsStore = new NatTableRenderMetricsStore();

readonly columns = withNatTableHeaderActions(
  withRenderMetricsColumn(baseColumns, this.metricsStore, {
    header: 'Render',
    pendingLabel: 'Pending',
    unitSuffix: ' ms',
    size: 112,
    minSize: 88,
  }),
);
```

The generated column:

- Uses id `__rowRenderMetric` unless `columnId` is provided.
- Aligns values to the end edge.
- Does not sort, hide, pin, or globally filter.
- Adds a column filter function driven by render tone.
- Shows a pending label until a row has been measured.

## Panel And Filter

The panel summarizes the latest render cycle. The filter targets the synthetic metrics column.

```html
<nat-table-surface>
  <div class="render-metrics-controls">
    <nat-render-metrics-filter [controller]="metricsTable()" [store]="metricsStore" />
    <nat-render-metrics-panel [controller]="metricsTable()" [store]="metricsStore" />
  </div>

  <nat-table
    #metricsTable
    [data]="rows()"
    [columns]="columns"
    [emitRowRenderEvents]="true"
    accessibleName="Position render metrics"
    (rowRendered)="metricsStore.record($event)" />
</nat-table-surface>
```

`NatRenderMetricsFilter` patches `columnFilters` for the metrics column and resets pagination to the first page. Pass the `NatTable` instance, or any object matching `NatTableRenderMetricsController`, through `[controller]`.

Keep `NatRenderMetricsFilter` outside `<nat-table-toolbar>` because it renders its own internal chip buttons as a labeled button group. Use `<nat-table-toolbar>` for controls that can register each interactive element with `natToolbarItem` or `NatToolbarGroup`.

## Reading Measurements

The store exposes read-only row-level and cycle-level metrics. Row history is bounded to the newest 1000 row ids by default so long-lived tables with row churn do not retain unbounded metrics.

```ts
readonly metricsStore = new NatTableRenderMetricsStore({
  maxRetainedRowMetrics: 2000,
});

readonly latestMeasurement = computed(() => this.metricsStore.measurement());
readonly retainedRowMetrics = computed(() => this.metricsStore.rowMetrics());

protected resetMetrics(): void {
  this.metricsStore.reset();
}

protected metricFor(rowId: string): RowRenderMetric | undefined {
  return this.metricsStore.rowMetric(rowId);
}
```

The latest measurement includes:

| Field                  | Meaning                                            |
| ---------------------- | -------------------------------------------------- |
| `durationMs`           | Total visible render duration for the latest cycle |
| `averageRowDurationMs` | Mean row duration                                  |
| `rowCount`             | Number of visible rows sampled                     |
| `rowsPerSecond`        | Approximate rendered rows per second               |

Row metrics include `durationMs`, `measuredAt`, and a derived tone: `fast`, `watch`, or `slow`.

Set `maxRetainedRowMetrics` to a higher finite value when a table needs a longer diagnostic window. Set it to `Infinity` only when the row-id space is known to be bounded.

## Locale And Labels

Render-metrics copy can come from `ng-advanced-table-locales`.

```ts
import { provideNatTableUtilsLocales } from 'ng-advanced-table-locales';

providers: [
  provideNatTableUtilsLocales({
    en: {
      renderMetrics: {
        column: {
          header: 'Render',
          pendingLabel: 'Pending'
        },
        panel: {
          ariaLabel: 'Row render timing'
        },
        filter: {
          heading: 'Render speed',
          groupAriaLabel: 'Filter rows by render speed'
        }
      }
    }
  })
];
```

`withRenderMetricsColumn(...)` creates static column definitions. If the locale can change at runtime, rebuild the columns from a `computed(...)` value or pass the `locale` option when constructing them.

```ts
readonly columns = computed(() =>
  withRenderMetricsColumn(baseColumns(), this.metricsStore, {
    locale: this.localeId(),
  }),
);
```

## Production Guidance

Use render metrics when they answer a specific performance question:

- Which rows are expensive to render?
- Did a custom cell renderer become slow?
- Did a live update pattern increase visible render time?
- Does a page-size change make row rendering unacceptable?

Remove or gate metrics UI when it is no longer useful to the user. Keep `emitRowRenderEvents` off for normal production tables unless product requirements need the measurements.
