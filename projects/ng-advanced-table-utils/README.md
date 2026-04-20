# ng-advanced-table-utils

Optional utilities package for the `angular-advanced-table` workspace.

## Canonical Docs

- Workspace and package docs: [../../README.md](../../README.md)
- Utils package reference: [../../README.md#utils-package](../../README.md#utils-package)
- Core table reference: [../../README.md#core-table](../../README.md#core-table)
- Install options: [../../README.md#install](../../README.md#install)

This package README is intentionally scoped to package entry-point information. The root README is the canonical source for render-metrics behavior and wiring.

## Package Scope

Use this package when you want optional render-metrics helpers:

- `NatTableRenderMetricsStore`
- `NatRenderMetricsFilter`
- `NatRenderMetricsPanel`
- `withRenderMetricsColumn(...)`

The package composes structurally with any compatible table controller and event source. The common pairing is `<nat-table [emitRowRenderEvents]="true" (rowRendered)="store.record($event)">`.

## Install

```bash
npm install ng-advanced-table ng-advanced-table-utils @tanstack/angular-table @angular/aria @angular/cdk
```

## Public Exports

- `NatTableRenderMetricsStore`
- `NatRenderMetricsFilter`
- `NatRenderMetricsPanel`
- `withRenderMetricsColumn(...)`
- `WithRenderMetricsColumnOptions`
- `NatTableRenderMetricsController`
- `NatTableRenderMetricsEvent`
- `NatTableRenderMetricsState`
- `getRowRenderTone(...)`
- `getRenderToneLabel(...)`
- `isRenderFilterValue(...)`
- `RENDER_FILTER_OPTIONS`
- `RENDER_METRIC_COLUMN_ID`
- `RowRenderFilterOption`
- `RowRenderFilterValue`
- `RowRenderMeasurement`
- `RowRenderMetric`
- `RowRenderTone`

## Package Notes

- `NatTableRenderMetricsStore` tracks per-row timings and computes the latest aggregate measurement.
- `withRenderMetricsColumn(...)` appends a synthetic metrics column. The default id is `__rowRenderMetric`.
- `NatRenderMetricsFilter` writes a column filter for the metrics column and resets pagination to the first page.
- `NatRenderMetricsPanel` renders a compact summary for the latest captured measurement.

## Minimal Example

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';
import {
  NatRenderMetricsPanel,
  NatTableRenderMetricsStore,
  withRenderMetricsColumn,
} from 'ng-advanced-table-utils';

interface MetricRow {
  id: string;
}

@Component({
  selector: 'app-metric-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatRenderMetricsPanel],
  template: `
    <nat-table
      [data]="rows()"
      [columns]="columns"
      [state]="tableState()"
      [emitRowRenderEvents]="true"
      ariaLabel="Metric table"
      (stateChange)="tableState.set($event)"
      (rowRendered)="metrics.record($event)"
    />

    <nat-render-metrics-panel [store]="metrics" />
  `,
})
export class MetricTableComponent {
  readonly rows = signal<MetricRow[]>([]);
  readonly tableState = signal<Partial<NatTableState>>({});
  readonly metrics = new NatTableRenderMetricsStore();
  readonly columns: ColumnDef<MetricRow>[] = withRenderMetricsColumn<MetricRow>([], this.metrics);
}
```
